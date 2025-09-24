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
const { calcValoresValidator } = require('../validators/calcValoresValidator');
let authMiddleware;
let adminMiddleware;
try {
    authMiddleware = require('../middleware/auth');
} catch (_) {
    authMiddleware = (req, res, next) => next();
}
try {
    adminMiddleware = require('../middleware/admin');
} catch (_) {
    adminMiddleware = (req, res, next) => next();
} // Opcional: apenas admins

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