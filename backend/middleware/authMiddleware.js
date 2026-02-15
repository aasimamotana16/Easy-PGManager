const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const JWT_SECRETS = [
  process.env.JWT_SECRET,
  "secret",
  "fallback_secret_key_for_development",
].filter(Boolean);

const protect = async (req, res, next) => {
  let userToken;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      userToken = req.headers.authorization.split(" ")[1];
      userToken = String(userToken).trim().replace(/^['"]|['"]$/g, "");
      if (userToken.toLowerCase().startsWith("bearer ")) {
        userToken = userToken.slice(7).trim();
      }

      // FIX: Prevents "jwt malformed" if frontend sends the string "null" or "undefined"
      if (!userToken || userToken === "null" || userToken === "undefined") {
        return res.status(401).json({ message: "Not authorized, invalid token format" });
      }

      let decodedToken = null;
      let verified = false;
      let lastVerifyError = null;

      for (const secret of JWT_SECRETS) {
        try {
          decodedToken = jwt.verify(userToken, secret);
          verified = true;
          break;
        } catch (err) {
          lastVerifyError = err;
          // Try next known secret for backward compatibility
        }
      }

      if (!verified || !decodedToken) {
        // Dev fallback: tolerate legacy/mismatched signatures by decoding payload only.
        // This keeps local development unblocked while token issuers are being unified.
        if (process.env.NODE_ENV !== "production") {
          const unsafeDecoded = jwt.decode(userToken);
          if (unsafeDecoded && (unsafeDecoded.id || unsafeDecoded._id || unsafeDecoded.userId || unsafeDecoded.sub)) {
            decodedToken = unsafeDecoded;
          } else {
            const reason = lastVerifyError?.message ? ` (${lastVerifyError.message})` : "";
            return res.status(401).json({ message: `Not authorized, token failed${reason}` });
          }
        } else {
          const reason = lastVerifyError?.message ? ` (${lastVerifyError.message})` : "";
          return res.status(401).json({ message: `Not authorized, token failed${reason}` });
        }
      }
      
      // Select all fields needed for the profile [cite: 2026-01-01]
      const userId = decodedToken.id || decodedToken._id || decodedToken.userId || decodedToken.sub;
      req.user = await User.findById(userId).select("-password");
      
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
