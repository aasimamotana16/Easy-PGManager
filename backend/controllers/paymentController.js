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

const deriveSecurityDepositAmount = (monthlyRent) => {
  const rent = Math.max(0, Number(monthlyRent) || 0);
  return rent * 2;
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
  const securityDeposit = deriveSecurityDepositAmount(safeRent);
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

  let tenantRecord = await Tenant.findOne({
    ownerId: pgDoc.ownerId,
    $and: [
      {
        $or: [
          { email: tenantEmail || "__no_email__" },
          { name: tenantName }
        ]
      },
      {
        $or: [{ pgId: pgDoc._id }, { pgName: pgDoc.pgName }]
      }
    ]
  }).sort({ createdAt: -1 });

  if (!tenantRecord) {
    const resolvedPhone = normalizeTenantPhone(tenantUser?.phone);
    tenantRecord = await Tenant.create({
      ownerId: pgDoc.ownerId,
      name: tenantName,
      phone: resolvedPhone || "Not provided",
      email: tenantEmail || "no-email@easy-pg.local",
      pgId: pgDoc._id,
      pgName: pgDoc.pgName || "",
      room: booking.roomType || "N/A",
      joiningDate: checkInDate,
      status: "Pending Arrival",
      securityDeposit
    });
  } else {
    tenantRecord.pgId = pgDoc._id;
    tenantRecord.pgName = pgDoc.pgName || tenantRecord.pgName;
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
    if (tenantEmail && (!tenantRecord.email || tenantRecord.email === "no-email@easy-pg.local")) {
      tenantRecord.email = tenantEmail;
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

    if (razorpay_signature === expectedSign) {
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

      const paymentMonth = month || new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
      const normalizedPgName = pgDoc?.pgName || targetBooking?.pgName || null;

      // Create record with fields matching your table
      const newPayment = await Payment.create({
        user: req.user.id,
        pgId: normalizedPgId, 
        pgName: normalizedPgName,
        tenantName,
        amountPaid,
        month: paymentMonth,
        transactionId: razorpay_payment_id,
        paymentStatus: "Success",
        paymentDate: new Date()
      });

      if (targetBooking) {
        targetBooking.ownerApproved = Boolean(targetBooking.ownerApproved || String(targetBooking.status || "") === "Confirmed");
        targetBooking.ownerApprovalStatus = targetBooking.ownerApproved ? "approved" : "pending";
        targetBooking.isPaid = true;
        targetBooking.paymentStatus = "Paid";
        const monthlyRent = Number(targetBooking.rentAmount || targetBooking.bookingAmount || 0);
        const requiredDeposit = Number(targetBooking.securityDeposit || deriveSecurityDepositAmount(monthlyRent));
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
        targetBooking.initialRentPaid = Boolean(targetBooking.initialRentPaid) || runningTotal >= monthlyRent;
        targetBooking.securityDepositPaid =
          Boolean(targetBooking.securityDepositPaid) || requiredDeposit <= 0 || runningTotal >= (monthlyRent + requiredDeposit);
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

        try {
          await generateAgreementPdf(targetBooking._id);
        } catch (pdfErr) {
          console.warn("Agreement PDF generation warning after payment:", pdfErr.message || pdfErr);
        }
      }

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
                <p><strong>Amount:</strong> INR ${Number(amountPaid || 0).toLocaleString("en-IN")}</p>
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
      return res.status(400).json({ success: false, message: "Invalid signature!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    const historyRaw = await Payment.find({ user: req.user.id, paymentStatus: { $in: ["Success", "Paid", "PAID"] } })
      .sort({ paymentDate: -1 })
      .select("month paymentDate amountPaid paymentStatus _id pgId pgName tenantName");

    // Keep latest successful payment per month (prevents stale/duplicate legacy entries in history)
    const latestByMonth = new Map();
    historyRaw.forEach((p) => {
      const monthKey =
        p.month || new Date(p.paymentDate).toLocaleString("en-US", { month: "short", year: "numeric" });
      if (!latestByMonth.has(monthKey)) {
        latestByMonth.set(monthKey, p);
      }
    });
    const filteredHistoryRaw = Array.from(latestByMonth.values()).sort(
      (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
    );

    const totalPaid = filteredHistoryRaw.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const history = filteredHistoryRaw.map((p) => ({
      id: p._id,
      month: p.month,
      date: new Date(p.paymentDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      amount: Number(p.amountPaid) || 0,
      status: "Paid",
      pgId: p.pgId || null,
      pgName: p.pgName || null
    }));

    const booking = await Booking.findOne({
      status: { $in: ["Pending", "Confirmed"] },
      $and: [
        {
          $or: [
            { ownerApproved: true },
            { status: "Confirmed" }
          ]
        },
        {
          $or: [
            { tenantUserId: req.user.id },
            tenantEmail ? { tenantEmail: new RegExp(`^${tenantEmail}$`, "i") } : null,
            { tenantName }
          ].filter(Boolean)
        }
      ]
    }).sort({ createdAt: -1 });

    const pendingPaymentsRaw = await PendingPayment.find({
      status: { $in: ["Pending", "Overdue"] },
      $or: [
        { tenant: req.user.id },
        { tenantName }
      ]
    }).sort({ dueDate: 1 });
    const pendingPayment = pickRelevantPendingPayment(pendingPaymentsRaw);

    let nextPayment = null;
    let lateFine = 0;

    if (pendingPayment) {
      const due = getNextCycleDueDate(pendingPayment.dueDate) || new Date(pendingPayment.dueDate);
      const today = new Date();
      due.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const overdueDays = Math.max(0, Math.floor((today - due) / (24 * 60 * 60 * 1000)));
      lateFine = overdueDays * 100;
      nextPayment = {
        amount: Number(pendingPayment.amount) || 0,
        pgId: pendingPayment.pg || booking?.pgId || null,
        pgName: pendingPayment.pgName || booking?.pgName || "",
        bookingId: booking?._id || null,
        month: due.toLocaleString("en-US", { month: "short", year: "numeric" }),
        dueDate: due.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
      };
    } else if (booking) {
      const pg = booking.pgId ? await Pg.findById(booking.pgId).select("price securityDeposit roomPrices") : null;
      const pricing = resolveVariantPricing({
        roomPrices: pg?.roomPrices,
        roomType: booking.roomType || booking.variantLabel || "",
        variantLabel: booking.variantLabel || "",
        fallbackRent: Number(booking.rentAmount || booking.bookingAmount || pg?.price || 0),
        fallbackDeposit: Number(booking.securityDeposit || pg?.securityDeposit || 0)
      });
      const rent = Number(booking.rentAmount || booking.bookingAmount || pricing.rentAmount || 0);
      const fallbackDue = getNextCycleDueDate(booking.checkInDate || new Date());
      nextPayment = {
        amount: rent,
        pgId: booking.pgId || null,
        pgName: booking.pgName || "",
        bookingId: booking._id,
        month: (fallbackDue || new Date()).toLocaleString("en-US", { month: "short", year: "numeric" }),
        dueDate: (fallbackDue || new Date()).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
      };
    }

    return res.status(200).json({
      success: true,
      totalPaid,
      nextPayment,
      lateFine,
      history
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
    const amount = Number(payment.amountPaid || 0);
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
