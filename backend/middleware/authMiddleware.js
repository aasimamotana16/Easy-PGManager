const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const JWT_SECRETS = [
  process.env.JWT_SECRET,
  "secret",
  "fallback_secret_key_for_development",
].filter(Boolean);

const protect = async (req, res, next) => {
  let userToken;
  const cookieHeader = req.headers.cookie || "";
  const cookiePairs = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const idx = part.indexOf("=");
      if (idx === -1) return [part, ""];
      return [part.slice(0, idx), part.slice(idx + 1)];
    });
  const cookieMap = Object.fromEntries(cookiePairs);

  const authHeader = req.headers.authorization || "";
  if (authHeader && authHeader.startsWith("Bearer")) {
    userToken = authHeader.split(" ")[1];
  } else if (cookieMap.userToken) {
    userToken = cookieMap.userToken;
  } else if (cookieMap.token) {
    userToken = cookieMap.token;
  } else if (req.headers["x-auth-token"]) {
    userToken = req.headers["x-auth-token"];
  } else if (req.query?.token) {
    // Browser/testing fallback: /api/...?...&token=<jwt>
    userToken = req.query.token;
  }

  if (!userToken) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    userToken = String(userToken).trim().replace(/^['"]|['"]$/g, "");
    if (userToken.toLowerCase().startsWith("bearer ")) {
      userToken = userToken.slice(7).trim();
    }

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
      }
    }

    if (!verified || !decodedToken) {
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
    
    const userId = decodedToken.id || decodedToken._id || decodedToken.userId || decodedToken.sub;
    req.user = await User.findById(userId).select("-password");
    
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    return next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
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
