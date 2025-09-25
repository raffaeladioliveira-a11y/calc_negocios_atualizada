'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  await queryInterface.createTable('roles', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    display_name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    color: {
      type: Sequelize.STRING(7),
      allowNull: true,
      defaultValue: '#6B7280'
    },
    is_system: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  });

  // Criar índices
  await queryInterface.addIndex('roles', ['name'], {
    unique: true,
    name: 'roles_name_unique'
  });

  await queryInterface.addIndex('roles', ['is_system'], {
    name: 'roles_is_system_index'
  });
},

async down(queryInterface, Sequelize) {
  await queryInterface.dropTable('roles');
}
};