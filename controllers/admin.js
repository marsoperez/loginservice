const express = require('express');
const Redis = require('ioredis');
const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = require('../config/db.js');
const db = require('../models/index.js');
const isEmpty = require('../utils/object_isEmpty.js');

const router = express.Router();
const { Account, Role, Permission } = db;
const redis = new Redis();
const Op = Sequelize.Op;


const checkAccounts = async (req, res) => {
    try {
        let failedAttemptAccounts = {};

        async function getAccounts() {
            const keys = await redis.keys('*');

            for (const key of keys) {
                failedAttemptAccounts[key] = await redis.get(key);
            }
        }

        getAccounts().then(message => {
            return res.status(200).json({
                status: true,
                data: {
                    accounts: failedAttemptAccounts
                }
            });
        })

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
};

const unlockAccount = async (req, res) => {
    try {
        const { emailAddress } = req.body;

        const account = await Account.findOne({ where: { emailAddress: req.body.emailAddress } });

        if (!account)
            return res.status(500).json({ status: false, message: 'Invalid email address' });

        await redis.del(emailAddress);
        return res.status(200).json({ status: true, message: 'Unlocked successfully' });

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
};

const listAccount = async (req, res) => {
    try {
        const { appName, emailAddress, name, active, offset, limit } = req.query,
            accountWhere = {};

        if (!!appName) accountWhere.appName = { [Op.like]: '%' + appName + '%' }
        if (!!emailAddress) accountWhere.emailAddress = { [Op.like]: '%' + emailAddress + '%' }
        if (!!name) accountWhere.name = { [Op.like]: '%' + name + '%' }
        accountWhere.isActive = { [Op.is]: /^true$/i.test(active) }

        const { count, rows } = await Account.findAndCountAll({
            attributes: { exclude: [], },
            where: accountWhere,
            order: [
                ['id', 'ASC']
            ],
            offset: offset ? parseInt(offset) : 0,
            limit: limit ? parseInt(limit) : 10
        });

        return res.status(200).json({ status: true, message: 'List of accounts', data: rows });

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
};

const updateAccount = async (req, res) => {
    try {
        const { name, emailAddress } = req.body,
            account = await Account.findOne({
                attributes: { exclude: ['password', 'forcePasswordChangeAt'], }, where: { emailAddress }
            });

        console.log('account >>>>', account);

        if (!account)
            return res.status(500).json({ status: false, message: 'Invalid email address' });

        await account.update({ name });
        res.status(200).json({ status: true, message: 'Account updated successfully' });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const account = await Account.findOne({
            attributes: { exclude: ['password', 'forcePasswordChangeAt'], }, where: { emailAddress: req.body.emailAddress }
        });

        if (!account)
            return res.status(500).json({ status: false, message: 'Invalid email address' });

        sequelize.query('CALL SP_LS_DeleteAccount (:p_accountId)', { replacements: { p_accountId: account.id, } })
            .then(() => {
                res.status(200).json({ status: true, message: 'Account deleted successfully' });
            });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const deactivateAccount = async (req, res) => {
    try {
        const account = await Account.findOne({
            attributes: { exclude: ['password', 'forcePasswordChangeAt'], }, where: { emailAddress: req.body.emailAddress }
        });

        if (!account)
            return res.status(500).json({ status: false, message: 'Invalid email address' });

        await account.update({ isActive: false });
        res.status(200).json({ status: true, message: 'Account deactivated successfully' });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const getDataValues = (model) => {
    if (!model) return;

    if (Array.isArray(model)) {
        return model.map((data) => {
            return data.dataValues;
        })
    }

    return model.dataValues;
}

const renameKeys = (obj, newKeys) => {
    const keyValues = Object.keys(obj).map(key => {
        const newKey = newKeys[key] || key;
        return { [newKey]: obj[key] };
    });
    return Object.assign({}, ...keyValues);
}

const listRolePermission = async (req, res) => {
    try {
        const { emailAddress } = req.query,
            account = await Account.findOne({
                raw: true,
                where: { emailAddress },
                attributes: ['id', 'name'],
                /*include: {
                    model: Role,
                    include: {
                        model: Permission,
                        attributes: { exclude: ['appName', 'link', 'id'] },
                        through: {
                            attributes: ['level'],
                        }
                    }
                }*/
            });

        const roleData = await Role.findAll({
            where: { lsAccountId: account.id },
            attributes: ['id', 'name', 'code', 'link'],
            include: {
                model: Permission,
                attributes: ['name', 'code', 'ordering'],
                through: {
                    attributes: ['level'],
                }
            },
            order: [
                [Permission, 'ordering', 'ASC'],
                [Permission, 'createdAt', 'ASC']
            ]
        });


        console.log('account >>>', roleData);

        const roles = roleData.map(role => {
            let upn = renameKeys(role.dataValues, { ls_permissions: "permissions" });

            delete role.dataValues.ls_permissions;
            role.dataValues.permissions = upn.permissions.map(perm => {
                perm.dataValues.level = perm.dataValues.ls_role_permission.level;
                delete perm.dataValues.ls_role_permission;
                return perm;
            });

            return upn;
        });

        const accountData = { ...account, forcePassword: false, roles: roleData },
            data = { adminLogin: accountData }

        res.status(200).json({
            status: true,
            message: "List of Role Permission",
            data
        });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const assignAccountRights = async (req, res) => {
    try {
        if (isEmpty(req.body))
            return res.status(500).json({ status: false, error: 'Form data not found' });

        const { emailAddress, role, data } = req.body;

        if (!role) return res.status(500).json({ status: false, message: "Role is required" });
        if (!data) return res.status(500).json({ status: false, message: "Permissions are required" });

        const account = await Account.findOne({ where: { emailAddress }, include: { model: Role } }),
            roles = account.ls_roles.map(role => { return role.code });

        if (roles.indexOf(role.code) >= 0)
            return res.status(500).json({ status: false, message: "Role code already exist" });

        if (!account)
            return res.status(500).json({ status: false, message: 'Invalid Email Address' });

        const newRole = new Role({ ...role, lsAccountId: account.id });
        await newRole.save();

        data.map(async ir => {
            let item = await Item.findOne({ where: { code: ir.item } }),
                rights = await Rights.findAll({ where: { code: ir.rights } });

            if (rights.length === 0)
                return res.status(500).json({ status: false, message: 'Invalid Rights Code' });

            if (!item)
                return res.status(500).json({ status: false, message: 'Invalid Item Code' });


            let values = '';
            rights.map((ryts, idx) => {
                if (idx === 1) values += ',';
                values += `(${newRole.id}, ${item.id}, ${ryts.id})`;
            });

            await sequelize.query(
                `INSERT INTO ls_role_item_rights (roleId, itemId, rightId) VALUES${values};`
            );

            // const permissionIds = permission.map(perm => perm.id);

            // const [results, metadata] = await sequelize.query(
            //     `SELECT lsPermissionId FROM ls_account_item_permission WHERE lsAccountId=${account.id} AND lsPermissionId IN (${permissionIds.toString()}) AND lsItemId=${item.id}`,
            //     // { type: QueryTypes.SELECT }
            // );

            // const existPermIds = results.map(row => row.lsPermissionId);
            // const finalPermissionIds = permissionIds.filter(id => !existPermIds.includes(id));

            // if (permissionIds.length === existPermIds.length) return res.status(500).json({ status: false, message: 'Permission code(s) already exists.' });

            // let perm = { data: ir.permissions },
            //     replacements = { p_accountId: account.id, p_itemId: item.id, rightId: JSON.stringify(perm) };

            // sequelize.query('CALL SP_LS_InsertAccountItemRights (:p_accountId, :p_itemId, :rightId)', { replacements })
            //     .then(() => {
            //         console.log({ message: "Item-permission successfully added.", data: replacements });
            //     });

            // finalPermissionIds.map(async permId => {
            //     await sequelize.query(
            //         `INSERT INTO ls_account_item_permission (lsAccountId, lsPermissionId, lsItemId) VALUES(${account.id}, ${permId}, ${item.id});`
            //     )
            // });
        });

        return res.status(200).json({ status: true, message: "Account Rights assigned successfully" });

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
};

const getAccountRights = async (req, res) => {
    try {
        const { emailAddress } = req.query;

        sequelize.query('CALL SP_LS_GetAccountItemRights (:p_accountEmail)', { replacements: { p_accountEmail: emailAddress } })
            .then(data => {

                const output = data.reduce((o, cur) => {

                    let occurs = o.reduce((n, item, i) => {
                        return (item.item === cur.name) ? i : n;
                    }, -1);

                    if (occurs >= 0) {
                        o[occurs].code = o[occurs].code.concat(cur.code);
                    } else {
                        var obj = { item: cur.name, code: [cur.code] };
                        o = o.concat([obj]);
                    }
                    return o;
                }, []);

                return res.status(200).json({
                    status: true,
                    message: 'List of account permissions',
                    data: { emailAddress, permissions: output }
                });
            });

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
};


const createPermission = async (req, res) => {
    try {
        const { permission } = req.body;
        //     account = await Account.findOne({
        //         attributes: { exclude: ['password', 'forcePasswordChangeAt'], }, where: { emailAddress }
        //     });

        // if (!account)
        //     return res.status(500).json({ status: false, message: 'Invalid email address' });

        await Permission.create(permission);

        res.status(200).json({ status: true, message: 'Permission created successfully' });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const assignRolePermission = async (req, res) => {

    if (isEmpty(req.body))
        return res.status(500).json({ status: false, error: 'Form data not found' });

    const { emailAddress, role, permissions } = req.body;

    if (!role) return res.status(500).json({ status: false, message: "Role is required" });
    if (!permissions || permissions.length === 0) return res.status(500).json({ status: false, message: "Permission is required" });

    const account = await Account.findOne({ where: { emailAddress }, include: { model: Role } }),
        accountRoles = account.ls_roles.filter(r => { return (r.code === role.code) });

    if (!account)
        return res.status(500).json({ status: false, message: 'Invalid Email Address' });

    if (accountRoles.length >= 1)
        return res.status(500).json({ status: false, message: 'Role code already exist' });

    const newRole = await new Role({ ...role, lsAccountId: account.id, appName: account.appName }).save();

    let values = '';
    permissions.map(async (perm, idx) => {
        const { name, code, link, ordering, level } = perm;

        const newPermission = await new Permission({ name, code, link, ordering, appName: account.appName }).save();

        await sequelize.query(
            `INSERT INTO ls_role_permission (lsRoleId, lsPermissionId, level) VALUES (${newRole.id}, ${newPermission.id}, '${level}');`
        );
    });

    return res.status(200).json({ status: true, message: "Role Permission assigned successfully" });
};

module.exports = {
    checkAccounts,
    unlockAccount,
    listAccount,
    updateAccount,
    deleteAccount,
    deactivateAccount,
    assignAccountRights,
    getAccountRights,
    createPermission,
    assignRolePermission,
    listRolePermission,
};