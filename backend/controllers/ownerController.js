const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const Pg = require('../models/pgModel');
const User = require('../models/userModel');
const Tenant = require('../models/tenantModel');
const Booking = require('../models/bookingModel');
const Agreement = require('../models/agreementModel');
const SupportTicket = require('../models/supportTicketModel');
const Payment = require('../models/paymentModel');
const PendingPayment = require('../models/pendingPaymentModel');
const CheckIn = require('../models/checkInModel');
const Room = require('../models/roomModel');
const Review = require('../models/reviewModel');
const ExtensionRequest = require('../models/extensionRequestModel');
const DamageReport = require('../models/damageReportModel');
const FineTransaction = require('../models/fineTransactionModel');
const { mergeRoomPriceVariants, resolveVariantPricing } = require('../utils/pricingUtils');
const { generateAgreementPdf } = require('../utils/agreementPdf');
const { calculateLateFine, validateMoveIn } = require('../utils/leaseUtils');
const {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  computeCommissionBreakdown,
  computeCancellationRefundSummary,
  getOwnerPayoutAmount
} = require('../utils/paymentPolicyUtils');
const { jsPDF } = require('jspdf');
const { autoTable } = require('jspdf-autotable');

const getMonthLabel = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const addMonths = (dateInput, months) => {
  const d = new Date(dateInput);
  d.setMonth(d.getMonth() + months);
  return d;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const LATE_FINE_PER_DAY = 100;
const PENDING_PAYMENT_VISIBLE_DAYS_BEFORE_DUE = 5;
const MONTH_SHORT_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SUCCESS_PAYMENT_STATUSES = ['Success', 'PAID', 'Paid'];

const resolveMonthRangeFromShortName = (monthShort) => {
  const normalized = String(monthShort || "").trim().toLowerCase();
  const monthIndex = MONTH_SHORT_NAMES.findIndex((m) => m.toLowerCase() === normalized);
  const now = new Date();
  const year = now.getFullYear();
  if (monthIndex < 0) {
    return {
      label: MONTH_SHORT_NAMES[now.getMonth()],
      start: new Date(year, now.getMonth(), 1),
      end: new Date(year, now.getMonth() + 1, 1)
    };
  }

  return {
    label: MONTH_SHORT_NAMES[monthIndex],
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 1)
  };
};

const deriveSecurityDepositAmount = (monthlyRent, configuredDeposit) => {
  const explicitDeposit = Number(configuredDeposit);
  if (Number.isFinite(explicitDeposit) && explicitDeposit >= 0) {
    return explicitDeposit;
  }
  const rent = Math.max(0, Number(monthlyRent) || 0);
  return rent > 0 ? 0 : 0;
};

const normalizeBaseUrl = (value, fallback = "http://localhost:3000") => {
  const raw = String(value || "").trim();
  const source = raw || fallback;
  const withProtocol = /^https?:\/\//i.test(source) ? source : `http://${source}`;
  return withProtocol.replace(/\/+$/, "");
};

const pickFirstNumeric = (...values) => {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return 0;
};

const normalizeRoomTypeKey = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/sharing|share|room/gi, "")
    .replace(/[^a-z0-9]/g, "");

const getRoomCapacity = (room = {}) => {
  const totalRooms = Math.max(0, Number(room?.totalRooms) || 0);
  const bedsPerRoom = Math.max(1, Number(room?.bedsPerRoom) || 1);
  return totalRooms * bedsPerRoom;
};

const attachComputedRoomOccupancy = async (pgItems = []) => {
  if (!Array.isArray(pgItems) || pgItems.length === 0) return [];

  const normalizedPgs = pgItems.map((pg) => (typeof pg.toObject === "function" ? pg.toObject() : pg));
  const pgIds = normalizedPgs
    .map((pg) => pg?._id)
    .filter(Boolean);

  if (pgIds.length === 0) return normalizedPgs;

  const bookings = await Booking.find({
    pgId: { $in: pgIds },
    status: "Confirmed"
  })
    .select("pgId roomType variantLabel seatsBooked")
    .lean();

  const occupiedByPg = new Map();
  bookings.forEach((booking) => {
    const pgIdKey = String(booking?.pgId || "");
    if (!pgIdKey) return;

    const rawRoomType = booking?.variantLabel || booking?.roomType || "";
    const roomKey = normalizeRoomTypeKey(rawRoomType);
    if (!roomKey) return;

    const bookedSeats = Math.max(1, Number(booking?.seatsBooked) || 1);
    const byType = occupiedByPg.get(pgIdKey) || new Map();
    byType.set(roomKey, (byType.get(roomKey) || 0) + bookedSeats);
    occupiedByPg.set(pgIdKey, byType);
  });

  return normalizedPgs.map((pg) => {
    const rooms = Array.isArray(pg?.rooms) ? pg.rooms : [];
    const byType = occupiedByPg.get(String(pg?._id || "")) || new Map();

    const computedRooms = rooms.map((room) => {
      const roomTypeKey = normalizeRoomTypeKey(room?.roomType);
      let occupiedBeds = byType.get(roomTypeKey) || 0;

      // Fuzzy fallback for legacy labels (e.g. "double" vs "doublesharing").
      if (!occupiedBeds && roomTypeKey) {
        for (const [bookingTypeKey, count] of byType.entries()) {
          if (bookingTypeKey.includes(roomTypeKey) || roomTypeKey.includes(bookingTypeKey)) {
            occupiedBeds = count;
            break;
          }
        }
      }

      const capacity = getRoomCapacity(room);
      return {
        ...room,
        occupiedBeds: Math.max(0, Math.min(capacity, Number(occupiedBeds) || 0))
      };
    });

    return {
      ...pg,
      rooms: computedRooms
    };
  });
};

const normalizeTenantPhone = (rawPhone = "") => {
  const value = String(rawPhone || "").trim();
  if (!value) return "";
  if (/^0+$/.test(value)) return "";
  return value;
};

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildHouseRules = (rules = {}, legacyHouseRules = []) => {
  const resolvedRules = rules && typeof rules === "object" ? rules : {};
  const hasRulesPayload =
    Object.prototype.hasOwnProperty.call(resolvedRules, "smoking") ||
    Object.prototype.hasOwnProperty.call(resolvedRules, "alcohol") ||
    Object.prototype.hasOwnProperty.call(resolvedRules, "visitors") ||
    Object.prototype.hasOwnProperty.call(resolvedRules, "pets") ||
    Object.prototype.hasOwnProperty.call(resolvedRules, "curfew");

  if (!hasRulesPayload && Array.isArray(legacyHouseRules) && legacyHouseRules.length > 0) {
    return legacyHouseRules.filter(Boolean);
  }

  const formatted = [
    `Smoking: ${resolvedRules.smoking ? "Allowed" : "Not allowed"}`,
    `Alcohol: ${resolvedRules.alcohol ? "Allowed" : "Not allowed"}`,
    `Visitors: ${resolvedRules.visitors ? "Allowed" : "Not allowed"}`,
    `Pets: ${resolvedRules.pets ? "Allowed" : "Not allowed"}`
  ];

  const curfew = String(resolvedRules.curfew || "").trim();
  if (curfew) {
    formatted.push(`Gate Closing Time: ${curfew}`);
  }

  return formatted;
};

const normalizeInventoryInput = (inventoryInput = {}) => {
  let inventory = inventoryInput && typeof inventoryInput === "object" ? inventoryInput : {};
  if (typeof inventoryInput === "string") {
    try {
      const parsed = JSON.parse(inventoryInput);
      if (parsed && typeof parsed === "object") inventory = parsed;
    } catch (_) {
      inventory = {};
    }
  }

  return {
    fanCount: pickFirstNumeric(inventory.fanCount, inventory.fansCount, inventory.fan, inventory.fans),
    lightCount: pickFirstNumeric(inventory.lightCount, inventory.lightsCount, inventory.light, inventory.lights),
    bedCount: pickFirstNumeric(inventory.bedCount, inventory.bedsCount, inventory.bed, inventory.beds),
    mattressCount: pickFirstNumeric(inventory.mattressCount, inventory.mattressesCount, inventory.mattress, inventory.mattresses),
    cupboardCount: pickFirstNumeric(inventory.cupboardCount, inventory.cupboardsCount, inventory.cupboard, inventory.cupboards),
    notes: String(inventory.notes ?? inventory.note ?? inventory.remarks ?? "").trim()
  };
};

const deriveRentAmount = (pg, roomValue, variantLabel = "") => {
  const pricing = resolveVariantPricing({
    roomPrices: pg?.roomPrices,
    roomType: roomValue,
    variantLabel,
    fallbackRent: Number(pg?.price || 0),
    fallbackDeposit: Number(pg?.securityDeposit || 0)
  });
  return Number(pricing.rentAmount || 0);
};

const resolveBookingDates = (checkInDate, checkOutDate) => {
  const resolvedCheckIn = (checkInDate || new Date().toISOString().split('T')[0]).trim();
  const hasCheckOut = Boolean(checkOutDate && String(checkOutDate).trim());
  const resolvedCheckOut = hasCheckOut ? String(checkOutDate).trim() : "Long Term";
  return {
    checkInDate: resolvedCheckIn,
    checkOutDate: resolvedCheckOut,
    isLongTerm: !hasCheckOut
  };
};

const ensureTenantAgreementRecord = async ({ ownerId, tenant, pg, rentAmount, securityDeposit = 0, variantLabel = "" }) => {
  const startDate = tenant.joiningDate || new Date().toISOString().split('T')[0];
  const endDate = addMonths(startDate, 11).toISOString().split('T')[0];
  const agreementId = `AGR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const linkedTenantUser = tenant.email
    ? await User.findOne({ email: tenant.email, role: 'tenant' }).select('_id')
    : null;
  const agreementUserId = linkedTenantUser?._id || ownerId;

  const existingAgreement = await Agreement.findOne({
    pgName: pg.pgName || "",
    tenantName: tenant.name,
    roomNo: tenant.room || "N/A",
    startDate
  });

  if (existingAgreement) {
    return { agreement: existingAgreement, agreementCreated: false };
  }

  const agreement = await Agreement.create({
    userId: agreementUserId,
    agreementId,
    pgName: pg.pgName || "",
    roomNo: tenant.room || "N/A",
    variantLabel: variantLabel || tenant.room || "",
    tenantName: tenant.name,
    rentAmount: Number(rentAmount) || 0,
    securityDeposit: Number(securityDeposit || 0),
    startDate,
    endDate,
    signed: true
  });

  return { agreement, agreementCreated: true };
};

const ensureTenantLinkedRecords = async ({ ownerId, tenant, pg }) => {
  const effectiveJoiningDate = tenant.joiningDate || new Date().toISOString().split('T')[0];

  const existingBooking = await Booking.findOne({
    ownerId,
    pgId: pg._id,
    tenantName: tenant.name,
    checkInDate: effectiveJoiningDate
  });

  let booking = existingBooking;
  let bookingCreated = false;
  const tenantPricing = resolveVariantPricing({
    roomPrices: pg?.roomPrices,
    roomType: tenant.room || pg.occupancy || "Single",
    variantLabel: tenant.room || "",
    fallbackRent: Number(pg?.price || 0),
    fallbackDeposit: Number(pg?.securityDeposit || 0)
  });

  if (!existingBooking) {
    booking = await Booking.create({
      ownerId,
      pgId: pg._id,
      bookingId: `BK-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      pgName: pg.pgName || "",
      roomType: tenant.room || pg.occupancy || "Single",
      variantLabel: tenantPricing.variantLabel || tenant.room || pg.occupancy || "Single",
      tenantName: tenant.name,
      checkInDate: effectiveJoiningDate,
      checkOutDate: addMonths(effectiveJoiningDate, 11).toISOString().split('T')[0],
      seatsBooked: 1,
      rentAmount: Number(tenantPricing.rentAmount || 0),
      securityDeposit: deriveSecurityDepositAmount(Number(tenantPricing.rentAmount || 0), tenantPricing.securityDeposit),
      pricingSnapshot: {
        billingCycle: tenantPricing.billingCycle || "Monthly",
        acType: tenantPricing.acType || "Non-AC",
        features: tenantPricing.features || {}
      },
      bookingAmount: Number(tenantPricing.rentAmount || 0),
      status: "Confirmed",
      ownerApproved: true,
      ownerApprovalStatus: "approved",
      initialRentPaid: true,
      securityDepositPaid: deriveSecurityDepositAmount(Number(tenantPricing.rentAmount || 0), tenantPricing.securityDeposit) <= 0,
      bookingSource: "tenant_sync"
    });
    bookingCreated = true;
  }

  const pricing = tenantPricing;
  const rentAmount = Number(pricing.rentAmount || 0);
  const securityDeposit = deriveSecurityDepositAmount(rentAmount, pricing.securityDeposit);
  const joinDateObj = new Date(effectiveJoiningDate);
  const currentMonthLabel = getMonthLabel(joinDateObj);
  const nextMonthDate = addMonths(joinDateObj, 1);
  const nextMonthLabel = getMonthLabel(nextMonthDate);

  const linkedTenantUser = tenant.email
    ? await User.findOne({ email: tenant.email, role: 'tenant' }).select('_id')
    : null;
  const paymentActorId = linkedTenantUser?._id || ownerId;

  let payment = null;
  let paymentCreated = false;
  let pendingCreated = false;
  let agreement = null;
  let agreementCreated = false;

  if (rentAmount > 0) {
    const existingPayment = await Payment.findOne({
      pgId: pg._id,
      tenantName: tenant.name,
      month: currentMonthLabel,
      paymentStatus: { $in: ['Success', 'PAID', 'Paid'] }
    });

    if (!existingPayment) {
      const manualBreakdown = computeCommissionBreakdown({
        amount: rentAmount,
        commissionPercent: 0
      });
      payment = await Payment.create({
        user: paymentActorId,
        ownerId,
        bookingRef: booking?._id || null,
        bookingCode: booking?.bookingId || null,
        pgId: pg._id,
        pgName: pg.pgName || "",
        tenantName: tenant.name,
        amountPaid: manualBreakdown.grossAmount,
        grossAmount: manualBreakdown.grossAmount,
        commissionRatePercent: manualBreakdown.commissionRatePercent,
        platformCommissionAmount: manualBreakdown.platformCommissionAmount,
        ownerPayoutAmount: manualBreakdown.ownerPayoutAmount,
        month: currentMonthLabel,
        paymentDate: new Date(),
        paymentMethod: "Cash",
        paymentStatus: "Success",
        transactionId: `AUTO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      });
      paymentCreated = true;
    } else {
      payment = existingPayment;
    }

    const existingPending = await PendingPayment.findOne({
      pg: pg._id,
      tenantName: tenant.name,
      month: nextMonthLabel,
      status: { $in: ['Pending', 'Overdue'] }
    });

    if (!existingPending) {
      await PendingPayment.create({
        tenant: paymentActorId,
        pg: pg._id,
        pgName: pg.pgName || "",
        tenantName: tenant.name,
        amount: rentAmount,
        dueDate: nextMonthDate,
        status: "Pending",
        month: nextMonthLabel
      });
      pendingCreated = true;
    }
  }

  const agreementResult = await ensureTenantAgreementRecord({
    ownerId,
    tenant,
    pg,
    rentAmount,
    securityDeposit,
    variantLabel: pricing.variantLabel
  });
  agreement = agreementResult.agreement;
  agreementCreated = agreementResult.agreementCreated;

  return {
    booking,
    payment,
    agreement,
    bookingCreated,
    paymentCreated,
    pendingCreated,
    agreementCreated
  };
};

const resolveTenantUserForBooking = async (booking) => {
  if (booking?.tenantUserId) {
    const byId = await User.findById(booking.tenantUserId).select('_id fullName email phone');
    if (byId) return byId;
  }

  if (booking?.tenantEmail) {
    const byEmail = await User.findOne({
      email: new RegExp(`^${String(booking.tenantEmail).trim()}$`, 'i'),
      role: { $in: ['user', 'tenant'] }
    }).select('_id fullName email phone');
    if (byEmail) return byEmail;
  }

  const byName = await User.findOne({
    fullName: booking?.tenantName,
    role: { $in: ['user', 'tenant'] }
  }).select('_id fullName email phone');
  return byName || null;
};

const hasTenantMovedInForBooking = async ({ booking, tenantUser }) => {
  if (!booking) return false;

  const activeTenant = await Tenant.findOne({
    ownerId: booking.ownerId,
    status: "Active",
    $and: [
      {
        $or: [
          booking.pgId ? { pgId: booking.pgId } : null,
          booking.pgName ? { pgName: booking.pgName } : null
        ].filter(Boolean)
      },
      {
        $or: [
          booking.tenantEmail ? { email: new RegExp(`^${escapeRegex(String(booking.tenantEmail).trim())}$`, "i") } : null,
          booking.tenantName ? { name: booking.tenantName } : null
        ].filter(Boolean)
      }
    ]
  }).select("_id");
  if (activeTenant?._id) return true;

  if (tenantUser?._id) {
    const activeCheckIn = await CheckIn.findOne({ userId: tenantUser._id, status: "Present" }).select("_id");
    if (activeCheckIn?._id) return true;
  }

  return false;
};

const getSuccessfulPaymentsForBooking = async ({ booking, tenantUser }) => {
  if (!booking) return [];

  const filters = [];

  if (booking?._id) {
    filters.push({ bookingRef: booking._id });
  }
  if (booking?.bookingId) {
    filters.push({ bookingCode: booking.bookingId });
  }

  const identityMatchers = [
    tenantUser?._id ? { user: tenantUser._id } : null,
    booking?.tenantName ? { tenantName: booking.tenantName } : null
  ].filter(Boolean);
  const pgMatchers = [
    booking?.pgId ? { pgId: booking.pgId } : null,
    booking?.pgName ? { pgName: booking.pgName } : null
  ].filter(Boolean);

  if (identityMatchers.length > 0 && pgMatchers.length > 0) {
    filters.push({
      $and: [
        { $or: identityMatchers },
        { $or: pgMatchers }
      ]
    });
  }

  if (filters.length === 0) return [];
  return Payment.find({
    paymentStatus: { $in: SUCCESS_PAYMENT_STATUSES },
    $or: filters
  }).sort({ paymentDate: 1 });
};

const clearTenantDashboardDataForCancelledBooking = async ({ booking, tenantUser }) => {
  if (!booking) return;

  const tenantMatcher = [
    tenantUser?._id ? { tenant: tenantUser._id } : null,
    booking?.tenantName ? { tenantName: booking.tenantName } : null
  ].filter(Boolean);

  const pgMatcher = [
    booking?.pgId ? { pg: booking.pgId } : null,
    booking?.pgName ? { pgName: booking.pgName } : null
  ].filter(Boolean);

  if (tenantMatcher.length > 0 && pgMatcher.length > 0) {
    await PendingPayment.deleteMany({
      status: { $in: ['Pending', 'Overdue'] },
      $and: [
        { $or: tenantMatcher },
        { $or: pgMatcher }
      ]
    });
  }

  if (booking?.bookingId) {
    await Agreement.deleteMany({ bookingId: booking.bookingId });
  }

  if (tenantUser?._id) {
    await Promise.all([
      User.findByIdAndUpdate(tenantUser._id, {
        $set: {
          assignedPg: null,
          ownerId: null,
          roomNo: ""
        },
        $unset: {
          bookedPgName: "",
          paymentDueDate: ""
        }
      }),
      CheckIn.deleteMany({ userId: tenantUser._id })
    ]);
  }
};

const ensureBookingConfirmationData = async ({ booking, ownerId }) => {
  const pg = booking.pgId
    ? await Pg.findOne({ _id: booking.pgId, ownerId }).select('pgName roomPrices price securityDeposit agreementTemplate ownerId')
    : await Pg.findOne({ ownerId, pgName: booking.pgName }).select('pgName roomPrices price securityDeposit agreementTemplate ownerId');

  if (!pg) {
    throw new Error('Linked PG not found for booking');
  }

  const tenantUser = await resolveTenantUserForBooking(booking);
  const tenantEmail = tenantUser?.email || booking.tenantEmail || '';
  const tenantName = booking.tenantName || tenantUser?.fullName || 'Tenant';
  const room = booking.roomType || booking.variantLabel || 'N/A';
  const bookingPricing = resolveVariantPricing({
    roomPrices: pg?.roomPrices,
    roomType: booking.roomType || booking.variantLabel || room,
    variantLabel: booking.variantLabel || "",
    fallbackRent: Number(booking.rentAmount || booking.bookingAmount || pg?.price || 0),
    fallbackDeposit: Number(booking.securityDeposit || pg?.securityDeposit || 0)
  });
  const rentAmount = Number(booking.rentAmount || booking.bookingAmount || bookingPricing.rentAmount || 0);
  const securityDeposit = deriveSecurityDepositAmount(rentAmount, bookingPricing.securityDeposit);
  const resolvedVariantLabel = booking.variantLabel || bookingPricing.variantLabel || room;
  const checkInDate = booking.checkInDate || new Date().toISOString().split('T')[0];
  const checkOutDate = booking.checkOutDate || addMonths(checkInDate, 11).toISOString().split('T')[0];
  const isLongTerm = String(checkOutDate).toLowerCase() === 'long term';

  if (tenantUser) {
    booking.tenantUserId = tenantUser._id;
    booking.tenantEmail = tenantUser.email || booking.tenantEmail || '';
  }
  booking.rentAmount = rentAmount;
  booking.securityDeposit = securityDeposit;
  booking.ownerApprovalStatus = booking.ownerApproved || String(booking.status || "").toLowerCase() === "confirmed" ? "approved" : "pending";
  booking.variantLabel = resolvedVariantLabel;
  booking.bookingAmount = rentAmount;
  booking.pricingSnapshot = {
    billingCycle: bookingPricing.billingCycle || booking?.pricingSnapshot?.billingCycle || "Monthly",
    acType: bookingPricing.acType || booking?.pricingSnapshot?.acType || "Non-AC",
    features: bookingPricing.features || booking?.pricingSnapshot?.features || {}
  };
  await booking.save();

  let tenantRecord = await Tenant.findOne({
    ownerId,
    name: tenantName,
    $or: [{ pgId: pg._id }, { pgName: pg.pgName }]
  }).sort({ createdAt: -1 });

  if (!tenantRecord) {
    const resolvedPhone = normalizeTenantPhone(tenantUser?.phone);
    tenantRecord = await Tenant.create({
      ownerId,
      name: tenantName,
      phone: resolvedPhone || "Not provided",
      email: tenantEmail || "no-email@easy-pg.local",
      pgId: pg._id,
      pgName: pg.pgName || "",
      room,
      joiningDate: checkInDate,
      status: "Active",
      securityDeposit
    });
  } else {
    tenantRecord.pgId = pg._id;
    tenantRecord.pgName = pg.pgName || tenantRecord.pgName;
    tenantRecord.room = room || tenantRecord.room;
    tenantRecord.joiningDate = tenantRecord.joiningDate || checkInDate;
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

  if (tenantUser) {
    await User.findByIdAndUpdate(tenantUser._id, {
      $set: {
        assignedPg: pg._id,
        ownerId
      }
    });
  }

  const agreementPayload = {
    userId: tenantUser?._id || ownerId,
    ownerId,
    pgId: pg._id,
    bookingId: booking.bookingId,
    agreementId: `AGR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    pgName: pg.pgName || "",
    roomNo: room,
    roomType: booking.roomType || room,
    variantLabel: resolvedVariantLabel,
    tenantName,
    rentAmount: Number(rentAmount) || 0,
    securityDeposit,
    startDate: checkInDate,
    endDate: checkOutDate,
    checkInDate,
    checkOutDate,
    isLongTerm,
    fileUrl: pg?.agreementTemplate?.agreementFileUrl || "",
    ownerSignatureUrl: pg?.agreementTemplate?.ownerSignatureUrl || "",
    signed: Boolean(pg?.agreementTemplate?.ownerSignatureUrl)
  };

  let agreement = await Agreement.findOne({ bookingId: booking.bookingId }).sort({ createdAt: -1 });
  if (!agreement) {
    agreement = await Agreement.create(agreementPayload);
  } else {
    agreement.userId = agreementPayload.userId;
    agreement.ownerId = agreementPayload.ownerId;
    agreement.pgId = agreementPayload.pgId;
    agreement.pgName = agreementPayload.pgName;
    agreement.roomNo = agreementPayload.roomNo;
    agreement.roomType = agreementPayload.roomType;
    agreement.variantLabel = agreementPayload.variantLabel;
    agreement.tenantName = agreementPayload.tenantName;
    agreement.rentAmount = agreementPayload.rentAmount;
    agreement.securityDeposit = agreementPayload.securityDeposit;
    agreement.startDate = agreementPayload.startDate;
    agreement.endDate = agreementPayload.endDate;
    agreement.checkInDate = agreementPayload.checkInDate;
    agreement.checkOutDate = agreementPayload.checkOutDate;
    agreement.isLongTerm = agreementPayload.isLongTerm;
    agreement.fileUrl = agreementPayload.fileUrl;
    agreement.ownerSignatureUrl = agreementPayload.ownerSignatureUrl;
    agreement.signed = agreementPayload.signed;
    await agreement.save();
  }

  const dueDate = new Date(checkInDate);
  const dueMonth = getMonthLabel(dueDate);
  const pendingFilter = {
    tenantName,
    month: dueMonth,
    $or: [{ pg: pg._id }, { pgName: pg.pgName }],
    status: { $in: ['Pending', 'Overdue'] }
  };
  const pendingExisting = await PendingPayment.findOne(pendingFilter);
  if (!pendingExisting && rentAmount > 0) {
    await PendingPayment.create({
      tenant: tenantUser?._id || ownerId,
      pg: pg._id,
      pgName: pg.pgName || '',
      tenantName,
      amount: Number(rentAmount) || 0,
      dueDate,
      status: 'Pending',
      month: dueMonth
    });
  }

  return { pg, tenantUser, tenantRecord, agreement, rentAmount };
};

const getOwnerProfile = async (req, res) => {
  try {
    const owner = await User.findById(req.user._id).select('-password +address +profilePicture');

    res.status(200).json({
      success: true,
      data: {
        name: owner.fullName,
        email: owner.email,
        phone: owner.phone || "Not provided",
        emergencyPhone: owner?.emergencyContact?.phoneNumber || "",
        businessName: owner.businessName || "",
        address: owner.address || "Add your address",
        role: "Owner",
        profileImage: owner.profilePicture || "/images/profileImages/profile1.jpg",
        memberId: owner._id.toString().slice(-6).toUpperCase(),
        isVerified: Boolean(owner.isVerified),
        memberSince: owner.createdAt
          ? new Date(owner.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : "N/A"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update owner profile
const updateOwnerProfile = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { name, email, phone, address, businessName, emergencyPhone } = req.body;
    const updatePayload = {};

    if (typeof name !== "undefined") updatePayload.fullName = name;
    if (typeof email !== "undefined") updatePayload.email = email;
    if (typeof phone !== "undefined") updatePayload.phone = phone;
    if (typeof address !== "undefined") updatePayload.address = address;
    if (typeof businessName !== "undefined") updatePayload.businessName = businessName || "";
    if (typeof emergencyPhone !== "undefined") {
      updatePayload["emergencyContact.phoneNumber"] = emergencyPhone || "";
    }
    if (req.file) {
      updatePayload.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(
      ownerId,
      {
        $set: updatePayload
      },
      { new: true, runValidators: true }
    ).select("-password +address +profilePicture");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Returning the EXACT structure your ProfileCard.jsx uses
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: updatedUser.fullName,
        role: "Owner", // Static or from DB
        registrationDate: updatedUser.createdAt ? new Date(updatedUser.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }) : "N/A",
        email: updatedUser.email,
        phone: updatedUser.phone || "Not provided",
        emergencyPhone: updatedUser?.emergencyContact?.phoneNumber || "",
        businessName: updatedUser.businessName || "",
        address: updatedUser.address || "Add your address",
        profileImage: updatedUser.profilePicture || "/images/profileImages/profile1.jpg",
        memberId: updatedUser._id.toString().slice(-6).toUpperCase(),
        isVerified: Boolean(updatedUser.isVerified),
        memberSince: updatedUser.createdAt
          ? new Date(updatedUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : "N/A"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getOwnerDashboardData = async (req, res) => {
  try {
    const ownerId = req.user._id;
    // Keep dashboard totals aligned with the "My PGs" listing.
    const liveOwnerPgs = await Pg.find({
      ownerId,
      $or: [
        { approvalStatus: "confirmed" },
        { status: "live" }
      ]
    }).select("totalRooms liveListings status approvalStatus createdAt").sort({ createdAt: -1 });

    // Owner-scoped identifiers for bookings/revenue calculations.
    const allOwnerPgs = await Pg.find({ ownerId }).select("_id pgName");
    const ownerPgIds = allOwnerPgs.map((pg) => pg._id);
    const ownerPgNames = allOwnerPgs.map((pg) => pg.pgName).filter(Boolean);

    const [uniqueBookingCountAgg, revenueAgg] = await Promise.all([
      Booking.aggregate([
        {
          $match: {
            $or: [
              { ownerId },
              { pgId: { $in: ownerPgIds } },
              { pgName: { $in: ownerPgNames } }
            ],
            bookingSource: { $ne: "tenant_sync" },
            status: { $ne: "Cancelled" }
          }
        },
        {
          $group: {
            _id: {
              $ifNull: ["$bookingId", "$_id"]
            }
          }
        },
        {
          $count: "total"
        }
      ]),
      Payment.aggregate([
        {
          $match: {
            paymentStatus: { $in: ['Success', 'PAID', 'Paid'] },
            $or: [
              { pgId: { $in: ownerPgIds } },
              { pgName: { $in: ownerPgNames } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $ifNull: ['$ownerPayoutAmount', '$amountPaid']
              }
            }
          }
        }
      ])
    ]);

    const totalBookings = Number(uniqueBookingCountAgg?.[0]?.total || 0);
    const totalRevenue = Number(revenueAgg?.[0]?.totalRevenue || 0);
    const totalPgs = liveOwnerPgs.length;
    const totalRooms = liveOwnerPgs.reduce((sum, pg) => sum + (Number(pg.totalRooms) || 0), 0);
    const availablePgs = liveOwnerPgs.reduce((sum, pg) => {
      const explicitListings = Number(pg.liveListings);
      if (Number.isFinite(explicitListings) && explicitListings > 0) {
        return sum + explicitListings;
      }

      const status = String(pg.status || "").toLowerCase();
      const approvalStatus = String(pg.approvalStatus || "").toLowerCase();
      const isPubliclyAvailable = status === "live" || approvalStatus === "confirmed";
      return sum + (isPubliclyAvailable ? 1 : 0);
    }, 0);
    const recentStatus = liveOwnerPgs[0]?.status
      ? liveOwnerPgs[0].status.charAt(0).toUpperCase() + liveOwnerPgs[0].status.slice(1)
      : "No Properties";

    res.status(200).json({
      success: true,
      data: {
        stats: [
          { label: "Total PGs", value: totalPgs },
          { label: "Total Rooms", value: totalRooms },
          { label: "Available PGs", value: availablePgs },
          { label: "Total Bookings", value: Number(totalBookings || 0) },
          { label: "Total Revenue", value: totalRevenue },
          { label: "Recent Status", value: recentStatus }
        ],
        recentActivity: [
          { 
            id: "1", 
            action: "Property Verified", 
            detail: "Your main property 'Girly Hostel' is now live.", 
            date: "2 hours ago" 
          },
          { 
            id: "2", 
            action: "New Booking", 
            detail: "Room 102 has been booked by a new tenant.", 
            date: "5 hours ago" 
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const createPg = async (req, res) => {
  try {
    console.log("Create PG Request Body:", req.body); // Debug log
    
    const { 
      name,        // Frontend field
      forWhom, 
      totalRooms, 
      description,
      city,        // Frontend field
      area,        // Frontend field
      address,     // Frontend field
      pincode,     // Frontend field
      facilities,  // Frontend sends as 'facilities'
      inventory,
      rules,
      price,
      rent,
      securityDeposit,
      deposit
    } = req.body;
    
    const ownerId = req.user._id;

    // Validate required fields from frontend
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Property name is required" });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    console.log("Creating PG with:", { 
      pgName: name, 
      location: city,
      ownerId 
    }); // Debug log

    const requestedCategory = String(forWhom || "Any").trim();
    const initialRent = Number(price ?? rent ?? 0) || 0;
    const initialDeposit = Number(securityDeposit ?? deposit ?? 0) || 0;
    const normalizedGender = (() => {
      const key = requestedCategory.toLowerCase();
      if (key === "boys" || key === "boy") return "Boys";
      if (key === "girls" || key === "girl") return "Girls";
      return "Any";
    })();

    // Map frontend fields to backend schema
    const newPg = await Pg.create({
      ownerId,
      pgName: name.trim(),  // Ensure trimmed string
      location: city.trim(),  // Ensure trimmed string
      city: city.trim(),
      area: area || "",
      address: address || "",
      pincode: pincode || "",
      price: initialRent,  // Usually set during room pricing, but accept direct value if provided.
      totalRooms: parseInt(totalRooms) || 0,
      liveListings: 0,
      gender: normalizedGender,
      type: requestedCategory || "Any",
      roomType: "Any",
      amenities: facilities || [],  // Facilities like WiFi, Food, etc
      facilities: facilities || [],  // Both for compatibility
      description: description || "",
      inventory: normalizeInventoryInput(inventory),
      rules: rules || {
        smoking: false,
        alcohol: false,
        visitors: true,
        pets: false,
        curfew: ""
      },
      // New properties start as draft until owner submits for admin approval.
      status: "draft",
      approvalStatus: "draft",
      operationalStatus: "active",
      securityDeposit: initialDeposit
    });

    console.log("PG Created Successfully:", newPg._id); // Debug log

    res.status(201).json({
      success: true,
      message: "Property saved as draft",
      data: newPg
    });
  } catch (error) {
    console.error("Create PG Error:", error.message); // Debug log
    console.error("Full Error:", error); // Full error details
    res.status(400).json({ 
      success: false, 
      message: error.message || "Failed to create property"
    });
  }
};

const getMyPgs = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const pgs = await Pg.find({ ownerId }).sort({ createdAt: -1 });

    // Backward compatibility: earlier uploads could store pg image URL under /uploads/pgImages
    // while the file was actually written to /uploads/documents.
    for (const pg of pgs) {
      let mutated = false;

      if (pg.mainImage && pg.mainImage.startsWith('/uploads/pgImages/')) {
        const filename = path.basename(pg.mainImage);
        const pgImgPath = path.join(__dirname, '..', 'uploads', 'pgImages', filename);
        const docImgPath = path.join(__dirname, '..', 'uploads', 'documents', filename);

        if (!fs.existsSync(pgImgPath) && fs.existsSync(docImgPath)) {
          pg.mainImage = `/uploads/documents/${filename}`;
          mutated = true;
        }
      }

      if (Array.isArray(pg.images) && pg.images.length > 0) {
        const repaired = pg.images.map((img) => {
          if (!img || !img.startsWith('/uploads/pgImages/')) return img;
          const filename = path.basename(img);
          const pgImgPath = path.join(__dirname, '..', 'uploads', 'pgImages', filename);
          const docImgPath = path.join(__dirname, '..', 'uploads', 'documents', filename);
          if (!fs.existsSync(pgImgPath) && fs.existsSync(docImgPath)) {
            mutated = true;
            return `/uploads/documents/${filename}`;
          }
          return img;
        });
        pg.images = repaired;
      }

      if (mutated) {
        await pg.save();
      }
    }

    const pgsWithComputedOccupancy = await attachComputedRoomOccupancy(pgs);
    const mappedPgs = pgsWithComputedOccupancy.map((pg) => ({
      ...pg,
      houseRules: buildHouseRules(pg.rules, pg.houseRules)
    }));

    res.status(200).json({
      success: true,
      count: pgs.length,
      data: mappedPgs 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePg = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    const pg = await Pg.findOne({ _id: id, ownerId }).select("_id pgName");

    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    // Block deletion if this PG has any non-cancelled tenant bookings.
    const hasLinkedBookings = await Booking.exists({
      ownerId,
      status: { $ne: "Cancelled" },
      $or: [
        { pgId: pg._id },
        { pgName: pg.pgName }
      ]
    });

    if (hasLinkedBookings) {
      return res.status(400).json({
        success: false,
        message: "This PG cannot be deleted because tenant bookings exist. Remove/cancel all bookings first."
      });
    }

    // No active bookings: allow delete.
    const deletedPg = await Pg.findOneAndDelete({ _id: id, ownerId });

    if (!deletedPg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    res.status(200).json({
      success: true,
      message: "PG deleted successfully",
      data: deletedPg
    });
  } catch (error) {
    console.error("Delete PG Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPgById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    const pg = await Pg.findOne({ _id: id, ownerId });

    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    const [pgWithComputedOccupancy] = await attachComputedRoomOccupancy([pg]);
    const mappedPg = {
      ...pgWithComputedOccupancy,
      houseRules: buildHouseRules(pg.rules, pg.houseRules)
    };

    res.status(200).json({
      success: true,
      data: mappedPg
    });
  } catch (error) {
    console.error("Get PG Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE PG (For room management updates) ---
const updatePg = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;
    const { rooms, ...updateData } = req.body;

    let updatePayload = { ...updateData };

    if (updatePayload.forWhom && !updatePayload.gender && !updatePayload.type) {
      updatePayload.type = updatePayload.forWhom;
      const key = String(updatePayload.forWhom).toLowerCase();
      updatePayload.gender = key === "boys" || key === "boy"
        ? "Boys"
        : key === "girls" || key === "girl"
          ? "Girls"
          : "Any";
    }
    if (updatePayload.gender && !updatePayload.type) {
      updatePayload.type = updatePayload.gender;
    }
    if (updatePayload.type && !updatePayload.gender) {
      const key = String(updatePayload.type).toLowerCase();
      updatePayload.gender = key === "boys" || key === "boy"
        ? "Boys"
        : key === "girls" || key === "girl"
          ? "Girls"
          : "Any";
    }
    if (updatePayload.occupancy && !updatePayload.roomType) {
      updatePayload.roomType = updatePayload.occupancy;
    }
    if (updatePayload.roomType && !updatePayload.occupancy) {
      updatePayload.occupancy = updatePayload.roomType;
    }
    if (updatePayload.deposit !== undefined && updatePayload.securityDeposit === undefined) {
      updatePayload.securityDeposit = Number(updatePayload.deposit) || 0;
    }
    if (updatePayload.inventory !== undefined) {
      updatePayload.inventory = normalizeInventoryInput(updatePayload.inventory);
    }

    // If rooms are being updated, keep aggregate totals in sync.
    if (rooms) {
      const normalizedRooms = Array.isArray(rooms)
        ? rooms.map((room = {}) => {
            const { occupiedBeds, ...safeRoom } = room;
            return safeRoom;
          })
        : rooms;

      updatePayload.rooms = normalizedRooms;
      if (Array.isArray(normalizedRooms)) {
        updatePayload.totalRooms = normalizedRooms.reduce((sum, room) => {
          const roomCount = Number(room?.totalRooms) || 0;
          return sum + roomCount;
        }, 0);
      }
    }

    const updatedPg = await Pg.findOneAndUpdate(
      { _id: id, ownerId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedPg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: updatedPg
    });
  } catch (error) {
    console.error("Update PG Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ADD ROOM DETAILS (Step 1 of your flow) ---
const addRoom = async (req, res) => {
  try {
    console.log("=== ADD ROOM API CALLED ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user._id);
    
    const { roomType, totalRooms, bedsPerRoom, description, pgId } = req.body;
    const ownerId = req.user._id;

    const targetPg = pgId
      ? await Pg.findOne({ _id: pgId, ownerId })
      : await Pg.findOne({ ownerId }).sort({ createdAt: -1 });

    if (!targetPg) {
      console.log("PG not found for owner:", ownerId);
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    console.log("Found PG:", targetPg.pgName);

    // Initialize rooms array if it doesn't exist
    if (!targetPg.rooms) {
      targetPg.rooms = [];
    }

    targetPg.rooms.push({ roomType, totalRooms, bedsPerRoom, description });
    
    // CRITICAL: Update the main totalRooms count so the dashboard sees it
    targetPg.totalRooms += Number(totalRooms); 
    
    await targetPg.save();

    console.log("Room added successfully. Total rooms now:", targetPg.totalRooms);

    res.status(201).json({ success: true, message: "Room added", data: targetPg });
  } catch (error) {
    console.error("Add Room Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPLOAD PG IMAGES ---
const uploadPgImages = async (req, res) => {
  try {
    console.log("=== UPLOAD PG IMAGES API CALLED ===");
    console.log("Files:", req.files);
    console.log("Body:", req.body);
    console.log("Params:", req.params);
    
    // Get pgId from body first, then from params as fallback
    let pgId = req.body.pgId || req.params.pgId;
    const ownerId = req.user._id;

    if (!pgId) {
      return res.status(400).json({ success: false, message: "PG ID is required" });
    }

    // Find the PG
    const pg = await Pg.findOne({ _id: pgId, ownerId });

    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    // Handle mainImage (single file) and gallery images - multer.fields returns an object
    // e.g. req.files = { mainImage: [File], images: [File, ...] }
    if (req.files) {
      // mainImage
      if (req.files.mainImage && req.files.mainImage.length > 0) {
        const mainFile = req.files.mainImage[0];
        const folder = path.basename(mainFile.destination || "pgImages");
        pg.mainImage = `/uploads/${folder}/${mainFile.filename}`;
      }

      // gallery images
      if (req.files.images && req.files.images.length > 0) {
        const imagePaths = req.files.images.map(file => {
          const folder = path.basename(file.destination || "pgImages");
          return `/uploads/${folder}/${file.filename}`;
        });
        if (!pg.images) pg.images = [];
        pg.images.push(...imagePaths);
      }
    }

    await pg.save();

    console.log("Images uploaded successfully.");
    console.log("MainImage:", pg.mainImage);
    console.log("Total images:", pg.images ? pg.images.length : 0);

    // Return the full updated PG document so frontend can refresh immediately
    const updatedPg = await Pg.findById(pg._id);

    res.status(200).json({ 
      success: true, 
      message: "Images uploaded successfully", 
      data: updatedPg
    });
  } catch (error) {
    console.error("Upload Images Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE ROOM PRICES (Step 2 of your flow) ---
const updateRoomPrices = async (req, res) => {
  try {
    const { roomPrices, pgId } = req.body;
    const ownerId = req.user._id;

    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: "pgId is required to update room prices."
      });
    }

    const targetPg = await Pg.findOne({ _id: pgId, ownerId });

    if (!targetPg) {
      return res.status(404).json({ 
        success: false, 
        message: "No property found to update prices for." 
      });
    }

    // Normalize incoming roomPrices and support alias keys from older/newer payloads.
    let normalizedPrices = roomPrices;
    if (Array.isArray(roomPrices)) {
      normalizedPrices = roomPrices.map(r => {
        if (!r || typeof r !== "object") return r;
        return {
          ...r,
          price: Number(r.pricePerMonth ?? r.price ?? r.rent ?? 0) || 0,
          securityDeposit: Number(r.securityDeposit ?? r.deposit ?? r.advancePayment ?? 0) || 0
        };
      });
    } else if (roomPrices && typeof roomPrices === "object") {
      normalizedPrices = {
        ...roomPrices,
        price: Number(roomPrices.pricePerMonth ?? roomPrices.price ?? roomPrices.rent ?? 0) || 0,
        securityDeposit: Number(roomPrices.securityDeposit ?? roomPrices.deposit ?? roomPrices.advancePayment ?? 0) || 0
      };
    }

    if (Array.isArray(normalizedPrices)) {
      targetPg.roomPrices = mergeRoomPriceVariants(targetPg.roomPrices, normalizedPrices);
    } else if (normalizedPrices && typeof normalizedPrices === "object") {
      targetPg.roomPrices = {
        ...(targetPg.roomPrices && typeof targetPg.roomPrices === "object" && !Array.isArray(targetPg.roomPrices)
          ? targetPg.roomPrices
          : {}),
        ...normalizedPrices
      };
    } else {
      targetPg.roomPrices = normalizedPrices;
    }

    // Derive a representative `price` for the PG so admin and other flows can display a value
    try {
      let candidatePrices = [];
      if (Array.isArray(normalizedPrices)) {
        candidatePrices = normalizedPrices
          .map(r => Number(r.pricePerMonth || r.price || 0))
          .filter(v => Number.isFinite(v) && v > 0);
      } else if (normalizedPrices && typeof normalizedPrices === 'object') {
        candidatePrices = Object.values(normalizedPrices).map(v => Number(v)).filter(v => Number.isFinite(v) && v > 0);
      }
      if (candidatePrices.length > 0) {
        targetPg.price = Math.min(...candidatePrices);
      }
    } catch (e) {
      console.error('Error deriving PG price from roomPrices:', e);
    }

    // Derive an indicative security deposit from room price data.
    try {
      let depositValues = [];
      if (Array.isArray(normalizedPrices)) {
        depositValues = normalizedPrices
          .map((r) => Number(r.securityDeposit || r.deposit || 0))
          .filter((v) => Number.isFinite(v) && v > 0);
      } else if (normalizedPrices && typeof normalizedPrices === "object") {
        depositValues = Object.values(normalizedPrices)
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v) && v > 0)
          .map((rent) => rent * 2);
      }
      if (depositValues.length > 0) {
        targetPg.securityDeposit = Math.min(...depositValues);
      }
    } catch (e) {
      console.error("Error deriving securityDeposit from roomPrices:", e);
    }

    await targetPg.save();

    res.status(200).json({
      success: true,
      message: "Room prices updated successfully",
      data: targetPg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addTenant = async (req, res) => {
  try {
    const { name, phone, email, pgId, room, joiningDate } = req.body;
    const ownerId = req.user._id;

    const pg = await Pg.findOne({ _id: pgId, ownerId }).select('pgName occupancy roomPrices price securityDeposit');
    if (!pg) {
      return res.status(404).json({ success: false, message: "Selected PG not found for this owner" });
    }

    const effectiveJoiningDate = joiningDate || new Date().toISOString().split('T')[0];
    const pricing = resolveVariantPricing({
      roomPrices: pg?.roomPrices,
      roomType: room,
      variantLabel: room,
      fallbackRent: Number(pg?.price || 0),
      fallbackDeposit: Number(pg?.securityDeposit || 0)
    });
    const rentAmount = Number(pricing.rentAmount || 0);
    const securityDeposit = deriveSecurityDepositAmount(rentAmount, pricing.securityDeposit);

    const newTenant = await Tenant.create({
      ownerId,
      name,
      phone,
      email,
      pgId,
      pgName: pg.pgName || "",
      room,
      joiningDate: effectiveJoiningDate,
      status: 'Active',
      securityDeposit: securityDeposit,
      finalRefund: securityDeposit
    });

    const linked = await ensureTenantLinkedRecords({
      ownerId,
      tenant: { name, email, room, joiningDate: effectiveJoiningDate },
      pg
    });

    res.status(201).json({
      success: true,
      message: "Tenant added successfully",
      data: {
        tenant: newTenant,
        booking: linked.booking,
        payment: linked.payment,
        agreement: linked.agreement
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const syncTenantLinkedData = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName occupancy roomPrices price');
    const pgMap = new Map(ownerPgs.map((pg) => [String(pg._id), pg]));

    const tenants = await Tenant.find({ ownerId }).select('name email room joiningDate pgId');

    let syncedTenants = 0;
    let createdBookings = 0;
    let createdPayments = 0;
    let createdPending = 0;
    let createdAgreements = 0;

    for (const tenant of tenants) {
      const pg = pgMap.get(String(tenant.pgId));
      if (!pg) continue;

      const linked = await ensureTenantLinkedRecords({
        ownerId,
        tenant,
        pg
      });

      syncedTenants += 1;
      if (linked.bookingCreated) createdBookings += 1;
      if (linked.paymentCreated) createdPayments += 1;
      if (linked.pendingCreated) createdPending += 1;
      if (linked.agreementCreated) createdAgreements += 1;
    }

    return res.status(200).json({
      success: true,
      message: "Tenant linked data synchronized successfully",
      data: {
        syncedTenants,
        createdBookings,
        createdPayments,
        createdPending,
        createdAgreements
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyTenants = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const ownerPgs = await Pg.find({ ownerId }).select("_id pgName");
    const pgIds = ownerPgs.map((pg) => pg._id);
    const pgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    // Only include tenants that came from real tenant-side bookings.
    const bookingBackedTenants = await Booking.find({
      status: "Confirmed",
      bookingSource: "tenant_request",
      $or: [
        { ownerId },
        { pgId: { $in: pgIds } },
        { pgName: { $in: pgNames } }
      ]
    })
      .sort({ createdAt: -1 })
      .select("tenantName tenantEmail tenantUserId pgId pgName roomType variantLabel isPaid createdAt");

    const normalizeValue = (value) => String(value || "").trim().toLowerCase();
    const allowedKeysByPgId = new Set();
    const allowedKeysByPgName = new Set();
    const latestBookingByKey = new Map();

    const setLatestBooking = (key, bookingDoc) => {
      if (!key || latestBookingByKey.has(key)) return;
      latestBookingByKey.set(key, bookingDoc);
    };

    bookingBackedTenants.forEach((b) => {
      const tenantName = normalizeValue(b.tenantName);
      const tenantEmail = normalizeValue(b.tenantEmail);
      const pgIdKey = b.pgId ? String(b.pgId) : "";
      const pgNameKey = normalizeValue(b.pgName);

      if (pgIdKey && tenantName) allowedKeysByPgId.add(`${pgIdKey}|name|${tenantName}`);
      if (pgIdKey && tenantEmail) allowedKeysByPgId.add(`${pgIdKey}|email|${tenantEmail}`);
      if (pgNameKey && tenantName) allowedKeysByPgName.add(`${pgNameKey}|name|${tenantName}`);
      if (pgNameKey && tenantEmail) allowedKeysByPgName.add(`${pgNameKey}|email|${tenantEmail}`);

      setLatestBooking(pgIdKey && tenantName ? `${pgIdKey}|name|${tenantName}` : "", b);
      setLatestBooking(pgIdKey && tenantEmail ? `${pgIdKey}|email|${tenantEmail}` : "", b);
      setLatestBooking(pgNameKey && tenantName ? `${pgNameKey}|name|${tenantName}` : "", b);
      setLatestBooking(pgNameKey && tenantEmail ? `${pgNameKey}|email|${tenantEmail}` : "", b);
    });

    const bookingTenantUserIds = [...new Set(
      bookingBackedTenants
        .map((b) => (b.tenantUserId ? String(b.tenantUserId) : ""))
        .filter(Boolean)
    )];
    const bookingTenantEmails = [...new Set(
      bookingBackedTenants
        .map((b) => normalizeValue(b.tenantEmail))
        .filter(Boolean)
    )];
    const bookingTenantNames = [...new Set(
      bookingBackedTenants
        .map((b) => normalizeValue(b.tenantName))
        .filter(Boolean)
    )];

    const tenantUserOr = [];
    if (bookingTenantUserIds.length > 0) {
      tenantUserOr.push({ _id: { $in: bookingTenantUserIds } });
    }
    if (bookingTenantEmails.length > 0) {
      tenantUserOr.push({ email: { $in: bookingTenantEmails } });
    }
    if (bookingTenantNames.length > 0) {
      tenantUserOr.push({
        $or: bookingTenantNames.map((name) => ({ fullName: new RegExp(`^${escapeRegex(name)}$`, "i") }))
      });
    }

    const linkedTenantUsers = tenantUserOr.length > 0
      ? await User.find({
          role: { $in: ["user", "tenant"] },
          $or: tenantUserOr
        }).select("_id fullName email phone")
      : [];

    const tenantUserById = new Map();
    const tenantUserByEmail = new Map();
    const tenantUserByName = new Map();

    linkedTenantUsers.forEach((u) => {
      const idKey = u?._id ? String(u._id) : "";
      const emailKey = normalizeValue(u?.email);
      const nameKey = normalizeValue(u?.fullName);
      if (idKey) tenantUserById.set(idKey, u);
      if (emailKey && !tenantUserByEmail.has(emailKey)) tenantUserByEmail.set(emailKey, u);
      if (nameKey && !tenantUserByName.has(nameKey)) tenantUserByName.set(nameKey, u);
    });

    const tenants = await Tenant.find({ ownerId })
      .populate('pgId', 'pgName location city occupancy roomType')
      .sort({ createdAt: -1 });

    const filteredTenants = tenants.filter((t) => {
      const pgObj = t.pgId && typeof t.pgId === "object" ? t.pgId : null;
      const tenantName = normalizeValue(t.name);
      const tenantEmail = normalizeValue(t.email);
      const pgIdKey = String(pgObj?._id || t.pgId || "");
      const pgNameKey = normalizeValue(pgObj?.pgName || t.pgName);

      return (
        (pgIdKey && tenantName && allowedKeysByPgId.has(`${pgIdKey}|name|${tenantName}`)) ||
        (pgIdKey && tenantEmail && allowedKeysByPgId.has(`${pgIdKey}|email|${tenantEmail}`)) ||
        (pgNameKey && tenantName && allowedKeysByPgName.has(`${pgNameKey}|name|${tenantName}`)) ||
        (pgNameKey && tenantEmail && allowedKeysByPgName.has(`${pgNameKey}|email|${tenantEmail}`))
      );
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalized = await Promise.all(filteredTenants.map(async (t) => {
      const pgObj = t.pgId && typeof t.pgId === "object" ? t.pgId : null;
      const extensionUntil = t.extensionUntil ? new Date(t.extensionUntil) : null;
      if (extensionUntil) extensionUntil.setHours(0, 0, 0, 0);
      const extensionPauseActive = Boolean(t.isFinePaused && extensionUntil && today <= extensionUntil);
      const tenantEmailNorm = normalizeValue(t.email);
      const tenantNameNorm = normalizeValue(t.name);
      const pgIdValue = pgObj?._id || t.pgId;
      const pgNameValue = pgObj?.pgName || t.pgName || "";

      const pgMatchers = [
        pgIdValue ? { pgId: pgIdValue } : null,
        pgNameValue ? { pgName: pgNameValue } : null
      ].filter(Boolean);

      const matchedBooking =
        (pgIdValue && tenantEmailNorm ? latestBookingByKey.get(`${String(pgIdValue)}|email|${tenantEmailNorm}`) : null) ||
        (pgIdValue && tenantNameNorm ? latestBookingByKey.get(`${String(pgIdValue)}|name|${tenantNameNorm}`) : null) ||
        (pgNameValue && tenantEmailNorm ? latestBookingByKey.get(`${normalizeValue(pgNameValue)}|email|${tenantEmailNorm}`) : null) ||
        (pgNameValue && tenantNameNorm ? latestBookingByKey.get(`${normalizeValue(pgNameValue)}|name|${tenantNameNorm}`) : null) ||
        null;

      let hasPaidRent = Boolean(matchedBooking?.isPaid);
      const tenantMatchers = [
        tenantEmailNorm ? { tenantEmail: new RegExp(`^${tenantEmailNorm}$`, "i") } : null,
        tenantNameNorm ? { tenantName: t.name } : null
      ].filter(Boolean);
      if (!hasPaidRent) {
        const paidBookingQuery = {
          status: "Confirmed",
          bookingSource: "tenant_request",
          isPaid: true
        };
        const andClauses = [];
        if (pgMatchers.length > 0) andClauses.push({ $or: pgMatchers });
        if (tenantMatchers.length > 0) andClauses.push({ $or: tenantMatchers });
        if (andClauses.length > 0) paidBookingQuery.$and = andClauses;

        const paidBooking = await Booking.findOne(paidBookingQuery)
          .sort({ createdAt: -1 })
          .select("_id");
        hasPaidRent = Boolean(paidBooking?._id);
      }

      const pendingPayment = await PendingPayment.findOne({
        tenantName: t.name,
        status: { $in: ["Pending", "Overdue"] },
        $or: [
          { pg: pgIdValue },
          { pgName: pgNameValue }
        ]
      }).sort({ dueDate: 1 });

      let lateFine = 0;
      if (pendingPayment?.dueDate) {
        const fineSnapshot = calculateLateFine({
          dueDate: pendingPayment.dueDate,
          dailyFine: LATE_FINE_PER_DAY,
          isFinePaused: extensionPauseActive
        });
        const overdueDays = fineSnapshot.overdueDays;
        lateFine = fineSnapshot.fineAmount;

        if (!extensionPauseActive && overdueDays > 0 && pendingPayment.status !== "Overdue") {
          pendingPayment.status = "Overdue";
          await pendingPayment.save();
        }

        await FineTransaction.findOneAndUpdate(
          {
            tenantRecordId: t._id,
            pendingPaymentId: pendingPayment._id
          },
          {
            ownerId,
            tenantRecordId: t._id,
            pendingPaymentId: pendingPayment._id,
            tenantId: null,
            pgId: pgObj?._id || t.pgId,
            dayFineAmount: LATE_FINE_PER_DAY,
            totalFineAmount: lateFine,
            overdueDays,
            isFinePaused: extensionPauseActive,
            reason: extensionPauseActive ? "Fine paused due to approved extension." : "Late rent fine applied."
          },
          { upsert: true, setDefaultsOnInsert: true, new: true }
        );
      }

      let resolvedPhone = normalizeTenantPhone(t.phone);
      if (!resolvedPhone) {
        const matchedTenantUser =
          (matchedBooking?.tenantUserId ? tenantUserById.get(String(matchedBooking.tenantUserId)) : null) ||
          (tenantEmailNorm ? tenantUserByEmail.get(tenantEmailNorm) : null) ||
          (tenantNameNorm ? tenantUserByName.get(tenantNameNorm) : null) ||
          null;
        resolvedPhone = normalizeTenantPhone(matchedTenantUser?.phone);
      }

      const resolvedRoomType =
        t.room ||
        matchedBooking?.roomType ||
        matchedBooking?.variantLabel ||
        pgObj?.occupancy ||
        pgObj?.roomType ||
        "N/A";

      const rawStatus = String(t.status || "").trim();
      const statusLower = rawStatus.toLowerCase();
      const hasMoveOutCompleted = Boolean(t.moveOutCompletedAt);

      let computedStatus = rawStatus;
      if (hasMoveOutCompleted || statusLower === "inactive") {
        computedStatus = "Inactive";
      } else if (hasPaidRent && !rawStatus) {
        computedStatus = "Pending Arrival";
      }

      return {
        _id: t._id,
        name: t.name,
        phone: resolvedPhone,
        email: t.email,
        pgId: pgObj?._id || t.pgId,
        pgName: pgObj?.pgName || t.pgName || "Unknown PG",
        room: t.room,
        roomType: resolvedRoomType,
        joiningDate: t.joiningDate,
        status: computedStatus,
        hasPaidRent,
        securityDeposit: Number(t.securityDeposit) || 0,
        hasMoveOutNotice: Boolean(t.hasMoveOutNotice),
        moveOutRequested: Boolean(t.moveOutRequested),
        moveOutRequestedAt: t.moveOutRequestedAt || null,
        moveOutCompletedAt: t.moveOutCompletedAt || null,
        damageCharges: Number(t.damageCharges) || 0,
        pendingFine: (Number(t.pendingFine) || 0) + lateFine,
        finalRefund: Number(t.finalRefund) || 0,
        deductionReason: t.deductionReason || "",
        hasDeferralRequest: Boolean(t.hasDeferralRequest || t.extensionRequested),
        extensionRequested: Boolean(t.extensionRequested),
        extensionRequestedAt: t.extensionRequestedAt || null,
        extensionUntil: t.extensionUntil || null,
        extensionReason: t.extensionReason || "",
        deferredDays: Number(t.deferredDays) || 0,
        deferredReason: t.deferredReason || "",
        lastDeferredDate: t.lastDeferredDate || "",
        rentDeferred: Boolean(t.rentDeferred),
        lateFinePerDay: LATE_FINE_PER_DAY,
        finePaused: extensionPauseActive
      };
    }));

    res.status(200).json({
      success: true,
      data: normalized 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete owner account and owner-linked data
const deleteOwnerAccount = async (req, res) => {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const owner = await User.findById(ownerId).select("_id role");
    if (!owner || owner.role !== "owner") {
      return res.status(404).json({ success: false, message: "Owner account not found" });
    }

    const ownerPgs = await Pg.find({ ownerId }).select("_id pgName");
    const pgIds = ownerPgs.map((pg) => pg._id);
    const pgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    await Promise.all([
      Tenant.deleteMany({ ownerId }),
      Booking.deleteMany({ $or: [{ ownerId }, { pgId: { $in: pgIds } }, { pgName: { $in: pgNames } }] }),
      Agreement.deleteMany({
        $or: [
          { ownerId },
          { userId: ownerId },
          { pgId: { $in: pgIds } },
          { pgName: { $in: pgNames } }
        ]
      }),
      SupportTicket.deleteMany({ ownerId }),
      Room.deleteMany({ $or: [{ ownerId }, { pgId: { $in: pgIds } }] }),
      Review.deleteMany({
        $or: [
          { ownerId },
          { userId: ownerId },
          { pgId: { $in: pgIds } }
        ]
      }),
      Payment.deleteMany({ $or: [{ user: ownerId }, { pgId: { $in: pgIds } }, { pgName: { $in: pgNames } }] }),
      PendingPayment.deleteMany({ $or: [{ tenant: ownerId }, { pg: { $in: pgIds } }, { pgName: { $in: pgNames } }] }),
      CheckIn.deleteMany({ userId: ownerId }),
      Pg.deleteMany({ ownerId })
    ]);

    await User.findByIdAndDelete(ownerId);

    return res.status(200).json({
      success: true,
      message: "Owner account and related data deleted successfully"
    });
  } catch (error) {
    console.error("deleteOwnerAccount error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete owner account" });
  }
};

const approveExtensionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;
    const tenant = await Tenant.findOne({ _id: id, ownerId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    const extensionUntil = tenant.extensionUntil ? new Date(tenant.extensionUntil) : null;
    let deferredDays = 0;
    if (extensionUntil) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      extensionUntil.setHours(0, 0, 0, 0);
      deferredDays = Math.max(0, Math.ceil((extensionUntil - today) / DAY_MS));
    }

    tenant.rentDeferred = true;
    tenant.hasDeferralRequest = false;
    tenant.extensionRequested = false;
    tenant.isFinePaused = true;
    tenant.lastDeferredDate = new Date().toISOString().split("T")[0];
    tenant.deferredDays = deferredDays || tenant.deferredDays || 0;
    tenant.deferredReason = tenant.extensionReason || tenant.deferredReason || "";
    await tenant.save();

    await ExtensionRequest.findOneAndUpdate(
      {
        ownerId,
        tenantRecordId: tenant._id,
        status: "Pending"
      },
      {
        status: "Approved",
        isFinePaused: true,
        reviewedBy: ownerId,
        reviewedAt: new Date(),
        reviewNote: "Approved by owner"
      },
      { sort: { createdAt: -1 } }
    );

    return res.status(200).json({
      success: true,
      message: "Extension approved successfully",
      data: tenant
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectExtensionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;
    const tenant = await Tenant.findOne({ _id: id, ownerId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    tenant.hasDeferralRequest = false;
    tenant.extensionRequested = false;
    tenant.isFinePaused = false;
    await tenant.save();

    await ExtensionRequest.findOneAndUpdate(
      {
        ownerId,
        tenantRecordId: tenant._id,
        status: "Pending"
      },
      {
        status: "Rejected",
        isFinePaused: false,
        reviewedBy: ownerId,
        reviewedAt: new Date(),
        reviewNote: "Rejected by owner"
      },
      { sort: { createdAt: -1 } }
    );

    return res.status(200).json({
      success: true,
      message: "Extension rejected. Late fine will continue."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const completeTenantMoveOut = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;
    const tenant = await Tenant.findOne({ _id: id, ownerId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    const securityDeposit = Number(req.body?.securityDeposit ?? tenant.securityDeposit ?? 0) || 0;
    let damageCharges = Number(req.body?.damageCharges ?? 0) || 0;
    let pendingFine = Number(req.body?.pendingFine ?? tenant.pendingFine ?? 0) || 0;
    const deductionReason = String(req.body?.deductionReason || "").trim();

    const latestDamageReport = await DamageReport.findOne({
      ownerId,
      tenantRecordId: tenant._id
    }).sort({ createdAt: -1 });

    if (damageCharges > 0) {
      if (!latestDamageReport) {
        return res.status(400).json({
          success: false,
          message: "Damage report is required before applying deduction."
        });
      }
      if (latestDamageReport.adminApproval !== "Approved") {
        return res.status(400).json({
          success: false,
          message: "Damage report is pending admin approval."
        });
      }
      if (latestDamageReport.isDeductionDisputed && !latestDamageReport.adminOverride) {
        return res.status(400).json({
          success: false,
          message: "Refund is blocked due to deduction dispute. Admin override required."
        });
      }
      damageCharges = Number(latestDamageReport.approvedAmount || latestDamageReport.amount || 0);
    }

    const tenantUser = await User.findOne({ email: new RegExp(`^${String(tenant.email || "").trim()}$`, "i") }).select("_id");
    const latestAgreement = tenantUser?._id
      ? await Agreement.findOne({ userId: tenantUser._id }).sort({ createdAt: -1 }).select("rentAmount")
      : null;
    const monthlyRent = Math.max(0, Number(latestAgreement?.rentAmount || 0));

    const requestedDate = tenant.moveOutDateRequested ? new Date(tenant.moveOutDateRequested) : null;
    const actualMoveOutDate = new Date();
    const isEarlyExitAgainstRequestedDate = Boolean(
      requestedDate &&
      !Number.isNaN(requestedDate.getTime()) &&
      actualMoveOutDate < requestedDate
    );

    let earlyExitRentDeduction = 0;
    if (isEarlyExitAgainstRequestedDate && monthlyRent > 0) {
      // Charge only for days stayed in current month when tenant exits earlier than their requested final date.
      const monthStart = new Date(actualMoveOutDate.getFullYear(), actualMoveOutDate.getMonth(), 1);
      const daysStayedInCurrentMonth = Math.max(1, Math.floor((actualMoveOutDate - monthStart) / DAY_MS) + 1);
      earlyExitRentDeduction = Math.round((monthlyRent / 30) * daysStayedInCurrentMonth);
      pendingFine += earlyExitRentDeduction;
    }

    const totalDeduction = Math.max(0, damageCharges + pendingFine);
    const finalRefund = Math.max(0, securityDeposit - totalDeduction);
    const remainingPayable = Math.max(0, totalDeduction - securityDeposit);

    const deductionRemarks = [
      deductionReason,
      tenant.moveOutFineApplied > 0 ? `Short notice fine applied: ₹${tenant.moveOutFineApplied}` : "",
      earlyExitRentDeduction > 0 ? `Early exit rent deduction applied: ₹${earlyExitRentDeduction}` : ""
    ].filter(Boolean).join(" | ");

    tenant.securityDeposit = securityDeposit;
    tenant.damageCharges = damageCharges;
    tenant.pendingFine = pendingFine;
    tenant.moveOutFineRemainingPayable = Math.max(0, Number(tenant.moveOutFineApplied || 0) - securityDeposit);
    tenant.finalRefund = finalRefund;
    tenant.deductionReason = deductionRemarks;
    tenant.status = "Inactive";
    tenant.hasMoveOutNotice = false;
    tenant.moveOutRequested = false;
    tenant.moveOutCompletedAt = new Date();
    await tenant.save();

    if (tenantUser?._id) {
      const activeCheckIn = await CheckIn.findOne({
        userId: tenantUser._id,
        status: { $in: ["Present", "Pending"] }
      }).sort({ createdAt: -1 });
      if (activeCheckIn) {
        activeCheckIn.status = "Out";
        activeCheckIn.checkOutDate = new Date();
        await activeCheckIn.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Move-out completed and settlement saved",
      data: {
        tenantId: tenant._id,
        securityDeposit,
        damageCharges,
        pendingFine,
        earlyExitRentDeduction,
        finalRefund,
        remainingPayable
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const submitDamageReport = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;
    const amount = Number(req.body?.amount || 0);
    const reason = String(req.body?.reason || "").trim();

    if (amount <= 0 || !reason) {
      return res.status(400).json({ success: false, message: "amount and reason are required" });
    }

    const tenant = await Tenant.findOne({ _id: id, ownerId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    const tenantUser = await User.findOne({
      email: new RegExp(`^${String(tenant.email || "").trim()}$`, "i"),
      role: { $in: ["user", "tenant"] }
    }).select("_id");

    const report = await DamageReport.create({
      ownerId,
      tenantId: tenantUser?._id || null,
      tenantRecordId: tenant._id,
      pgId: tenant.pgId,
      amount,
      approvedAmount: amount,
      reason,
      adminApproval: "Pending",
      isDeductionDisputed: false,
      adminOverride: false
    });

    return res.status(201).json({
      success: true,
      message: "Damage report submitted. Waiting for admin approval before refund processing.",
      data: report
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;
    const tenant = await Tenant.findOne({ _id: id, ownerId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    const latestDamageReport = await DamageReport.findOne({
      ownerId,
      tenantRecordId: tenant._id
    }).sort({ createdAt: -1 });

    if (latestDamageReport) {
      if (latestDamageReport.adminApproval !== "Approved") {
        return res.status(400).json({ success: false, message: "Admin approval required before refund." });
      }
      if (latestDamageReport.isDeductionDisputed && !latestDamageReport.adminOverride) {
        return res.status(400).json({ success: false, message: "Refund blocked due to dispute. Await admin override." });
      }
    }

    const fineAmount = Number(tenant.pendingFine || 0);
    const approvedDamageAmount = Number(latestDamageReport?.approvedAmount || latestDamageReport?.amount || tenant.damageCharges || 0);
    const totalDeduction = Math.max(0, fineAmount + approvedDamageAmount);
    const securityDeposit = Number(tenant.securityDeposit || 0);
    const finalRefund = Math.max(0, securityDeposit - totalDeduction);

    tenant.damageCharges = approvedDamageAmount;
    tenant.finalRefund = finalRefund;
    tenant.status = "Inactive";
    tenant.hasMoveOutNotice = false;
    tenant.moveOutRequested = false;
    tenant.moveOutCompletedAt = new Date();
    await tenant.save();

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully.",
      data: {
        tenantId: tenant._id,
        securityDeposit,
        damageCharges: approvedDamageAmount,
        pendingFine: fineAmount,
        finalRefund
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const pgIds = ownerPgs.map((pg) => pg._id);
    const pgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    const bookings = await Booking.find({
      $or: [
        { ownerId },
        { pgId: { $in: pgIds } },
        { pgName: { $in: pgNames } }
      ]
    }).sort({ createdAt: -1 });
    const bookingCodes = bookings
      .map((b) => String(b.bookingId || "").trim())
      .filter(Boolean);
    const agreements = bookingCodes.length > 0
      ? await Agreement.find({ bookingId: { $in: bookingCodes } })
          .select("bookingId fileUrl")
          .sort({ createdAt: -1 })
      : [];
    const agreementUrlByBookingCode = new Map();
    agreements.forEach((a) => {
      const key = String(a.bookingId || "").trim();
      if (!key || agreementUrlByBookingCode.has(key)) return;
      if (a.fileUrl) agreementUrlByBookingCode.set(key, a.fileUrl);
    });

    const successfulPayments = await Payment.find({
      paymentStatus: { $in: ['Success', 'PAID', 'Paid'] },
      $or: [
        { pgId: { $in: pgIds } },
        { pgName: { $in: pgNames } }
      ]
    }).select('pgId pgName tenantName');

    const paidKeyByPgId = new Set();
    const paidKeyByPgName = new Set();
    successfulPayments.forEach((p) => {
      const tenant = String(p.tenantName || '').trim().toLowerCase();
      if (!tenant) return;
      if (p.pgId) paidKeyByPgId.add(`${String(p.pgId)}|${tenant}`);
      if (p.pgName) paidKeyByPgName.add(`${String(p.pgName).trim().toLowerCase()}|${tenant}`);
    });

    const filteredBookings = bookings.filter((b) => {
      const tenantName = String(b.tenantName || '').trim();
      const pgName = String(b.pgName || '').trim();
      // Show all owner-related bookings with basic tenant/property identity.
      return Boolean(tenantName || pgName);
    }).map((b) => {
      const tenant = String(b.tenantName || '').trim().toLowerCase();
      const pgIdKey = b.pgId ? String(b.pgId) : '';
      const pgNameKey = String(b.pgName || '').trim().toLowerCase();
      const paid = Boolean(
        b.isPaid ||
        (tenant && pgIdKey && paidKeyByPgId.has(`${pgIdKey}|${tenant}`)) ||
        (tenant && pgNameKey && paidKeyByPgName.has(`${pgNameKey}|${tenant}`))
      );
      return {
        ...b.toObject(),
        isPaid: paid,
        paymentStatus: paid ? 'Paid' : 'Unpaid',
        agreementPdfUrl: b.agreementPdfUrl || agreementUrlByBookingCode.get(String(b.bookingId || "").trim()) || ""
      };
    });

    res.status(200).json({ success: true, data: filteredBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBooking = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { bookingId, pgId, pgName, roomType, variantLabel, tenantName, tenantEmail, checkInDate, checkOutDate, seatsBooked, status } = req.body;

    let ownerPg = null;
    if (pgId && mongoose.Types.ObjectId.isValid(pgId)) {
      ownerPg = await Pg.findOne({ _id: pgId, ownerId }).select('_id pgName');
    } else if (pgName) {
      ownerPg = await Pg.findOne({ ownerId, pgName }).select('_id pgName');
    }

    if (!ownerPg) {
      return res.status(404).json({ success: false, message: "Selected PG not found for this owner" });
    }

    const generatedBookingId = bookingId || `BK-${Date.now()}`;
    const resolvedDates = resolveBookingDates(checkInDate, checkOutDate);
    const templatePg = await Pg.findById(ownerPg._id).select('agreementTemplate roomPrices price securityDeposit');
    const pricing = resolveVariantPricing({
      roomPrices: templatePg?.roomPrices,
      roomType,
      variantLabel,
      fallbackRent: Number(templatePg?.price || 0),
      fallbackDeposit: Number(templatePg?.securityDeposit || 0)
    });
    const monthlyRent = Number(pricing.rentAmount || 0);
    const securityDeposit = deriveSecurityDepositAmount(monthlyRent, pricing.securityDeposit);
    const linkedUser = tenantEmail
      ? await User.findOne({
          email: new RegExp(`^${String(tenantEmail).trim()}$`, 'i'),
          role: { $in: ['user', 'tenant'] }
        }).select('_id email')
      : await User.findOne({ fullName: tenantName, role: { $in: ['user', 'tenant'] } }).select('_id email');

    const newBooking = await Booking.create({
      ownerId,
      pgId: ownerPg._id,
      tenantUserId: linkedUser?._id || null,
      tenantEmail: linkedUser?.email || tenantEmail || "",
      bookingId: generatedBookingId,
      pgName: ownerPg.pgName,
      roomType,
      variantLabel: pricing.variantLabel || variantLabel || roomType || "",
      tenantName,
      checkInDate: resolvedDates.checkInDate,
      checkOutDate: resolvedDates.checkOutDate,
      seatsBooked,
      status: status || "Pending",
      ownerApproved: Boolean(status === "Confirmed"),
      ownerApprovalStatus: status === "Confirmed" ? "approved" : "pending",
      rentAmount: monthlyRent,
      securityDeposit,
      pricingSnapshot: {
        billingCycle: pricing.billingCycle || "Monthly",
        acType: pricing.acType || "Non-AC",
        features: pricing.features || {}
      },
      bookingAmount: Number(monthlyRent) || 0,
      bookingSource: "owner_manual"
    });

    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelReason = "", cancelOtherReason = "" } = req.body; 
    const ownerId = req.user._id;
    const normalizedStatus = String(status || '').trim();
    if (!['Pending', 'Confirmed', 'Cancelled'].includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: "Invalid booking status" });
    }

    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const pgIds = ownerPgs.map((pg) => String(pg._id));
    const pgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const belongsToOwner =
      String(booking.ownerId) === String(ownerId) ||
      (booking.pgId && pgIds.includes(String(booking.pgId))) ||
      pgNames.includes(booking.pgName);

    if (!belongsToOwner) {
      return res.status(403).json({ success: false, message: "You don't have permission to update this booking" });
    }

    const source = String(booking.bookingSource || '').toLowerCase();
    const requiresPaymentBeforeConfirm = source === 'tenant_request';

    let cancellationRefundSummary = null;

    if (normalizedStatus === 'Cancelled') {
      const cancellationRequested = Boolean(booking?.cancelRequest?.requested && booking?.cancelRequest?.status === 'Pending');
      const cancelledBy = cancellationRequested ? 'tenant' : 'owner';
      const tenantUser = await resolveTenantUserForBooking(booking);
      const hasMovedIn = await hasTenantMovedInForBooking({ booking, tenantUser });
      const successfulPayments = await getSuccessfulPaymentsForBooking({ booking, tenantUser });
      const totalPaidAmount = successfulPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
      const totalCommissionAmount = successfulPayments.reduce((sum, p) => {
        const explicit = Number(p.platformCommissionAmount);
        if (Number.isFinite(explicit)) return sum + explicit;
        const fallback = computeCommissionBreakdown({
          amount: Number(p.amountPaid || 0),
          commissionPercent: Number(p.commissionRatePercent || DEFAULT_PLATFORM_COMMISSION_PERCENT)
        });
        return sum + fallback.platformCommissionAmount;
      }, 0);

      cancellationRefundSummary = {
        ...computeCancellationRefundSummary({
          cancelledBy,
          hasMovedIn,
          cancellationDate: new Date(),
          checkInDate: booking.checkInDate,
          totalPaidAmount,
          securityDepositAmount: Number(booking.securityDeposit || 0),
          totalCommissionAmount
        }),
        refundStatus: totalPaidAmount > 0 ? "Pending" : "None",
        calculatedAt: new Date()
      };

      booking.status = 'Cancelled';
      booking.ownerApproved = false;
      booking.ownerApprovalStatus = 'rejected';
      booking.paymentStatus = booking.isPaid ? 'Paid' : 'Unpaid';
      booking.cancellationRefund = cancellationRefundSummary;
      booking.cancelRequest = {
        ...(booking.cancelRequest || {}),
        requested: Boolean(cancellationRequested),
        requestedAt: booking?.cancelRequest?.requestedAt || (cancellationRequested ? new Date() : null),
        requestedBy: cancellationRequested ? (booking?.cancelRequest?.requestedBy || 'tenant') : 'owner',
        reason: cancellationRequested ? (booking?.cancelRequest?.reason || '') : String(cancelReason || '').trim(),
        otherReason: cancellationRequested ? (booking?.cancelRequest?.otherReason || '') : String(cancelOtherReason || '').trim(),
        status: 'Approved',
        reviewedAt: new Date()
      };

      if (successfulPayments.length > 0) {
        const refundable = Number(cancellationRefundSummary?.refundableAmount || 0);
        const refundStatus = refundable > 0 ? "Pending" : "None";
        await Payment.updateMany(
          { _id: { $in: successfulPayments.map((p) => p._id) } },
          {
            $set: {
              refundStatus,
              refundedAmount: 0,
              refundedAt: null
            }
          }
        );
      }
    } else if (normalizedStatus === 'Pending') {
      booking.status = 'Pending';
      booking.ownerApproved = false;
      booking.ownerApprovalStatus = 'pending';
      booking.paymentStatus = booking.isPaid ? 'Paid' : 'Unpaid';
      if (booking?.cancelRequest?.status === 'Pending') {
        booking.cancelRequest.status = 'Rejected';
        booking.cancelRequest.reviewedAt = new Date();
      }
    } else if (normalizedStatus === 'Confirmed' && requiresPaymentBeforeConfirm && !booking.isPaid) {
      // Owner-selected confirmation should be reflected immediately in owner bookings UI.
      booking.ownerApproved = true;
      booking.ownerApprovalStatus = 'approved';
      booking.status = 'Confirmed';
      booking.paymentStatus = booking.isPaid ? 'Paid' : 'Unpaid';
      if (booking?.cancelRequest?.status === 'Pending') {
        booking.cancelRequest.status = 'Rejected';
        booking.cancelRequest.reviewedAt = new Date();
      }
    } else {
      booking.ownerApproved = true;
      booking.ownerApprovalStatus = 'approved';
      booking.status = 'Confirmed';
      booking.paymentStatus = booking.isPaid ? 'Paid' : 'Unpaid';
      if (booking?.cancelRequest?.status === 'Pending') {
        booking.cancelRequest.status = 'Rejected';
        booking.cancelRequest.reviewedAt = new Date();
      }
    }

    const updatedBooking = await booking.save();

    let linkedData = null;
    if (normalizedStatus === 'Cancelled') {
      const tenantUser = await resolveTenantUserForBooking(updatedBooking);
      const recipientEmail = String(tenantUser?.email || updatedBooking.tenantEmail || '').trim();

      await clearTenantDashboardDataForCancelledBooking({ booking: updatedBooking, tenantUser });

      if (recipientEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const frontendUrl = normalizeBaseUrl(process.env.FRONTEND_URL || req.headers.origin || "http://localhost:3000");
          const loginLink = `${frontendUrl}/loginPage`;
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          });

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `Booking Cancelled - ${updatedBooking.pgName}`,
            html: `
              <h2>Your booking has been cancelled</h2>
              <p>Hi ${updatedBooking.tenantName},</p>
              <p>Your cancellation request for booking <strong>${updatedBooking.bookingId}</strong> at <strong>${updatedBooking.pgName}</strong> has been approved by the owner.</p>
              <p>This booking is now fully cancelled and removed from your active dashboard.</p>
              <p>Login here: <a href="${loginLink}" target="_blank" rel="noopener noreferrer">${loginLink}</a></p>
            `
          });
        } catch (mailErr) {
          console.warn("Tenant cancellation email failed:", mailErr.message || mailErr);
        }
      }
    }

    if (normalizedStatus === 'Confirmed') {
      // Notify tenant that owner approved and payment can be completed.
      const tenantUser = await resolveTenantUserForBooking(updatedBooking);
      if (tenantUser?.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const frontendUrl = normalizeBaseUrl(process.env.FRONTEND_URL || req.headers.origin || "http://localhost:3000");
          const loginLink = `${frontendUrl}/loginPage`;
          const paymentLink = `${frontendUrl}/user/dashboard/payments?bookingId=${updatedBooking._id}`;
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          });

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: tenantUser.email,
            subject: `Booking Approved - ${updatedBooking.pgName}`,
            html: `
              <h2>Your booking has been approved</h2>
              <p>Hi ${updatedBooking.tenantName},</p>
              <p>Your booking <strong>${updatedBooking.bookingId}</strong> for <strong>${updatedBooking.pgName}</strong> is approved by owner.</p>
              <p>Please complete payment to finalize confirmation and onboarding:</p>
              <p><a href="${paymentLink}" target="_blank" rel="noopener noreferrer">Complete Payment</a></p>
              <p>Login link: <a href="${loginLink}" target="_blank" rel="noopener noreferrer">${loginLink}</a></p>
            `
          });
        } catch (mailErr) {
          console.warn("Tenant approval email failed:", mailErr.message || mailErr);
        }
      }

      if (updatedBooking.status === 'Confirmed') {
        try {
          const confirmedData = await ensureBookingConfirmationData({ booking: updatedBooking, ownerId });
          let agreementPdfResult = null;
          try {
            agreementPdfResult = await generateAgreementPdf(updatedBooking._id);
          } catch (pdfErr) {
            console.warn("Agreement PDF generation warning:", pdfErr.message || pdfErr);
          }
          linkedData = {
            tenantId: confirmedData?.tenantUser?._id || null,
            agreementId: confirmedData?.agreement?.agreementId || null,
            rentAmount: Number(confirmedData?.rentAmount || updatedBooking.rentAmount || updatedBooking.bookingAmount || 0),
            securityDeposit: Number(confirmedData?.agreement?.securityDeposit || updatedBooking.securityDeposit || 0),
            agreementPdfUrl: agreementPdfResult?.agreementPdfUrl || updatedBooking.agreementPdfUrl || "",
            awaitsPayment: false
          };
        } catch (linkErr) {
          console.warn("Booking confirmation sync warning:", linkErr.message || linkErr);
          let agreementPdfUrl = updatedBooking.agreementPdfUrl || "";
          try {
            const pdfResult = await generateAgreementPdf(updatedBooking._id);
            agreementPdfUrl = pdfResult?.agreementPdfUrl || agreementPdfUrl;
          } catch (pdfErr) {
            console.warn("Agreement PDF generation warning:", pdfErr.message || pdfErr);
          }
          linkedData = {
            tenantId: null,
            agreementId: null,
            rentAmount: Number(updatedBooking.rentAmount || updatedBooking.bookingAmount || 0),
            securityDeposit: Number(updatedBooking.securityDeposit || 0),
            agreementPdfUrl,
            awaitsPayment: false
          };
        }
      } else {
        linkedData = {
          tenantId: updatedBooking.tenantUserId || null,
          agreementId: null,
          rentAmount: Number(updatedBooking.rentAmount || updatedBooking.bookingAmount || 0),
          securityDeposit: Number(updatedBooking.securityDeposit || 0),
          agreementPdfUrl: updatedBooking.agreementPdfUrl || "",
          awaitsPayment: true
        };
      }
    }

    res.status(200).json({
      success: true,
      data: updatedBooking,
      refund: cancellationRefundSummary || updatedBooking?.cancellationRefund || null,
      linked: linkedData
        ? {
            tenantId: linkedData.tenantId || null,
            agreementId: linkedData.agreementId || null,
            rentAmount: Number(linkedData.rentAmount) || 0,
            securityDeposit: Number(linkedData.securityDeposit) || 0,
            agreementPdfUrl: linkedData.agreementPdfUrl || "",
            awaitsPayment: Boolean(linkedData.awaitsPayment)
          }
        : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateBookingAgreementPdf = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (String(booking.ownerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "You don't have permission for this booking" });
    }

    const result = await generateAgreementPdf(booking._id);
    return res.status(200).json({
      success: true,
      message: "Agreement PDF generated successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all agreements for the owner
const getMyAgreements = async (req, res) => {
  try {
    const ownerId = req.user._id;
    
    // Get all PGs owned by this owner
    const ownerPGs = await Pg.find({ ownerId });
    const pgIds = ownerPGs.map(pg => pg._id);
    const pgNames = ownerPGs.map(pg => pg.pgName).filter(Boolean);

    // Only include agreements tied to real tenant-side confirmed bookings.
    const validBookings = await Booking.find({
      status: "Confirmed",
      bookingSource: "tenant_request",
      $or: [
        { ownerId },
        { pgId: { $in: pgIds } },
        { pgName: { $in: pgNames } }
      ]
    }).select("bookingId tenantName tenantEmail pgId pgName");

    const bookingById = new Map();
    validBookings.forEach((b) => {
      if (b.bookingId) bookingById.set(String(b.bookingId), b);
    });
    const validBookingIds = Array.from(bookingById.keys());

    if (validBookingIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const agreements = await Agreement.find({
      bookingId: { $in: validBookingIds },
      $or: [
        { ownerId },
        { pgId: { $in: pgIds } },
        { pgName: { $in: pgNames } }
      ]
    })
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 });

    // Keep one agreement row per booking (latest wins).
    const latestByBookingId = new Map();
    agreements.forEach((agreement) => {
      const key = String(agreement.bookingId || "");
      if (!key) return;
      if (!latestByBookingId.has(key)) {
        latestByBookingId.set(key, agreement);
      }
    });
    
    // Format the data for the frontend
    const formattedAgreements = Array.from(latestByBookingId.values()).map((agreement) => {
      const tenant = agreement.userId || {};
      const booking = bookingById.get(String(agreement.bookingId || ""));
      return {
        id: agreement._id,
        agreementId: agreement.agreementId,
        bookingId: agreement.bookingId,
        tenant: agreement.tenantName || booking?.tenantName || tenant.fullName || "Unknown Tenant",
        tenantEmail: booking?.tenantEmail || tenant.email || "N/A",
        tenantPhone: tenant.phone || "N/A",
        property: agreement.pgName || 'Unknown',
        room: agreement.roomNo || 'Unknown',
        startDate: agreement.startDate,
        endDate: agreement.endDate,
        checkInDate: agreement.checkInDate || agreement.startDate,
        checkOutDate: agreement.checkOutDate || agreement.endDate,
        isLongTerm: agreement.isLongTerm || String(agreement.endDate || "").toLowerCase() === "long term",
        rent: agreement.rentAmount,
        securityDeposit: agreement.securityDeposit,
        fileUrl: agreement.fileUrl || "",
        ownerSignatureUrl: agreement.ownerSignatureUrl || "",
        status: agreement.signed ? 'Active' : 'Pending Signature',
        signed: agreement.signed,
        createdAt: agreement.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: formattedAgreements.length,
      data: formattedAgreements
    });
  } catch (error) {
    console.error('Error fetching agreements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Support ticket management
const createSupportTicket = async (req, res) => {
  try {
    const {
      yourName,
      emailAddress,
      phone,
      subject,
      description,
      message
    } = req.body;
    const ownerId = req.user._id;
    const owner = await User.findById(ownerId).select("fullName email phone");

    const normalizedSubject = String(subject || "").trim();
    const normalizedDescription = String(description || "").trim();
    const normalizedMessage = String(message || "").trim();

    const finalSubject = normalizedSubject || "Support Request";
    const finalDescription = normalizedDescription || normalizedMessage;

    if (!finalDescription) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    // Generate unique ticket ID
    const ticketId = `TKT${Date.now()}`;

    const newTicket = await SupportTicket.create({
      ownerId,
      ticketId,
      subject: finalSubject,
      description: finalDescription,
      yourName: String(yourName || owner?.fullName || "Owner").trim(),
      emailAddress: String(emailAddress || owner?.email || "").trim(),
      phone: String(phone || owner?.phone || "Not provided").trim(),
      date: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: newTicket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all support tickets for the owner
const getMySupportTickets = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const tickets = await SupportTicket.find({ ownerId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update support ticket status
const updateSupportTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user._id;

    const ticket = await SupportTicket.findOne({ _id: id, ownerId });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found or you don't have permission to update this ticket" });
    }

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update tenant information
const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, room, status, pgId } = req.body;
    const ownerId = req.user._id;

    // Find the tenant and ensure it belongs to this owner
    const tenant = await Tenant.findOne({ _id: id, ownerId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found or you don't have permission to edit this tenant" });
    }

    const normalizedName = name !== undefined ? String(name || "").trim() : undefined;
    const normalizedPhone = phone !== undefined ? String(phone || "").trim() : undefined;
    const normalizedEmail = email !== undefined ? String(email || "").trim().toLowerCase() : undefined;
    const normalizedRoom = room !== undefined ? String(room || "").trim() : undefined;
    const normalizedStatus = status !== undefined ? String(status || "").trim() : undefined;

    // Update tenant information (only provided fields)
    const payload = {};
    if (normalizedName !== undefined) payload.name = normalizedName;
    if (normalizedPhone !== undefined) payload.phone = normalizedPhone;
    if (normalizedEmail !== undefined) payload.email = normalizedEmail;
    if (normalizedRoom !== undefined) payload.room = normalizedRoom;
    if (normalizedStatus !== undefined) payload.status = normalizedStatus;
    if (pgId) {
      const pg = await Pg.findOne({ _id: pgId, ownerId }).select('pgName');
      if (!pg) {
        return res.status(404).json({ success: false, message: "Selected PG not found for this owner" });
      }
      payload.pgId = pgId;
      payload.pgName = pg.pgName || "";
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true }
    );

    // Sync linked agreement + user room fields so user dashboard reflects latest room number.
    const oldEmail = String(tenant.email || "").trim().toLowerCase();
    const newEmail = String(updatedTenant.email || "").trim().toLowerCase();
    const oldName = String(tenant.name || "").trim();
    const newName = String(updatedTenant.name || "").trim();

    const linkedUser = await User.findOne({
      role: { $in: ['user', 'tenant'] },
      $or: [
        oldEmail ? { email: new RegExp(`^${oldEmail}$`, 'i') } : null,
        newEmail ? { email: new RegExp(`^${newEmail}$`, 'i') } : null,
        oldName ? { fullName: new RegExp(`^${escapeRegex(oldName)}$`, 'i') } : null,
        newName ? { fullName: new RegExp(`^${escapeRegex(newName)}$`, 'i') } : null
      ].filter(Boolean)
    }).select('_id');

    if (linkedUser?._id) {
      await User.findByIdAndUpdate(linkedUser._id, {
        $set: {
          roomNo: updatedTenant.room || "",
          assignedPg: updatedTenant.pgId || null
        }
      });
    }

    const pgCandidates = [
      tenant.pgId ? String(tenant.pgId) : "",
      updatedTenant.pgId ? String(updatedTenant.pgId) : ""
    ].filter(Boolean);
    const pgNameCandidates = [
      String(tenant.pgName || "").trim(),
      String(updatedTenant.pgName || "").trim()
    ].filter(Boolean);

    const identityOr = [
      oldName ? { tenantName: new RegExp(`^${escapeRegex(oldName)}$`, 'i') } : null,
      newName ? { tenantName: new RegExp(`^${escapeRegex(newName)}$`, 'i') } : null,
      oldEmail ? { tenantEmail: new RegExp(`^${oldEmail}$`, 'i') } : null,
      newEmail ? { tenantEmail: new RegExp(`^${newEmail}$`, 'i') } : null,
      linkedUser?._id ? { tenantUserId: linkedUser._id } : null
    ].filter(Boolean);

    const bookingMatches = { ownerId, $and: [] };
    if (pgCandidates.length > 0 || pgNameCandidates.length > 0) {
      bookingMatches.$and.push({
        $or: [
          pgCandidates.length > 0 ? { pgId: { $in: pgCandidates } } : null,
          pgNameCandidates.length > 0 ? { pgName: { $in: pgNameCandidates } } : null
        ].filter(Boolean)
      });
    }
    if (identityOr.length > 0) {
      bookingMatches.$and.push({ $or: identityOr });
    }
    if (identityOr.length === 0) {
      bookingMatches.$and.push({ _id: null });
    }
    if (bookingMatches.$and.length === 0) {
      delete bookingMatches.$and;
    }

    const linkedBookings = await Booking.find(bookingMatches).select('bookingId');
    const bookingCodes = linkedBookings
      .map((b) => String(b.bookingId || "").trim())
      .filter(Boolean);

    if (normalizedRoom !== undefined) {
      await Booking.updateMany(
        bookingMatches,
        {
          $set: {
            roomType: updatedTenant.room || "N/A",
            variantLabel: updatedTenant.room || ""
          }
        }
      );
    }

    if (bookingCodes.length > 0) {
      await Agreement.updateMany(
        { bookingId: { $in: bookingCodes } },
        {
          $set: {
            roomNo: updatedTenant.room || "N/A",
            roomType: updatedTenant.room || "N/A"
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: updatedTenant
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SUBMIT PROPERTY FOR APPROVAL ---
const submitForApproval = async (req, res) => {
  try {
    const { pgId } = req.params;
    const ownerId = req.user._id;

    // Find the property
    const pg = await Pg.findOne({ _id: pgId, ownerId });
    
    if (!pg) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // If already submitted, treat this as idempotent success for smoother UX.
    if (pg.approvalStatus === "pending") {
      return res.status(200).json({
        success: true,
        message: "Property is already submitted for approval.",
        data: pg
      });
    }

    // Only draft listings can be submitted for admin review.
    if (pg.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: `Property is already ${pg.status}. Only draft properties can be submitted.`
      });
    }

    // Keep listing in draft until admin confirms it; only mark approval workflow as pending.
    pg.status = "draft";
    pg.approvalStatus = "pending";
    await pg.save();

    // Get owner details for email
    const owner = await User.findById(ownerId);

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    if (adminEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject: `New Property Approval Request - ${pg.pgName}`,
          html: `
            <h2>New Property Submitted for Approval</h2>
            <p><strong>Property Name:</strong> ${pg.pgName}</p>
            <p><strong>Location:</strong> ${pg.location}</p>
            <p><strong>Owner Name:</strong> ${owner.fullName}</p>
            <p><strong>Owner Email:</strong> ${owner.email}</p>
            <p><strong>Owner Phone:</strong> ${owner.phone || 'Not provided'}</p>
            <p><strong>Submitted Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p>Please login to the admin panel to review and approve this property.</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log("Approval request email sent to admin:", adminEmail);
      } catch (emailError) {
        console.error("Error sending email to admin:", emailError);
        // Continue even if email fails - the property status is already updated
      }
    } else {
      console.log("Email not configured. Skipping admin notification.");
    }

    res.status(200).json({
      success: true,
      message: "Property submitted for approval successfully! Admin will review it shortly.",
      data: pg
    });
  } catch (error) {
    console.error("Submit for approval error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOwnerEarnings = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const fromQuickAction = String(req.query.from || req.query.source || "").toLowerCase() === "quick-action";
    const pendingScope = String(req.query.pendingScope || "").toLowerCase();
    const showOnlyCurrentMonthPending = fromQuickAction || pendingScope === "current-month";
    const selectedMonthRange = resolveMonthRangeFromShortName(req.query.month);

    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const ownerPgIds = ownerPgs.map((pg) => pg._id);
    const ownerPgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const selectedMonthStart = selectedMonthRange.start;
    const selectedMonthEnd = selectedMonthRange.end;
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const payments = await Payment.find({
      paymentStatus: { $in: SUCCESS_PAYMENT_STATUSES },
      $or: [
        { pgId: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    }).sort({ paymentDate: -1 });

    const total = payments.reduce((sum, p) => sum + getOwnerPayoutAmount(p), 0);
    const todayAmount = payments
      .filter((p) => new Date(p.paymentDate) >= dayStart)
      .reduce((sum, p) => sum + getOwnerPayoutAmount(p), 0);

    const selectedMonthPayments = payments.filter((p) => {
      const d = new Date(p.paymentDate);
      return d >= selectedMonthStart && d < selectedMonthEnd;
    });
    const selectedMonthAmount = selectedMonthPayments.reduce((sum, p) => sum + getOwnerPayoutAmount(p), 0);

    const daysInSelectedMonth = new Date(
      selectedMonthStart.getFullYear(),
      selectedMonthStart.getMonth() + 1,
      0
    ).getDate();
    const dayBuckets = Array.from({ length: daysInSelectedMonth }, (_, i) => ({
      label: String(i + 1),
      amount: 0
    }));

    selectedMonthPayments.forEach((p) => {
      const d = new Date(p.paymentDate);
      const dayIndex = d.getDate() - 1;
      if (dayIndex >= 0 && dayIndex < dayBuckets.length) {
        dayBuckets[dayIndex].amount += getOwnerPayoutAmount(p);
      }
    });

    const chartLabels = dayBuckets.map((v) => v.label);
    const chartValues = dayBuckets.map((v) => v.amount);

    const earningsHistory = selectedMonthPayments.slice(0, 50).map((payment) => ({
      date: new Date(payment.paymentDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      source: payment.pgName || "Unknown PG",
      amount: getOwnerPayoutAmount(payment),
      status: "Paid"
    }));

    const pendingQuery = {
      status: { $in: ['Pending', 'Overdue'] },
      $or: [
        { pg: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    };
    // Show pending items only in the 5-day pre-due reminder window.
    const reminderWindowStart = new Date(dayStart);
    reminderWindowStart.setHours(0, 0, 0, 0);
    const reminderWindowEnd = new Date(dayStart);
    reminderWindowEnd.setDate(reminderWindowEnd.getDate() + PENDING_PAYMENT_VISIBLE_DAYS_BEFORE_DUE);
    reminderWindowEnd.setHours(23, 59, 59, 999);
    const monthEndInclusive = new Date(monthEnd);
    monthEndInclusive.setMilliseconds(monthEndInclusive.getMilliseconds() - 1);

    const dueDateGte = showOnlyCurrentMonthPending
      ? (monthStart > reminderWindowStart ? monthStart : reminderWindowStart)
      : reminderWindowStart;
    const dueDateLt = showOnlyCurrentMonthPending
      ? (monthEndInclusive < reminderWindowEnd ? monthEndInclusive : reminderWindowEnd)
      : reminderWindowEnd;
    pendingQuery.dueDate = { $gte: dueDateGte, $lte: dueDateLt };

    const pendingPaymentsRaw = await PendingPayment.find(pendingQuery).sort({ dueDate: 1 });

    const normalizeKey = (value = "") => String(value || "").trim().toLowerCase();
    const buildTenantPgKeys = ({ tenantName = "", pgId = "", pgName = "" }) => ([
      `${normalizeKey(tenantName)}|id:${normalizeKey(pgId)}`,
      `${normalizeKey(tenantName)}|name:${normalizeKey(pgName)}`
    ]);

    const tenantsRaw = await Tenant.find({
      ownerId,
      $or: [
        { pgId: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    }).select("name pgId pgName isFinePaused extensionUntil");
    const tenantStateByKey = new Map();
    tenantsRaw.forEach((tenant) => {
      const keys = buildTenantPgKeys({
        tenantName: tenant.name || "",
        pgId: tenant.pgId || "",
        pgName: tenant.pgName || ""
      });
      keys.forEach((k) => {
        if (!tenantStateByKey.has(k)) {
          tenantStateByKey.set(k, {
            isFinePaused: Boolean(tenant.isFinePaused),
            extensionUntil: tenant.extensionUntil || null
          });
        }
      });
    });

    const bookingsRaw = await Booking.find({
      ownerId,
      status: { $ne: "Cancelled" },
      $or: [
        { pgId: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    })
      .sort({ createdAt: -1 })
      .select("_id pgId pgName tenantName status isPaid");

    const bookingByKey = new Map();
    const bookingByTenantKey = new Map();
    bookingsRaw.forEach((booking) => {
      const keys = buildTenantPgKeys({
        tenantName: booking.tenantName || "",
        pgId: booking.pgId || "",
        pgName: booking.pgName || ""
      });

      keys.forEach((k) => {
        const existing = bookingByKey.get(k);
        const existingScore = existing ? (String(existing.status || "").toLowerCase() === "confirmed" ? 2 : 1) : 0;
        const nextScore = String(booking.status || "").toLowerCase() === "confirmed" ? 2 : 1;
        if (!existing || nextScore > existingScore) {
          bookingByKey.set(k, booking);
        }
      });

      const tenantOnlyKey = normalizeKey(booking.tenantName || "");
      if (tenantOnlyKey) {
        const existing = bookingByTenantKey.get(tenantOnlyKey);
        const existingScore = existing ? (String(existing.status || "").toLowerCase() === "confirmed" ? 2 : 1) : 0;
        const nextScore = String(booking.status || "").toLowerCase() === "confirmed" ? 2 : 1;
        if (!existing || nextScore > existingScore) {
          bookingByTenantKey.set(tenantOnlyKey, booking);
        }
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingPayments = pendingPaymentsRaw.map((payment) => {
      const paymentPgId = payment.pg ? String(payment.pg) : "";
      const paymentPgName = String(payment.pgName || "");
      const tenantName = String(payment.tenantName || "Unknown Tenant");

      const lookupKeys = buildTenantPgKeys({
        tenantName,
        pgId: paymentPgId,
        pgName: paymentPgName
      });

      const tenantState = lookupKeys.map((k) => tenantStateByKey.get(k)).find(Boolean) || null;
      const matchedBooking =
        lookupKeys.map((k) => bookingByKey.get(k)).find(Boolean) ||
        bookingByTenantKey.get(normalizeKey(tenantName)) ||
        null;

      const extensionUntil = tenantState?.extensionUntil ? new Date(tenantState.extensionUntil) : null;
      const extensionActive = Boolean(extensionUntil && !Number.isNaN(extensionUntil.getTime()) && extensionUntil >= today);
      const isFinePaused = Boolean(tenantState?.isFinePaused || extensionActive);
      const lateFine = calculateLateFine({
        dueDate: payment.dueDate,
        dailyFine: LATE_FINE_PER_DAY,
        isFinePaused
      });

      const baseAmount = Number(payment.amount) || 0;
      const lateFee = Number(lateFine.fineAmount || 0);
      const totalAmount = baseAmount + lateFee;
      const dueDate = new Date(payment.dueDate);
      const dueLabel = dueDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

      return {
        id: payment._id,
        tenant: tenantName,
        userName: tenantName,
        pg: paymentPgName || "Unknown PG",
        amount: baseAmount,
        lateFee,
        totalAmount,
        due: dueLabel,
        actualDueDate: dueLabel,
        overdueDays: Number(lateFine.overdueDays || 0),
        isFinePaused,
        status: payment.status,
        month: payment.month,
        bookingId: matchedBooking?._id || null
      };
    });

    const pendingSummary = pendingPayments.reduce((acc, payment) => {
      acc.baseAmount += Number(payment.amount) || 0;
      acc.lateFee += Number(payment.lateFee) || 0;
      acc.totalAmount += Number(payment.totalAmount) || 0;
      return acc;
    }, { baseAmount: 0, lateFee: 0, totalAmount: 0 });

    res.status(200).json({
      success: true,
      data: {
        stats: { total, monthly: selectedMonthAmount, today: todayAmount },
        chartData: {
          labels: chartLabels,
          datasets: [
            {
              label: `${selectedMonthRange.label} Earnings`,
              data: chartValues,
              borderColor: "#f97316",
              backgroundColor: "rgba(249,115,22,0.15)",
              tension: 0.35,
            }
          ]
        },
        meta: {
          fromQuickAction,
          pendingScope: showOnlyCurrentMonthPending ? "current-month" : "all",
          selectedMonth: selectedMonthRange.label
        },
        selectedMonthAmount,
        earningsHistory,
        pendingPayments,
        pendingSummary
      }
    });
  } catch (error) {
    console.error('Owner earnings fetch error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch earnings data" });
  }
};

const sendPaymentLink = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const pgIds = ownerPgs.map((pg) => String(pg._id));
    const pgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    let booking = await Booking.findById(id);
    if (!booking) {
      const pending = await PendingPayment.findById(id).select("tenantName pg pgName");
      if (!pending) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      const pendingBelongsToOwner =
        (pending.pg && pgIds.includes(String(pending.pg))) ||
        (pending.pgName && pgNames.includes(pending.pgName));

      if (!pendingBelongsToOwner) {
        return res.status(403).json({ success: false, message: "You don't have permission to send payment link for this pending payment" });
      }

      booking = await Booking.findOne({
        ownerId,
        status: { $ne: "Cancelled" },
        tenantName: pending.tenantName,
        $or: [
          pending.pg ? { pgId: pending.pg } : null,
          pending.pgName ? { pgName: pending.pgName } : null
        ].filter(Boolean)
      }).sort({ createdAt: -1 });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "No active booking found for this pending payment"
        });
      }
    }

    const belongsToOwner =
      String(booking.ownerId) === String(ownerId) ||
      (booking.pgId && pgIds.includes(String(booking.pgId))) ||
      pgNames.includes(booking.pgName);

    if (!belongsToOwner) {
      return res.status(403).json({ success: false, message: "You don't have permission to send payment link for this booking" });
    }

    const tenantQuery = {
      ownerId,
      name: booking.tenantName,
      $or: [
        booking.pgId ? { pgId: booking.pgId } : null,
        booking.pgName ? { pgName: booking.pgName } : null
      ].filter(Boolean)
    };

    const tenantRecord = await Tenant.findOne(tenantQuery).sort({ createdAt: -1 });
    const recipientEmail = tenantRecord?.email;

    if (!recipientEmail) {
      return res.status(404).json({
        success: false,
        message: "Tenant email not found. Add tenant email in tenant records first."
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service not configured on server"
      });
    }

    const frontendUrl = normalizeBaseUrl(process.env.FRONTEND_URL || req.headers.origin || "http://localhost:3000");
    const paymentLink = `${frontendUrl}/user/dashboard/payments?bookingId=${booking._id}`;
    const loginLink = `${frontendUrl}/loginPage`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const subject = `Payment Link - ${booking.pgName}`;
    const html = `
      <h2>Rent Payment Reminder</h2>
      <p>Dear ${booking.tenantName},</p>
      <p>Your booking <strong>${booking.bookingId}</strong> for <strong>${booking.pgName}</strong> is confirmed.</p>
      <p>Please complete your rent payment using the link below:</p>
      <p><a href="${paymentLink}" target="_blank" rel="noopener noreferrer">Pay Now</a></p>
      <p>If not logged in, login first here:</p>
      <p><a href="${loginLink}" target="_blank" rel="noopener noreferrer">Login</a></p>
      <p>If the button does not work, copy this URL:</p>
      <p>${paymentLink}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject,
      html
    });

    return res.status(200).json({
      success: true,
      message: "Payment link sent successfully",
      data: {
        bookingId: booking._id,
        email: recipientEmail
      }
    });
  } catch (error) {
    console.error("Send payment link error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const downloadOwnerEarningsPDF = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const selectedMonthRange = resolveMonthRangeFromShortName(req.query.month);
    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const ownerPgIds = ownerPgs.map((pg) => pg._id);
    const ownerPgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    const payments = await Payment.find({
      paymentStatus: { $in: SUCCESS_PAYMENT_STATUSES },
      $or: [
        { pgId: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    }).sort({ paymentDate: -1 });

    const pendingPaymentsRaw = await PendingPayment.find({
      status: { $in: ['Pending', 'Overdue'] },
      dueDate: { $gte: selectedMonthRange.start, $lt: selectedMonthRange.end },
      $or: [
        { pg: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    }).sort({ dueDate: 1 });

    const monthPayments = payments.filter((p) => {
      const d = new Date(p.paymentDate);
      return d >= selectedMonthRange.start && d < selectedMonthRange.end;
    });

    const total = payments.reduce((sum, p) => sum + getOwnerPayoutAmount(p), 0);
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthly = monthPayments
      .reduce((sum, p) => sum + getOwnerPayoutAmount(p), 0);
    const today = payments
      .filter((p) => new Date(p.paymentDate) >= dayStart)
      .reduce((sum, p) => sum + getOwnerPayoutAmount(p), 0);

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`EasyPG Manager - Owner Earnings Report (${selectedMonthRange.label})`, 14, 15);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["Metric", "Amount"]],
      body: [
        ["Total Earnings", `Rs. ${total.toLocaleString()}`],
        [`${selectedMonthRange.label} Earnings`, `Rs. ${monthly.toLocaleString()}`],
        ["Today", `Rs. ${today.toLocaleString()}`],
      ],
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Date", "PG", "Amount", "Status"]],
      body: monthPayments.slice(0, 50).map((p) => [
        new Date(p.paymentDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        p.pgName || 'Unknown PG',
        `Rs. ${getOwnerPayoutAmount(p).toLocaleString()}`,
        'Paid'
      ]),
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Tenant", "PG", "Amount", "Due Date"]],
      body: pendingPaymentsRaw.map((p) => [
        p.tenantName || 'Unknown Tenant',
        p.pgName || 'Unknown PG',
        `Rs. ${(Number(p.amount) || 0).toLocaleString()}`,
        new Date(p.dueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      ]),
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Owner_Earnings_Report_${selectedMonthRange.label}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Owner earnings PDF error:', error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
};

// --- UPLOAD PROPERTY DOCUMENTS ---
const uploadPropertyDocuments = async (req, res) => {
  try {
    const { pgId } = req.params;
    const ownerId = req.user._id;

    if (!pgId) {
      return res.status(400).json({ success: false, message: "PG ID is required" });
    }

    const pg = await Pg.findOne({ _id: pgId, ownerId });
    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    if (!pg.proofDocuments) {
      pg.proofDocuments = {};
    }
    if (!pg.proofDocumentMeta) {
      pg.proofDocumentMeta = {};
    }

    const filePath = (file) => (file ? `/uploads/documents/${file.filename}` : undefined);

    if (req.files?.aadhaar?.[0]) {
      pg.proofDocuments.aadhaar = filePath(req.files.aadhaar[0]);
      pg.proofDocumentMeta.aadhaar = {
        status: "Uploaded",
        reviewedAt: null,
        reviewNote: ""
      };
    }
    if (req.files?.electricityBill?.[0]) {
      pg.proofDocuments.electricityBill = filePath(req.files.electricityBill[0]);
      pg.proofDocumentMeta.electricityBill = {
        status: "Uploaded",
        reviewedAt: null,
        reviewNote: ""
      };
    }
    if (req.files?.propertyTax?.[0]) {
      pg.proofDocuments.propertyTax = filePath(req.files.propertyTax[0]);
      pg.proofDocumentMeta.propertyTax = {
        status: "Uploaded",
        reviewedAt: null,
        reviewNote: ""
      };
    }

    await pg.save();

    return res.status(200).json({
      success: true,
      message: "Property documents uploaded successfully",
      data: pg,
    });
  } catch (error) {
    console.error("Upload property documents error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadAgreementTemplate = async (req, res) => {
  try {
    const { pgId } = req.params;
    const ownerId = req.user._id;

    const pg = await Pg.findOne({ _id: pgId, ownerId });
    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    const agreementFile = req.files?.agreementPdf?.[0];
    const signatureFile = req.files?.ownerSignature?.[0];

    if (!agreementFile && !signatureFile) {
      return res.status(400).json({ success: false, message: "Upload agreement PDF or owner signature" });
    }

    pg.agreementTemplate = {
      agreementFileUrl: agreementFile ? `/uploads/documents/${agreementFile.filename}` : (pg.agreementTemplate?.agreementFileUrl || ""),
      ownerSignatureUrl: signatureFile ? `/uploads/documents/${signatureFile.filename}` : (pg.agreementTemplate?.ownerSignatureUrl || ""),
      uploadedAt: new Date()
    };
    if (!pg.agreementTemplateMeta) {
      pg.agreementTemplateMeta = {};
    }
    if (agreementFile) {
      pg.agreementTemplateMeta.agreementFileUrl = {
        status: "Uploaded",
        reviewedAt: null,
        reviewNote: ""
      };
    }
    if (signatureFile) {
      pg.agreementTemplateMeta.ownerSignatureUrl = {
        status: "Uploaded",
        reviewedAt: null,
        reviewNote: ""
      };
    }

    await pg.save();

    return res.status(200).json({
      success: true,
      message: "Agreement template uploaded successfully",
      data: pg.agreementTemplate
    });
  } catch (error) {
    console.error("Upload agreement template error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Owner confirms tenant arrival
const confirmArrival = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const ownerId = req.user._id;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    if (String(tenant.ownerId) !== String(ownerId)) return res.status(403).json({ success: false, message: 'Not authorized' });

    const linkedBooking = await Booking.findOne({
      ownerId,
      status: { $in: ["Pending", "Confirmed"] },
      $and: [
        {
          $or: [
            { pgId: tenant.pgId },
            { pgName: tenant.pgName || "" }
          ]
        },
        {
          $or: [
            { tenantEmail: tenant.email || "" },
            { tenantName: tenant.name || "" }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    if (linkedBooking) {
      const moveInValidation = validateMoveIn({
        securityDepositPaid:
          Boolean(linkedBooking.securityDepositPaid) ||
          Number(linkedBooking.securityDeposit || 0) <= 0,
        initialRentPaid: Boolean(linkedBooking.initialRentPaid || linkedBooking.isPaid),
        ownerApprovalStatus:
          String(linkedBooking.ownerApprovalStatus || "").toLowerCase() === "approved" ||
          linkedBooking.ownerApproved ||
          String(linkedBooking.status || "").toLowerCase() === "confirmed"
            ? "approved"
            : "pending"
      });
      if (!moveInValidation.allowed) {
        return res.status(400).json({ success: false, message: moveInValidation.message, code: moveInValidation.code });
      }
    }

    // Set joining date to today and mark active
    const todayStr = new Date().toISOString().split('T')[0];
    tenant.joiningDate = todayStr;
    tenant.status = 'Active';
    await tenant.save();

    // Convert pending user check-in request into approved check-in event.
    // Resolve user robustly (email -> booking linkage -> tenant name fallback).
    const tenantEmail = String(tenant.email || "").trim();
    let linkedUser = null;
    if (tenantEmail && tenantEmail !== "no-email@easy-pg.local") {
      linkedUser = await User.findOne({
        email: new RegExp(`^${tenantEmail}$`, "i"),
        role: { $in: ["user", "tenant"] }
      }).select("_id");
    }

    if (!linkedUser?._id) {
      const pgMatchers = [
        { pgId: tenant.pgId },
        { pgName: tenant.pgName || "" }
      ];
      const tenantMatchers = [
        tenantEmail ? { tenantEmail: tenantEmail } : null,
        tenant.name ? { tenantName: tenant.name } : null
      ].filter(Boolean);
      const linkedBooking = await Booking.findOne({
        ownerId,
        status: "Confirmed",
        isPaid: true,
        $and: [
          { $or: pgMatchers },
          { $or: tenantMatchers }
        ]
      })
        .sort({ createdAt: -1 })
        .select("tenantUserId tenantEmail tenantName");

      if (linkedBooking?.tenantUserId) {
        linkedUser = await User.findById(linkedBooking.tenantUserId).select("_id");
      }

      if (!linkedUser?._id && linkedBooking?.tenantEmail) {
        linkedUser = await User.findOne({
          email: new RegExp(`^${String(linkedBooking.tenantEmail).trim()}$`, "i"),
          role: { $in: ["user", "tenant"] }
        }).select("_id");
      }

      if (!linkedUser?._id && linkedBooking?.tenantName) {
        linkedUser = await User.findOne({
          fullName: linkedBooking.tenantName,
          role: { $in: ["user", "tenant"] }
        }).select("_id");
      }
    }

    if (linkedUser?._id) {
      const pendingCheckIn = await CheckIn.findOne({ userId: linkedUser._id, status: "Pending" }).sort({ createdAt: -1 });
      if (pendingCheckIn) {
        pendingCheckIn.status = "Present";
        pendingCheckIn.checkInDate = new Date();
        await pendingCheckIn.save();
      } else {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const alreadyApprovedToday = await CheckIn.findOne({
          userId: linkedUser._id,
          status: "Present",
          checkInDate: { $gte: todayStart }
        }).select("_id");

        if (!alreadyApprovedToday) {
          await CheckIn.create({
            userId: linkedUser._id,
            checkInDate: new Date(),
            status: "Present"
          });
        }
      }
    }

    // Ensure linked records (booking, agreement, payments)
    const pg = await Pg.findById(tenant.pgId);
    try {
      await ensureTenantLinkedRecords({ ownerId, tenant, pg });
    } catch (e) {
      console.warn('ensureTenantLinkedRecords warning:', e.message || e);
    }

    return res.status(200).json({ success: true, message: 'Arrival confirmed', data: tenant });
  } catch (error) {
    console.error('confirmArrival error:', error);
    return res.status(500).json({ success: false, message: 'Failed to confirm arrival' });
  }
};

// --- DELETE TENANT ---
const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    // Find the tenant and ensure it belongs to this owner
    const tenant = await Tenant.findOne({ _id: id, ownerId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found or you don't have permission to delete this tenant" });
    }

    // Delete the tenant
    await Tenant.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Tenant deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOwnerProfile, 
  getOwnerDashboardData, 
  createPg, 
  getMyPgs, 
  deletePg,
  getPgById,
  updatePg,
  addRoom,
  uploadPgImages,
  updateRoomPrices, 
  addTenant, 
  getMyTenants, 
  approveExtensionRequest,
  rejectExtensionRequest,
  completeTenantMoveOut,
  submitDamageReport,
  processRefund,
  getMyBookings, 
  addBooking, 
  updateBookingStatus,
  generateBookingAgreementPdf,
  sendPaymentLink,
  updateOwnerProfile,
  getMyAgreements,
  updateTenant,
  deleteTenant,
  syncTenantLinkedData,
  createSupportTicket,
  getMySupportTickets,
  updateSupportTicketStatus,
  submitForApproval,
  uploadPropertyDocuments,
  uploadAgreementTemplate,
  confirmArrival,
  deleteOwnerAccount,
  getOwnerEarnings,
  downloadOwnerEarningsPDF
};
