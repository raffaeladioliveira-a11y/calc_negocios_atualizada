/**
 * Created by rafaela on 25/09/25.
 */
const express = require('express');
const RolesController = require('../controllers/RolesController');
const { authMiddleware } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/roles/permissions - Listar permissões (para o painel de criação/edição de roles)
router.get('/permissions',
    requirePermission('roles.browse'),
    RolesController.permissions
);

// GET /api/roles - Listar roles
router.get('/',
    requirePermission('roles.browse'),
    RolesController.index
);

// GET /api/roles/:id - Buscar role específica
router.get('/:id',
    requirePermission('roles.read'),
    RolesController.show
);

// POST /api/roles - Criar role
router.post('/',
    requirePermission('roles.add'),
    RolesController.validation,
    RolesController.create
);

// PUT /api/roles/:id - Atualizar role
router.put('/:id',
    requirePermission('roles.edit'),
    RolesController.validation,
    RolesController.update
);

// DELETE /api/roles/:id - Excluir role
router.delete('/:id',
    requirePermission('roles.delete'),
    RolesController.destroy
);

module.exports = router;