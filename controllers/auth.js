const express = require('express');
const Redis = require('ioredis');
const router = express.Router();
const db = require('../models/index.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const OTPAuth = require("otpauth");
const base32 = require("hi-base32");
const QRCode = require('qrcode');
const crypto = require('crypto');
const isEmpty = require('../utils/object_isEmpty.js');
const { Verify } = require('../middleware/verify.js');

const { Account, PasswordHistory, LoginHistory, RefreshToken, Blacklist } = db;

const redis = new Redis();
require("dotenv").config();

const register = async (req, res) => {
    try {
        const { appName, emailAddress, password, name, isMobile, mobileNumber } = req.body;
        const account = await Account.findOne({ where: { appName, emailAddress } });

        if (!!account)
            return res.status(404).json({ status: false, message: 'Please change app name / email address' });

        const forcePasswordChangeDays = 90,
            newAccount = new Account({
                appName,
                emailAddress,
                password,
                name,
                isMobile,
                mobileNumber,
                forcePasswordChangeAt: new Date(new Date().getTime() + (forcePasswordChangeDays * 24 * 60 * 60 * 1000))
            });

        await newAccount.save();

        const passwordHistory = new PasswordHistory({
            accountId: newAccount.id,
            password: newAccount.password
        });

        await passwordHistory.save();

        res.status(201).json({ status: true, message: 'User registered successfully' });

    } catch (error) {
        const email = error.message.includes('emailAddress failed'),
            password = error.message.includes('password failed');

        if (!!email) {
            res.status(500).json({ status: false, error: 'Invalid Email Address' });
        } else if (!!password) {
            res.status(500).json({
                status: false,
                message: 'Your password must be at least 16-25 characters long and include a number, an uppercase letter and a lowercase letter.',
                error: 'Invalid Password Combination'
            })
        } else {
            res.status(500).json({ status: false, error: error.message });
        }

    }
};

const enable2FA = async (req, res) => {
    const { emailAddress } = req.body;

    const user = await Account.findOne({ where: { emailAddress: emailAddress } });

    if (!user)
        return res.status(404).send('User does not exist');

    const generateBase32Secret = () => {
        const buffer = crypto.randomBytes(15);
        const base32Sec = base32.encode(buffer).replace(/=/g, "").substring(0, 24);
        return base32Sec;
    };

    const base32_secret = generateBase32Secret();

    const totp = new OTPAuth.TOTP({
        issuer: "Surf2sawa.com",
        label: emailAddress,
        algorithm: "SHA1",
        digits: 6,
        secret: base32_secret,
    });

    const otpauth_url = totp.toString();

    QRCode.toDataURL(otpauth_url, async (err, url) => {
        if (err)
            return res.status(500).json({ status: false, message: "Error while generating QR Code" });

        user.metadata = { ...user.metadata, secret: base32_secret };
        await user.update({ metadata: user.metadata });
        res.json({ status: true, data: { qrCodeUrl: url } });
    })
};


const maxNumberOfFailedLogins = 3;
//brew services start redis
//redis-cli keys "*" ===== show * keys
//redis-cli flushall ===== delete all keys


const login = async (req, res) => {
    try {

        const { appName, emailAddress, password } = req.body,
            user = await Account.findOne({ where: { appName: appName, emailAddress: emailAddress } });

        const lockedAccountMessage = "Your account has been locked. Contact your support person to unlock it, then try again.";

        if (!user)
            return res.status(401).json({ status: false, error: 'We could not find an account with given App Name / Email Address.' });

        if (!user.isActive)
            return res.status(401).json({ status: false, error: 'Your account has been disabled' });

        if (user.isMobile && !req.useragent.isMobile)
            // if (user.isMobile && !(req.useragent.browser === 'okhttp'))
            return res.status(401).json({ status: false, error: "Logging in is only possible through mobile devices" })

        // check user is not attempted too many login requests
        let userAttempts = await redis.get(emailAddress);
        if (userAttempts >= maxNumberOfFailedLogins)
            return res.status(429).json({ status: false, error: lockedAccountMessage });

        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) {
            await redis.set(emailAddress, ++userAttempts);
            let checkfailedAttempts = await redis.get(emailAddress);
            if (checkfailedAttempts >= maxNumberOfFailedLogins) {
                return res.status(401).json({ status: false, error: lockedAccountMessage });
            } else {
                return res.status(401).json({ status: false, error: 'Entry password invalid. Try again' });
            }
        }

        if (user.forcePasswordChangeAt < new Date())
            return res.status(200).json({ status: false, message: 'Your password has expired and must be changed.' })

        await redis.del(emailAddress);
        res.status(200).json({ status: true, message: 'Proceed to 2FA API /verify-2fa' });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const verify2FA = async (req, res) => {

    if (isEmpty(req.body))
        return res.status(500).json({ status: false, error: 'Form data not found' });
    try {
        const { emailAddress, token } = req.body;

        const user = await Account.findOne({ where: { emailAddress: emailAddress } });

        if (!token)
            return res.status(404).send('Token is required');

        if (!user)
            return res.status(404).send('User does not exist');

        const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress,
            totp = new OTPAuth.TOTP({
                issuer: "Surf2sawa.com",
                label: emailAddress,
                algorithm: "SHA1",
                digits: 6,
                secret: user.metadata.secret,
            });

        let isSuccess = totp.validate({ token });

        //TODO
        isSuccess = 0;

        if (isSuccess !== 0)
            return res.status(401).json({ status: false, message: "Authentication failed" });

        const cleanUserAgent = object => {
            const newObject = {};
            Object.keys(object).forEach(key => {
                if (object[key]) newObject[key] = object[key];
            });
            return newObject;
        };

        const loginHistory = new LoginHistory({
            accountId: user.id,
            ipAddress: ipAddress,
            userAgent: cleanUserAgent(req.useragent)
        });

        await loginHistory.save();

        const accessToken = jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }),
            _token = jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' }),
            options = {
                maxAge: 60 * 60 * 1000,
                httpOnly: true, // The cookie is only accessible by the web server
                secure: true,
                sameSite: "None",
            };

        const refreshToken = new RefreshToken({
            accountId: user.id,
            token: _token
        });

        await refreshToken.save();

        res
            .cookie('refreshToken', _token, options)
            .header('Authorization', accessToken)
            .status(201)
            .json({
                status: true,
                message: "Login Successful",
                accessToken,
                refreshToken: _token
            });


    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const refresh = (req, res) => {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken)
        return res.status(401).send('Access Denied. No refresh token provided.');

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
        const accessToken = jwt.sign({ user: decoded.user }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res
            .header('Authorization', accessToken)
            .send(decoded.user);
    } catch (error) {
        return res.status(400).send('Invalid refresh token.');
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.headers['cookie'];
        if (!authHeader) return res.sendStatus(204);

        const cookie = authHeader.split('=')[1];
        const accessToken = cookie.split(';')[0];
        const checkIfBlacklisted = await Blacklist.findOne({ where: { token: accessToken } });
        const token = await RefreshToken.findOne({ where: { token: accessToken } });
        if (checkIfBlacklisted) return res.sendStatus(204);

        const newBlacklist = new Blacklist({
            token: accessToken,
        });

        console.log('token >>>', token);

        await token.update({ isActive: false });

        await newBlacklist.save();
        res.setHeader('Clear-Site-Data', '"cookies"');
        res.status(200).json({ message: 'You are logged out!' });

    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
    res.end();
};

module.exports = {
    register, login, enable2FA, verify2FA, refresh, logout
};