const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let userToken;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      userToken = req.headers.authorization.split(" ")[1];

      // FIX: Prevents "jwt malformed" if frontend sends the string "null" or "undefined"
      if (!userToken || userToken === "null" || userToken === "undefined") {
        return res.status(401).json({ message: "Not authorized, invalid token format" });
      }

      const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
      
      // Select all fields needed for the profile [cite: 2026-01-01]
      req.user = await User.findById(decodedToken.id).select("-password");
      
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next(); // Use return to stop execution here after calling next()
    } catch (error) {
      // Cleaner logging for your terminal [cite: 2026-01-06]
      console.error("Auth Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token was found in the header
  if (!userToken) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// This stays the same for owner-only pages [cite: 2026-01-07]
const isOwner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Only owners can see this." });
  }
};

// NEW: Add this if you want to protect specific Tenant/User dashboard areas
const isTenant = (req, res, next) => {
  if (req.user && (req.user.role === 'tenant' || req.user.role === 'user')) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Role not authorized." });
  }
};

module.exports = { protect, isOwner, isTenant };