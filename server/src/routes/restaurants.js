const express = require('express');
const { verifyToken, verifyMembership } = require('../middleware/verifyToken');
const verifyOwner = require('../middleware/verifyOwner');
const categoriesRouter = require('./categories');
const itemsRouter = require('./items');
const modifiersRouter = require('./modifiers');
const specialClosuresRouter = require('./specialClosures');
const discountsRouter = require('./discounts');
const rolesRouter = require('./roles');
const staffRouter = require('./staff');
const customersRouter = require('./customers');
const tablesRouter = require('./tables');
const router = express.Router();
const controller = require('../controllers/restaurantsController');
router.get('/', verifyToken, controller.getUserRestaurants);
router.post('/', verifyToken, controller.createRestaurant);
router.get('/:restaurantId/shop', controller.getRestaurantForShop);
router.get('/:restaurantId', verifyToken, controller.getRestaurant);
router.put('/:restaurantId', verifyToken, verifyOwner, controller.updateRestaurant);
router.delete('/:restaurantId', verifyToken, verifyOwner, controller.deleteRestaurant);

// Site config routes
router.get('/slug/:slug', controller.findRestaurantBySlug);
router.put('/:restaurantId/site-config', verifyToken, verifyOwner, controller.updateRestaurantSiteConfig);
router.get('/check-slug/:slug', controller.checkSlugAvailability);
router.post('/generate-slug', controller.generateSlugEndpoint);

router.use('/:restaurantId/categories', categoriesRouter);
router.use('/:restaurantId/items', itemsRouter);
router.use('/:restaurantId/modifiers', modifiersRouter);
router.use('/:restaurantId/special-closures', specialClosuresRouter);
router.use('/:restaurantId/discounts', discountsRouter);
router.use('/:restaurantId/roles', rolesRouter);
router.use('/:restaurantId/staff', staffRouter);
router.use('/:restaurantId/customers', customersRouter);
router.use('/:restaurantId/tables', tablesRouter);

module.exports = router;
