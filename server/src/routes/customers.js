const express = require('express');
const router = express.Router({ mergeParams: true });
const { verifyToken, verifyRestaurantOwnership } = require('../middleware/verifyToken');
const { getCustomers, getCustomerOrders, getGuestOrders, exportCustomers } = require('../controllers/customersController');

router.get('/', verifyToken, verifyRestaurantOwnership, getCustomers);
router.get('/export', verifyToken, verifyRestaurantOwnership, exportCustomers);
router.get('/orders', verifyToken, verifyRestaurantOwnership, getCustomerOrders);
router.get('/:customerEmail/orders', verifyToken, verifyRestaurantOwnership, getCustomerOrders);
router.get('/guest/:guestUuid/orders', getGuestOrders);

module.exports = router;
