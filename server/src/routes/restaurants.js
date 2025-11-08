const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const categoriesRouter = require('./categories');
const itemsRouter = require('./items');
const modifiersRouter = require('./modifiers');
const specialClosuresRouter = require('./specialClosures');
const router = express.Router();

const controller = require('../controllers/restaurantsController');
router.get('/:uid/shop', controller.getRestaurantForShop);
router.get('/:uid', verifyToken, controller.getRestaurant);
router.put('/:uid', verifyToken, controller.updateRestaurant);
router.use('/:uid/categories', categoriesRouter);
router.use('/:uid/items', itemsRouter);
router.use('/:uid/modifiers', modifiersRouter);
router.use('/:uid/special-closures', specialClosuresRouter);


module.exports = router;
