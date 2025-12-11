const multer = require('multer');
const path = require('path');

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'public', 'tmp')); // carpeta temporal
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
        const err = new Error('Invalid image format. Only JPEG and PNG are allowed');
        err.code = 'INVALID_FORMAT';
        return cb(err);
    }
    cb(null, true);
};

const uploadProfileImage = multer({
    storage,
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter
}).single('profileImage'); // nombre del campo de archivo

module.exports = uploadProfileImage;
