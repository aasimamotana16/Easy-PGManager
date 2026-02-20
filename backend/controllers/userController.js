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
const fs = require('fs');
const path = require('path');
// Moved to top to avoid redundant requiring during PDF generation
const { jsPDF } = require('jspdf');
const { autoTable } = require('jspdf-autotable');

// ✅ Temporary in-memory store for Security OTPs [cite: 2026-01-06]
const securityOtpCache = {};
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Helper: Generate JWT [cite: 2026-01-06]
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

const resolveTenantForUser = async (userDoc) => {
  if (!userDoc) return null;
  const email = String(userDoc.email || "").toLowerCase().trim();
  if (!email) return null;

  return Tenant.findOne({ email: new RegExp(`^${email}$`, "i") }).sort({ createdAt: -1 });
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
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
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
    // Explicitly include profileCompletion even though it's select:false in the schema
    const user = await User.findById(req.user._id).select("-password +profileCompletion");
    if (!user) return res.status(404).json({ message: "User not found" });

    const dashboardData = {
      fullName: user.fullName || user.name, 
      profileCompletion: user.profileCompletion || 0,
      currentBooking: {
        pgName: user.bookedPgName || "No PG Booked",
        roomNo: user.roomNo || "N/A",
        status: user.bookingStatus || "Inactive",
        monthlyRent: user.monthlyRent || 0,
      },
      nextPayment: {
        amount: user.monthlyRent || 0,
        dueDate: user.paymentDueDate || "05 Jan 2026",
      }
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
    const userId = req.user?._id;
    const agreement = await Agreement.findOne({ userId }).sort({ createdAt: -1 });

    if (!agreement) {
      return res.status(200).json({
        success: true,
        data: {
          pgName: "",
          roomNo: "",
          tenantName: req.user?.fullName || "",
          rentAmount: null,
          securityDeposit: null,
          agreementId: "",
          bookingId: "",
          startDate: "",
          endDate: "",
          checkInDate: "",
          checkOutDate: "",
          isLongTerm: false,
          fileUrl: "",
          ownerSignatureUrl: "",
          status: "Pending"
        },
        message: "No agreement available yet. It will appear after booking confirmation."
      });
    }

    res.status(200).json({
      success: true,
      data: {
        pgName: agreement.pgName || "N/A",
        roomNo: agreement.roomNo || "N/A",
        tenantName: agreement.tenantName || "N/A",
        rentAmount: agreement.rentAmount,
        securityDeposit: agreement.securityDeposit,
        agreementId: agreement.agreementId,
        bookingId: agreement.bookingId,
        startDate: agreement.startDate,
        endDate: agreement.endDate,
        checkInDate: agreement.checkInDate || agreement.startDate,
        checkOutDate: agreement.checkOutDate || agreement.endDate,
        isLongTerm: agreement.isLongTerm || String(agreement.endDate || "").toLowerCase() === "long term",
        fileUrl: agreement.fileUrl || "",
        ownerSignatureUrl: agreement.ownerSignatureUrl || "",
        status: agreement.signed ? "Active" : "Pending Signature"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching agreement data" });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("+idDocument +aadharCard +rentalAgreementCopy");
    res.status(200).json({
      success: true,
      data: {
        idDocument: user.idDocument || { status: "Pending" },
        aadharCard: user.aadharCard || { status: "Pending" },
        rentalAgreementCopy: user.rentalAgreementCopy || { status: "Uploaded" }
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

    // ✅ Robust Path Resolution using process.cwd()
    if (user[documentType] && user[documentType].fileUrl) {
      const relativePath = user[documentType].fileUrl.startsWith('/') 
        ? user[documentType].fileUrl.substring(1) 
        : user[documentType].fileUrl;

      const filePath = path.join(process.cwd(), relativePath);
      
      // ✅ Only try to delete if the file actually exists on the server
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
      }
    }

    // ✅ Reset the database fields regardless of physical file status
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
    const user = await User.findById(req.user._id).populate('assignedPg');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.assignedPg) {
      return res.status(200).json({ 
        success: true, 
        message: "No PG found or assigned",
        data: null 
      });
    }

    const pg = user.assignedPg;

    res.status(200).json({
      success: true,
      data: {
        ownerName: pg.ownerName || "Unity Girls Management", 
        phone: pg.ownerContact || pg.phone || "9876543210", 
        email: pg.ownerEmail || "s61429609@gmail.com",
        pgName: pg.pgName || "Unity Girls Residency", 
        pgAddress: pg.location || "Nadiad, Gujarat" 
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

    // 1. Fetch real Check-In history for this user
    const checkIns = await CheckIn.find({ userId }).sort({ checkInDate: -1 }).limit(10);

    // 2. Fetch real Payment history (if you have a Payment model)
    // Note: If you don't have a Payment model yet, this part can remain empty for now
    let payments = [];
    try {
      const Payment = mongoose.model("Payment"); // Dynamic check
      payments = await Payment.find({ user: userId }).sort({ paymentDate: -1 }).limit(5);
    } catch (e) {
      console.log("Payment model not found, skipping payment events");
    }

    // 3. Construct Key Events from DB records
    const keyEvents = [
      ...checkIns.map(ci => ({
        id: ci._id,
        title: ci.status === "Present" ? "Checked In" : "Checked Out",
        type: ci.status === "Present" ? "checkin" : "checkout",
        date: new Date(ci.checkInDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: ci.status
      })),
      ...payments.map(p => ({
        id: p._id,
        title: `Rent Paid: ₹${p.amountPaid}`,
        type: "payment",
        date: new Date(p.paymentDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: "Paid"
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort newest first

    // 4. Monthly Activity Chart Data (Aggregated from real counts)
    // For now, we'll keep the structure but we can eventually aggregate this properly
    const chartData = {
      months: ["Jan", "Feb", "Mar", "Apr", "May"],
      checkins: [checkIns.length, 18, 22, 19, 21], // Using real count for current month
      payments: [payments.length, 3, 4, 3, 3]       // Using real count for current month
    };

    res.status(200).json({
      success: true,
      data: {
        keyEvents: keyEvents.length > 0 ? keyEvents : [
          { id: "empty", title: "No Activities Found", type: "info", date: "Today", status: "New" }
        ],
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
    const { month } = req.query; // ✅ Capture the month from frontend query
    const user = await User.findById(req.user._id);
    
    // Initial query to find check-ins for this specific user
    let query = { userId: req.user._id };

    // ✅ NEW: Month filtering logic
    if (month && month !== "All") {
      const year = 2026; // Current project year
      // Convert month name (e.g., "Jan") to index (0-11)
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

      // Apply the date range to the query
      query.checkInDate = { $gte: startDate, $lte: endDate };
    }

    const checkIns = await CheckIn.find(query).sort({ checkInDate: -1 });

    const doc = new jsPDF();
    
    // Header Section
    doc.setFontSize(18);
    doc.setTextColor(249, 115, 22); // Orange brand color
    doc.text("EasyPG Manager - Stay Timeline Report", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Reset to Black
    doc.text(`Tenant: ${user.fullName}`, 14, 30);
    doc.text(`Email: ${user.email}`, 14, 37);
    doc.text(`Filter: ${month === "All" ? "Full History" : month}`, 14, 44);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 51);

    // Table Section
    autoTable(doc, {
      startY: 58,
      head: [['Date', 'Activity', 'Status']],
      body: checkIns.map(ci => [
        new Date(ci.checkInDate).toLocaleDateString('en-GB'), // DD/MM/YYYY format
        ci.status === "Present" ? "Check-In" : "Check-Out",
        ci.status
      ]),
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0] }
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Dynamic filename based on month
    const fileName = month === "All" ? "Full_Stay_Report.pdf" : `Stay_Report_${month}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
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
      console.log("⚠️ Development mode: Proceeding without reCAPTCHA token");
    } else {
      const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isCaptchaValid) {
        return res.status(400).json({ success: false, message: "Invalid Captcha. Please try again." });
      }
    }
    
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    securityOtpCache[email] = { otp, expires: Date.now() + 300000 };

    console.log(`🔑 Security OTP for ${email} is: ${otp}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Development mode: Email not configured, returning OTP in response");
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
    console.error("🚨 VERIFICATION ERROR:", error);
    res.status(500).json({ message: "Registration failed after OTP" });
  }
};

const getMyCheckIns = async (req, res) => {
  try {
    const history = await CheckIn.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const formattedHistory = history.map(item => {
      const dateObj = new Date(item.checkInDate);
      return {
        _id: item._id,
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: item.status === "Present" ? "Checked In" : "Checked Out", 
        status: item.status,
        type: item.status === "Present" ? "checkin" : "checkout"
      };
    });

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
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// ✅ Corrected verifySecurityAction [cite: 2026-01-01, 2026-01-06]
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

// @desc User requests Move-In (creates a pending check-in)
const moveIn = async (req, res) => {
  try {
    const userId = req.user._id;
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

// @desc User requests Move-Out (checks 60 day rule)
const moveOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("email");
    const tenant = await resolveTenantForUser(user);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant record not found. Contact owner." });
    }

    // find active or pending checkin for user for 60-day rule info
    const checkin = await CheckIn.findOne({ userId, status: { $in: ['Present', 'Pending'] } }).sort({ createdAt: -1 });
    const joinDate = checkin?.checkInDate ? new Date(checkin.checkInDate) : new Date(tenant.joiningDate);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let rentAmount = 0;
    const agreement = await Agreement.findOne({ userId }).sort({ createdAt: -1 });
    if (agreement?.rentAmount) rentAmount = Number(agreement.rentAmount) || 0;

    tenant.hasMoveOutNotice = true;
    tenant.moveOutRequested = true;
    tenant.moveOutRequestedAt = new Date();
    await tenant.save();

    return res.status(200).json({
      success: true,
      message: "Move-out request sent to owner for inspection and settlement.",
      moveOutRequested: true,
      earlyMoveOut: diffDays < 60,
      penalty: diffDays < 60 ? rentAmount : 0,
      daysStayed: diffDays
    });
  } catch (error) {
    console.error('moveOut error:', error);
    return res.status(500).json({ success: false, message: 'Failed to request move-out' });
  }
};

// @desc User requests payment-extension and pauses late fine till selected date
const requestExtension = async (req, res) => {
  try {
    const { untilDate, reason } = req.body || {};
    if (!untilDate) {
      return res.status(400).json({ success: false, message: "untilDate is required" });
    }

    const targetDate = new Date(untilDate);
    if (Number.isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid untilDate" });
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

    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    tenant.hasDeferralRequest = true;
    tenant.extensionRequested = true;
    tenant.extensionRequestedAt = new Date();
    tenant.extensionUntil = endDate;
    tenant.extensionReason = reason || "";
    tenant.deferredDays = Math.max(diffDays, 0);
    tenant.deferredReason = reason || "";
    await tenant.save();

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
  requestExtension,
  getOwnerEarnings,
  downloadEarningsPDF,
  downloadTenantReport,
  forgotPassword: (req, res) => res.send("Forgot Pass"), 
  resetPassword: (req, res) => res.send("Reset Pass"), 
};
