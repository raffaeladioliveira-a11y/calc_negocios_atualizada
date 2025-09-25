/**
 * Created by rafaela on 25/09/25.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        role_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        granted_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        granted_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        expires_at: {
            type: Sequelize.DATE,
            allowNull: true
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
    await queryInterface.addIndex('user_roles', ['user_id', 'role_id'], {
        unique: true,
        name: 'user_roles_user_role_unique'
    });

    await queryInterface.addIndex('user_roles', ['user_id'], {
        name: 'user_roles_user_id_index'
    });

    await queryInterface.addIndex('user_roles', ['role_id'], {
        name: 'user_roles_role_id_index'
    });

    await queryInterface.addIndex('user_roles', ['granted_by'], {
        name: 'user_roles_granted_by_index'
    });
},

async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_roles');
}
};