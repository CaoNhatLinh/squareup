const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyAdmin = require('../middleware/verifyAdmin');
const staffController = require('../controllers/staffController');

router.get('/', verifyAdmin, staffController.getStaffMembers);

router.post('/invite', verifyAdmin, staffController.inviteStaff);
router.patch('/:staffId/role', verifyAdmin, staffController.updateStaffRole);
router.delete('/:staffId', verifyAdmin, staffController.removeStaff);

router.post('/invitations/:invitationId/resend', verifyAdmin, staffController.resendInvitation);

module.exports = router;
