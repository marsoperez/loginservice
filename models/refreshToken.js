const { DataTypes } = require('sequelize');

const RefreshToken = (sequelize, Sequelize) => {
    const RefreshToken = sequelize.define("ls_refresh_token", {
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
        token: {
            type: "LONGTEXT",
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
        {
            timestamps: true,
            createdAt: true,
            updatedAt: false,
            paranoid: true,
            underscored: false,
            freezeTableName: true,
            tableName: 'ls_refresh_token'
        });

    return RefreshToken;
}

module.exports = RefreshToken; 