const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const { verifyPermission } = require('../middleware/verifyPermission');
const router = express.Router({ mergeParams: true });

const controller = require('../controllers/itemsController');

router.use(verifyToken);
router.get('/', verifyPermission('items', 'read'), controller.listItems);
router.post('/', verifyPermission('items', 'create'), controller.createItem);
router.get('/:itemId', verifyPermission('items', 'read'), controller.getItem);
router.put('/:itemId', verifyPermission('items', 'update'), controller.updateItem);
router.delete('/:itemId', verifyPermission('items', 'delete'), controller.deleteItem);

module.exports = router;
    