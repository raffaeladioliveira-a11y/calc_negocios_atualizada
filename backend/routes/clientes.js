const express = require('express');
const router = express.Router();
const ClientesController = require('../controllers/ClientesController');

console.log('📋 Carregando rotas clientes completas...');

// GET /api/clientes - Listar todos os clientes (gerenciamento)
router.get('/', (req, res, next) => {
    console.log('🔍 GET /api/clientes');
ClientesController.getAll(req, res).catch(next);
});

// GET /api/clientes/calculadora - Clientes para calculadora (formato específico)
router.get('/calculadora', (req, res, next) => {
    console.log('🧮 GET /api/clientes/calculadora');
ClientesController.getForCalculadora(req, res).catch(next);
});

// GET /api/clientes/stats - Estatísticas
router.get('/stats', (req, res, next) => {
    console.log('📊 GET /api/clientes/stats');
ClientesController.getStats(req, res).catch(next);
});

// GET /api/clientes/:id - Buscar cliente por ID
router.get('/:id', (req, res, next) => {
    console.log(`🔍 GET /api/clientes/${req.params.id}`);
ClientesController.getById(req, res).catch(next);
});

// POST /api/clientes - Criar novo cliente
router.post('/', (req, res, next) => {
    console.log('➕ POST /api/clientes');
ClientesController.create(req, res).catch(next);
});

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', (req, res, next) => {
    console.log(`✏️ PUT /api/clientes/${req.params.id}`);
ClientesController.update(req, res).catch(next);
});

// DELETE /api/clientes/:id - Deletar cliente
router.delete('/:id', (req, res, next) => {
    console.log(`🗑️ DELETE /api/clientes/${req.params.id}`);
ClientesController.delete(req, res).catch(next);
});

console.log('✅ Rotas clientes completas carregadas');
module.exports = router;