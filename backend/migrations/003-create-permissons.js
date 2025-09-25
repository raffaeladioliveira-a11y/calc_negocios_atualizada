/**
 * Created by rafaela on 25/09/25.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permissions', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
        },
        display_name: {
            type: Sequelize.STRING(150),
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        resource: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        action: {
            type: Sequelize.ENUM('browse', 'read', 'edit', 'add', 'delete'),
            allowNull: false
        },
        group: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        order: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
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
    await queryInterface.addIndex('permissions', ['name'], {
        unique: true,
        name: 'permissions_name_unique'
    });

    await queryInterface.addIndex('permissions', ['resource'], {
        name: 'permissions_resource_index'
    });

    await queryInterface.addIndex('permissions', ['action'], {
        name: 'permissions_action_index'
    });

    await queryInterface.addIndex('permissions', ['resource', 'action'], {
        unique: true,
        name: 'permissions_resource_action_unique'
    });

    await queryInterface.addIndex('permissions', ['group'], {
        name: 'permissions_group_index'
    });

    await queryInterface.addIndex('permissions', ['order'], {
        name: 'permissions_order_index'
    });
},

async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permissions');
}
};