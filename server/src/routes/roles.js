const express = require('express');
const router = express.Router({ mergeParams: true });
const verifyAdmin = require('../middleware/verifyAdmin');
const rolesController = require('../controllers/rolesController');
router.get('/permissions-structure', verifyAdmin, rolesController.getPermissionsStructure);
router.get('/', verifyAdmin, rolesController.getRoles);
router.get('/:roleId', verifyAdmin, rolesController.getRole);
router.post('/', verifyAdmin, rolesController.createRole);
router.patch('/:roleId', verifyAdmin, rolesController.updateRole);
router.delete('/:roleId', verifyAdmin, rolesController.deleteRole);

module.exports = router;
