const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router({ mergeParams: true });

const controller = require('../controllers/itemsController');

router.use(verifyToken);
router.get('/', controller.listItems);
router.post('/', controller.createItem);
router.get('/:itemId', controller.getItem);
router.put('/:itemId', controller.updateItem);
router.delete('/:itemId', controller.deleteItem);

module.exports = router;
    