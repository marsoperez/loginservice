const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const isEmpty = require('../utils/object_isEmpty.js');
const db = require('../models/index.js');

const { Account, PasswordHistory, RefreshToken } = db;
const router = express.Router();
require("dotenv").config();

const resetPassword = async (req, res) => {

    if (isEmpty(req.body))
        return res.status(500).json({ status: false, error: 'Form data not found' });

    try {
        const { emailAddress } = req.body,
            account = await Account.findOne({ where: { emailAddress } });

        if (!account)
            res.status(500).json({ status: false, message: 'Invalid Account' });

        const otp = Math.floor(1000 + Math.random() * 9000),
            otpExpier = new Date();

        otpExpier.setMinutes(otpExpier.getMinutes() + 15);

        const transporter = nodemailer.createTransport(smtpTransport({
            service: 'Gmail',
            auth: {
                user: 'prctml01@gmail.com',
                pass: process.env.EMAIL_PASS,
            },
        }));

        const mailOptions = {
            to: req.body.emailAddress,
            subject: 'Password reset OTP',
            text: `The code expires in 15 minutes. \nHere is your verification code: ${otp}`,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                res.status(500).json({ status: false, error: error });
            } else {
                account.update({ otp, otpExpier });
                res.status(200).json({ status: true, message: 'Check your email for the OTP' });
            }
        });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const checkOTP = async (req, res) => {

    if (isEmpty(req.body))
        return res.status(500).json({ status: false, error: 'Form data not found' });

    try {
        const { emailAddress, OTP } = req.body,
            account = await Account.findOne({ where: { emailAddress } });

        if (!OTP)
            return res.status(500).json({ status: false, message: 'OTP is required' });

        if (!account)
            return res.status(500).json({ status: false, message: 'Invalid Account' });

        if (OTP != account.otp || account.otpExpier < new Date())
            return res.status(500).json({ status: false, message: 'Entered OTP is invalid or expired' });

        await account.update({ otpExpier: null, otp: "ok" })
        res.status(200).json({ status: true, message: 'Proceed to Change Password API /changePassword' });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const changePassword = async (req, res) => {

    if (isEmpty(req.body)) res.status(500).json({ status: false, error: 'Form data not found' });

    try {
        const { emailAddress, currentPassword, newPassword } = req.body,
            account = await Account.findOne({ where: { emailAddress } });

        debugger
        if (!account)
            return res.status(500).json({ status: false, message: 'Invalid Account' });

        if (account.otp != "ok")
            return res.status(500).json({ status: false, message: 'Please reset your password' });

        const isCurrentPasswordMatch = bcrypt.compareSync(currentPassword, account.password);

        if (!isCurrentPasswordMatch)
            return res.status(500).json({ status: false, message: 'Current password is incorrect' });

        const passwordHistory = await PasswordHistory.findAll(
            {
                attributes: ['password'],
                where: { accountId: account.id },
                order: [
                    ['id', 'DESC'],
                ],
                limit: 3
            }
        );

        const hasMatchOldPassword = passwordHistory.filter(ph => {
            return bcrypt.compareSync(newPassword, ph.dataValues.password) === true;
        });

        if (hasMatchOldPassword.length >= 1)
            return res.status(500).json({ status: false, message: 'Last 3 password cannot be used' });

        const forcePasswordChangeDays = 90,
            newAccount = await account.update({
                password: newPassword,
                forcePasswordChangeAt: new Date(new Date().getTime() + (forcePasswordChangeDays * 24 * 60 * 60 * 1000))
            });

        const newPasswordHistory = new PasswordHistory({ accountId: account.id, password: newAccount.password });
        await newPasswordHistory.save();
        res.status(201).json({ status: true, message: 'Password successfuly updated' });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

module.exports = {
    resetPassword, checkOTP, changePassword
};