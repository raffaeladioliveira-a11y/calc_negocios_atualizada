/**
 * Created by rafaela on 25/09/25.
 */
const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Rota pública de login
router.post('/login',
    AuthController.loginValidation,
    AuthController.login
);

// Rotas protegidas (requerem autenticação)
router.use(authMiddleware);

// Dados do usuário logado
router.get('/me', AuthController.me);

// Verificar token
router.post('/verify', AuthController.verifyToken);

// Logout
router.post('/logout', AuthController.logout);

// Alterar senha
router.put('/change-password',
    AuthController.changePasswordValidation,
    AuthController.changePassword
);

module.exports = router;