const axios = require("axios");
const FormData = require("form-data");
const IMGBB_API_KEY = "a7ea3dc4669ef60f39d7367d9de5571e";

/**
 * Upload image to ImgBB
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ error: "No image provided" });
    }
    const base64Image = req.body.image.replace(/^data:image\/\w+;base64,/, "");
    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", base64Image);

    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    if (response.data.success) {
      res.status(200).json({ success: true, data: { url: response.data.data.url, displayUrl: response.data.data.display_url, deleteUrl: response.data.data.delete_url } });
    } else {
      res.status(500).json({ error: "Failed to upload image" });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload image from file (multipart/form-data)
 */
const uploadImageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", req.file.buffer.toString("base64"));

    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    if (response.data.success) {
      res.status(200).json({ success: true, data: { url: response.data.data.url, displayUrl: response.data.data.display_url, deleteUrl: response.data.data.delete_url } });
    } else {
      res.status(500).json({ error: "Failed to upload image" });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadImage,
  uploadImageFile,
};
