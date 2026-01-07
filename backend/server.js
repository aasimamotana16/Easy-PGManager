const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// IMPORT ROUTES
const authRoutes = require('./routes/authRoutes');
const cityRoutes = require('./routes/cityRoutes');
const featuresRoutes = require("./routes/featuresRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ownerRoutes = require('./routes/ownerRoutes');

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

// Health Check (To verify if backend is alive in browser)
app.get('/', (req, res) => {
  res.send("EasyPGManager Backend is running successfully.");
});

// Use variable for PORT to allow flexibility
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Test API: http://localhost:${PORT}/api/cities`);
});