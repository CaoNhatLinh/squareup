const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const verifyToken = require("../middleware/verifyToken");

// Multer config for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Upload image (base64)
router.post("/image", verifyToken, uploadController.uploadImage);

// Upload image (file)
router.post(
  "/image-file",
  verifyToken,
  upload.single("image"),
  uploadController.uploadImageFile
);

module.exports = router;
