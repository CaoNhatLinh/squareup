const express = require('express');
const verifyToken = require('../middleware/verifyToken');
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
router.post('/', createModifier);
router.put('/:modifierId', updateModifier);
router.delete('/:modifierId', deleteModifier);

module.exports = router;
