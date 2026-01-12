const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// backend/server.js
// Use camelCase for the request body fields [cite: 2026-01-01]
app.post('/api/request-demo', async (req, res) => {
  try {
    const { yourName, emailAddress, phone, message } = req.body;

    // Here you would typically save to MongoDB or send an email
    console.log("New Demo Request:", { yourName, emailAddress, phone, message });

    res.status(201).json({ 
      success: true, 
      message: "Demo request received successfully!" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Use variable for PORT to allow flexibility
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Test API: http://localhost:${PORT}/api/reviews/public`);
});