/**
 * Created by rafaela on 25/09/25.
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Permission = sequelize.define('Permission', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        display_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 150]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        resource: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true
            },
            comment: 'Recurso/módulo (dashboard, clientes, orcamentos, etc.)'
        },
        action: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notEmpty: true,
                isIn: [['browse', 'read', 'edit', 'add', 'delete']]
            },
            comment: 'Ação (browse, read, edit, add, delete)'
        },
        group: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Grupo para organização no painel (Menu Principal, Administração, etc.)'
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Ordem de exibição no painel'
        },
        is_system: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Permissões do sistema não podem ser deletadas'
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
        tableName: 'permissions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['name']
            },
            {
                fields: ['resource']
            },
            {
                fields: ['action']
            },
            {
                unique: true,
                fields: ['resource', 'action'],
                name: 'unique_resource_action'
            }
        ]
    });

    // Associações
    Permission.associate = function(models) {
        // Many-to-Many com Roles através de RolePermission
        Permission.belongsToMany(models.Role, {
            through: models.RolePermission,
            foreignKey: 'permission_id',
            otherKey: 'role_id',
            as: 'roles'
        });

        // Relacionamento direto
        Permission.hasMany(models.RolePermission, {
            foreignKey: 'permission_id',
            as: 'rolePermissions'
        });
    };

    return Permission;
};