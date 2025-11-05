const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/categoriesController');
router.use(verifyToken);


router.get('/', controller.listCategories);
router.get('/:categoryId', controller.getCategory);
router.post('/', controller.createCategory);
router.put('/:categoryId', controller.updateCategory);
router.delete('/:categoryId', controller.deleteCategory);

module.exports = router;
