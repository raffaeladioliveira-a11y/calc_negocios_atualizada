/**
 * Created by rafaela on 25/09/25.
 */
const express = require('express');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permission');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/users - Listar usuários (com paginação e filtros)
router.get('/',
    requirePermission('users.browse'),
    UsersController.index
);

// GET /api/users/:id - Buscar usuário específico
router.get('/:id',
    requirePermission('users.read'),
    UsersController.show
);

// POST /api/users - Criar novo usuário
router.post('/',
    requirePermission('users.add'),
    UsersController.createValidation,
    UsersController.create
);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id',
    requirePermission('users.edit'),
    UsersController.updateValidation,
    UsersController.update
);

// DELETE /api/users/:id - Excluir usuário
router.delete('/:id',
    requirePermission('users.delete'),
    UsersController.destroy
);

// POST /api/users/register - Rota especial para registro (apenas para super-admin)
router.post('/register',
    requirePermission('users.add'),
    AuthController.registerValidation,
    AuthController.register
);

module.exports = router;