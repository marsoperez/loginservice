const Sequelize = require('sequelize');
const sequelize = require('../config/db.js');

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

const { Account, Role } = require('./account.js');
const PasswordHistory = require('./passwordHistory.js');
const LoginHistory = require('./loginHistory.js');
const RefreshToken = require('./refreshToken.js');
const Blacklist = require('./blacklist.js');
const Permission = require('./permission.js');

db.Account = Account(sequelize, Sequelize);
db.Role = Role(sequelize, Sequelize);
db.PasswordHistory = PasswordHistory(sequelize, Sequelize);
db.LoginHistory = LoginHistory(sequelize, Sequelize);
db.RefreshToken = RefreshToken(sequelize, Sequelize);
db.Blacklist = Blacklist(sequelize, Sequelize);
db.Permission = Permission(sequelize, Sequelize);


db.Role.belongsTo(db.Account,)
db.Account.hasMany(db.Role, { foreignKey: 'lsAccountId' });


var RolePermission = sequelize.define('ls_role_permission', {
    level: {
        type: "STRING",
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true,
});

db.Role.belongsToMany(db.Permission, { through: RolePermission });
db.Permission.belongsToMany(db.Role, { through: RolePermission });

// db.Account.hasMany(db.PasswordHistory, {
//     onDelete: 'CASCADE', hooks: true
// });
// db.PasswordHistory.belongsTo(db.Account);

// db.Account.hasMany(db.LoginHistory, {
//     onDelete: 'CASCADE', hooks: true
// });
// db.LoginHistory.belongsTo(db.Account);
// ;


module.exports = db;
