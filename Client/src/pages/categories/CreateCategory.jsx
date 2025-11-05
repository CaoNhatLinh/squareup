import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createCategory, fetchCategories } from '../../api/categories'
import { useImageUpload } from '../../hooks/useImageUpload'
import { HiX, HiPhotograph, HiFolder, HiTag } from 'react-icons/hi'

export default function CreateCategory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { uploadImage, uploading } = useImageUpload()
  const [formData, setFormData] = useState({
    name: '',
    parentCategoryId: null,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [showParentSelector, setShowParentSelector] = useState(false)
  const [selectedParent, setSelectedParent] = useState(null)
  const [items, setItems] = useState([])
  const [showItemSelector, setShowItemSelector] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [itemSearch, setItemSearch] = useState('')

  useEffect(() => {
    if (user?.uid) {
      Promise.all([
        fetchCategories(user.uid),
        import('../../api/items').then(({ fetchItems }) => fetchItems(user.uid))
      ])
        .then(([categoriesData, itemsData]) => {
          const topLevelCategories = Object.values(categoriesData || {}).filter(cat => !cat.parentCategoryId)
          setCategories(topLevelCategories)
          setItems(Object.values(itemsData || {}))
        })
        .catch((err) => console.error('Error loading data:', err))
    }
  }, [user])

  const handleClose = () => {
    navigate(-1)
  }

  const handleParentSelect = (category) => {
    setSelectedParent(category)
    setFormData({ ...formData, parentCategoryId: category.id })
    setShowParentSelector(false)
  }

  const handleRemoveParent = () => {
    setSelectedParent(null)
    setFormData({ ...formData, parentCategoryId: null })
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleItemToggle = (item) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Category name is required')
      return
    }
    
    setSaving(true)
    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'categories')
      }
      
      await createCategory(user.uid, {
        name: formData.name,
        image: imageUrl,
        parentCategoryId: formData.parentCategoryId,
        itemIds: selectedItems.map(item => item.id),
      })
      
      navigate(-1)
    } catch (err) {
      console.error('Failed to create category:', err)
      alert('Failed to create category: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <HiX className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold">Create category</h2>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving || uploading ? 'Saving...' : 'Save'}
          </button>
        </div>        <div className="flex-1 overflow-y-auto p-6 space-y-6">          <div>
            <input
              type="text"
              placeholder="Category name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                <button
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <HiPhotograph className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">
                  Drag an image here,{' '}
                  <label className="text-blue-600 hover:underline cursor-pointer">
                    upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>{' '}
                  or <button className="text-blue-600 hover:underline">browse image library</button>
                </p>
              </>
            )}
          </div>          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <HiFolder className="w-6 h-6 text-gray-600 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">Parent category</div>
                {selectedParent ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{selectedParent.name}</span>
                    <button 
                      onClick={handleRemoveParent}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 mb-3">
                    Select a parent category to make this a subcategory.
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowParentSelector(!showParentSelector)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showParentSelector ? 'Cancel' : 'Select'}
              </button>
            </div>
            
            {showParentSelector && (
              <div className="mt-3 border-t pt-3 max-h-48 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No parent categories available</p>
                ) : (
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleParentSelect(cat)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        {cat.image && (
                          <img src={cat.image} alt={cat.name} className="w-6 h-6 rounded object-cover" />
                        )}
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>          <div>
            <h3 className="font-semibold text-base mb-4">Items</h3>
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <HiTag className="w-6 h-6 text-gray-600 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">Items</div>
                  {selectedItems.length === 0 ? (
                    <div className="text-sm text-gray-600 mb-3">None selected</div>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {selectedItems.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <span>{item.name}</span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowItemSelector(!showItemSelector)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showItemSelector ? 'Cancel' : 'Add'}
                </button>
              </div>
              
              {showItemSelector && (
                <div className="mt-3 border-t pt-3">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {items
                      .filter(item => 
                        item.name.toLowerCase().includes(itemSearch.toLowerCase())
                      )
                      .map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleItemToggle(item)}
                          className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${
                            selectedItems.find(i => i.id === item.id) 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!selectedItems.find(i => i.id === item.id)}
                            onChange={() => {}}
                            className="rounded"
                          />
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
                          )}
                          <span>{item.name}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
