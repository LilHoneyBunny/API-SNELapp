/*const multer = require('multer');
const path = require('path');

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/profile_images'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, uniqueName);
    }
});

// Filtro de formato de imagen
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];

    if (!allowed.includes(file.mimetype)) {
        const err = new Error('Formato inválido');
        err.code = 'INVALID_FORMAT';
        return cb(err);
    }

    cb(null, true);
};


/*Middleware final
const uploadProfileImageMiddleware = (req, res, next) => {
    uploadProfileImage(req, res, (err) => {
        if (err) {
            console.error('Error al cargar la imagen:', err);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: true,
                    message: 'El tamaño de la imagen no debe superar los 5 MB.'
                });
            }

            if (err.code === 'INVALID_FORMAT') {
                return res.status(400).json({
                    error: true,
                    message: 'Solo se permiten imágenes JPEG y PNG.'
                });
            }

            return res.status(500).json({
                error: true,
                message: 'Error al cargar la imagen.'
            });
        }

        next();
    });
};

module.exports = uploadProfileImageMiddleware; */
