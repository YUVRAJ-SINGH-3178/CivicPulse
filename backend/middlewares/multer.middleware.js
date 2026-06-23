const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    const basename = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50) || "incident-media";

    cb(null, `${Date.now()}-${basename}${extension.toLowerCase()}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image and video files are supported."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

module.exports = { upload };
