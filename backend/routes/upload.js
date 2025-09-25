/**
 * Created by rafaela on 25/09/25.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configuração do multer para upload
const storage = multer.diskStorage({
        destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
},
filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
}
});

const upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
    cb(null, true);
} else {
    cb(new Error('Apenas imagens são permitidas'));
}
}
});

// Rota de upload de avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
    return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
    });
}

const avatarUrl = `/uploads/avatars/${req.file.filename}`;

res.json({
    success: true,
    message: 'Avatar enviado com sucesso',
    data: {
        avatar_url: avatarUrl,
        filename: req.file.filename
    }
});
} catch (error) {
    res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload da imagem'
    });
}
});

module.exports = router;