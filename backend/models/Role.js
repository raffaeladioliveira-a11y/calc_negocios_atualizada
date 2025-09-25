/**
 * Created by rafaela on 25/09/25.
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        display_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        color: {
            type: DataTypes.STRING(7), // Para hex colors como #FF5733
            allowNull: true,
            defaultValue: '#6B7280',
            validate: {
                is: /^#[0-9A-Fa-f]{6}$/
            }
        },
        is_system: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Roles do sistema não podem ser deletadas'
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
        tableName: 'roles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['name']
            }
        ]
    });

    // Associações
    Role.associate = function(models) {
        // Many-to-Many com Users através de UserRole
        Role.belongsToMany(models.User, {
            through: models.UserRole,
            foreignKey: 'role_id',
            otherKey: 'user_id',
            as: 'users'
        });

        // Many-to-Many com Permissions através de RolePermission
        Role.belongsToMany(models.Permission, {
            through: models.RolePermission,
            foreignKey: 'role_id',
            otherKey: 'permission_id',
            as: 'permissions'
        });

        // Relacionamentos diretos
        Role.hasMany(models.UserRole, {
            foreignKey: 'role_id',
            as: 'userRoles'
        });

        Role.hasMany(models.RolePermission, {
            foreignKey: 'role_id',
            as: 'rolePermissions'
        });
    };

    return Role;
};