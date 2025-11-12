const express = require('express');
const controller = require('../controllers/usersController');

const router = express.Router();

router.get('/', controller.getAllUsers);
router.get('/:uid', controller.getUser);

module.exports = router;
