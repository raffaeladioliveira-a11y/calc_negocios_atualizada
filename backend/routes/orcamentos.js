/**
 * Created by rafaela on 24/09/25.
 */
const express = require('express');
const router = express.Router();
const OrcamentosController = require('../controllers/OrcamentosController');

console.log('📋 Carregando rotas orçamentos...');

// GET /api/orcamentos - Listar orçamentos
router.get('/', OrcamentosController.getAll);

// GET /api/orcamentos/stats - Estatísticas
router.get('/stats', OrcamentosController.getStats);

// GET /api/orcamentos/:id - Buscar por ID
router.get('/:id', OrcamentosController.getById);

// POST /api/orcamentos - Criar novo
router.post('/', OrcamentosController.create);

// PUT /api/orcamentos/:id - Atualizar
router.put('/:id', OrcamentosController.update);

// PUT /api/orcamentos/:id/status - Atualizar status
router.put('/:id/status', OrcamentosController.updateStatus);

// DELETE /api/orcamentos/:id - Deletar
router.delete('/:id', OrcamentosController.delete);

console.log('✅ Rotas orçamentos carregadas');
module.exports = router;