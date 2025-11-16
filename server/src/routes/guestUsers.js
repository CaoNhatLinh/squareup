const express = require("express");
const router = express.Router();
const guestUsersController = require("../controllers/guestUsersController");
router.get("/:guestUuid/orders", guestUsersController.getGuestOrderHistory);

module.exports = router;
