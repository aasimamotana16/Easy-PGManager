// MUST BE LINE 1 [cite: 2026-01-06]
require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Added for real email
const path = require("path");

// IMPORT ROUTES
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const featuresRoutes = require("./routes/featuresRoutes");
const faqRoutes = require("./routes/faqRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ownerRoutes = require('./routes/ownerRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // New route for dynamic reviews
const adminRoutes = require('./routes/adminRoutes'); // Admin routes
const aboutRoutes = require('./routes/aboutRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const privacyPolicyRoutes = require('./routes/privacyPolicyRoutes');
const User = require("./models/userModel"); // Add this if you use it for countDocuments
const Payment = require("./models/paymentModel");
const cronRoutes = require('./routes/cronRoutes');
// 1. Import the new PG routes [cite: 2026-01-06]
const pgRoutes = require('./routes/pgRoutes');
const roomRoutes = require('./routes/roomRoutes');
const DemoRequest = require('./models/demoRequestModel');
const Contact = require('./models/contactModel');

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: true,
  credentials: true
})); 
app.use(express.json()); // Essential for processing Login/Signup data

// DB CONNECTION (Vercel/serverless-safe)
// - Vercel does not ship your local .env file; values must be set in Vercel Environment Variables.
// - Support both MONGO_URI (legacy) and MONGO_URL (used elsewhere in repo).
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

let __mongoCache = global.__easyPgMongoCache;
if (!__mongoCache) {
  __mongoCache = { conn: null, promise: null };
  global.__easyPgMongoCache = __mongoCache;
}

const connectMongo = async () => {
  if (__mongoCache.conn) return __mongoCache.conn;
  if (!__mongoCache.promise) {
    if (!MONGO_URI) {
      throw new Error("Missing MongoDB connection string. Set MONGO_URI (or MONGO_URL) in Vercel env vars.");
    }
    __mongoCache.promise = mongoose
      .connect(MONGO_URI)
      .then((m) => m.connection);
  }
  __mongoCache.conn = await __mongoCache.promise;
  return __mongoCache.conn;
};

// Ensure DB is connected before handling requests.
app.use(async (req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    return res.status(503).json({
      success: false,
      message: "Database connection is not configured. Please contact admin."
    });
  }
});

  // --- CRITICAL: REGISTER MODELS BEFORE ROUTES ---
require('./models/pgModel');   // <--- ADD THIS [cite: 2026-01-01]
require('./models/userModel'); // <--- ADD THIS
require('./models/profileModel'); // <--- ADD THIS LINE HERE
require('./models/agreementModel'); // <--- ADD THIS for agreement functionality
require('./models/timelineModel'); // <--- Add this line here! [cite: 2026-01-06]
require('./models/termsModel'); // <--- Register Terms model
require('./models/paymentModel'); // <--- CRITICAL for tonight's payment flow [cite: 2026-01-01]
require('./models/featureModel'); // <--- ADD THIS for features functionality
require('./models/pendingPaymentModel'); // <--- ADD THIS for pending payments
require('./models/leaseAgreementModel');
require('./models/extensionRequestModel');
require('./models/damageReportModel');
require('./models/fineTransactionModel');

// --- ROUTES (Standardized with /api prefix) ---

// Auth (Signup/Login) - Now matches frontend /api/auth calls
app.use('/api/auth', authRoutes);

// Shared Data
app.use('/api/cities', cityRoutes);
app.use('/api/features', featuresRoutes);
app.use('/api/faqs', faqRoutes);
const termsRoutes = require('./routes/termsRoutes');
app.use('/api/terms', termsRoutes);

// User & Payment Logic
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

// Owner Specific Logic
app.use('/api/owner', ownerRoutes);

// Cron / scheduled jobs (serverless-safe; called by Vercel Cron or external scheduler)
app.use('/api/cron', cronRoutes);

// Dynamic Reviews (About Page & Admin Management)

// Matches your requirement to let admin edit data themselves [cite: 2026-01-06]
app.use('/api/reviews', reviewRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/privacy-policy', privacyPolicyRoutes);

// 2. Connect it to the /api/pg path [cite: 2026-01-06]
app.use('/api/pg', pgRoutes);

// Rooms - lazy load per PG
app.use('/api/rooms', roomRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

//3. booking
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));// documents

// Health Check (To verify if backend is alive in browser)
app.get('/', (req, res) => {
  res.send("EasyPGManager Backend is running successfully.");
});
// --- DYNAMIC HOME STATS API ---
// This provides the numbers for: Customers Worldwide, Daily Users, and Rent Managed
app.get('/api/home-stats', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const customerRoles = ['user', 'tenant'];
    const paidStatuses = ['Success', 'PAID', 'Paid'];

    const [customersWorldwide, rawDailyUsers, rentAgg] = await Promise.all([
      User.countDocuments({ role: { $in: customerRoles } }),
      User.countDocuments({ role: { $in: customerRoles }, createdAt: { $gte: todayStart } }),
      Payment.aggregate([
        { $match: { paymentStatus: { $in: paidStatuses } } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ])
    ]);

    const dailyUsers = rawDailyUsers > 0
      ? rawDailyUsers
      : Math.max(12, Math.ceil(customersWorldwide * 0.1));

    res.json({
      customersWorldwide,
      dailyUsers,
      worthOfRentManaged: rentAgg[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch home stats" });
  }
});

// --- UPDATED REQUEST DEMO API (DATABASE + REAL EMAIL) ---
app.post('/api/request-demo', async (req, res) => {
  try {
    const { yourName, emailAddress, phone, message } = req.body;

    // 1. Save to MongoDB Atlas
    await DemoRequest.create({ 
      yourName, 
      emailAddress, 
      phone, 
      message 
    });
    console.log("Demo request saved to Database");

    // 2. Check if email is configured, otherwise skip email sending
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Development mode: Email not configured, skipping email sending");
      return res.status(201).json({ 
        success: true, 
        message: "Demo request submitted successfully! (Email not configured)" 
      });
    }

    // 3. Setup Email Transporter using your existing .env
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 3. Define Mail Content
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_USER, 
      subject: `New Demo Request from ${yourName}`,
      html: `
        <h2>Demo Request Details</h2>
        <p><strong>Name:</strong> ${yourName}</p>
        <p><strong>Email:</strong> ${emailAddress}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    };

    // 4. Send Email notification
    await transporter.sendMail(mailOptions);
    console.log("Email notification sent successfully");

    res.status(201).json({ 
      success: true, 
      message: "Demo request submitted and email sent successfully!" 
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- CONTACT US API (DATABASE + REAL EMAIL) ---
app.post('/api/contact-us', async (req, res) => {
  try {
    const { fullName, emailAddress, phoneNumber, yourMessage } = req.body;

    // 1. Save to MongoDB Atlas [cite: 2026-01-06]
    await Contact.create({ fullName, emailAddress, phoneNumber, yourMessage });

    // 2. Setup Email Transporter (Same as before)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 3. Define Mail Content
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_USER, 
      subject: `New Contact Message from ${fullName}`,
      html: `
        <h2>Contact Form Details</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${emailAddress}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
        <p><strong>Message:</strong> ${yourMessage}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      
      success: true, 
      message: "Message sent and saved successfully!" 
    });
  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = app;
