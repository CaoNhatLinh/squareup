const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const adminController = require('../controllers/adminController');

router.get('/restaurants', verifyAdmin, adminController.getAllRestaurants);

router.get('/users', verifyAdmin, adminController.getAllUsers);

router.post('/set-admin', verifyAdmin, adminController.setAdminRole);

router.post('/remove-admin', verifyAdmin, adminController.removeAdminRole);

module.exports = router;
