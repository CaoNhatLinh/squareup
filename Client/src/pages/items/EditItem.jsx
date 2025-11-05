import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchItems, updateItem } from '../../api/items'
import { useImageUpload } from '../../hooks/useImageUpload'

export default function EditItem() {
  const navigate = useNavigate()
  const { itemId } = useParams()
  const { user } = useAuth()
  const { uploadImage, uploading } = useImageUpload()
  const [formData, setFormData] = useState({
    itemType: 'Physical good',
    name: '',
    price: '',
    description: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [modifiers, setModifiers] = useState([])
  const [modifierSearch, setModifierSearch] = useState('')
  const [selectedModifiers, setSelectedModifiers] = useState([])
  const [categorySearch, setCategorySearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])

  useEffect(() => {
    if (!user || !itemId) return
    setLoading(true)
    
    Promise.all([
      fetchItems(user.uid),
      import('../../api/categories').then(({ fetchCategories }) => fetchCategories(user.uid)),
      import('../../api/modifers').then(({ fetchModifiers }) => fetchModifiers(user.uid))
    ])
      .then(([itemsData, categoriesData, modifiersData]) => {
        const items = Object.values(itemsData || {})
        const item = items.find(i => i.id === itemId)
        if (item) {
          setFormData({
            itemType: item.type || 'Physical good',
            name: item.name || '',
            price: item.price?.toString() || '',
            description: item.description || '',
          })
          if (item.image) setImagePreview(item.image)
        }
        
        const cats = Object.values(categoriesData || {})
        setCategories(cats)
        
        const itemCategories = cats.filter(cat => 
          cat.itemIds && cat.itemIds.includes(itemId)
        )
        setSelectedCategories(itemCategories)

        const mods = Object.values(modifiersData || {})
        setModifiers(mods)
        // determine selected modifiers from the item's modifierIds (items now own modifierIds)
        if (item && Array.isArray(item.modifierIds)) {
          const itemMods = mods.filter((m) => item.modifierIds.includes(m.id));
          setSelectedModifiers(itemMods);
        } else {
          // backward compatible: if modifiers still have itemIds, fall back to previous behavior
          const itemMods = mods.filter((m) => {
            const current = Array.isArray(m.itemIds) ? m.itemIds : (m.itemIds ? Object.values(m.itemIds) : []);
            return current.includes(itemId);
          });
          setSelectedModifiers(itemMods);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, itemId])

  const handleClose = () => {
    navigate(-1)
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

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Item name is required')
      return
    }
    
    setSaving(true)
    try {
      let imageUrl = imagePreview
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'items')
      }
      
      await updateItem(user.uid, itemId, {
        type: formData.itemType,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        image: imageUrl,
        categoryIds: selectedCategories.map(c => c.id),
        modifierIds: selectedModifiers.map(m => m.id),
      })
      
      navigate('/items')
    } catch (err) {
      console.error('Failed to update item:', err)
      alert('Failed to update item: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="bg-white rounded-lg p-6">Loading...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-lg shadow-xl flex flex-col">        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold">Edit item</h2>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving || uploading ? 'Saving...' : 'Save'}
          </button>
        </div>        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-6 p-6">            <div className="flex-1 space-y-6">              <div className="border border-blue-500 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-1">Item type</div>
                    <select
                      value={formData.itemType}
                      onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                      className="w-full bg-transparent text-sm font-medium focus:outline-none"
                    >
                      <option>Prepared food and beverage</option>
                      <option>Physical good</option>
                      <option>Membership</option>
                      <option>Digital</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <input
                type="text"
                placeholder="Name (required)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="relative">
                <input
                  type="text"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <textarea
                placeholder="Customer-facing description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      Drop images here,{' '}
                      <label className="text-blue-600 hover:underline cursor-pointer">
                        browse files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    </p>
                  </>
                )}
              </div>
            </div>            <div className="w-80 space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3">Categories</h3>
                <div className="border border-gray-300 rounded-lg">
                  <div className="p-3 flex items-center gap-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Add to categories"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="flex-1 text-sm focus:outline-none"
                    />
                  </div>
                  {categorySearch && (
                    <div className="border-t max-h-48 overflow-y-auto">
                      {categories
                        .filter((cat) => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                        .map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              if (!selectedCategories.find(c => c.id === cat.id)) {
                                setSelectedCategories([...selectedCategories, cat])
                              }
                              setCategorySearch('')
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            {cat.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                {selectedCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCategories.map((cat) => (
                      <span
                        key={cat.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                      >
                        {cat.name}
                        <button
                          onClick={() => setSelectedCategories(selectedCategories.filter(c => c.id !== cat.id))}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Modifiers</h3>
                <div className="border border-gray-300 rounded-lg">
                  <div className="p-3 flex items-center gap-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Add modifiers"
                      value={modifierSearch}
                      onChange={(e) => setModifierSearch(e.target.value)}
                      className="flex-1 text-sm focus:outline-none"
                    />
                  </div>
                  {modifierSearch && (
                    <div className="border-t max-h-48 overflow-y-auto">
                      {modifiers
                        .filter((m) => (m.name || '').toLowerCase().includes(modifierSearch.toLowerCase()))
                        .map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              if (!selectedModifiers.find(s => s.id === m.id)) {
                                setSelectedModifiers([...selectedModifiers, m])
                              }
                              setModifierSearch('')
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            {m.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                {selectedModifiers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedModifiers.map((m) => (
                      <span key={m.id} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                        {m.name}
                        <button onClick={() => setSelectedModifiers(selectedModifiers.filter(s => s.id !== m.id))} className="text-gray-500 hover:text-gray-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
