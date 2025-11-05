const express = require('express');
const { getUser, getAllUsers } = require('../controllers/usersController');

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:uid', getUser);

module.exports = router;
