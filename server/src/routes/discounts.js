const express = require('express');
const router = express.Router({ mergeParams: true });
const discountsController = require('../controllers/discountsController');
const { verifyToken, verifyRestaurantOwnership } = require('../middleware/verifyToken');
const { verifyPermission } = require('../middleware/verifyPermission');

router.get('/active', discountsController.getActiveDiscounts);

router.use(verifyToken);
router.get('/', verifyPermission('discounts', 'read'), discountsController.getDiscounts);
router.get('/:discountId', verifyPermission('discounts', 'read'), discountsController.getDiscount);
router.post('/', verifyPermission('discounts', 'create'), discountsController.createDiscount);
router.put('/:discountId', verifyPermission('discounts', 'update'), discountsController.updateDiscount);
router.delete('/:discountId', verifyPermission('discounts', 'delete'), discountsController.deleteDiscount);

module.exports = router;
