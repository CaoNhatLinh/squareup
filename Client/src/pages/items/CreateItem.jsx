import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createItem } from '../../api/items'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useToast } from '../../hooks/useToast'
import { HiMiniXMark, HiTag, HiOutlineCurrencyDollar, HiCamera, HiRectangleGroup, HiAdjustmentsHorizontal, HiMagnifyingGlass } from 'react-icons/hi2' 
import { useLoaderData } from 'react-router-dom'
export default function CreateItem() {
  const navigate = useNavigate()
  const { restaurantId } = useParams()
  const { uploadImage, uploading } = useImageUpload()
  const { success, error } = useToast()
 const loaderData = useLoaderData();
 const { categories, modifiers } = loaderData;

  const [formData, setFormData] = useState({
    itemType: 'Prepared food and beverage',
    name: '',
    price: '',
    description: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [modifierSearch, setModifierSearch] = useState('')
  const [selectedModifiers, setSelectedModifiers] = useState([])
  const [categorySearch, setCategorySearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])

  const handleClose = () => {
    navigate(`/${restaurantId}/items`)
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
      error('Item name is required')
      return
    }
    
    setSaving(true)
    try {
      let imageUrl = null
      if (imageFile) {
        if (uploading) return; 
        imageUrl = await uploadImage(imageFile, 'items')
      }
      
      await createItem(restaurantId, {
        type: formData.itemType,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        image: imageUrl,
        categoryIds: selectedCategories.map(c => c.id),
        modifierIds: selectedModifiers.map(m => m.id),
      })
      
      success(`Item "${formData.name}" created successfully!`)
      navigate(`/${restaurantId}/items`)
    } catch (err) {
      console.error('Failed to create item:', err)
      error('Failed to create item: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const renderFilterList = (list, search, setSearch, selected, setSelected, title, icon) => {
    const IconComponent = icon;
    const filtered = list.filter(item => (item.name || '').toLowerCase().includes(search.toLowerCase()));

    return (
      <div className="border border-gray-300 rounded-xl bg-white shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
            <IconComponent className="w-5 h-5 text-red-600" />
            {title}
          </h3>
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
            <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search or add to ${title.toLowerCase()}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm focus:outline-none text-gray-700"
            />
          </div>
        </div>
        
        {selected.length > 0 && (
          <div className="p-4 border-b border-gray-200 flex flex-wrap gap-2">
            {selected.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full text-sm text-red-800 font-medium">
                {item.name}
                <button 
                  onClick={() => setSelected(selected.filter(s => s.id !== item.id))} 
                  className="text-red-500 hover:text-red-700 p-0.5"
                >
                  <HiMiniXMark className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        {search && (
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((item) => {
                const isSelected = selected.find(s => s.id === item.id);
                if (isSelected) return null; 
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelected([...selected, item]);
                      setSearch('');
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    {item.name}
                  </button>
                );
            })}
            {filtered.length === 0 && (
                 <div className="px-4 py-3 text-sm text-gray-500">No matching {title.toLowerCase()} found.</div>
            )}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Create New Menu Item</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClose} 
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="px-6 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {saving || uploading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex gap-8">
            <div className="flex-1 space-y-6">
              <div className="border border-red-500 rounded-xl p-4 bg-red-50/50">
                <div className="flex items-center gap-3">
                  <HiTag className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <div className="text-xs text-red-800 font-semibold mb-1">Item type</div>
                    <select
                      value={formData.itemType}
                      onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                      className="w-full bg-transparent text-sm font-bold text-red-900 focus:outline-none"
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
              <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                      <input
                          type="text"
                          placeholder="Name (required)"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold"
                      />
                  </div>
                  <div className="relative col-span-1">
                      <HiOutlineCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                          type="number"
                          placeholder="Price"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold"
                      />
                  </div>
              </div>
              <div>
                <textarea
                  placeholder="Customer-facing description (Optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-gray-700"
                />
              </div>
              <div className="border-2 border-dashed border-red-300 rounded-xl p-8 text-center bg-gray-50">
                {imagePreview ? (
                  <div className="relative group">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg object-cover w-full" />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600/90 text-white rounded-full p-2 hover:bg-red-700 transition-colors shadow-md"
                    >
                      <HiMiniXMark className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <HiCamera className="w-12 h-12 mx-auto text-red-400 mb-3" />
                    <p className="text-sm text-gray-600">
                      Drag and drop image here or{' '}
                      <label className="text-red-600 font-semibold hover:text-red-700 cursor-pointer">
                        browse files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    </p>
                    {uploading && <p className="text-sm text-red-500 mt-2">Uploading image...</p>}
                  </>
                )}
              </div>
            </div>
            <div className="w-96 space-y-8 flex-shrink-0">
              {renderFilterList(
                categories,
                categorySearch,
                setCategorySearch,
                selectedCategories,
                setSelectedCategories,
                'Categories',
                HiRectangleGroup
              )}
              {renderFilterList(
                modifiers,
                modifierSearch,
                setModifierSearch,
                selectedModifiers,
                setSelectedModifiers,
                'Modifiers',
                HiAdjustmentsHorizontal
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}