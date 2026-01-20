const multer = require("multer");
const path = require("path");
const fs = require("fs");

// middleware/uploadMiddleware.js
const uploadDir = path.resolve(__dirname, "..", "uploads");
const profileDir = path.join(uploadDir, "profiles");
const docDir = path.join(uploadDir, "documents");

// Create both folders if they don't exist [cite: 2026-01-06]
[profileDir, docDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dynamic destination based on the field name [cite: 2026-01-07]
    if (file.fieldname === "image") {
      cb(null, profileDir);
    } else {
      cb(null, docDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `${req.user._id}-${file.fieldname}-${uniqueSuffix}`);
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;