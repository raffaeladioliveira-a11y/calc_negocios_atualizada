const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [6, 255]
            }
        },
        avatar: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            defaultValue: 'active'
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        email_verified_at: {
            type: DataTypes.DATE,
            allowNull: true
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
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (user) => {
            if (user.password) {
        const saltRounds = 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
    }
},
    beforeUpdate: async (user) => {
        if (user.changed('password')) {
            const saltRounds = 12;
            user.password = await bcrypt.hash(user.password, saltRounds);
        }
    }
}
});

    // Método para verificar senha
    User.prototype.validatePassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    };

    // Método para obter dados seguros (sem senha)
    User.prototype.getSafeData = function() {
        const { password, ...safeData } = this.toJSON();
        return safeData;
    };

    // Associações
    User.associate = function(models) {
        // Many-to-Many com Roles através de UserRole
        User.belongsToMany(models.Role, {
            through: models.UserRole,
            foreignKey: 'user_id',
            otherKey: 'role_id',
            as: 'roles'
        });

        // Relacionamento direto com UserRole
        User.hasMany(models.UserRole, {
            foreignKey: 'user_id',
            as: 'userRoles'
        });
    };

    return User;
};