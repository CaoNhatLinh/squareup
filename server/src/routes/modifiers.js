const express = require('express');
const { verifyToken, verifyRestaurantOwnership } = require('../middleware/verifyToken');
const router = express.Router({ mergeParams: true });

const {
  listModifiers,
  getModifier,
  createModifier,
  updateModifier,
  deleteModifier,
} = require('../controllers/modifiersController');

router.use(verifyToken);
router.get('/', listModifiers);
router.get('/:modifierId', getModifier);
router.post('/', verifyRestaurantOwnership, createModifier);
router.put('/:modifierId', verifyRestaurantOwnership, updateModifier);
router.delete('/:modifierId', verifyRestaurantOwnership, deleteModifier);

module.exports = router;
