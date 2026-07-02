const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Nombre único: userId + timestamp + extensión
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `avatar_${req.user.id}_${Date.now()}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
});

// Upload de planes (PDF)
const planUploadDir = path.join(__dirname, '../uploads/plans');
if (!fs.existsSync(planUploadDir)) {
    fs.mkdirSync(planUploadDir, { recursive: true });
}

const planStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, planUploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `plan_${req.user.id}_${Date.now()}${ext}`;
        cb(null, filename);
    },
});

const planUpload = multer({
    storage: planStorage,
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Solo se permiten PDF o imágenes'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { upload, planUpload };