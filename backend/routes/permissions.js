/**
 * Created by rafaela on 25/09/25.
 */
/**
 * Created by rafaela on 25/09/25.
 */
const express = require('express');
const PermissionsController = require('../controllers/PermissionsController');
const { authMiddleware } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');

const router = express.Router();

console.log('🔑 Carregando rotas permissions...');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/permissions/groups - Listar grupos disponíveis
router.get('/groups',
    requirePermission('permissions.browse'),
    PermissionsController.getGroups
);

// GET /api/permissions/resources - Listar recursos disponíveis
router.get('/resources',
    requirePermission('permissions.browse'),
    PermissionsController.getResources
);

// GET /api/permissions - Listar permissions
router.get('/',
    requirePermission('permissions.browse'),
    PermissionsController.getAll
);

// GET /api/permissions/:id - Buscar permission específica
router.get('/:id',
    requirePermission('permissions.read'),
    PermissionsController.getById
);

// POST /api/permissions - Criar permission
router.post('/',
    requirePermission('permissions.add'),
    PermissionsController.validation,
    PermissionsController.create
);

// PUT /api/permissions/:id - Atualizar permission
router.put('/:id',
    requirePermission('permissions.edit'),
    PermissionsController.validation,
    PermissionsController.update
);

// DELETE /api/permissions/:id - Excluir permission
router.delete('/:id',
    requirePermission('permissions.delete'),
    PermissionsController.delete
);

console.log('✅ Rotas permissions carregadas');
module.exports = router;