const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const sequelize = require('../config/db.js');
// const PasswordHistory = require('./passwordHistory');

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// db.PasswordHistory = PasswordHistory(sequelize, Sequelize);

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
            allowNull: false
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
        password: {
            type: "LONGTEXT",
            allowNull: false,
            validate: {
                notNull: { msg: "The password can't be null." },
                notEmpty: { msg: "The password can't be an empty." },
                is: {
                    args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{16,25}$/,
                    msg: "Password must contain at least 16-25 characters, one lowercase letter, one uppercase letter, and one number.",
                },
            }
        },
        isLocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        mobileNumber: {
            type: DataTypes.STRING,
            allowNull: true // required?
        },
        isMobile: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        forcePasswordChangeAt: {
            type: 'TIMESTAMP',
            allowNull: false
        },
        otp: {
            type: DataTypes.STRING,
            allowNull: true
        },
        otpExpier: {
            type: 'TIMESTAMP',
            allowNull: true
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
        {
            timestamps: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: false,
            underscored: false,
            freezeTableName: true,
            tableName: 'ls_account',
            // associate: function (models) {
            //     Account.hasMany(models.db.PasswordHistory, { onDelete: 'cascade', hooks: true });
            // },
            hooks: {
                beforeUpdate: (instance, options) => {
                    options.validate = false;
                },
                afterValidate: async (account) => {
                    if (account.password) {
                        account.password = bcrypt.hashSync(account.password, bcrypt.genSaltSync(10));
                        console.log('account.password >>>> ', account.password)
                    }
                },
            },
            instanceMethods: {
                validPassword: (password) => {
                    return bcrypt.compareSync(password, this.password);
                }
            },
        });

    return Account;

}

// debugger;
// Account.Instance.test = function () {
//     return `AppName: ${this.appName}, Email: ${this.email}`
// }


const Role = (sequelize, Sequelize) => {
    const Role = sequelize.define("ls_role", {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
            allowNull: true
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lsAccountId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
        {
            timestamps: false,
            createdAt: false,
            updatedAt: false,
            deletedAt: false,
            underscored: false,
            freezeTableName: true,
            tableName: 'ls_role'
        });

    return Role;

}

module.exports = { Account, Role }; 