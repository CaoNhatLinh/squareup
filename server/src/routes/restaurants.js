const express = require('express');
const { verifyToken, verifyRestaurantOwnership } = require('../middleware/verifyToken');
const categoriesRouter = require('./categories');
const itemsRouter = require('./items');
const modifiersRouter = require('./modifiers');
const specialClosuresRouter = require('./specialClosures');
const discountsRouter = require('./discounts');

const router = express.Router();

const controller = require('../controllers/restaurantsController');

router.get('/', verifyToken, controller.getUserRestaurants);

router.post('/', verifyToken, controller.createRestaurant);

router.get('/:restaurantId/shop', controller.getRestaurantForShop);

router.get('/:restaurantId', verifyToken, controller.getRestaurant);
router.put('/:restaurantId', verifyToken, verifyRestaurantOwnership, controller.updateRestaurant);
router.delete('/:restaurantId', verifyToken, verifyRestaurantOwnership, controller.deleteRestaurant);

router.use('/:restaurantId/categories', categoriesRouter);
router.use('/:restaurantId/items', itemsRouter);
router.use('/:restaurantId/modifiers', modifiersRouter);
router.use('/:restaurantId/special-closures', specialClosuresRouter);
router.use('/:restaurantId/discounts', discountsRouter);

module.exports = router;
