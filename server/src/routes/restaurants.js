const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const categoriesRouter = require('./categories');
const itemsRouter = require('./items');
const modifiersRouter = require('./modifiers');
const router = express.Router();

const controller = require('../controllers/restaurantsController');

// Public endpoint for shop page (no auth required)
router.get('/:uid/shop', controller.getRestaurantForShop);

// Protected endpoints
router.get('/:uid', verifyToken, controller.getRestaurant);
router.put('/:uid', verifyToken, controller.updateRestaurant);
router.use('/:uid/categories', categoriesRouter);
router.use('/:uid/items', itemsRouter);
router.use('/:uid/modifiers', modifiersRouter);


module.exports = router;
