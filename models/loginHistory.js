const { DataTypes } = require('sequelize');
// const db = require('./index.js');
// const { Account } = db;

const LoginHistory = (sequelize, Sequelize) => {
    const Account = sequelize.define("ls_account", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        }
    });

    const LoginHistory = sequelize.define("ls_login_history", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userAgent: {
            type: DataTypes.JSON,
            allowNull: false,
        }
    },
        {
            timestamps: true,
            createdAt: true,
            updatedAt: false,
            paranoid: true,
            underscored: false,
            freezeTableName: true,
            tableName: 'ls_login_history'
        });


    // Account.hasMany(LoginHistory, {
    //     foreignKey: 'lsAccountId',
    //     onDelete: 'CASCADE',
    //     hooks: true
    // });

    // LoginHistory.belongsTo(Account, {
    //     foreignKey: 'lsAccountId',
    //     onDelete: 'CASCADE',
    //     hooks: true
    // });

    return LoginHistory;
}


module.exports = LoginHistory; 