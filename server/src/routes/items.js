const express = require('express');
const { verifyToken, verifyRestaurantOwnership } = require('../middleware/verifyToken');
const router = express.Router({ mergeParams: true });

const controller = require('../controllers/itemsController');

router.use(verifyToken);
router.get('/', controller.listItems);
router.post('/', verifyRestaurantOwnership, controller.createItem);
router.get('/:itemId', controller.getItem);
router.put('/:itemId', verifyRestaurantOwnership, controller.updateItem);
router.delete('/:itemId', verifyRestaurantOwnership, controller.deleteItem);

module.exports = router;
    