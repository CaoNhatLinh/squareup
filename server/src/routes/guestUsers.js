const express = require("express");
const router = express.Router();
const guestUsersController = require("../controllers/guestUsersController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/:guestUuid/orders", guestUsersController.getGuestOrderHistory);

module.exports = router;
