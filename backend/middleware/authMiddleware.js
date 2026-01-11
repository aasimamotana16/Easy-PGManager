const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let userToken;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      userToken = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
      
      // Select all fields needed for the profile [cite: 2026-01-01]
      req.user = await User.findById(decodedToken.id).select("-password");
      
      return next(); // Use return to stop execution here after calling next()
    } catch (error) {
      console.error("Auth Error:", error);
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