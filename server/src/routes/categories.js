const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const { verifyPermission } = require('../middleware/verifyPermission');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/categoriesController');
router.use(verifyToken);

router.get('/', verifyPermission('categories', 'read'), controller.listCategories);
router.get('/:categoryId', verifyPermission('categories', 'read'), controller.getCategory);
router.post('/', verifyPermission('categories', 'create'), controller.createCategory);
router.put('/:categoryId', verifyPermission('categories', 'update'), controller.updateCategory);
router.delete('/:categoryId', verifyPermission('categories', 'delete'), controller.deleteCategory);

module.exports = router;
