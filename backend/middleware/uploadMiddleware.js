const multer = require("multer");
const path = require("path");
const fs = require("fs");

// middleware/uploadMiddleware.js
const uploadDir = path.resolve(__dirname, "..", "uploads");
const profileDir = path.join(uploadDir, "profiles");
const docDir = path.join(uploadDir, "documents");
const pgImagesDir = path.join(uploadDir, "pgImages"); // NEW: Folder for PG images

// Create all folders if they don't exist
[profileDir, docDir, pgImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, c1b) => {
    // Dynamic destination based on the field name
    if (file.fieldname === "image") {
      // Check if it's a profile image or PG image based on the route
      if (req.originalUrl && req.originalUrl.includes('pg')) {
        cb(null, pgImagesDir);
      } else {
        cb(null, profileDir);
      }
    } else if (file.fieldname === "mainImage") {
      // Main property image for PG flow
      cb(null, pgImagesDir);
    } else if (file.fieldname === "images") {
      // For PG/room images uploaded as "images" field
      cb(null, pgImagesDir);
    } else {
      cb(null, docDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    const pgId = req.body.pgId || req.params.pgId || 'pg';
    cb(null, `${pgId}-${file.fieldname}-${uniqueSuffix}`);
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
