const express = require('express');
const {
    register,
    login,
    enable2FA,
    verify2FA,
    refresh,
    logout
} = require('../controllers/auth.js');
const { Verify } = require('../middleware/verify.js');

const router = express.Router();

router.get('/logout', Verify, logout);
router.post('/register', register);
router.post('/login', login);
router.post('/enable-2fA', enable2FA);
router.post('/verify-2fA', verify2FA);
router.post('/refresh', Verify, refresh);

module.exports = router;