/**
 * Created by rafaela on 24/09/25.
 */
// ==========================================
// 5. ROUTES - Rotas da API
// ==========================================
// routes/calcValores.js

const express = require('express');
const router = express.Router();
const CalcValoresController = require('../controllers/CalcValoresController');

// Tentar importar validators
let calcValoresValidator;
try {
    calcValoresValidator = require('../validators/calcValoresValidator').calcValoresValidator;
} catch (_) {
    // Validator básico se não existir
    calcValoresValidator = (req, res, next) => next();
}

// Middleware temporários até implementarmos o ACL completo
let authMiddleware;
let adminMiddleware;

try {
    // Tentar importar o novo middleware de autenticação
    const authModule = require('../middleware/auth');
    authMiddleware = authModule.authMiddleware || authModule;
} catch (_) {
    // Middleware permissivo temporário
    authMiddleware = (req, res, next) => {
        console.log('⚠️ Usando auth middleware temporário para calc-valores');
        next();
    };
}

try {
    adminMiddleware = require('../middleware/admin');
} catch (_) {
    // Middleware permissivo temporário
    adminMiddleware = (req, res, next) => {
        console.log('⚠️ Usando admin middleware temporário para calc-valores');
        next();
    };
}

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/calc-valores - Buscar configurações atuais
router.get('/', CalcValoresController.getConfiguracoes);

// PUT /api/calc-valores - Atualizar configurações (apenas admins)
router.put('/',
    adminMiddleware, // Opcional: restringir a admins
    calcValoresValidator,
    CalcValoresController.updateConfiguracoes
);

// GET /api/calc-valores/historico - Histórico de alterações
// Desabilitar histórico se não implementado
// router.get('/historico',
//     adminMiddleware,
//     CalcValoresController.getHistorico
// );

// POST /api/calc-valores/reset - Resetar para valores padrão
router.post('/reset',
    adminMiddleware, // Opcional: apenas admins podem resetar
    CalcValoresController.resetConfiguracoes
);

module.exports = router;