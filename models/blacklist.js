const { DataTypes } = require('sequelize');

const Blacklist = (sequelize, Sequelize) => {
    const Blacklist = sequelize.define("ls_blacklist", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: "LONGTEXT",
            allowNull: false
        }
    },
        {
            timestamps: false,
            createdAt: false,
            updatedAt: false,
            paranoid: true,
            underscored: false,
            freezeTableName: true,
            tableName: 'ls_blacklist'
        });

    return Blacklist;
}

module.exports = Blacklist; 