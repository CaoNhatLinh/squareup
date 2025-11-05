import * as apiClient from './apiClient'

/**
 * Upload image to ImgBB
 */
export const uploadImage = async (base64Image) => {
  const response = await apiClient.post("/api/upload/image", {
    image: base64Image,
  });
  return response.data;
};

/**
 * Upload image file to ImgBB
 */
export const uploadImageFile = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post("/api/upload/image-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
