const { DataTypes } = require('sequelize');

const PasswordHistory = (sequelize, Sequelize) => {
    const PasswordHistory = sequelize.define("ls_password_history", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
        {
            timestamps: false,
            createdAt: true,
            updatedAt: false,
            paranoid: true,
            underscored: false,
            freezeTableName: true,
            tableName: 'ls_password_history'
        });

    // PasswordHistory.associate = models => {
    //     PasswordHistory.belongsTo(models.Account, {
    //         foreignKey: 'lsAccountId',
    //         onDelete: 'CASCADE',
    //         hooks: true
    //     })
    // }

    return PasswordHistory;
}


module.exports = PasswordHistory; 