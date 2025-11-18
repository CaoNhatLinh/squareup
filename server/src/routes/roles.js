const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyOwner = require('../middleware/verifyOwner');
const rolesController = require('../controllers/rolesController');
router.get('/permissions-structure', verifyOwner, rolesController.getPermissionsStructure);
router.get('/', verifyOwner, rolesController.getRoles);
router.get('/:roleId', verifyOwner, rolesController.getRole);
router.post('/', verifyOwner, rolesController.createRole);
router.patch('/:roleId', verifyOwner, rolesController.updateRole);
router.delete('/:roleId', verifyOwner, rolesController.deleteRole);

module.exports = router;
