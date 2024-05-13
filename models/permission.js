const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
const sequelize = require('../config/db.js');

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

const Permission = (sequelize, Sequelize) => {
    const Permission = sequelize.define("ls_permission", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        appName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ordering: {
            type: DataTypes.INTEGER,
            allowNull: true
        }

    },
        {
            timestamps: false,
            createdAt: true,
            updatedAt: false,
            deletedAt: false,
            underscored: false,
            freezeTableName: true,
            tableName: 'ls_permission'
        });

    return Permission;

}

module.exports = Permission; 