const express = require('express');
const router = express.Router({ mergeParams: true });
const tablesController = require('../controllers/tablesController');
const { verifyToken } = require('../middleware/verifyToken');
const attachUser = require('../middleware/attachUser');
const { verifyPermission } = require('../middleware/verifyPermission');

// All routes require authentication
router.use(verifyToken);
router.use(attachUser);

// Get all tables for a restaurant
router.get('/', verifyPermission('pos', 'read'), tablesController.getTables);

// Get a specific table
router.get('/:tableId', verifyPermission('pos', 'read'), tablesController.getTableById);

// Create a new table
router.post('/', verifyPermission('pos', 'create'), tablesController.createTable);

// Update a table
router.put('/:tableId', verifyPermission('pos', 'update'), tablesController.updateTable);

// Delete a table
router.delete('/:tableId', verifyPermission('pos', 'delete'), tablesController.deleteTable);

// Merge tables
router.post('/merge', verifyPermission('pos', 'update'), tablesController.mergeTables);

// Clear table after checkout
router.post('/:tableId/clear', verifyPermission('pos', 'update'), tablesController.clearTable);

module.exports = router;
