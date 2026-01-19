const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Use an absolute path to avoid ENOENT errors on Windows
const uploadDir = path.resolve(__dirname, "..", "uploads", "documents");

// Automatically create the directory structure if it's missing
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    // Generates a unique name: userId-field-timestamp.extension
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `${req.user._id}-${file.fieldname}-${uniqueSuffix}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;