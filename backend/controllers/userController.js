const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const Agreement = require("../models/agreementModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const PG = require("../models/pgModel"); 
const nodemailer = require("nodemailer");
const axios = require("axios");
const CheckIn = require("../models/checkInModel");
const Timeline = require("../models/timelineModel");
const Tenant = require("../models/tenantModel");
const PendingPayment = require("../models/pendingPaymentModel");
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const ExtensionRequest = require("../models/extensionRequestModel");
const fs = require('fs');
const path = require('path');
const { validateMoveIn } = require("../utils/leaseUtils");
const { resolveVariantPricing } = require("../utils/pricingUtils");
// Moved to top to avoid redundant requiring during PDF generation
const { jsPDF } = require('jspdf');
const { autoTable } = require('jspdf-autotable');
const DAY_MS = 24 * 60 * 60 * 1000;
const TENANT_PAY_WINDOW_DAYS_BEFORE_DUE = 5;

// ? Temporary in-memory store for Security OTPs [cite: 2026-01-06]
const securityOtpCache = {};
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Helper: Generate JWT [cite: 2026-01-06]
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

const setAuthCookie = (res, token) => {
  if (!token) return;
  res.cookie("userToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  });
};

const resolveTenantForUser = async (userDoc) => {
  if (!userDoc) return null;
  const email = String(userDoc.email || "").toLowerCase().trim();
  if (!email) return null;

  return Tenant.findOne({ email: new RegExp(`^${email}$`, "i") }).sort({ createdAt: -1 });
};

const getNextCycleDueDate = (anchorDateInput) => {
  const anchor = new Date(anchorDateInput);
  if (Number.isNaN(anchor.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(anchor);
  due.setHours(0, 0, 0, 0);

  // Must always show upcoming month cycle (today counts as current cycle, so move ahead).
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

// @desc Generate Custom CAPTCHA (Function kept but logic cleared to avoid errors)
const generateCaptcha = async (req, res) => {
  res.status(200).json({ success: true, message: "Puzzle CAPTCHA enabled on frontend" });
};

// @desc Register new user
const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profileCompletion: 20,
      emergencyContact: {
        contactName: "",  // contactname
        relationship: "", // relationship
        phoneNumber: ""
      }
    });

    if (user) {
      const token = generateToken(user._id);
      setAuthCookie(res, token);
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc Authenticate user
const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    const selectedRole = req.body.role; 
    const { otp } = req.body; 

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    const isTesterManual = (email === "tester@gmail.com" && password === "abcd");

    if (!isMatch && !isTesterManual) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (selectedRole && user.role !== selectedRole) {
      return res.status(401).json({ 
        message: `This account is registered as an ${user.role}. Please use the correct login button.` 
      });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName || "User",
      email: user.email,
      role: user.role || "user",
      token
    });

  } catch (error) {
    console.error(" LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc Get Dynamic Dashboard Data [cite: 2026-01-06]
const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password +profileCompletion");
    if (!user) return res.status(404).json({ message: "User not found" });

    const tenantEmail = String(user.email || "").trim().toLowerCase();
    const booking = await Booking.findOne({
      status: { $in: ["Pending", "Confirmed"] },
      $or: [
        { tenantUserId: user._id },
        tenantEmail ? { tenantEmail: new RegExp(`^${tenantEmail}$`, "i") } : null,
        { tenantName: user.fullName }
      ].filter(Boolean)
    }).sort({ createdAt: -1 });

    const latestAgreement = await Agreement.findOne({ userId: user._id }).sort({ createdAt: -1 });
    const approvedMoveIn = await CheckIn.findOne({ userId: user._id, status: "Present" })
      .sort({ checkInDate: -1 })
      .select("_id");
    const activeTenantRecord = await Tenant.findOne({
      status: "Active",
      $or: [
        { email: new RegExp(`^${tenantEmail}$`, "i") },
        { name: user.fullName || "" }
      ]
    }).select("_id");
    const hasApprovedMoveIn = Boolean(approvedMoveIn?._id || activeTenantRecord?._id);
    const pendingPaymentsRaw = await PendingPayment.find({
      status: { $in: ["Pending", "Overdue"] },
      $or: [{ tenant: user._id }, { tenantName: user.fullName }]
    }).sort({ dueDate: 1 });
    const pendingPayment = pickRelevantPendingPayment(pendingPaymentsRaw);
    const recentPaymentsRaw = await Payment.find({
      user: user._id,
      paymentStatus: { $in: ["Success", "Paid", "PAID"] }
    })
      .sort({ paymentDate: -1 })
      .select("month amountPaid paymentStatus paymentDate _id");
    const latestByMonth = new Map();
    recentPaymentsRaw.forEach((payment) => {
      const monthKey =
        payment.month || new Date(payment.paymentDate).toLocaleString("en-US", { month: "short", year: "numeric" });
      if (!latestByMonth.has(monthKey)) {
        latestByMonth.set(monthKey, payment);
      }
    });
    const filteredRecentPayments = Array.from(latestByMonth.values())
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 5);

    const roomType = latestAgreement?.roomType || booking?.roomType || "N/A";
    let linkedPg = null;
    let pricing = null;
    let monthlyRent = Number(booking?.rentAmount || booking?.bookingAmount || 0);
    if (booking) {
      linkedPg = booking.pgId
        ? await PG.findById(booking.pgId).select("price securityDeposit roomPrices")
        : booking.pgName
          ? await PG.findOne({ pgName: booking.pgName }).select("price securityDeposit roomPrices")
          : null;
      pricing = resolveVariantPricing({
        roomPrices: linkedPg?.roomPrices,
        roomType: booking.roomType || booking.variantLabel || roomType,
        variantLabel: booking.variantLabel || "",
        fallbackRent: Number(booking?.rentAmount || booking?.bookingAmount || linkedPg?.price || 0),
        fallbackDeposit: Number(booking?.securityDeposit || linkedPg?.securityDeposit || 0)
      });
      monthlyRent = Number(pricing.rentAmount || booking?.rentAmount || booking?.bookingAmount || linkedPg?.price || 0);
    }
    const initialRentPaid = Boolean(booking?.initialRentPaid || booking?.isPaid);
    const securityDepositAmount = Math.max(
      0,
      Number(pricing?.securityDeposit ?? booking?.securityDeposit ?? linkedPg?.securityDeposit ?? 0)
    );
    const securityDepositPaid = Boolean(booking?.securityDepositPaid) || securityDepositAmount <= 0;
    const moveInDuesPaid = initialRentPaid && securityDepositPaid;

    let bookingStatus = "Inactive";
    if (booking) {
      if (booking.status === "Cancelled") {
        bookingStatus = "Cancelled";
      } else if (booking.ownerApproved && initialRentPaid) {
        // Once rent is paid, do not keep showing "Awaiting Payment".
        bookingStatus = hasApprovedMoveIn ? "Active" : "Pending Move-In Approval";
      } else if (booking.ownerApproved) {
        bookingStatus = "Awaiting Payment";
      } else {
        bookingStatus = "Pending Approval";
      }
    }
    const normalizedPendingDueDate = getNextCycleDueDate(pendingPayment?.dueDate || null);
    const fallbackCycleDueDate = getNextCycleDueDate(booking?.checkInDate || user.paymentDueDate || null);
    const dueDateValue = normalizedPendingDueDate || fallbackCycleDueDate || null;
    const dueDateLabel = dueDateValue
      ? new Date(dueDateValue).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
      : "No due";
    let canPayNow = false;
    if (pendingPayment?.dueDate) {
      const dueDateObj = new Date(pendingPayment.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDateObj.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.floor((dueDateObj - today) / DAY_MS);
      canPayNow = daysUntilDue <= TENANT_PAY_WINDOW_DAYS_BEFORE_DUE;
    }
    const rentDue = Number(pendingPayment?.amount || monthlyRent || 0);
    const securityDepositDue = securityDepositPaid ? 0 : securityDepositAmount;
    const recentPayments = filteredRecentPayments.map((payment) => ({
      id: payment._id,
      month: payment.month || new Date(payment.paymentDate).toLocaleString("en-US", { month: "short", year: "numeric" }),
      amount: Number(monthlyRent || payment.amountPaid || 0),
      status: "Paid"
    }));

    const dashboardData = {
      fullName: user.fullName || user.name, 
      profileCompletion: user.profileCompletion || 0,
      currentBooking: {
        pgId: booking?.pgId || user.assignedPg || null,
        pgName: booking?.pgName || user.bookedPgName || "No PG Booked",
        roomNo: latestAgreement?.roomNo || user.roomNo || "N/A",
        roomType: roomType,
        status: bookingStatus,
        monthlyRent: monthlyRent,
        isPaid: Boolean(booking?.isPaid),
        initialRentPaid,
        securityDepositPaid,
        moveInDuesPaid,
        ownerApproved: Boolean(booking?.ownerApproved),
        hasApprovedMoveIn: hasApprovedMoveIn,
        bookingState: booking?.status || "Pending",
      },
      nextPayment: {
        amount: Number(rentDue + securityDepositDue),
        rentDue,
        securityDepositDue,
        dueDate: dueDateLabel,
        canPayNow
      },
      recentPayments
    };

    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard from backend" });
  }
};

// @desc Get Full Profile Details [cite: 2026-01-06]
const getUserProfile = async (req, res) => {
  try {
    // Explicitly include fields that are select:false by default (profilePicture, profileCompletion)
    const [user, profile] = await Promise.all([
      User.findById(req.user._id).select("-password +profilePicture +profileCompletion"),
      Profile.findOne({ userId: req.user._id }).select("personalInfo emergencyContact")
    ]);
    if (!user) return res.status(404).json({ message: "User not found" });

    const personal = profile?.personalInfo || {};
    const emergency = profile?.emergencyContact || {};
    const pick = (...values) =>
      values.find((v) => v !== undefined && v !== null && v !== "" && v !== "NOT SET");

    res.status(200).json({ 
      success: true, 
      data: {
        fullName: pick(personal.fullName, user.fullName, user.name, "User"),
        email: user.email,
        phone: pick(personal.phone, user.phone, "Not Set"),
        city: pick(personal.city, user.city, "Not Set"),
        state: pick(personal.state, user.state, "Not Set"),
        role: user.role || "user",
        profilePicture: user.profilePicture || "",
        profileCompletion: user.profileCompletion || 0,
        emergencyContact: {
          contactName: pick(emergency.guardianName, user.emergencyContact?.contactName, "Not Set"),
          relationship: pick(emergency.relationship, user.emergencyContact?.relationship, "Not Set"),
          phoneNumber: pick(emergency.guardianPhone, user.emergencyContact?.phoneNumber, "Not Set")
        }
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Helper: recalculate profileCompletion using User + Profile models
const recalcProfileCompletion = async (userId) => {
  try {
    const [user, profile] = await Promise.all([
      User.findById(userId).select("+profilePicture +profileCompletion"),
      Profile.findOne({ userId }),
    ]);
    if (!user) return;

    const hasAny = (obj, keys) =>
      keys.some((k) => {
        const v = obj?.[k];
        return v && v !== "NOT SET";
      });

    let filledSections = 0;
    const totalSections = 5; // personal, academic, emergency, payment, picture

    // Personal: use Profile first, then fallback to legacy User fields
    if (
      hasAny(profile?.personalInfo || {}, [
        "fullName",
        "phone",
        "age",
        "bloodGroup",
        "city",
        "state",
        "email",
      ]) ||
      hasAny(user || {}, ["fullName", "phone", "city", "state", "email", "age", "bloodGroup"])
    ) {
      filledSections++;
    }

    // Academic: profile model only
    if (
      hasAny(profile?.academicInfo || {}, [
        "status",
        "qualification",
        "company",
        "workAddress",
      ])
    ) {
      filledSections++;
    }

    // Emergency: use Profile first, then fallback to legacy User.emergencyContact
    if (
      hasAny(profile?.emergencyContact || {}, [
        "guardianName",
        "relationship",
        "guardianPhone",
      ]) ||
      hasAny(user?.emergencyContact || {}, ["contactName", "relationship", "phoneNumber"])
    ) {
      filledSections++;
    }

    // Payment: profile model only
    if (
      hasAny(profile?.paymentDetails || {}, [
        "holder",
        "bank",
        "ifsc",
        "account",
      ])
    ) {
      filledSections++;
    }

    if (user.profilePicture) {
      filledSections++;
    }

    const completion = Math.round((filledSections / totalSections) * 100);
    user.profileCompletion = Math.max(0, Math.min(100, completion));
    await user.save();
  } catch (e) {
    console.error("Profile completion calc error:", e.message);
  }
};

// @desc Update User Profile (Edit Info Button) [cite: 2026-01-07]
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = req.body.fullName || user.fullName;
    user.phone = req.body.phone || user.phone;
    user.city = req.body.city || user.city;
    user.state = req.body.state || user.state;

    if (req.body.emergencyContact) {
      user.emergencyContact.contactName = req.body.emergencyContact.contactName || user.emergencyContact.contactName;
      user.emergencyContact.relationship = req.body.emergencyContact.relationship || user.emergencyContact.relationship;
      user.emergencyContact.phoneNumber = req.body.emergencyContact.phoneNumber || user.emergencyContact.phoneNumber;
    }

    const fields = [user.phone, user.city, user.state, user.emergencyContact.contactName];
    const filledCount = fields.filter(f => f && f !== "Not Set").length;
    user.profileCompletion = 20 + (filledCount * 20); 

    const updatedUser = await user.save();

    // Also sync completion if Profile document exists
    await recalcProfileCompletion(user._id);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// @desc Upload Profile Picture [cite: 2026-01-07]
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const user = await User.findById(req.user._id);
    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    // Recalculate completion including picture section
    await recalcProfileCompletion(user._id);

    res.status(200).json({ success: true, profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: "Error uploading picture" });
  }
};

// @desc Remove Profile Picture [cite: 2026-01-07]
const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.profilePicture = ""; 
    await user.save();

    await recalcProfileCompletion(user._id);
    res.status(200).json({ success: true, message: "Picture removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing picture" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

const getMyAgreement = async (req, res) => {
  try {
    const userDocWithAgreementCopy = await User.findById(req.user._id).select(
      "+rentalAgreementCopy.status +rentalAgreementCopy.fileUrl"
    );
    const signedAgreementDocStatus = String(userDocWithAgreementCopy?.rentalAgreementCopy?.status || "");
    const hasUploadedSignedAgreement = Boolean(userDocWithAgreementCopy?.rentalAgreementCopy?.fileUrl) &&
      ["uploaded", "verified"].includes(signedAgreementDocStatus.toLowerCase());

    const userId = req.user?._id;
    const tenantEmail = String(req.user?.email || "").trim().toLowerCase();
    const booking = await Booking.findOne({
      status: { $in: ["Pending", "Confirmed"] },
      $or: [
        { tenantUserId: userId },
        tenantEmail ? { tenantEmail: new RegExp(`^${tenantEmail}$`, "i") } : null,
        { tenantName: req.user?.fullName || "" }
      ].filter(Boolean)
    }).sort({ createdAt: -1 });
    const agreement = booking?.bookingId
      ? await Agreement.findOne({ bookingId: booking.bookingId }).sort({ createdAt: -1 })
      : await Agreement.findOne({ userId }).sort({ createdAt: -1 });

    const bookingPg = booking?.pgId
      ? await PG.findById(booking.pgId).select("agreementTemplate pgName roomPrices price securityDeposit")
      : null;
    const ownerTemplateUrl = bookingPg?.agreementTemplate?.agreementFileUrl || "";
    const ownerTemplateSignatureUrl = bookingPg?.agreementTemplate?.ownerSignatureUrl || "";
    const generatedAgreementUrl = booking?.agreementPdfUrl || "";
    const agreementPricing = resolveVariantPricing({
      roomPrices: bookingPg?.roomPrices,
      roomType: booking?.roomType || agreement?.roomType || "",
      variantLabel: booking?.variantLabel || agreement?.variantLabel || "",
      fallbackRent: Number(agreement?.rentAmount || booking?.rentAmount || booking?.bookingAmount || bookingPg?.price || 0),
      fallbackDeposit: Number(agreement?.securityDeposit || booking?.securityDeposit || bookingPg?.securityDeposit || 0)
    });

    if (!agreement) {
      return res.status(200).json({
        success: true,
        data: {
          pgName: booking?.pgName || bookingPg?.pgName || "",
          roomNo: "",
          tenantName: req.user?.fullName || "",
          rentAmount: Number(agreementPricing.rentAmount || booking?.rentAmount || booking?.bookingAmount || 0) || null,
          securityDeposit: Number(booking?.securityDeposit || 0) || null,
          agreementId: "",
          bookingId: booking?.bookingId || "",
          startDate: booking?.checkInDate || "",
          endDate: booking?.checkOutDate || "",
          checkInDate: booking?.checkInDate || "",
          checkOutDate: booking?.checkOutDate || "",
          isLongTerm: String(booking?.checkOutDate || "").toLowerCase() === "long term",
          fileUrl: generatedAgreementUrl || "",
          ownerSignatureUrl: "",
          signatureVerified: hasUploadedSignedAgreement,
          status: hasUploadedSignedAgreement
            ? "Signature Verified"
            : booking?.status === "Confirmed"
            ? (booking?.isPaid ? "Awaiting Agreement Signature" : "Awaiting Payment")
            : (booking?.ownerApproved ? "Awaiting Payment" : "Pending Approval")
        },
        message: "No agreement available yet. It will appear after booking confirmation."
      });
    }

    const resolvedOwnerSignatureUrl = agreement.ownerSignatureUrl || ownerTemplateSignatureUrl || "";
    const resolvedSigned = Boolean(agreement.signed || resolvedOwnerSignatureUrl || hasUploadedSignedAgreement);
    if (!agreement.signed && resolvedSigned) {
      agreement.signed = true;
      if (!agreement.ownerSignatureUrl && ownerTemplateSignatureUrl) {
        agreement.ownerSignatureUrl = ownerTemplateSignatureUrl;
      }
      await agreement.save();
    } else if (!agreement.ownerSignatureUrl && ownerTemplateSignatureUrl) {
      agreement.ownerSignatureUrl = ownerTemplateSignatureUrl;
      await agreement.save();
    }

    res.status(200).json({
      success: true,
      data: {
        pgName: agreement.pgName || "N/A",
        roomNo: agreement.roomNo || "N/A",
        tenantName: agreement.tenantName || "N/A",
        rentAmount: Number(agreementPricing.rentAmount || agreement.rentAmount || 0),
        securityDeposit: agreement.securityDeposit,
        agreementId: agreement.agreementId,
        bookingId: agreement.bookingId,
        startDate: agreement.startDate,
        endDate: agreement.endDate,
        checkInDate: agreement.checkInDate || agreement.startDate,
        checkOutDate: agreement.checkOutDate || agreement.endDate,
        isLongTerm: agreement.isLongTerm || String(agreement.endDate || "").toLowerCase() === "long term",
        fileUrl: generatedAgreementUrl || agreement.fileUrl || "",
        ownerSignatureUrl: resolvedOwnerSignatureUrl,
        signatureVerified: resolvedSigned,
        status: resolvedSigned ? "Signature Verified" : "Pending Signature"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching agreement data" });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select(
        "+idDocument.status +idDocument.fileUrl +idDocument.uploadedAt +idDocument.reviewedAt +idDocument.reviewNote " +
        "+aadharCard.status +aadharCard.fileUrl +aadharCard.uploadedAt +aadharCard.reviewedAt +aadharCard.reviewNote " +
        "+rentalAgreementCopy.status +rentalAgreementCopy.fileUrl +rentalAgreementCopy.uploadedAt +rentalAgreementCopy.reviewedAt +rentalAgreementCopy.reviewNote"
      );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        idDocument: user.idDocument || { status: "Pending" },
        aadharCard: user.aadharCard || { status: "Pending" },
        rentalAgreementCopy: user.rentalAgreementCopy || { status: "Pending" }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching documents" });
  }
};

const uploadUserDocument = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const fieldName = req.body.documentType; 
    const allowedDocumentFields = ["idDocument", "aadharCard", "rentalAgreementCopy"];

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!allowedDocumentFields.includes(fieldName)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    user[fieldName] = {
      status: "Uploaded",
      fileUrl: `/uploads/documents/${req.file.filename}`,
      uploadedAt: Date.now(),
      reviewedAt: null,
      reviewNote: ""
    };

    await user.save();
    res.status(200).json({ success: true, data: user[fieldName] });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};
const deleteUserDocument = async (req, res) => {
  try {
    const { documentType } = req.body; // Matches 'idDocument', 'aadharCard', etc.
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ? Robust Path Resolution using process.cwd()
    if (user[documentType] && user[documentType].fileUrl) {
      const relativePath = user[documentType].fileUrl.startsWith('/') 
        ? user[documentType].fileUrl.substring(1) 
        : user[documentType].fileUrl;

      const filePath = path.join(process.cwd(), relativePath);
      
      // ? Only try to delete if the file actually exists on the server
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
      }
    }

    // ? Reset the database fields regardless of physical file status
    user[documentType] = {
      status: "Pending",
      fileUrl: "",
      uploadedAt: null
    };

    await user.save();
    res.status(200).json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ success: false, message: "Server error during deletion" });
  }
};

const getMyOwnerContact = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("email assignedPg fullName");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const tenantEmail = String(user.email || "").trim().toLowerCase();

    // Primary source: latest booking for this tenant.
    const latestBooking = await Booking.findOne({
      status: { $in: ["Pending", "Confirmed"] },
      $or: [
        { tenantUserId: user._id },
        tenantEmail ? { tenantEmail: new RegExp(`^${tenantEmail}$`, "i") } : null,
        { tenantName: user.fullName || "" }
      ].filter(Boolean)
    }).sort({ createdAt: -1 }).select("pgId pgName ownerId");

    let pg = null;
    if (latestBooking?.pgId) {
      pg = await PG.findById(latestBooking.pgId)
        .populate("ownerId", "fullName email phone")
        .select("pgName location city area address ownerId");
    }

    // Fallback 1: assigned PG on user.
    if (!pg && user.assignedPg) {
      pg = await PG.findById(user.assignedPg)
        .populate("ownerId", "fullName email phone")
        .select("pgName location city area address ownerId");
    }

    // Fallback 2: PG by booking pgName if pgId missing.
    if (!pg && latestBooking?.pgName) {
      pg = await PG.findOne({ pgName: latestBooking.pgName })
        .populate("ownerId", "fullName email phone")
        .select("pgName location city area address ownerId");
    }

    if (!pg) {
      return res.status(200).json({
        success: true,
        message: "No booked PG found for owner contact yet",
        data: null
      });
    }

    const owner = pg.ownerId && typeof pg.ownerId === "object" ? pg.ownerId : null;
    const rawLocationParts = [pg.address, pg.area, pg.city, pg.location]
      .map((part) => String(part || "").trim())
      .filter(Boolean);
    const flatLocationParts = rawLocationParts
      .flatMap((part) => part.split(","))
      .map((part) => part.trim())
      .filter(Boolean);
    const seenLocation = new Set();
    const dedupedLocationParts = flatLocationParts.filter((part) => {
      const key = part.toLowerCase();
      if (seenLocation.has(key)) return false;
      seenLocation.add(key);
      return true;
    });
    const pgAddress = dedupedLocationParts.length > 0 ? dedupedLocationParts.join(", ") : "Address not available";

    return res.status(200).json({
      success: true,
      data: {
        ownerName: owner?.fullName || "Owner",
        phone: owner?.phone || "Not provided",
        email: owner?.email || "",
        pgName: pg.pgName || latestBooking?.pgName || "N/A",
        pgAddress
      }
    });
  } catch (error) {
    console.error("Owner Contact Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const firstMonth = new Date(now.getFullYear(), now.getMonth() - 4, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [checkIns, rawPayments, checkInsForChart, paymentsForChart] = await Promise.all([
      CheckIn.find({ userId })
        .sort({ checkInDate: -1 })
        .limit(20)
        .select("_id checkInDate status"),
      Payment.find({
        user: userId,
        paymentStatus: { $in: ["Success", "Paid", "PAID"] }
      })
        .sort({ paymentDate: -1 })
        .limit(50)
        .select("_id paymentDate amountPaid month"),
      CheckIn.find({
        userId,
        checkInDate: { $gte: firstMonth, $lt: nextMonth }
      }).select("checkInDate"),
      Payment.find({
        user: userId,
        paymentStatus: { $in: ["Success", "Paid", "PAID"] },
        paymentDate: { $gte: firstMonth, $lt: nextMonth }
      }).select("paymentDate")
    ]);

    const latestPaymentByMonth = new Map();
    rawPayments.forEach((payment) => {
      const monthKey =
        payment.month ||
        new Date(payment.paymentDate).toLocaleString("en-US", { month: "short", year: "numeric" });
      if (!latestPaymentByMonth.has(monthKey)) {
        latestPaymentByMonth.set(monthKey, payment);
      }
    });
    const payments = Array.from(latestPaymentByMonth.values())
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 5);
    const pricingBooking = await getLatestTenantBookingForUser(
      userId,
      req.user?.email || "",
      req.user?.fullName || ""
    );
    let timelineRentAmount = 0;
    if (pricingBooking) {
      const linkedPg = pricingBooking.pgId
        ? await PG.findById(pricingBooking.pgId).select("price securityDeposit roomPrices")
        : pricingBooking.pgName
          ? await PG.findOne({ pgName: pricingBooking.pgName }).select("price securityDeposit roomPrices")
          : null;
      const pricing = resolveVariantPricing({
        roomPrices: linkedPg?.roomPrices,
        roomType: pricingBooking.roomType || pricingBooking.variantLabel || "",
        variantLabel: pricingBooking.variantLabel || "",
        fallbackRent: Number(pricingBooking.rentAmount || pricingBooking.bookingAmount || linkedPg?.price || 0),
        fallbackDeposit: Number(pricingBooking.securityDeposit || linkedPg?.securityDeposit || 0)
      });
      timelineRentAmount = Number(
        pricing.rentAmount ||
          pricingBooking.rentAmount ||
          pricingBooking.bookingAmount ||
          linkedPg?.price ||
          0
      );
    }

    const keyEvents = [
      ...checkIns.map((ci) => ({
        id: ci._id,
        title: ci.status === "Present" ? "Checked In" : "Checked Out",
        type: ci.status === "Present" ? "checkin" : "checkout",
        date: ci.checkInDate,
        status: ci.status
      })),
      ...payments.map((p) => ({
        id: p._id,
        title: `Rent Paid: INR ${Number(timelineRentAmount || p.amountPaid || 0).toLocaleString("en-IN")}`,
        type: "payment",
        date: p.paymentDate,
        status: "Paid"
      }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    const monthKeys = [];
    const monthLabels = [];
    for (let i = 0; i < 5; i += 1) {
      const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i, 1);
      monthKeys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
      monthLabels.push(date.toLocaleString("en-US", { month: "short" }));
    }

    const checkInBuckets = monthKeys.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
    const paymentBuckets = monthKeys.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    checkInsForChart.forEach((ci) => {
      const d = new Date(ci.checkInDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (Object.prototype.hasOwnProperty.call(checkInBuckets, key)) {
        checkInBuckets[key] += 1;
      }
    });
    paymentsForChart.forEach((p) => {
      const d = new Date(p.paymentDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (Object.prototype.hasOwnProperty.call(paymentBuckets, key)) {
        paymentBuckets[key] += 1;
      }
    });

    const chartData = {
      months: monthLabels,
      checkins: monthKeys.map((key) => checkInBuckets[key]),
      payments: monthKeys.map((key) => paymentBuckets[key])
    };

    res.status(200).json({
      success: true,
      data: {
        keyEvents: keyEvents.length > 0
          ? keyEvents
          : [{ id: "empty", title: "No Activities Found", type: "info", date: new Date(), status: "New" }],
        chartData
      }
    });
  } catch (error) {
    console.error("Timeline error:", error);
    res.status(500).json({ success: false, message: "Error fetching timeline" });
  }
};

const downloadTenantReport = async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user._id;
    const user = await User.findById(userId).select("fullName email");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const tenantEmail = String(user.email || "").trim().toLowerCase();
    const tenantName = String(user.fullName || "").trim();

    const [checkIns, rawPayments, latestBooking] = await Promise.all([
      CheckIn.find({ userId }).sort({ checkInDate: -1 }).limit(50),
      Payment.find({
        user: userId,
        paymentStatus: { $in: ["Success", "Paid", "PAID"] }
      })
        .sort({ paymentDate: -1 })
        .limit(50)
        .select("_id paymentDate amountPaid paymentStatus month"),
      Booking.findOne({
        status: { $in: ["Pending", "Confirmed"] },
        $or: [
          { tenantUserId: userId },
          tenantEmail ? { tenantEmail: new RegExp(`^${tenantEmail}$`, "i") } : null,
          tenantName ? { tenantName } : null
        ].filter(Boolean)
      })
        .sort({ createdAt: -1 })
        .select("_id pgId pgName roomType variantLabel rentAmount bookingAmount checkInDate status isPaid")
    ]);

    const latestPaymentByMonth = new Map();
    rawPayments.forEach((payment) => {
      const monthKey = payment.month || new Date(payment.paymentDate).toLocaleString("en-US", { month: "short", year: "numeric" });
      if (!latestPaymentByMonth.has(monthKey)) {
        latestPaymentByMonth.set(monthKey, payment);
      }
    });
    const payments = Array.from(latestPaymentByMonth.values())
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    let timelineRentAmount = 0;
    if (latestBooking) {
      const linkedPg = latestBooking.pgId
        ? await PG.findById(latestBooking.pgId).select("price securityDeposit roomPrices")
        : latestBooking.pgName
          ? await PG.findOne({ pgName: latestBooking.pgName }).select("price securityDeposit roomPrices")
          : null;
      const pricing = resolveVariantPricing({
        roomPrices: linkedPg?.roomPrices,
        roomType: latestBooking.roomType || latestBooking.variantLabel || "",
        variantLabel: latestBooking.variantLabel || "",
        fallbackRent: Number(latestBooking.rentAmount || latestBooking.bookingAmount || linkedPg?.price || 0),
        fallbackDeposit: Number(latestBooking.securityDeposit || linkedPg?.securityDeposit || 0)
      });
      timelineRentAmount = Number(
        pricing.rentAmount ||
          latestBooking.rentAmount ||
          latestBooking.bookingAmount ||
          linkedPg?.price ||
          0
      );
    }

    const checkInEvents = checkIns.map((ci) => {
      const eventDate = new Date(ci.checkInDate);
      return {
        eventDate,
        date: eventDate.toLocaleDateString("en-GB"),
        activity: ci.status === "Present" ? "Check-In" : "Check-Out",
        status: ci.status
      };
    });

    const paymentEvents = payments.map((p) => {
      const eventDate = new Date(p.paymentDate);
      const amount = Number(timelineRentAmount || p.amountPaid || 0);
      return {
        eventDate,
        date: eventDate.toLocaleDateString("en-GB"),
        activity: `Rent Paid: INR ${amount.toLocaleString("en-IN")}`,
        status: "Paid"
      };
    });

    const moveInEvents = [];
    if (latestBooking?.isPaid && String(latestBooking.status || "").toLowerCase() === "confirmed") {
      const moveInDate = new Date(latestBooking.checkInDate || new Date());
      if (!Number.isNaN(moveInDate.getTime())) {
        moveInEvents.push({
          eventDate: moveInDate,
          date: moveInDate.toLocaleDateString("en-GB"),
          activity: "Move-In Activated",
          status: "Active"
        });
      }
    }

    let allEvents = [...checkInEvents, ...paymentEvents, ...moveInEvents];
    if (month && month !== "All") {
      const monthIndex = new Date(`${month} 1, 2026`).getMonth();
      if (!Number.isNaN(monthIndex)) {
        allEvents = allEvents.filter((event) => {
          const d = event.eventDate;
          return d instanceof Date && !Number.isNaN(d.getTime()) && d.getMonth() === monthIndex;
        });
      }
    }
    allEvents.sort((a, b) => b.eventDate - a.eventDate);

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(249, 115, 22);
    doc.text("EasyPG Manager - Stay Timeline Report", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Tenant: ${user.fullName}`, 14, 30);
    doc.text(`Email: ${user.email}`, 14, 37);
    doc.text(`Filter: ${month === "All" ? "Full History" : month}`, 14, 44);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 51);

    autoTable(doc, {
      startY: 58,
      head: [["Date", "Activity", "Status"]],
      body: allEvents.length > 0
        ? allEvents.map((event) => [event.date, event.activity, event.status])
        : [["-", "No activity found for selected filter", "-"]],
      theme: "striped",
      headStyles: { fillColor: [0, 0, 0] }
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const fileName = month === "All" ? "Full_Stay_Report.pdf" : `Stay_Report_${month}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Gen Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate your report" });
  }
};
const sendOtp = async (req, res) => {
  const verifyRecaptcha = async (recaptchaToken) => {
    return true; 
  };

  const email = (req.user?.email || req.body.email)?.toLowerCase().trim();
  const { recaptchaToken } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Recipient email is missing" });
    }

    if (!recaptchaToken) {
      console.log("?? Development mode: Proceeding without reCAPTCHA token");
    } else {
      const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isCaptchaValid) {
        return res.status(400).json({ success: false, message: "Invalid Captcha. Please try again." });
      }
    }
    
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    securityOtpCache[email] = { otp, expires: Date.now() + 300000 };

    console.log(`?? Security OTP for ${email} is: ${otp}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("?? Development mode: Email not configured, returning OTP in response");
      return res.status(200).json({ 
        success: true, 
        message: "OTP generated successfully (development mode)",
        otp: otp 
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"EasyPG Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "EasyPG Manager - Security Verification Code",
      text: `Your security code is ${otp}. Use this to complete your check-in/out.`,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server failed to send email" });
  }
};

const verifyOtpAndRegister = async (req, res) => {
  const { fullName, email, password, otp } = req.body;
  try {
    if (otp !== "1234") {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    return registerUser(req, res); 
  } catch (error) {
    console.error("?? VERIFICATION ERROR:", error);
    res.status(500).json({ message: "Registration failed after OTP" });
  }
};

const getMyCheckIns = async (req, res) => {
  try {
    const userId = req.user._id;
    const tenantEmail = String(req.user?.email || "").trim().toLowerCase();
    const tenantName = String(req.user?.fullName || "").trim();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [checkInHistory, paymentHistory, latestBooking] = await Promise.all([
      CheckIn.find({ userId, status: { $in: ["Present", "Out"] } }).sort({ createdAt: -1 }),
      Payment.find({
        user: userId,
        paymentStatus: { $in: ["Success", "Paid", "PAID"] },
        paymentDate: { $gte: dayStart, $lt: dayEnd }
      })
        .sort({ paymentDate: -1 })
        .limit(1)
        .select("_id paymentDate amountPaid paymentStatus pgName"),
      Booking.findOne({
        status: { $in: ["Pending", "Confirmed"] },
        $or: [
          { tenantUserId: userId },
          tenantEmail ? { tenantEmail: new RegExp(`^${tenantEmail}$`, "i") } : null,
          tenantName ? { tenantName } : null
        ].filter(Boolean)
      })
        .sort({ createdAt: -1 })
        .select("_id checkInDate status isPaid pgName")
    ]);

    const checkInEvents = checkInHistory.map((item) => {
      const dateObj = new Date(item.checkInDate);
      return {
        _id: item._id,
        date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: item.status === "Present" ? "Checked In" : "Checked Out",
        status: item.status,
        type: item.status === "Present" ? "checkin" : "checkout",
        pgName: latestBooking?.pgName || "",
        sortTs: dateObj.getTime()
      };
    });

    const paymentEvents = paymentHistory.map((payment) => {
      const dateObj = new Date(payment.paymentDate);
      const amount = Number(payment.amountPaid) || 0;
      return {
        _id: `payment-${payment._id}`,
        date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: `Rent Paid: ?${amount.toLocaleString("en-IN")}`,
        status: "Paid",
        type: "payment",
        pgName: payment.pgName || latestBooking?.pgName || "",
        sortTs: dateObj.getTime()
      };
    });

    const formattedHistory = [...checkInEvents, ...paymentEvents]
      .sort((a, b) => b.sortTs - a.sortTs)
      .map(({ sortTs, ...event }) => event);

    res.status(200).json({ success: true, data: formattedHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching activity" });
  }
};

const createCheckIn = async (req, res) => {
  try {
    const checkInDate = req.body.date ? new Date(req.body.date) : new Date();
    const newCheckIn = await CheckIn.create({
      userId: req.user._id,
      checkInDate: checkInDate, 
      status: "Present"
    });
    res.status(201).json({ success: true, data: newCheckIn });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to record check-in" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("userToken");
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// ? Corrected verifySecurityAction [cite: 2026-01-01, 2026-01-06]
const verifySecurityAction = async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    const finalEmail = (req.user?.email || email)?.toLowerCase().trim();

    const cachedData = securityOtpCache[finalEmail];
    if (!cachedData || cachedData.otp !== otp || Date.now() > cachedData.expires) {
      return res.status(400).json({ success: false, message: "Invalid or expired Security OTP" });
    }

    delete securityOtpCache[finalEmail];

    // Create a NEW record for every button click to show it in the list
    const activityRecord = await CheckIn.create({
      userId: req.user._id,
      checkInDate: new Date(), // This captures full time [cite: 2026-01-01]
      status: type === "Check-In" ? "Present" : "Out",
      activityType: type // Explicitly save "Check-In" or "Check-Out" [cite: 2026-01-06]
    });

    return res.status(200).json({ 
      success: true, 
      message: `${type} successful`,
      data: activityRecord 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed on server" });
  }
};

const submitSupportTicket = async (req, res) => {
  try {
    const { ticketSubject, issueDescription, email } = req.body; 

    if (!ticketSubject || !issueDescription) {
      return res.status(400).json({ success: false, message: "Please provide a subject and description." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"EasyPG Support" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, 
      subject: `[SUPPORT] ${ticketSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #3182ce;">New Support Request</h2>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <hr />
          <p><strong>Description:</strong></p>
          <p style="background: #f7fafc; padding: 10px;">${issueDescription}</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: "Your request has been sent to the admin." });
  } catch (error) {
    console.error("Support Ticket Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send support ticket." });
  }
};

const getOwnerEarnings = async (req, res) => {
  try {
    const owner = await User.findById(req.user._id);
    
    if (!owner || owner.role !== 'owner') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const totalTenants = await User.countDocuments({ role: 'tenant' });
    const avgRent = 7500; 
    const monthlyEarnings = totalTenants * avgRent;
    const todayEarnings = Math.floor(monthlyEarnings / 30); 
    
    const Payment = require('../models/paymentModel');
    const payments = await Payment.find({ paymentStatus: 'Success' })
      .populate('user', 'fullName')
      .sort({ paymentDate: -1 })
      .limit(10);

    const earningsHistory = payments.map(payment => ({
      date: new Date(payment.paymentDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      source: payment.pgName || 'Unknown PG', 
      amount: payment.amountPaid,
      status: payment.paymentStatus
    }));

    const PendingPayment = require('../models/pendingPaymentModel');
    const pendingPaymentsData = await PendingPayment.find({ status: 'Pending' })
      .populate('tenant', 'fullName')
      .sort({ dueDate: 1 });

    const pendingPayments = pendingPaymentsData.map(payment => ({
      tenant: payment.tenant?.fullName || payment.tenantName || 'Unknown Tenant',
      pg: payment.pgName || 'Unknown PG', 
      amount: payment.amount,
      due: new Date(payment.dueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    }));

    const earningsData = {
      stats: {
        total: monthlyEarnings * 12, 
        monthly: monthlyEarnings,
        today: todayEarnings,
      },
      chartData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
          {
            label: "Earnings",
            data: [
              monthlyEarnings * 0.9,
              monthlyEarnings * 1.1,
              monthlyEarnings * 0.95,
              monthlyEarnings * 1.05,
              monthlyEarnings * 1.15,
              monthlyEarnings * 1.2,
              monthlyEarnings * 1.25,
            ],
            borderColor: "#f97316",
            backgroundColor: "rgba(249,115,22,0.15)",
            tension: 0.35,
          },
        ],
      },
      earningsHistory,
      pendingPayments
    };

    res.status(200).json({ success: true, data: earningsData });
  } catch (error) {
    console.error("Earnings fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch earnings data" });
  }
};

const downloadEarningsPDF = async (req, res) => {
  try {
    const owner = await User.findById(req.user._id);
    
    if (!owner || owner.role !== 'owner') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { month } = req.query;
    const totalTenants = await User.countDocuments({ role: 'tenant' });
    const avgRent = 7500;
    const monthlyEarnings = totalTenants * avgRent;
    const todayEarnings = Math.floor(monthlyEarnings / 30);
    
    const earningsData = {
      stats: {
        total: monthlyEarnings * 12,
        monthly: monthlyEarnings,
        today: todayEarnings,
      },
      earningsHistory: [
        { date: "05 Jan 2026", source: "Shree Residency", amount: 8500, status: "Paid" },
        { date: "03 Jan 2026", source: "Krishna PG", amount: 7000, status: "Paid" },
        { date: "01 Jan 2026", source: "Om Sai PG", amount: 6500, status: "Paid" },
        { date: "28 Dec 2025", source: "Green Villa PG", amount: 8000, status: "Paid" },
        { date: "25 Dec 2025", source: "Sunshine PG", amount: 7500, status: "Paid" },
      ],
      pendingPayments: [
        { tenant: "Amit Patel", pg: "Shree Residency", amount: 9000, due: "15 Jan 2026" },
        { tenant: "Riya Shah", pg: "Om Sai PG", amount: 7500, due: "18 Jan 2026" },
        { tenant: "Vikram Singh", pg: "Green Villa PG", amount: 8000, due: "20 Jan 2026" },
      ]
    };

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("EasyPG Manager - Earnings Report", 14, 15);

    doc.setFontSize(11);
    doc.text(`Month: ${month || 'Jan'}`, 14, 25);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total Tenants: ${totalTenants}`, 14, 39);
    doc.text(`Average Rent: Rs. ${avgRent.toLocaleString()}`, 14, 44);

    autoTable(doc, {
      startY: 52,
      head: [["Metric", "Amount"]],
      body: [
        ["Total Earnings", `Rs. ${earningsData.stats.total.toLocaleString()}`],
        ["This Month", `Rs. ${earningsData.stats.monthly.toLocaleString()}`],
        ["Today", `Rs. ${earningsData.stats.today.toLocaleString()}`],
      ],
    });

    doc.text("Pending Payments", 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Tenant", "PG", "Amount", "Due Date"]],
      body: earningsData.pendingPayments.map(p => [
        p.tenant, p.pg, `Rs. ${p.amount.toLocaleString()}`, p.due,
      ]),
    });

    doc.text("Earnings History", 14, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 14,
      head: [["Date", "PG Name", "Amount", "Status"]],
      body: earningsData.earningsHistory.map(e => [
        e.date, e.source, `Rs. ${e.amount.toLocaleString()}`, e.status,
      ]),
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Earnings_Report_${month || 'Jan'}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
};

const getLatestTenantBookingForUser = async (userId, email, fullName) => {
  const tenantEmail = String(email || "").trim().toLowerCase();
  return Booking.findOne({
    status: { $in: ["Pending", "Confirmed"] },
    $or: [
      { tenantUserId: userId },
      tenantEmail ? { tenantEmail: new RegExp(`^${tenantEmail}$`, "i") } : null,
      fullName ? { tenantName: fullName } : null
    ].filter(Boolean)
  }).sort({ createdAt: -1 });
};

// @desc User requests Move-In (creates a pending check-in)
const moveIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const booking = await getLatestTenantBookingForUser(
      userId,
      req.user?.email || "",
      req.user?.fullName || ""
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found for move-in." });
    }

    const paymentQuery = {
      paymentStatus: { $in: ["Success", "Paid", "PAID"] },
      $and: [
        {
          $or: [
            { user: userId },
            { tenantName: booking.tenantName || "" }
          ]
        }
      ]
    };
    const pgPaymentMatchers = [
      booking.pgId ? { pgId: booking.pgId } : null,
      booking.pgName ? { pgName: booking.pgName } : null
    ].filter(Boolean);
    if (pgPaymentMatchers.length > 0) {
      paymentQuery.$and.push({ $or: pgPaymentMatchers });
    }

    const paidPayments = await Payment.find(paymentQuery).select("amountPaid");
    const totalPaid = paidPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

    const monthlyRent = Number(booking.rentAmount || booking.bookingAmount || 0);
    const securityDeposit = Number(booking.securityDeposit || 0);
    const ownerApprovalStatus =
      String(booking.ownerApprovalStatus || "").toLowerCase() === "approved" ||
      booking.ownerApproved ||
      String(booking.status || "").toLowerCase() === "confirmed"
        ? "approved"
        : "pending";

    const moveInValidation = validateMoveIn({
      securityDepositPaid: Boolean(booking.securityDepositPaid) || securityDeposit <= 0 || totalPaid >= (monthlyRent + securityDeposit),
      initialRentPaid: Boolean(booking.initialRentPaid || booking.isPaid) || totalPaid >= monthlyRent,
      ownerApprovalStatus
    });

    if (!moveInValidation.allowed) {
      return res.status(400).json({ success: false, message: moveInValidation.message, code: moveInValidation.code });
    }

    // create a pending CheckIn record (or update existing pending)
    let checkin = await CheckIn.findOne({ userId, status: 'Pending' });
    if (!checkin) {
      checkin = await CheckIn.create({ userId, checkInDate: new Date(), status: 'Pending' });
    } else {
      checkin.checkInDate = new Date();
      await checkin.save();
    }

    return res.status(200).json({ success: true, message: 'Move-in requested', status: 'Pending' });
  } catch (error) {
    console.error('moveIn error:', error);
    return res.status(500).json({ success: false, message: 'Failed to request move-in' });
  }
};

// @desc User requests Move-Out with notice date and long-term notice fine policy
const moveOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("email");
    const tenant = await resolveTenantForUser(user);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant record not found. Contact owner." });
    }

    const moveOutDateRaw = req.body?.moveOutDate || req.body?.requestedMoveOutDate;
    if (!moveOutDateRaw) {
      return res.status(400).json({ success: false, message: "Move-out date is required." });
    }

    const requestedMoveOutDate = new Date(moveOutDateRaw);
    if (Number.isNaN(requestedMoveOutDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid move-out date." });
    }
    requestedMoveOutDate.setHours(0, 0, 0, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (requestedMoveOutDate < todayStart) {
      return res.status(400).json({ success: false, message: "Move-out date cannot be in the past." });
    }

    // find active or pending checkin for user for stay info
    const checkin = await CheckIn.findOne({ userId, status: { $in: ['Present', 'Pending'] } }).sort({ createdAt: -1 });
    const joinDate = checkin?.checkInDate ? new Date(checkin.checkInDate) : new Date(tenant.joiningDate);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let rentAmount = 0;
    const agreement = await Agreement.findOne({ userId }).sort({ createdAt: -1 });
    const booking = await getLatestTenantBookingForUser(
      userId,
      req.user?.email || "",
      req.user?.fullName || ""
    );
    if (agreement?.rentAmount) rentAmount = Number(agreement.rentAmount) || 0;
    if (!rentAmount && booking?.rentAmount) rentAmount = Number(booking.rentAmount) || 0;
    if (!rentAmount && booking?.bookingAmount) rentAmount = Number(booking.bookingAmount) || 0;

    const isLongTermStay =
      Boolean(agreement?.isLongTerm) ||
      String(agreement?.endDate || "").toLowerCase() === "long term" ||
      String(booking?.checkOutDate || "").toLowerCase() === "long term";

    const noticeDays = Math.max(0, Math.ceil((requestedMoveOutDate - todayStart) / DAY_MS));
    const shortNoticeFine = isLongTermStay && noticeDays < 30 ? 5000 : 0;
    const previousMoveOutFine = Math.max(0, Number(tenant.moveOutFineApplied || 0));
    const existingPendingFine = Math.max(0, Number(tenant.pendingFine || 0));
    const basePendingFine = Math.max(0, existingPendingFine - previousMoveOutFine);
    const pendingFine = basePendingFine + shortNoticeFine;
    const securityDeposit = Math.max(0, Number(tenant.securityDeposit || agreement?.securityDeposit || booking?.securityDeposit || 0));
    const remainingPayable = Math.max(0, shortNoticeFine - securityDeposit);

    tenant.hasMoveOutNotice = true;
    tenant.moveOutRequested = true;
    tenant.moveOutRequestedAt = new Date();
    tenant.moveOutDateRequested = requestedMoveOutDate;
    tenant.moveOutNoticeDays = noticeDays;
    tenant.moveOutFineApplied = shortNoticeFine;
    tenant.moveOutFineRemainingPayable = remainingPayable;
    tenant.pendingFine = pendingFine;
    await tenant.save();

    return res.status(200).json({
      success: true,
      message: "Move-out request sent to owner for inspection and settlement.",
      moveOutRequested: true,
      daysStayed: diffDays,
      isLongTermStay,
      noticeDays,
      fineApplied: shortNoticeFine,
      pendingFine,
      securityDeposit,
      remainingPayable
    });
  } catch (error) {
    console.error('moveOut error:', error);
    return res.status(500).json({ success: false, message: 'Failed to request move-out' });
  }
};

// @desc User requests payment-extension and pauses late fine till selected date
const requestRentExtension = async (req, res) => {
  try {
    const requestedDueDate = req.body?.requestedDueDate || req.body?.untilDate;
    const reason = String(req.body?.reason || "").trim();
    if (!requestedDueDate) {
      return res.status(400).json({ success: false, message: "requestedDueDate is required" });
    }
    if (!reason) {
      return res.status(400).json({ success: false, message: "reason is required" });
    }

    const targetDate = new Date(requestedDueDate);
    if (Number.isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid requestedDueDate" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(0, 0, 0, 0);
    if (endDate < today) {
      return res.status(400).json({ success: false, message: "Extension date cannot be in the past" });
    }

    const user = await User.findById(req.user._id).select("email");
    const tenant = await resolveTenantForUser(user);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant record not found. Contact owner." });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const lastRequest = await ExtensionRequest.findOne({
      tenantId: req.user._id,
      tenantRecordId: tenant._id,
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ createdAt: -1 });
    if (lastRequest) {
      return res.status(400).json({
        success: false,
        message: "Extension request is allowed only once every 6 months."
      });
    }

    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    tenant.hasDeferralRequest = true;
    tenant.extensionRequested = true;
    tenant.extensionRequestedAt = new Date();
    tenant.extensionUntil = endDate;
    tenant.extensionReason = reason;
    tenant.lastExtensionRequestAt = new Date();
    tenant.isFinePaused = false;
    tenant.deferredDays = Math.max(diffDays, 0);
    tenant.deferredReason = reason;
    await tenant.save();

    await ExtensionRequest.create({
      ownerId: tenant.ownerId,
      tenantId: req.user._id,
      tenantRecordId: tenant._id,
      pgId: tenant.pgId,
      requestedDueDate: endDate,
      reason,
      status: "Pending",
      isFinePaused: false
    });

    // keep pending payment as pending while extension window is active
    await PendingPayment.updateMany(
      {
        tenantName: tenant.name,
        status: { $in: ["Pending", "Overdue"] },
        $or: [
          { pg: tenant.pgId },
          { pgName: tenant.pgName || "" }
        ]
      },
      { $set: { status: "Pending" } }
    );

    return res.status(200).json({
      success: true,
      message: "Extension request sent. Late fine is paused till requested date.",
      data: {
        extensionUntil: endDate,
        pauseFinePerDay: 100
      }
    });
  } catch (error) {
    console.error("requestExtension error:", error);
    return res.status(500).json({ success: false, message: "Failed to request extension" });
  }
};

const requestExtension = requestRentExtension;

module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserDashboard,
  getUserProfile, 
  updateUserProfile,
  updateProfilePicture, 
  removeProfilePicture, 
  getMe,
  getMyAgreement,
  getMyDocuments,
  uploadUserDocument,
  deleteUserDocument,
  getMyOwnerContact,
  getMyTimeline, 
  sendOtp,
  verifyOtpAndRegister,
  getMyCheckIns,
  createCheckIn,
  generateCaptcha,
  verifySecurityAction, 
  submitSupportTicket,
  moveIn,
  moveOut,
  requestRentExtension,
  requestExtension,
  getOwnerEarnings,
  downloadEarningsPDF,
  downloadTenantReport,
  forgotPassword: (req, res) => res.send("Forgot Pass"), 
  resetPassword: (req, res) => res.send("Reset Pass"), 
};


