const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let userToken;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Extract the token
      userToken = req.headers.authorization.split(" ")[1];

      // 3. Verify the token
      const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);

      // 4. Find the user and attach to the request object (req.user)
      req.user = await User.findById(decodedToken.id).select("-password");

      next();
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 5. If no token is found at all
  if (!userToken) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };