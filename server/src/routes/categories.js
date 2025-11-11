const express = require('express');
const { verifyToken, verifyRestaurantOwnership } = require('../middleware/verifyToken');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/categoriesController');
router.use(verifyToken);


router.get('/', controller.listCategories);
router.get('/:categoryId', controller.getCategory);
router.post('/', verifyRestaurantOwnership, controller.createCategory);
router.put('/:categoryId', verifyRestaurantOwnership, controller.updateCategory);
router.delete('/:categoryId', verifyRestaurantOwnership, controller.deleteCategory);

module.exports = router;
