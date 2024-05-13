const { DataTypes } = require('sequelize');

const Account = (sequelize, Sequelize) => {
    const Account = sequelize.define("ls_account", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        appName: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(25),
            validate: {
                is: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{16,25}$"
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        isMobile: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        mobileNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is2FA: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    }, {
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        paranoid: true,
        underscored: false,
        freezeTableName: true,
        tableName: 'ls_account'
    });

    return Account;
}

module.exports = Account;