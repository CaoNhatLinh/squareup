const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const verifyToken = require("../middleware/verifyToken");
const upload = multer({ storage: multer.memoryStorage() });

router.post("/image", verifyToken, uploadController.uploadImage);
router.post(
  "/image-file",
  verifyToken,
  upload.single("image"),
  uploadController.uploadImageFile
);

module.exports = router;
