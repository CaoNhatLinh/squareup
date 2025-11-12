const express = require('express');
const router = express.Router({ mergeParams: true });
const discountsController = require('../controllers/discountsController');
const { verifyToken, verifyRestaurantOwnership } = require('../middleware/verifyToken');

router.get('/active', discountsController.getActiveDiscounts);

router.use(verifyToken);
router.use(verifyRestaurantOwnership);
router.get('/', discountsController.getDiscounts);
router.get('/:discountId', discountsController.getDiscount);
router.post('/', discountsController.createDiscount);
router.put('/:discountId', discountsController.updateDiscount);
router.delete('/:discountId', discountsController.deleteDiscount);

module.exports = router;
