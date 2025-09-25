/**
 * Created by rafaela on 25/09/25.
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserRole = sequelize.define('UserRole', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        granted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            comment: 'ID do usuário que concedeu esta role'
        },
        granted_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Data de expiração da role (opcional para roles temporárias)'
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'user_roles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'role_id'],
                name: 'unique_user_role'
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['role_id']
            },
            {
                fields: ['granted_by']
            }
        ]
    });

    // Associações
    UserRole.associate = function(models) {
        // Pertence a User (o usuário que recebe a role)
        UserRole.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // Pertence a Role (a role que foi atribuída)
        UserRole.belongsTo(models.Role, {
            foreignKey: 'role_id',
            as: 'role'
        });

        // Pertence a User (quem concedeu a role)
        UserRole.belongsTo(models.User, {
            foreignKey: 'granted_by',
            as: 'grantedBy'
        });
    };

    return UserRole;
};