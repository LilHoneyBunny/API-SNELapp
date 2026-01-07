const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png"]);

const uploadsDir = path.join(__dirname, "..", "uploads", "profile_images");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // ✅ fuerza extensión según mimetype (no confíes en originalname)
    const safeExt = file.mimetype === "image/png" ? ".png" : ".jpg";

    const userId = req.params?.userId || "unknown";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `user_${userId}_${unique}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    const err = new Error("Formato inválido");
    err.code = "INVALID_FORMAT";
    return cb(err);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
}).single("profileImage");

const uploadProfileImageMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "El tamaño de la imagen no debe superar los 5 MB.",
      });
    }

    if (err.code === "INVALID_FORMAT") {
      return res.status(400).json({
        success: false,
        message: "Solo se permiten imágenes JPEG y PNG.",
      });
    }

    console.error("❌ uploadProfileImageMiddleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Error al cargar la imagen.",
    });
  });
};

module.exports = uploadProfileImageMiddleware;
