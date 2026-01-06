const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let userToken;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      userToken = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
      req.user = await User.findById(decodedToken.id).select("-password");
      next();
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!userToken) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Add this to check if the logged-in user is an owner
const isOwner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Only owners can see this." });
  }
};

module.exports = { protect, isOwner }; // Export both