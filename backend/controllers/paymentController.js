const Razorpay = require("razorpay");
const crypto = require("crypto");
const PDFDocument = require("pdfkit"); 
const nodemailer = require("nodemailer");
const Payment = require("../models/paymentModel");
const Booking = require("../models/bookingModel");
const PendingPayment = require("../models/pendingPaymentModel");
const Pg = require("../models/pgModel");
const Tenant = require("../models/tenantModel");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const Agreement = require("../models/agreementModel");
const { resolveVariantPricing } = require("../utils/pricingUtils");
const { generateAgreementPdf } = require("../utils/agreementPdf");
const {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  computeCommissionBreakdown
} = require("../utils/paymentPolicyUtils");

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isMongoDuplicateKeyError = (err) => {
  if (!err) return false;
  if (err.code === 11000) return true;
  if (err.name === "MongoServerError" && err.code === 11000) return true;
  return false;
};

const pickFirstValid = (...values) => {
  for (const raw of values) {
    const value = String(raw ?? "").trim();
    if (!value) continue;
    if (value.toLowerCase() === "not set") continue;
    return value;
  }
  return "";
};

const normalizeTenantPhone = (rawPhone = "") => {
  const value = String(rawPhone || "").trim();
  if (!value) return "";
  if (/^0+$/.test(value)) return "";
  return value;
};

const getTenantDisplayName = async (userId, fallback = "") => {
  const [user, profile, agreement] = await Promise.all([
    User.findById(userId).select("fullName name"),
    Profile.findOne({ userId }).select("personalInfo.fullName"),
    Agreement.findOne({ userId }).sort({ createdAt: -1 }).select("tenantName")
  ]);

  return pickFirstValid(
    profile?.personalInfo?.fullName,
    user?.fullName,
    user?.name,
    agreement?.tenantName,
    fallback
  ) || "Tenant";
};

const getMonthLabel = (dateInput) => {
  const d = new Date(dateInput);
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
};

const addMonths = (dateInput, months) => {
  const d = new Date(dateInput);
  d.setMonth(d.getMonth() + months);
  return d;
};

const deriveSecurityDepositAmount = (monthlyRent, configuredDeposit) => {
  const explicitDeposit = Number(configuredDeposit);
  if (Number.isFinite(explicitDeposit) && explicitDeposit >= 0) {
    return explicitDeposit;
  }
  return 0;
};

const getNextCycleDueDate = (anchorDateInput) => {
  const anchor = new Date(anchorDateInput);
  if (Number.isNaN(anchor.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(anchor);
  due.setHours(0, 0, 0, 0);

  while (due <= today) {
    due.setMonth(due.getMonth() + 1);
  }
  return due;
};

const pickRelevantPendingPayment = (payments = []) => {
  if (!Array.isArray(payments) || payments.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureOrToday = payments.find((p) => {
    const d = new Date(p?.dueDate);
    if (Number.isNaN(d.getTime())) return false;
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });
  if (futureOrToday) return futureOrToday;

  return payments[payments.length - 1] || payments[0];
};

const canUserPayForBooking = (booking, userId, userEmail, userName = "") => {
  if (!booking) return false;
  const normalizedEmail = String(userEmail || "").trim().toLowerCase();
  const normalizedName = String(userName || "").trim().toLowerCase();
  if (booking.tenantUserId && String(booking.tenantUserId) === String(userId)) return true;
  if (normalizedEmail && String(booking.tenantEmail || "").trim().toLowerCase() === normalizedEmail) return true;
  if (normalizedName && String(booking.tenantName || "").trim().toLowerCase() === normalizedName) return true;
  if (!booking.tenantUserId && !String(booking.tenantEmail || "").trim()) return true;
  return false;
};

const ensureBookingCompletionRecords = async ({ booking, tenantUser, pgDoc, tenantName, tenantEmail, rentAmount }) => {
  if (!booking || !pgDoc) return { tenantRecord: null, agreement: null };

  const checkInDate = booking.checkInDate || new Date().toISOString().split("T")[0];
  const checkOutDate = booking.checkOutDate || addMonths(checkInDate, 11).toISOString().split("T")[0];
  const bookingPricing = resolveVariantPricing({
    roomPrices: pgDoc?.roomPrices,
    roomType: booking.roomType || booking.variantLabel || "N/A",
    variantLabel: booking.variantLabel || "",
    fallbackRent: Number(booking.rentAmount || booking.bookingAmount || pgDoc.price || 0),
    fallbackDeposit: Number(booking.securityDeposit || pgDoc.securityDeposit || 0)
  });
  const safeRent = Number(booking.rentAmount || booking.bookingAmount || bookingPricing.rentAmount || rentAmount || 0);
  const securityDeposit = deriveSecurityDepositAmount(safeRent, bookingPricing.securityDeposit);
  const variantLabel = booking.variantLabel || bookingPricing.variantLabel || booking.roomType || "N/A";

  booking.rentAmount = safeRent;
  booking.securityDeposit = securityDeposit;
  booking.ownerApprovalStatus =
    booking.ownerApproved || String(booking.status || "").toLowerCase() === "confirmed"
      ? "approved"
      : "pending";
  booking.variantLabel = variantLabel;
  booking.bookingAmount = safeRent;
  booking.pricingSnapshot = {
    billingCycle: bookingPricing.billingCycle || booking?.pricingSnapshot?.billingCycle || "Monthly",
    acType: bookingPricing.acType || booking?.pricingSnapshot?.acType || "Non-AC",
    features: bookingPricing.features || booking?.pricingSnapshot?.features || {}
  };
  await booking.save();

  const normalizedTenantEmail = String(tenantEmail || "").trim().toLowerCase();

  // IMPORTANT: email has a unique index in MongoDB.
  // Always de-duplicate by email FIRST so payment verification is idempotent.
  let tenantRecord = null;
  if (normalizedTenantEmail) {
    tenantRecord = await Tenant.findOne({ email: normalizedTenantEmail }).sort({ createdAt: -1 });

    // Backward-compat: older records may have mixed-case emails.
    if (!tenantRecord) {
      tenantRecord = await Tenant.findOne({
        email: new RegExp(`^${escapeRegex(normalizedTenantEmail)}$`, "i")
      }).sort({ createdAt: -1 });
    }
  }

  if (!tenantRecord) {
    tenantRecord = await Tenant.findOne({
      ownerId: pgDoc.ownerId,
      $and: [
        {
          $or: [
            { email: normalizedTenantEmail || "__no_email__" },
            { name: tenantName }
          ]
        },
        {
          $or: [{ pgId: pgDoc._id }, { pgName: pgDoc.pgName }]
        }
      ]
    }).sort({ createdAt: -1 });
  }

  if (!tenantRecord) {
    const resolvedPhone = normalizeTenantPhone(tenantUser?.phone);
    try {
      tenantRecord = await Tenant.create({
        ownerId: pgDoc.ownerId,
        name: tenantName,
        phone: resolvedPhone || "Not provided",
        email: normalizedTenantEmail || "no-email@easy-pg.local",
        pgId: pgDoc._id,
        pgName: pgDoc.pgName || "",
        room: booking.roomType || "N/A",
        joiningDate: checkInDate,
        status: "Pending Arrival",
        securityDeposit
      });
    } catch (err) {
      // If a concurrent verification attempt created the tenant first, fetch & reuse it.
      if (isMongoDuplicateKeyError(err) && normalizedTenantEmail) {
        tenantRecord = await Tenant.findOne({ email: normalizedTenantEmail }).sort({ createdAt: -1 });
        if (!tenantRecord) {
          tenantRecord = await Tenant.findOne({
            email: new RegExp(`^${escapeRegex(normalizedTenantEmail)}$`, "i")
          }).sort({ createdAt: -1 });
        }
      }
      if (!tenantRecord) throw err;
    }
  } else {
    tenantRecord.pgId = pgDoc._id;
    tenantRecord.pgName = pgDoc.pgName || tenantRecord.pgName;
    tenantRecord.ownerId = pgDoc.ownerId;
    tenantRecord.room = booking.roomType || tenantRecord.room;
    tenantRecord.joiningDate = tenantRecord.joiningDate || checkInDate;
    if (String(tenantRecord.status || "").toLowerCase() !== "inactive") {
      tenantRecord.status = "Pending Arrival";
    }
    tenantRecord.securityDeposit = Number(tenantRecord.securityDeposit || securityDeposit);
    const resolvedPhone = normalizeTenantPhone(tenantUser?.phone);
    if (resolvedPhone && (!tenantRecord.phone || tenantRecord.phone === "0000000000" || tenantRecord.phone === "Not provided")) {
      tenantRecord.phone = resolvedPhone;
    }
    if (normalizedTenantEmail && (!tenantRecord.email || tenantRecord.email === "no-email@easy-pg.local")) {
      tenantRecord.email = normalizedTenantEmail;
    }
    await tenantRecord.save();
  }

  if (tenantUser?._id) {
    await User.findByIdAndUpdate(tenantUser._id, {
      $set: {
        assignedPg: pgDoc._id,
        ownerId: pgDoc.ownerId
      }
    });
  }

  let agreement = await Agreement.findOne({ bookingId: booking.bookingId }).sort({ createdAt: -1 });
  const agreementPayload = {
    userId: tenantUser?._id || pgDoc.ownerId,
    ownerId: pgDoc.ownerId,
    pgId: pgDoc._id,
    bookingId: booking.bookingId,
    agreementId: agreement?.agreementId || `AGR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    pgName: pgDoc.pgName || booking.pgName || "N/A",
    roomNo: booking.roomType || "N/A",
    roomType: booking.roomType || "N/A",
    variantLabel,
    tenantName,
    rentAmount: safeRent,
    securityDeposit,
    startDate: checkInDate,
    endDate: checkOutDate,
    checkInDate,
    checkOutDate,
    isLongTerm: String(checkOutDate).toLowerCase() === "long term",
    fileUrl: pgDoc?.agreementTemplate?.agreementFileUrl || "",
    ownerSignatureUrl: pgDoc?.agreementTemplate?.ownerSignatureUrl || "",
    signed: Boolean(pgDoc?.agreementTemplate?.ownerSignatureUrl)
  };

  if (!agreement) {
    agreement = await Agreement.create(agreementPayload);
  } else {
    Object.assign(agreement, agreementPayload);
    await agreement.save();
  }

  if (safeRent > 0) {
    const nextDueDate = addMonths(checkInDate, 1);
    const nextMonth = getMonthLabel(nextDueDate);
    const nextPending = await PendingPayment.findOne({
      status: { $in: ["Pending", "Overdue"] },
      month: nextMonth,
      tenantName,
      $or: [{ pg: pgDoc._id }, { pgName: pgDoc.pgName }]
    });
    if (!nextPending) {
      await PendingPayment.create({
        tenant: tenantUser?._id || pgDoc.ownerId,
        pg: pgDoc._id,
        pgName: pgDoc.pgName || "",
        tenantName,
        amount: safeRent,
        dueDate: nextDueDate,
        status: "Pending",
        month: nextMonth
      });
    }
  }

  return { tenantRecord, agreement };
};

// Initialize Razorpay only if keys are configured
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// 1. CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const { amount, pgId, bookingId, type } = req.body; 
    
    if (!amount || (!pgId && !bookingId)) {
      return res.status(400).json({ success: false, message: "Amount and pgId or bookingId are required" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({ success: false, message: "Payment gateway not configured. Please contact admin." });
    }

    // Guard: block monthly rent payments until required KYC/docs are uploaded.
    // First/move-in payments remain allowed.
    if (String(type || "").toUpperCase() === "MONTHLY_RENT") {
      const userDocs = await User.findById(req.user.id)
        .select(
          "+idDocument.status +idDocument.fileUrl " +
          "+aadharCard.status +aadharCard.fileUrl " +
          "+rentalAgreementCopy.status +rentalAgreementCopy.fileUrl"
        )
        .lean();

      const docData = userDocs || {};
      const requiredFields = [
        { key: "idDocument", label: "ID Document" },
        { key: "aadharCard", label: "Aadhar Card" },
        { key: "rentalAgreementCopy", label: "Signed Agreement" }
      ];
      const missing = requiredFields
        .filter((r) => {
          const status = String(docData?.[r.key]?.status || "Pending");
          const fileUrl = String(docData?.[r.key]?.fileUrl || "").trim();
          return status === "Pending" || !fileUrl;
        })
        .map((r) => r.label);

      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Please upload required documents before paying rent: ${missing.join(", ")}.`
        });
      }
    }

    const requesterEmail = String(req.user?.email || "").trim().toLowerCase();
    let resolvedPgId = pgId || "";
    if (!bookingId && pgId) {
      const gateBooking = await Booking.findOne({
        pgId,
        status: { $in: ["Pending", "Confirmed"] },
        ownerApproved: true,
        $or: [
          { tenantUserId: req.user.id },
          requesterEmail ? { tenantEmail: new RegExp(`^${requesterEmail}$`, "i") } : null,
          req.user?.fullName || req.user?.name ? { tenantName: req.user?.fullName || req.user?.name } : null
        ].filter(Boolean)
      }).sort({ createdAt: -1 }).select("_id");

      if (!gateBooking) {
        return res.status(400).json({ success: false, message: "Owner approval is required before payment" });
      }
    }
    if (bookingId) {
      const booking = await Booking.findById(bookingId).select("status ownerApproved isPaid pgId tenantUserId tenantEmail");
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      if (!canUserPayForBooking(booking, req.user.id, requesterEmail, req.user?.fullName || req.user?.name || "")) {
        return res.status(403).json({ success: false, message: "You cannot pay for this booking" });
      }
      const isOwnerApproved = Boolean(booking.ownerApproved || String(booking.status || "") === "Confirmed");
      if (!isOwnerApproved || String(booking.status || "") === "Cancelled") {
        return res.status(400).json({ success: false, message: "Owner approval is required before payment" });
      }
      resolvedPgId = resolvedPgId || String(booking.pgId || "");
    }

    const options = {
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { pgId: resolvedPgId || "", bookingId: bookingId || "", type: type || "" }
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. VERIFY & SAVE (Connects to History)
const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      amountPaid, 
      pgId,
      type,
      month, // Added to record the specific rent month
      bookingId
    } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, message: "Payment verification is not configured" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    let signatureOk = razorpay_signature === expectedSign;

    // Fallback: if signature validation fails, cross-check payment via Razorpay API.
    // This helps avoid rejecting valid payments due to misconfigured signature flows.
    // Still enforces strict matching (order_id, amount, currency, and payment status).
    if (!signatureOk && razorpay && razorpay_payment_id && razorpay_order_id) {
      try {
        const payment = await razorpay.payments.fetch(String(razorpay_payment_id));
        const expectedAmountPaise = Math.round(Number(amountPaid || 0) * 100);
        const paymentAmountPaise = Number(payment?.amount || 0);
        const paymentCurrency = String(payment?.currency || '').toUpperCase();
        const paymentStatus = String(payment?.status || '').toLowerCase();
        const paymentOrderId = String(payment?.order_id || '');

        const statusOk = paymentStatus === 'authorized' || paymentStatus === 'captured';
        const amountOk = expectedAmountPaise > 0 && paymentAmountPaise === expectedAmountPaise;
        const orderOk = paymentOrderId && paymentOrderId === String(razorpay_order_id);
        const currencyOk = paymentCurrency === 'INR';

        signatureOk = Boolean(statusOk && amountOk && orderOk && currencyOk);
      } catch (fallbackErr) {
        // ignore fallback errors; we'll return invalid signature below
      }
    }

    if (signatureOk) {
      const tenantUser = await User.findById(req.user.id).select("fullName name email phone ownerId assignedPg");
      const tenantEmail = String(tenantUser?.email || "").trim().toLowerCase();
      const tenantName = await getTenantDisplayName(req.user.id, tenantUser?.fullName || tenantUser?.name || "Tenant");

      let targetBooking = null;
      if (bookingId) {
        targetBooking = await Booking.findById(bookingId);
        if (!targetBooking) {
          return res.status(404).json({ success: false, message: "Booking not found" });
        }
        if (!canUserPayForBooking(targetBooking, req.user.id, tenantEmail, tenantUser?.fullName || tenantUser?.name || "")) {
          return res.status(403).json({ success: false, message: "You cannot pay for this booking" });
        }
        const isOwnerApproved = Boolean(targetBooking.ownerApproved || String(targetBooking.status || "") === "Confirmed");
        if (!isOwnerApproved || String(targetBooking.status || "") === "Cancelled") {
          return res.status(400).json({ success: false, message: "Owner approval is required before payment" });
        }
      }
      if (!targetBooking && pgId) {
        targetBooking = await Booking.findOne({
          pgId,
          status: { $in: ["Pending", "Confirmed"] },
          ownerApproved: true,
          $or: [
            { tenantUserId: req.user.id },
            tenantEmail ? { tenantEmail: new RegExp(`^${tenantEmail}$`, "i") } : null,
            { tenantName: tenantName }
          ].filter(Boolean)
        }).sort({ createdAt: -1 });
      }
      if (bookingId && !targetBooking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      const normalizedPgId = targetBooking?.pgId || pgId || null;
      const pgDoc = normalizedPgId ? await Pg.findById(normalizedPgId).select("_id pgName ownerId price securityDeposit roomPrices agreementTemplate") : null;

      const normalizedPgName = pgDoc?.pgName || targetBooking?.pgName || null;

      let paymentMonth = month || new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
      const normalizedPaymentType = String(type || "").toUpperCase();
      // If client didn't send a billing month for MONTHLY_RENT, infer it from the relevant pending cycle.
      // This prevents all payments being recorded under the current month and fixes history collapsing.
      if (!month && normalizedPaymentType === "MONTHLY_RENT") {
        try {
          const pendingQuery = {
            status: { $in: ["Pending", "Overdue"] },
            $or: [
              { tenant: req.user.id },
              { tenantName: tenantName }
            ]
          };
          const pgMatchers = [
            normalizedPgId ? { pg: normalizedPgId } : null,
            normalizedPgName ? { pgName: normalizedPgName } : null
          ].filter(Boolean);
          if (pgMatchers.length > 0) {
            pendingQuery.$and = [{ $or: pgMatchers }];
          }
          const pendingPaymentsRaw = await PendingPayment.find(pendingQuery)
            .sort({ dueDate: 1 })
            .select("month dueDate");
          const pendingPayment = pickRelevantPendingPayment(pendingPaymentsRaw);
          if (pendingPayment) {
            const due = pendingPayment.dueDate ? new Date(pendingPayment.dueDate) : null;
            paymentMonth =
              pendingPayment.month ||
              (due && !Number.isNaN(due.getTime())
                ? due.toLocaleString("en-US", { month: "short", year: "numeric" })
                : paymentMonth);
          }
        } catch (inferErr) {
          // Non-critical: keep default paymentMonth
        }
      }


      // Idempotency guard: transactionId is unique, so retries / refreshes should not create duplicates.
      const existingByTransaction = await Payment.findOne({ transactionId: razorpay_payment_id })
        .sort({ paymentDate: -1 })
        .populate("pgId", "pgName");
      if (existingByTransaction) {
        // Best-effort: ensure booking/tenant records exist (safe + de-duplicated).
        if (targetBooking) {
          const paymentType = String(type || "").toUpperCase();
          const countsAsMoveInPayment =
            !paymentType ||
            paymentType === "MOVE_IN_PAYMENT" ||
            paymentType === "RENT_AND_DEPOSIT" ||
            paymentType === "RENT_ONLY";

          if (countsAsMoveInPayment && !targetBooking.isPaid) {
            targetBooking.isPaid = true;
            targetBooking.paymentStatus = "Paid";
            await targetBooking.save();
          }

          try {
            await ensureBookingCompletionRecords({
              booking: targetBooking,
              tenantUser,
              pgDoc:
                pgDoc ||
                (await Pg.findById(targetBooking.pgId).select(
                  "_id pgName ownerId price securityDeposit roomPrices agreementTemplate"
                )),
              tenantName: targetBooking.tenantName || tenantName,
              tenantEmail: targetBooking.tenantEmail || tenantEmail,
              rentAmount: Number(targetBooking.rentAmount || targetBooking.bookingAmount || pgDoc?.price || 0)
            });
          } catch (syncErr) {
            // Do not fail idempotent response due to non-critical completion sync.
            console.warn("Payment already processed; completion sync warning:", syncErr.message || syncErr);
          }
        }

        return res.status(200).json({
          success: true,
          message: "Payment already processed",
          data: existingByTransaction
        });
      }

      // Prevent accidental duplicate monthly payment entries for the same tenant + PG + amount.
      const duplicatePaymentQuery = {
        paymentStatus: { $in: ["Success", "Paid", "PAID"] },
        month: paymentMonth,
        amountPaid: Number(amountPaid || 0),
        $and: [
          {
            $or: [
              { user: req.user.id },
              { tenantName }
            ]
          }
        ]
      };
      const samePgMatchers = [
        normalizedPgId ? { pgId: normalizedPgId } : null,
        normalizedPgName ? { pgName: normalizedPgName } : null
      ].filter(Boolean);
      if (samePgMatchers.length > 0) {
        duplicatePaymentQuery.$and.push({ $or: samePgMatchers });
      }

      const existingMonthlyPayment = await Payment.findOne(duplicatePaymentQuery)
        .sort({ paymentDate: -1 })
        .populate("pgId", "pgName");
      if (existingMonthlyPayment) {
        return res.status(200).json({
          success: true,
          message: "Payment already recorded for this billing month.",
          data: existingMonthlyPayment
        });
      }

      // Create record with fields matching your table
      const commissionBreakdown = computeCommissionBreakdown({
        amount: Number(amountPaid || 0),
        commissionPercent: DEFAULT_PLATFORM_COMMISSION_PERCENT
      });
      let newPayment = null;
      try {
        newPayment = await Payment.create({
          user: req.user.id,
          ownerId: pgDoc?.ownerId || targetBooking?.ownerId || null,
          bookingRef: targetBooking?._id || null,
          bookingCode: targetBooking?.bookingId || null,
          pgId: normalizedPgId,
          pgName: normalizedPgName,
          tenantName,
          amountPaid: commissionBreakdown.grossAmount,
          grossAmount: commissionBreakdown.grossAmount,
          commissionRatePercent: commissionBreakdown.commissionRatePercent,
          platformCommissionAmount: commissionBreakdown.platformCommissionAmount,
          ownerPayoutAmount: commissionBreakdown.ownerPayoutAmount,
          month: paymentMonth,
          transactionId: razorpay_payment_id,
          paymentStatus: "Success",
          paymentDate: new Date()
        });
      } catch (err) {
        if (isMongoDuplicateKeyError(err)) {
          const existing = await Payment.findOne({ transactionId: razorpay_payment_id })
            .sort({ paymentDate: -1 })
            .populate("pgId", "pgName");
          if (existing) {
            return res.status(200).json({
              success: true,
              message: "Payment already processed",
              data: existing
            });
          }
        }
        throw err;
      }

      if (targetBooking) {
        targetBooking.ownerApproved = Boolean(targetBooking.ownerApproved || String(targetBooking.status || "") === "Confirmed");
        targetBooking.ownerApprovalStatus = targetBooking.ownerApproved ? "approved" : "pending";
        const paymentType = String(type || "").toUpperCase();
        // Booking.isPaid is used by owner booking UI as "move-in payment received".
        // Do NOT mark isPaid for monthly rent cycles.
        const countsAsMoveInPayment =
          !paymentType ||
          paymentType === "MOVE_IN_PAYMENT" ||
          paymentType === "RENT_AND_DEPOSIT" ||
          paymentType === "RENT_ONLY";
        if (countsAsMoveInPayment) {
          targetBooking.isPaid = true;
          targetBooking.paymentStatus = "Paid";
        }
        const monthlyRent = Number(targetBooking.rentAmount || targetBooking.bookingAmount || 0);
        const requiredDeposit = Number(targetBooking.securityDeposit ?? 0);
        const paidSoFarQuery = {
          paymentStatus: { $in: ["Success", "Paid", "PAID"] },
          $and: [
            {
              $or: [
                { user: req.user.id },
                { tenantName }
              ]
            }
          ]
        };
        const paidPgMatchers = [
          targetBooking.pgId ? { pgId: targetBooking.pgId } : null,
          targetBooking.pgName ? { pgName: targetBooking.pgName } : null
        ].filter(Boolean);
        if (paidPgMatchers.length > 0) {
          paidSoFarQuery.$and.push({ $or: paidPgMatchers });
        }
        const paidSoFarRaw = await Payment.find(paidSoFarQuery).select("amountPaid");
        const runningTotal = paidSoFarRaw.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
        const paidAmount = Number(amountPaid || 0);

        // Some clients send MOVE_IN_PAYMENT even when the user pays deposit-only.
        // Infer the intent from the paid amount so we can correctly mark booking flags.
        const effectivePaymentType = (() => {
          const raw = String(paymentType || "").toUpperCase();
          if (raw !== "MOVE_IN_PAYMENT") return raw;

          const rent = Number(monthlyRent || 0);
          const deposit = Number(requiredDeposit || 0);
          const full = rent + deposit;
          const amt = Number(paidAmount || 0);
          const tol = 1; // INR rounding guard

          if (full > 0 && amt >= full - tol) return "RENT_AND_DEPOSIT";

          const rentTol = rent > 0 ? Math.max(1, Math.round(rent * 0.05)) : 1;
          const depTol = deposit > 0 ? Math.max(1, Math.round(deposit * 0.05)) : 1;
          const nearRent = rent > 0 && Math.abs(amt - rent) <= rentTol;
          const nearDeposit = deposit > 0 && Math.abs(amt - deposit) <= depTol;

          if (nearDeposit && !nearRent) return "DEPOSIT_ONLY";
          if (nearRent && !nearDeposit) return "RENT_ONLY";

          // If deposit is smaller than rent, a smaller move-in payment is most likely deposit-only.
          if (deposit > 0 && rent > 0 && deposit < rent && amt >= deposit - depTol && amt < rent - rentTol) {
            return "DEPOSIT_ONLY";
          }

          // Fall back to legacy handling (running totals) if still ambiguous.
          return raw;
        })();

        const isDepositOnly = effectivePaymentType === "DEPOSIT_ONLY";
        const isRentOnly = effectivePaymentType === "RENT_ONLY" || effectivePaymentType === "MONTHLY_RENT";
        const isCombined = effectivePaymentType === "RENT_AND_DEPOSIT";

        if (isDepositOnly) {
          targetBooking.securityDepositPaid =
            Boolean(targetBooking.securityDepositPaid) || requiredDeposit <= 0 || paidAmount >= requiredDeposit;
        } else if (isRentOnly) {
          targetBooking.initialRentPaid =
            Boolean(targetBooking.initialRentPaid || targetBooking.isPaid) || paidAmount >= monthlyRent;
        } else if (isCombined) {
          targetBooking.initialRentPaid =
            Boolean(targetBooking.initialRentPaid || targetBooking.isPaid) || paidAmount >= monthlyRent;
          targetBooking.securityDepositPaid =
            Boolean(targetBooking.securityDepositPaid) || requiredDeposit <= 0 || paidAmount >= (monthlyRent + requiredDeposit);
        } else {
          // Backward-compatible fallback for old clients not sending payment intent
          targetBooking.initialRentPaid = Boolean(targetBooking.initialRentPaid || targetBooking.isPaid) || runningTotal >= monthlyRent;
          targetBooking.securityDepositPaid =
            Boolean(targetBooking.securityDepositPaid) || requiredDeposit <= 0 || runningTotal >= (monthlyRent + requiredDeposit);
        }
        if (targetBooking.ownerApproved && String(targetBooking.status || "") !== "Cancelled") {
          targetBooking.status = "Confirmed";
        }
        if (!targetBooking.tenantUserId) targetBooking.tenantUserId = req.user.id;
        if (tenantEmail && !targetBooking.tenantEmail) targetBooking.tenantEmail = tenantEmail;
        await targetBooking.save();

        await ensureBookingCompletionRecords({
          booking: targetBooking,
          tenantUser,
          pgDoc: pgDoc || await Pg.findById(targetBooking.pgId).select("_id pgName ownerId price securityDeposit roomPrices agreementTemplate"),
          tenantName: targetBooking.tenantName || tenantName,
          tenantEmail: targetBooking.tenantEmail || tenantEmail,
          rentAmount: Number(targetBooking.rentAmount || targetBooking.bookingAmount || pgDoc?.price || 0)
        });

      }

      if (normalizedPaymentType === "MONTHLY_RENT") {
        // Mark pending due as paid for this tenant/PG/month.
        const pgMatcher = [
          normalizedPgId ? { pg: normalizedPgId } : null,
          normalizedPgName ? { pgName: normalizedPgName } : null
        ].filter(Boolean);
        const pendingQuery = {
          status: { $in: ["Pending", "Overdue"] },
          month: paymentMonth,
          $or: [
            { tenant: req.user.id },
            { tenantName: tenantName }
          ]
        };
        if (pgMatcher.length > 0) {
          pendingQuery.$and = [{ $or: pgMatcher }];
        }

        const paidPending = await PendingPayment.findOneAndUpdate(
          pendingQuery,
          { $set: { status: "Paid" } },
          { sort: { dueDate: 1 } }
        );

        // After marking current cycle as paid, create the next cycle pending entry.
        // This prevents "next due date" from getting stuck on an old month.
        const nextAmount =
          Number(paidPending?.amount) ||
          Number(targetBooking?.rentAmount || targetBooking?.bookingAmount || 0) ||
          Number(amountPaid || 0);
        if (nextAmount > 0) {
          const nextDueAnchor = paidPending?.dueDate ? new Date(paidPending.dueDate) : new Date();
          const nextDueDate = addMonths(nextDueAnchor, 1);
          const nextMonth = getMonthLabel(nextDueDate);

          const nextPendingQuery = {
            status: { $in: ["Pending", "Overdue"] },
            month: nextMonth,
            $or: [
              { tenant: req.user.id },
              { tenantName }
            ]
          };
          if (pgMatcher.length > 0) {
            nextPendingQuery.$and = [{ $or: pgMatcher }];
          }

          const existingNextPending = await PendingPayment.findOne(nextPendingQuery).select("_id");
          if (!existingNextPending) {
            await PendingPayment.create({
              tenant: req.user.id,
              pg: normalizedPgId || undefined,
              pgName: normalizedPgName || "",
              tenantName,
              amount: nextAmount,
              dueDate: nextDueDate,
              status: "Pending",
              month: nextMonth
            });
          }
        }
      }

      if (targetBooking && pgDoc?.ownerId && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const owner = await User.findById(pgDoc.ownerId).select("email fullName");
        if (owner?.email) {
          try {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
              }
            });
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: owner.email,
              subject: `Payment Completed - ${normalizedPgName || "PG Booking"}`,
              html: `
                <h2>Booking payment completed</h2>
                <p><strong>Tenant:</strong> ${targetBooking.tenantName || tenantName}</p>
                <p><strong>Booking ID:</strong> ${targetBooking.bookingId}</p>
                <p><strong>PG:</strong> ${normalizedPgName || "N/A"}</p>
                <p><strong>Amount Paid:</strong> INR ${commissionBreakdown.grossAmount.toLocaleString("en-IN")}</p>
                <p><strong>Platform Commission (${commissionBreakdown.commissionRatePercent}%):</strong> INR ${commissionBreakdown.platformCommissionAmount.toLocaleString("en-IN")}</p>
                <p><strong>Owner Payout:</strong> INR ${commissionBreakdown.ownerPayoutAmount.toLocaleString("en-IN")}</p>
                <p><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
              `
            });
          } catch (mailErr) {
            console.warn("Owner payment notification failed:", mailErr.message || mailErr);
          }
        }
      }

      // Populate PG details so frontend has the name immediately
      const populatedPayment = await Payment.findById(newPayment._id).populate('pgId', 'pgName');

      return res.status(200).json({
        success: true,
        message: "Payment recorded",
        data: populatedPayment 
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid signature! (Razorpay verification failed — check that backend RAZORPAY_KEY_SECRET matches the Key Secret for the Key ID used in checkout.)"
      });
    }
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message: "Duplicate record detected. Please refresh and try again."
      });
    }
    res.status(500).json({ success: false, message: "Payment verification failed. Please try again." });
  }
};

// 3. GET HISTORY
const getUserPayments = async (req, res) => {
  try {
    const allPayments = await Payment.find({ user: req.user.id })
      .populate('pgId', 'pgName location city') 
      .sort({ paymentDate: -1 });

    res.status(200).json({ success: true, data: allPayments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

const getUserPaymentStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("fullName email");
    const tenantName = user?.fullName || "Tenant";
    const tenantEmail = String(user?.email || "").trim().toLowerCase();

    const requestedBookingId = String(req.query?.bookingId || "").trim();

    const bookingMatchers = [
      { tenantUserId: req.user.id },
      tenantEmail ? { tenantEmail: new RegExp(`^${tenantEmail}$`, "i") } : null,
      { tenantName }
    ].filter(Boolean);

    let requestedBooking = null;
    if (requestedBookingId && requestedBookingId.match(/^[a-fA-F0-9]{24}$/)) {
      requestedBooking = await Booking.findById(requestedBookingId);
      if (requestedBooking && !canUserPayForBooking(requestedBooking, req.user.id, tenantEmail, tenantName)) {
        requestedBooking = null;
      }
    }

    const tenantRecord = tenantEmail
      ? await Tenant.findOne({ email: new RegExp(`^${tenantEmail}$`, "i") })
          .sort({ createdAt: -1 })
          .select("status moveOutCompletedAt")
      : null;

    const baseMoveOutCompleted = Boolean(
      tenantRecord &&
      String(tenantRecord.status || "").toLowerCase() === "inactive" &&
      tenantRecord.moveOutCompletedAt
    );

    // If a newer booking exists after move-out completion, treat the user as active again.
    let moveOutCompleted = baseMoveOutCompleted;
    if (baseMoveOutCompleted) {
      const latestBooking = requestedBooking
        ? requestedBooking
        : await Booking.findOne({
            status: { $in: ["Pending", "Confirmed"] },
            $or: bookingMatchers
          })
            .sort({ createdAt: -1 })
            .select("createdAt");
      const hasPostMoveOutBooking = Boolean(
        latestBooking &&
        (!tenantRecord?.moveOutCompletedAt ||
          !latestBooking?.createdAt ||
          new Date(latestBooking.createdAt) > new Date(tenantRecord.moveOutCompletedAt))
      );
      moveOutCompleted = baseMoveOutCompleted && !hasPostMoveOutBooking;
    }

    const historyRaw = await Payment.find({ user: req.user.id, paymentStatus: { $in: ["Success", "Paid", "PAID"] } })
      .sort({ paymentDate: -1 })
      .select("month paymentDate amountPaid paymentStatus _id pgId pgName tenantName");

    const totalPaid = historyRaw.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    let history = historyRaw.map((p) => ({
      id: p._id,
      month:
        p.month ||
        new Date(p.paymentDate).toLocaleString("en-US", { month: "short", year: "numeric" }),
      date: new Date(p.paymentDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      amount: Number(p.amountPaid) || 0,
      status: "Paid",
      pgId: p.pgId || null,
      pgName: p.pgName || null
    }));

    if (moveOutCompleted) {
      return res.status(200).json({
        success: true,
        totalPaid,
        nextPayment: {
          amount: 0,
          rentDue: 0,
          securityDepositDue: 0,
          pgId: null,
          pgName: "",
          bookingId: null,
          month: "",
          dueDateMs: null,
          dueDate: "No due"
        },
        lateFine: 0,
        history,
        moveOutCompleted: true
      });
    }

    const booking = requestedBooking
      ? requestedBooking
      : await Booking.findOne({
          status: { $in: ["Pending", "Confirmed"] },
          $and: [
            {
              $or: [{ ownerApproved: true }, { status: "Confirmed" }]
            },
            {
              $or: bookingMatchers
            }
          ]
        }).sort({ createdAt: -1 });
    const pricingBooking = requestedBooking
      ? requestedBooking
      : await Booking.findOne({
          $or: bookingMatchers
        }).sort({ createdAt: -1 });

    const pendingPaymentsRaw = await PendingPayment.find({
      status: { $in: ["Pending", "Overdue"] },
      $or: [
        { tenant: req.user.id },
        { tenantName }
      ]
    }).sort({ dueDate: 1 });
    const pendingPayment = pickRelevantPendingPayment(pendingPaymentsRaw);
    let currentRentDue = 0;
    let currentSecurityDeposit = 0;
    const sourceBooking = pricingBooking || booking;
    let bookingPgId = sourceBooking?.pgId || null;
    let bookingPgName = sourceBooking?.pgName || "";
    if (sourceBooking) {
      const pg = sourceBooking.pgId
        ? await Pg.findById(sourceBooking.pgId).select("price securityDeposit roomPrices")
        : sourceBooking.pgName
          ? await Pg.findOne({ pgName: sourceBooking.pgName }).select("price securityDeposit roomPrices")
          : null;
      const pricing = resolveVariantPricing({
        roomPrices: pg?.roomPrices,
        roomType: sourceBooking.roomType || sourceBooking.variantLabel || "",
        variantLabel: sourceBooking.variantLabel || "",
        fallbackRent: Number(sourceBooking.rentAmount || sourceBooking.bookingAmount || pg?.price || 0),
        fallbackDeposit: Number(sourceBooking.securityDeposit || pg?.securityDeposit || 0)
      });
      currentRentDue = Number(pricing.rentAmount || sourceBooking.rentAmount || sourceBooking.bookingAmount || pg?.price || 0);
      currentSecurityDeposit = Math.max(
        0,
        Number(pricing.securityDeposit || sourceBooking.securityDeposit || pg?.securityDeposit || 0)
      );
      if (!bookingPgId && pg?._id) bookingPgId = pg._id;
      if (!bookingPgName && pg?.pgName) bookingPgName = pg.pgName;
    }

    let nextPayment = null;
    let lateFine = 0;
    const bookingSecurityDeposit = Math.max(0, Number(currentSecurityDeposit || booking?.securityDeposit || 0));

    const inferDepositPaidFromPayments = async ({ targetBooking, rentAmount, depositAmount, pgId, pgName }) => {
      const deposit = Math.max(0, Number(depositAmount || 0));
      if (deposit <= 0) return true;

      const rent = Math.max(0, Number(rentAmount || 0));
      const full = rent + deposit;

      const matchOr = [
        targetBooking?._id ? { bookingRef: targetBooking._id } : null,
        targetBooking?.bookingId ? { bookingCode: targetBooking.bookingId } : null,
        pgId ? { pgId } : null,
        pgName ? { pgName } : null
      ].filter(Boolean);
      if (matchOr.length === 0) return false;

      const payments = await Payment.find({
        user: req.user.id,
        paymentStatus: { $in: ["Success", "Paid", "PAID"] },
        $or: matchOr
      })
        .sort({ paymentDate: 1 })
        .select("amountPaid");

      const amounts = payments.map((p) => Number(p.amountPaid) || 0).filter((n) => Number.isFinite(n) && n > 0);
      if (amounts.length === 0) return false;

      const tol = 1;
      if (full > 0 && amounts.some((a) => a >= full - tol)) return true;

      // Conservative deposit-only inference: only treat a payment as deposit if it is clearly distinct from rent.
      const depTol = Math.max(1, Math.round(deposit * 0.02));
      const rentTol = rent > 0 ? Math.max(1, Math.round(rent * 0.02)) : 1;

      if (rent > 0 && Math.abs(deposit - rent) > Math.max(depTol, rentTol)) {
        if (amounts.some((a) => Math.abs(a - deposit) <= depTol)) return true;
        if (deposit < rent && amounts.some((a) => a >= deposit - depTol && a < rent - rentTol)) return true;
      }

      return false;
    };

    const inferredDepositPaid = booking
      ? await inferDepositPaidFromPayments({
          targetBooking: booking,
          rentAmount: Number(currentRentDue || booking?.rentAmount || booking?.bookingAmount || 0),
          depositAmount: bookingSecurityDeposit,
          pgId: bookingPgId,
          pgName: bookingPgName
        })
      : false;

    const effectiveSecurityDepositPaid = Boolean(booking?.securityDepositPaid) || inferredDepositPaid;

    const securityDepositDue =
      booking && !effectiveSecurityDepositPaid && bookingSecurityDeposit > 0 ? bookingSecurityDeposit : 0;

    const inferPaymentOptionForBooking = async (targetBooking) => {
      const explicit = String(targetBooking?.paymentOption || "").trim().toLowerCase();
      if (explicit) return explicit;

      if (!targetBooking?._id) return "deposit_only";

      const payments = await Payment.find({
        paymentStatus: { $in: ["Success", "Paid", "PAID"] },
        $or: [
          { bookingRef: targetBooking._id },
          targetBooking.bookingId ? { bookingCode: targetBooking.bookingId } : null
        ].filter(Boolean)
      })
        .sort({ paymentDate: 1 })
        .select("amountPaid");

      const firstPaid = Number(payments?.[0]?.amountPaid || 0);
      const rent = Number(targetBooking.rentAmount || targetBooking.bookingAmount || 0);
      const deposit = Number(targetBooking.securityDeposit || 0);
      const full = rent + deposit;

      if (full > 0 && firstPaid >= full) return "full_payment";
      if (deposit > 0 && firstPaid >= deposit && firstPaid < full) return "deposit_only";

      // Backward-compat: booking UI historically defaulted to deposit-only.
      return "deposit_only";
    };

    const normalizedPaymentOption = booking ? await inferPaymentOptionForBooking(booking) : "deposit_only";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDateObj = booking?.checkInDate ? new Date(booking.checkInDate) : null;
    const checkInMs = checkInDateObj && !Number.isNaN(checkInDateObj.getTime()) ? checkInDateObj.setHours(0, 0, 0, 0) : NaN;
    const initialRentDueNow = Number.isFinite(checkInMs) ? today.getTime() >= checkInMs : true;

    // If tenant chose deposit-only at booking time, handle deposit first,
    // and only allow rent payment on/after check-in date.
    if (booking && normalizedPaymentOption === "deposit_only") {
      const rentDue = !Boolean(booking.initialRentPaid) && initialRentDueNow ? Number(currentRentDue || 0) : 0;
      const depositDue = securityDepositDue;

      if (depositDue > 0) {
        const due = new Date();
        due.setHours(0, 0, 0, 0);
        nextPayment = {
          amount: Number(depositDue),
          rentDue: 0,
          securityDepositDue: depositDue,
          pgId: bookingPgId || null,
          pgName: bookingPgName || "",
          bookingId: booking._id,
          month: due.toLocaleString("en-US", { month: "short", year: "numeric" }),
          dueDateMs: due.getTime(),
          dueDate: due.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
        };
      } else if (rentDue > 0) {
        const due = Number.isFinite(checkInMs) ? new Date(checkInMs) : new Date();
        due.setHours(0, 0, 0, 0);
        nextPayment = {
          amount: Number(rentDue),
          rentDue,
          securityDepositDue: 0,
          pgId: bookingPgId || null,
          pgName: bookingPgName || "",
          bookingId: booking._id,
          month: due.toLocaleString("en-US", { month: "short", year: "numeric" }),
          dueDateMs: due.getTime(),
          dueDate: due.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
        };
      } else {
        // Deposit paid, rent not yet due.
        const due = Number.isFinite(checkInMs) ? new Date(checkInMs) : null;
        nextPayment = {
          amount: 0,
          rentDue: 0,
          securityDepositDue: 0,
          pgId: bookingPgId || null,
          pgName: bookingPgName || "",
          bookingId: booking._id,
          month: due ? due.toLocaleString("en-US", { month: "short", year: "numeric" }) : "",
          dueDateMs: due ? due.getTime() : null,
          dueDate: due ? due.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "No due"
        };
      }

      return res.status(200).json({
        success: true,
        totalPaid,
        nextPayment,
        lateFine: 0,
        history,
        moveOutCompleted: false
      });
    }

    if (pendingPayment) {
      const due = getNextCycleDueDate(pendingPayment.dueDate) || new Date(pendingPayment.dueDate);
      due.setHours(0, 0, 0, 0);
      const overdueDays = Math.max(0, Math.floor((today - due) / (24 * 60 * 60 * 1000)));
      lateFine = overdueDays * 100;
      const rentDue = Number(currentRentDue || pendingPayment.amount || 0);
      const amount = rentDue + securityDepositDue;
      nextPayment = {
        amount,
        rentDue,
        securityDepositDue,
        pgId: pendingPayment.pg || bookingPgId || null,
        pgName: pendingPayment.pgName || bookingPgName || "",
        bookingId: booking?._id || null,
        month: due.toLocaleString("en-US", { month: "short", year: "numeric" }),
        dueDateMs: due.getTime(),
        dueDate: due.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
      };
    } else if (booking) {
      const rentDue = Number(currentRentDue || 0);
      const amount = rentDue + securityDepositDue;
      const fallbackDue = getNextCycleDueDate(booking.checkInDate || new Date());
      const due = new Date(fallbackDue || new Date());
      due.setHours(0, 0, 0, 0);
      nextPayment = {
        amount,
        rentDue,
        securityDepositDue,
        pgId: bookingPgId || null,
        pgName: bookingPgName || "",
        bookingId: booking._id,
        month: due.toLocaleString("en-US", { month: "short", year: "numeric" }),
        dueDateMs: due.getTime(),
        dueDate: due.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
      };
    }

    return res.status(200).json({
      success: true,
      totalPaid,
      nextPayment,
      lateFine,
      history,
      moveOutCompleted: false
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DOWNLOAD RECEIPT (Triggered by orange icon)
const downloadReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('pgId', 'pgName location city');
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (String(payment.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to download this receipt" });
    }

    const [tenantName, userProfile, userDoc] = await Promise.all([
      getTenantDisplayName(req.user.id, payment.tenantName || req.user.fullName || req.user.name),
      Profile.findOne({ userId: req.user.id }).select("personalInfo"),
      User.findById(req.user.id).select("email fullName name +city +state")
    ]);
    const issuedDate = new Date();
    const paymentDate = new Date(payment.paymentDate);
    const bookingQuery = {
      tenantUserId: req.user.id
    };
    if (payment.pgId?._id || payment.pgId) {
      bookingQuery.pgId = payment.pgId._id || payment.pgId;
    } else if (payment.pgName) {
      bookingQuery.pgName = payment.pgName;
    }
    const linkedBooking = await Booking.findOne(bookingQuery).sort({ createdAt: -1 });
    const linkedPg = payment.pgId?._id
      ? await Pg.findById(payment.pgId._id).select("price securityDeposit roomPrices")
      : payment.pgName
        ? await Pg.findOne({ pgName: payment.pgName }).select("price securityDeposit roomPrices")
        : null;
    const receiptPricing = resolveVariantPricing({
      roomPrices: linkedPg?.roomPrices,
      roomType: linkedBooking?.roomType || linkedBooking?.variantLabel || "",
      variantLabel: linkedBooking?.variantLabel || "",
      fallbackRent: Number(linkedBooking?.rentAmount || linkedBooking?.bookingAmount || linkedPg?.price || payment.amountPaid || 0),
      fallbackDeposit: Number(linkedBooking?.securityDeposit || linkedPg?.securityDeposit || 0)
    });
    const amount = Math.max(0, Number(payment.amountPaid || 0));
    const propertyName = payment.pgId?.pgName || payment.pgName || 'N/A';
    const propertyLocation = payment.pgId?.location || payment.pgId?.city || 'N/A';
    const receiptNo = String(payment._id);
    const receiptNoShort = receiptNo.slice(-12).toUpperCase();
    const transactionId = payment.transactionId || 'N/A';
    const monthLabel = payment.month || paymentDate.toLocaleString("en-US", { month: "short", year: "numeric" });
    const tenantEmail = pickFirstValid(userDoc?.email, userProfile?.personalInfo?.email, "N/A");
    const tenantAddress = pickFirstValid(
      userProfile?.personalInfo?.city,
      userDoc?.city,
      userProfile?.personalInfo?.state,
      userDoc?.state,
      propertyLocation
    );
    const paymentMethod = pickFirstValid(payment.paymentMethod, "Online");
    const quantity = 1;
    const unitPrice = amount;
    const subtotal = amount;
    const taxRate = 0;
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const totalAmount = subtotal + taxAmount;

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${monthLabel.replace(/\s+/g, "_")}.pdf`);

    doc.pipe(res);
    // Top style bar
    doc.rect(35, 28, 525, 4).fill("#D97706");
    doc.rect(35, 36, 525, 1).fill("#E5E0D9");

    // Header metadata
    doc.fillColor("#1C1C1C").fontSize(24).text("Paid Invoice Receipt", 35, 78, { align: "center", width: 525 });
    doc.fontSize(10).fillColor("#4B4B4B")
      .text("EASYPG MANAGER", 35, 112, { align: "center", width: 525 })
      .text(`Receipt No: ${receiptNoShort}`, 370, 54, { width: 175, align: "right" })
      .text(`Issue Date: ${issuedDate.toLocaleDateString("en-IN")}`, 370, 68, { width: 175, align: "right" });

    // Bill to
    doc.fontSize(11).fillColor("#1C1C1C").text("Bill To:", 45, 145);
    doc.fontSize(10).fillColor("#4B4B4B")
      .text(`- Customer Name: ${tenantName}`, 45, 163)
      .text(`- Address: ${tenantAddress}`, 45, 178)
      .text(`- Email: ${tenantEmail}`, 45, 193)
      .text(`- Property: ${propertyName}`, 45, 208)
      .text(`- Billing Month: ${monthLabel}`, 45, 223);

    // Items table header
    const tableX = 45;
    const tableY = 255;
    const tableW = 500;
    doc.rect(tableX, tableY, tableW, 26).fillAndStroke("#F3F4F6", "#E5E0D9");
    doc.fontSize(10).fillColor("#1C1C1C")
      .text("Description", tableX + 12, tableY + 9)
      .text("Quantity", tableX + 245, tableY + 9, { width: 70, align: "center" })
      .text("Unit Price", tableX + 330, tableY + 9, { width: 80, align: "right" })
      .text("Total", tableX + 420, tableY + 9, { width: 70, align: "right" });

    // Items table row
    doc.rect(tableX, tableY + 26, tableW, 28).stroke("#E5E0D9");
    doc.fontSize(10).fillColor("#4B4B4B")
      .text("Monthly PG Rent", tableX + 12, tableY + 36)
      .text(String(quantity), tableX + 245, tableY + 36, { width: 70, align: "center" })
      .text(`INR ${unitPrice.toLocaleString("en-IN")}`, tableX + 330, tableY + 36, { width: 80, align: "right" })
      .text(`INR ${totalAmount.toLocaleString("en-IN")}`, tableX + 420, tableY + 36, { width: 70, align: "right" });

    // Summary rows
    const sumY = tableY + 64;
    const sumLabelX = tableX + tableW - 170;
    const sumValueX = tableX + tableW - 75;
    const sumValueWidth = 65;
    doc.rect(tableX, sumY, tableW, 78).stroke("#E5E0D9");
    doc.fontSize(10).fillColor("#1C1C1C")
      .text("Subtotal", sumLabelX, sumY + 12, { width: 95, align: "right" })
      .text(`INR ${subtotal.toLocaleString("en-IN")}`, sumValueX, sumY + 12, { width: sumValueWidth, align: "right" })
      .text(`Tax (${taxRate}%)`, sumLabelX, sumY + 31, { width: 95, align: "right" })
      .text(`INR ${taxAmount.toLocaleString("en-IN")}`, sumValueX, sumY + 31, { width: sumValueWidth, align: "right" });

    doc.rect(tableX, sumY + 48, tableW, 30).fillAndStroke("#FEF3C7", "#E5E0D9");
    doc.fontSize(11).fillColor("#1C1C1C")
      .text("Total Amount", sumLabelX - 5, sumY + 58, { width: 100, align: "right" })
      .fillColor("#B45309")
      .text(`INR ${totalAmount.toLocaleString("en-IN")}`, sumValueX, sumY + 58, { width: sumValueWidth, align: "right" });

    // Footer details
    const footerY = sumY + 96;
    doc.fontSize(10).fillColor("#4B4B4B")
      .text(`Payment Method: ${paymentMethod}`, 45, footerY)
      .text(`Transaction ID: ${transactionId}`, 45, footerY + 16)
      .text(`Payment Date: ${paymentDate.toLocaleDateString("en-IN")}`, 45, footerY + 32);

    doc.fontSize(10).fillColor("#1C1C1C").text("Authorized Signature:", 370, footerY + 8);
    doc.moveTo(370, footerY + 28).lineTo(535, footerY + 28).strokeColor("#9CA3AF").stroke();
    doc.fontSize(9).fillColor("#4B4B4B").text(tenantName, 370, footerY + 33);

    doc.fontSize(9).fillColor("#6B7280").text(
      "This is a computer-generated receipt and does not require a physical signature.",
      45,
      730,
      { width: 500, align: "center" }
    );

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Error generating PDF" });
  }
};

module.exports = { createOrder, verifyPayment, getUserPayments, getUserPaymentStats, downloadReceipt };
