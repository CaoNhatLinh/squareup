const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyOwner = require('../middleware/verifyOwner');
const staffController = require('../controllers/staffController');

router.get('/', verifyOwner, staffController.getStaffMembers);

router.post('/invite', verifyOwner, staffController.inviteStaff);
router.patch('/:staffId/role', verifyOwner, staffController.updateStaffRole);
router.delete('/:staffId', verifyOwner, staffController.removeStaff);

router.post('/invitations/:invitationId/resend', verifyOwner, staffController.resendInvitation);

module.exports = router;
