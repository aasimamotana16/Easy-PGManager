const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Added for real email
const path = require("path");
require('dotenv').config();

// IMPORT ROUTES
// 1. Add this at the top with other imports
const adminRoutes = require('./routes/adminRoutes'); // Add this line
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const featuresRoutes = require("./routes/featuresRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ownerRoutes = require('./routes/ownerRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // New route for dynamic reviews
const User = require("./models/userModel"); // Add this if you use it for countDocuments
// 1. Import the new PG routes [cite: 2026-01-06]
const pgRoutes = require('./routes/pgRoutes');
const DemoRequest = require('./models/demoRequestModel');
const Contact = require('./models/contactModel');

const app = express();

// MIDDLEWARE
app.use(cors()); 
app.use(express.json()); // Essential for processing Login/Signup data

// DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Database connection error:", err));

// --- ROUTES (Standardized with /api prefix) ---

// Auth (Signup/Login) - Now matches frontend /api/auth calls
app.use('/api/auth', authRoutes);

// Shared Data
app.use('/api/cities', cityRoutes);
app.use('/api/features', featuresRoutes);

// User & Payment Logic
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

// Owner Specific Logic
app.use('/api/owner', ownerRoutes);

//2. Add this in the ROUTES section (around line 45)
app.use('/api/admin', adminRoutes); // This connects the Add/Edit/Delete logic
// Dynamic Reviews (About Page & Admin Management)

// Matches your requirement to let admin edit data themselves [cite: 2026-01-06]
app.use('/api/reviews', reviewRoutes);

// 2. Connect it to the /api/pg path [cite: 2026-01-06]
app.use('/api/pg', pgRoutes);

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
    // Once you connect your real models at home [cite: 2026-01-07]:
    // const customersWorldwide = await User.countDocuments({ role: 'tenant' });
    // const totalRent = await Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

    res.json({
      customersWorldwide: 120, // These match the placeholders in image_139e4b.png
      dailyUsers: 1500,
      worthOfRentManaged: 125000 
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

    // 2. Setup Email Transporter using your existing .env
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

// Use variable for PORT to allow flexibility
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Test API: http://localhost:${PORT}/api/reviews/public`);
});