/**
 * Created by rafaela on 25/09/25.
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        email: {
            type: Sequelize.STRING(150),
            allowNull: false,
            unique: true
        },
        password: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        avatar: {
            type: Sequelize.STRING(255),
            allowNull: true
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'active',
            allowNull: false
        },
        last_login: {
            type: Sequelize.DATE,
            allowNull: true
        },
        email_verified_at: {
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
    await queryInterface.addIndex('users', ['email'], {
        unique: true,
        name: 'users_email_unique'
    });

    await queryInterface.addIndex('users', ['status'], {
        name: 'users_status_index'
    });
},

async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
}
};