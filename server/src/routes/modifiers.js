const express = require('express');
const { verifyToken, verifyRestaurantOwnership } = require('../middleware/verifyToken');
const router = express.Router({ mergeParams: true });

const controller = require('../controllers/modifiersController');

router.use(verifyToken);
router.get('/', controller.listModifiers);
router.get('/:modifierId', controller.getModifier);
router.post('/', verifyRestaurantOwnership, controller.createModifier);
router.put('/:modifierId', verifyRestaurantOwnership, controller.updateModifier);
router.delete('/:modifierId', verifyRestaurantOwnership, controller.deleteModifier);

module.exports = router;
