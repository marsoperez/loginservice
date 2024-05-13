const express = require('express');
const {
    resetPassword,
    checkOTP,
    changePassword
} = require('../controllers/account.js');

const router = express.Router();

router.post('/resetPassword', resetPassword);
router.post('/checkOTP', checkOTP);
router.post('/changePassword', changePassword);

module.exports = router;