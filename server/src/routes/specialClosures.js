const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const verifyOwner = require('../middleware/verifyOwner');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/specialClosuresController');

router.use(verifyToken);
router.use(verifyOwner);

router.get('/', controller.fetchSpecialClosures);
router.get('/:specialClosureId', controller.getSpecialClosures);
router.post('/', controller.addSpecialClosure);
router.put('/:specialClosureId', controller.updateSpecialClosure);
router.delete('/:specialClosureId', controller.removeSpecialClosure);

module.exports = router;