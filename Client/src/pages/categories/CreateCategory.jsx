import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCategory, fetchCategories } from "@/api/categories";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/useToast";
import {
  HiXMark,
  HiPhoto,
  HiFolder,
  HiTag,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { Input, Button, Checkbox } from '@/components/ui';

export default function CreateCategory() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { uploadImage, uploading } = useImageUpload();
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    parentCategoryId: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showParentSelector, setShowParentSelector] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [items, setItems] = useState([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemSearch, setItemSearch] = useState("");

  useEffect(() => {
    if (restaurantId) {
      Promise.all([
        fetchCategories(restaurantId),
        import("../../api/items").then(({ fetchItems }) =>
          fetchItems(restaurantId)
        ),
      ])
        .then(([categoriesData, itemsData]) => {
          const topLevelCategories = Object.values(categoriesData || {}).filter(
            (cat) => !cat.parentCategoryId
          );
          setCategories(topLevelCategories);
          setItems(Object.values(itemsData || {}));
        })
        .catch((err) => console.error("Error loading data:", err));
    }
  }, [restaurantId]);

  const handleClose = () => {
    navigate(`/${restaurantId}/categories`);
  };

  const handleParentSelect = (category) => {
    setSelectedParent(category);
    setFormData({ ...formData, parentCategoryId: category.id });
    setShowParentSelector(false);
  };

  const handleRemoveParent = () => {
    setSelectedParent(null);
    setFormData({ ...formData, parentCategoryId: null });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemToggle = (item) => {
    if (selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== itemId));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, "categories");
      }
      await createCategory(restaurantId, {
        name: formData.name,
        image: imageUrl,
        parentCategoryId: formData.parentCategoryId,
        itemIds: selectedItems.map((item) => item.id),
      });
      success(`Category "${formData.name}" created successfully!`);
      navigate(`/${restaurantId}/categories`);
    } catch (err) {
      console.error("Failed to create category:", err);
      error("Failed to create category: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <button
            onClick={handleClose}
            className="p-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <HiXMark className="w-6 h-6" /> 
          </button>

          <h2 className="text-2xl font-bold text-gray-900">
            Create New Category
          </h2>

          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving || uploading}
          >
            Save Category
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Category name (Required)"
              className="text-xl font-semibold"
            />
          </div>
          <div className="border-2 border-dashed border-red-300 rounded-xl p-8 text-center bg-gray-50">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-xl shadow-lg object-cover w-full"
                />

                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600/90 text-white rounded-full p-2 hover:bg-red-700 transition-colors shadow-md"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <HiPhoto className="w-12 h-12 mx-auto text-red-400 mb-3" />

                <p className="text-sm text-gray-600">
                  Drag and drop image here or
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
              </>
            )}
          </div>
          <div className="border border-gray-300 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-start gap-3">
              <HiFolder className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />

              <div className="flex-1">
                <div className="font-semibold text-base mb-2 text-gray-900">
                  Parent category
                </div>

                {selectedParent ? (
                  <div className="flex items-center justify-between bg-red-50 p-2 rounded-lg">
                    <span className="text-sm font-medium text-red-800">
                      {selectedParent.name}
                    </span>

                    <button
                      onClick={handleRemoveParent}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                    >
                      <HiXMark className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Selecting a parent makes this a subcategory.
                  </p>
                )}
                <button
                  onClick={() => setShowParentSelector(!showParentSelector)}
                  className="text-sm text-red-600 font-semibold hover:text-red-700 mt-3 inline-block"
                >
                  {showParentSelector
                    ? "Close Selector"
                    : selectedParent
                    ? "Change Parent"
                    : "Select Parent"}
                </button>
              </div>
            </div>
            {showParentSelector && (
              <div className="mt-4 border-t border-gray-200 pt-3 max-h-48 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">
                    No top-level categories available
                  </p>
                ) : (
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleParentSelect(cat)}
                        className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-3 ${
                          selectedParent?.id === cat.id
                            ? "bg-red-50 text-red-700 font-medium"
                            : "hover:bg-gray-100 text-gray-800"
                        }`}
                      >
                        {cat.image && (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-6 h-6 rounded-md object-cover"
                          />
                        )}
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <div className="border border-gray-300 rounded-xl p-4 bg-white shadow-sm">
              <div className="flex items-start gap-3">
                <HiTag className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-base mb-2 text-gray-900">
                    Items
                  </div>
                  {selectedItems.length === 0 ? (
                    <div className="text-sm text-gray-600 mb-3">
                      No items selected
                    </div>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {selectedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-gray-100 p-2 rounded-lg text-sm"
                        >
                          <span className="font-medium">{item.name}</span>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <HiXMark className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowItemSelector(!showItemSelector)}
                  className="text-sm text-red-600 font-semibold hover:text-red-700"
                >
                  {showItemSelector
                    ? "Close Item Selector"
                    : selectedItems.length > 0
                    ? `Edit (${selectedItems.length}) Items`
                    : "Add Items"}
                </button>
              </div>

              {showItemSelector && (
                <div className="mt-4 border-t border-gray-200 pt-3">
                  <div className="relative mb-3">
                        <Input
                          leftIcon={HiMagnifyingGlass}
                          placeholder="Search and select items..."
                          value={itemSearch}
                          onChange={(e) => setItemSearch(e.target.value)}
                          className="text-sm"
                        />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {items
                      .filter((item) =>
                        item.name
                          .toLowerCase()
                          .includes(itemSearch.toLowerCase())
                      )
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleItemToggle(item)}
                          className={`w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between gap-3 ${
                            selectedItems.find((i) => i.id === item.id)
                              ? "bg-red-50 text-red-700 font-medium"
                              : "hover:bg-gray-100 text-gray-800"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Checkbox
                              checked={!!selectedItems.find((i) => i.id === item.id)}
                              onChange={() => handleItemToggle(item)}
                              size="small"
                            />

                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-6 h-6 rounded-md object-cover"
                              />
                            )}
                            <span>{item.name}</span>
                          </span>

                          <span className="text-xs text-gray-500">
                            ${item.price.toFixed(2)}
                          </span>
                        </button>
                      ))}
                    {items.filter((item) =>
                      item.name.toLowerCase().includes(itemSearch.toLowerCase())
                    ).length === 0 && (
                      <p className="text-sm text-gray-500 text-center p-3">
                        No matching items found.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
