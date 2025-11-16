import * as apiClient from './apiClient'
import imageCompression from 'browser-image-compression';

export const uploadImage = async (base64Image) => {
  const response = await apiClient.post("/upload/image", {
    image: base64Image,
  });
  return response.data;
};

export const uploadImageFile = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post("/upload/image-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadCompressedImageFile = async (file) => {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);

    const formData = new FormData();
    formData.append("image", compressedFile);

    const response = await apiClient.post("/upload/image-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
};
