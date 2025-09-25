'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  await queryInterface.createTable('role_permissions', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    // --- FKs ---
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    permission_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'permissions', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    granted_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    // --- Campos extras ---
    granted_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },

    // --- Timestamps padrão ---
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
  });

  // Índices para performance e unicidade
  await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], {
    unique: true,
    name: 'role_permissions_role_permission_unique',
  });
  await queryInterface.addIndex('role_permissions', ['role_id'], {
    name: 'role_permissions_role_id_index',
  });
  await queryInterface.addIndex('role_permissions', ['permission_id'], {
    name: 'role_permissions_permission_id_index',
  });
  await queryInterface.addIndex('role_permissions', ['granted_by'], {
    name: 'role_permissions_granted_by_index',
  });
},

async down(queryInterface) {
  // Remover índices explicitamente (opcional, mas recomendado para MySQL)
  await queryInterface.removeIndex('role_permissions', 'role_permissions_role_permission_unique');
  await queryInterface.removeIndex('role_permissions', 'role_permissions_role_id_index');
  await queryInterface.removeIndex('role_permissions', 'role_permissions_permission_id_index');
  await queryInterface.removeIndex('role_permissions', 'role_permissions_granted_by_index');

  await queryInterface.dropTable('role_permissions');
},
};
