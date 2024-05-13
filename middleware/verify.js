const db = require('../models/index.js');
const jwt = require('jsonwebtoken');
const chalk = require('chalk');
const url = require('url');

const { Account, Role, Blacklist } = db;

const Verify = async (req, res, next) => {
    try {
        const authHeader = req.headers["cookie"],
            errorMessage = "This session has expired. Please login";

        if (!authHeader)
            return res.status(401).json({ status: false, message: errorMessage });

        const cookie = authHeader.split("=")[1];
        const accessToken = cookie.split(";")[0];
        const checkIfBlacklisted = await Blacklist.findOne({ where: { token: accessToken } });

        if (checkIfBlacklisted)
            return res.status(401).json({ status: false, message: errorMessage });

        jwt.verify(cookie, process.env.JWT_SECRET_KEY, async (err, decoded) => {
            if (err)
                return res.status(401).json({ status: false, message: errorMessage });

            const user = await Account.findOne({
                attributes: { exclude: ['password', 'forcePasswordChangeAt'], }, where: { id: decoded.user.id }
            });

            const { ...data } = user;
            req.user = data;
            next();
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: [],
            message: "Internal Server Error",
        });
    }
}

const VerifyRole = async (req, res, next) => {
    try {
        const userId = req.user.dataValues.id;
        const user = await Account.findOne({
            attributes: { exclude: ['password', 'forcePasswordChangeAt'], }, where: { id: userId }, include: { model: Role }
        });

        const isAdmin = user.ls_roles.map(role => {
            if (role.code === 'admin') return true;
        })[0];

        // if (req.originalUrl.indexOf(code) < 0) {
        if (!isAdmin)
            return res.status(401).json({
                status: false,
                message: "You are not authorized to view this page.",
            });

        next();

    } catch (err) {
        res.status(500).json({
            status: false,
            data: [],
            message: "Internal Server Error",
        });
    }
}

module.exports = { Verify, VerifyRole };