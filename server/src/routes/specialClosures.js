const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router({ mergeParams: true });
const { 
    fetchSpecialClosures,
    getSpecialClosures,
    addSpecialClosure,
    updateSpecialClosure,
    removeSpecialClosure
} = require('../controllers/specialClosuresController')
// All routes are protected
router.use(verifyToken);    

router.get('/', fetchSpecialClosures);
router.get('/:specialClosureId', getSpecialClosures);
router.post('/', addSpecialClosure);
router.put('/:specialClosureId', updateSpecialClosure);
router.delete('/:specialClosureId', removeSpecialClosure);
module.exports = router;