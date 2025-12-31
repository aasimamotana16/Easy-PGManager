import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import featuresRoutes from "./routes/featuresRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import pgRoutes from "./routes/pgRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import agreementRoutes from "./routes/agreementRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* FIX FOR __dirname */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* API ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/features", featuresRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/pgs", pgRoutes);


// Use routes
app.use("/api/user", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/agreements", agreementRoutes);

/* TEST ROUTE */
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend API working fine" });
});

/* FRONTEND SERVE (ONLY IF build EXISTS) */
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Serve frontend index.html for non-/api GET requests only (must be LAST)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});