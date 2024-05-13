const express = require('express');
const {
    listAccount,
    listRolePermission,
    getAccountRights,
    updateAccount,
    deleteAccount,
    checkAccounts,
    unlockAccount,
    deactivateAccount,
    assignAccountRights,
    createPermission,
    assignRolePermission
} = require('../controllers/admin.js');
const { Verify, VerifyRole } = require('../middleware/verify.js');

const router = express.Router();

router.get('/list-account', Verify, VerifyRole, listAccount);
router.get('/list-role-permission', Verify, VerifyRole, listRolePermission);
router.get('/get-account-rights', Verify, VerifyRole, getAccountRights); //deprecated

router.put('/update-account', Verify, VerifyRole, updateAccount);
router.delete('/delete-account', Verify, VerifyRole, deleteAccount);

router.post('/check-accounts', Verify, VerifyRole, checkAccounts);
router.post('/unlock-account', Verify, VerifyRole, unlockAccount);
router.post('/deactivate-account', Verify, VerifyRole, deactivateAccount);
router.post('/assign-account-rights', Verify, VerifyRole, assignAccountRights); //deprecated
router.post('/create-permission', Verify, VerifyRole, createPermission); //deprecated
router.post('/assign-role-permission', Verify, VerifyRole, assignRolePermission);

module.exports = router;