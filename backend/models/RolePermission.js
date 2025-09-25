/**
 * Created by rafaela on 25/09/25.
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RolePermission = sequelize.define('RolePermission', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        permission_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'permissions',
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
            comment: 'ID do usuário que concedeu esta permissão à role'
        },
        granted_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
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
        tableName: 'role_permissions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['role_id', 'permission_id'],
                name: 'unique_role_permission'
            },
            {
                fields: ['role_id']
            },
            {
                fields: ['permission_id']
            },
            {
                fields: ['granted_by']
            }
        ]
    });

    // Associações
    RolePermission.associate = function(models) {
        // Pertence a Role (o papel que recebe a permissão)
        RolePermission.belongsTo(models.Role, {
            foreignKey: 'role_id',
            as: 'role'
        });

        // Pertence a Permission (a permissão que foi concedida)
        RolePermission.belongsTo(models.Permission, {
            foreignKey: 'permission_id',
            as: 'permission'
        });

        // Pertence a User (quem concedeu a permissão)
        RolePermission.belongsTo(models.User, {
            foreignKey: 'granted_by',
            as: 'grantedBy'
        });
    };

    return RolePermission;
};