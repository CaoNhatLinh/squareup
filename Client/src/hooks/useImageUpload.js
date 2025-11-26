import { useState } from "react";
import { uploadCompressedImageFile } from '@/api/upload'

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const uploadImage = async (file) => {
    if (!file) return null
    
    setUploading(true)
    setError(null)
    
    try {
      const response = await uploadCompressedImageFile(file)
      
      setUploading(false)
      return response.url
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message)
      setUploading(false)
      throw err
    }
  }

  return { uploadImage, uploading, error }
}
