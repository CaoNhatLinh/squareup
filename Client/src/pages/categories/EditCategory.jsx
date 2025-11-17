import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  updateCategory,
  fetchCategory,
  fetchCategories,
} from "@/api/categories";
import { useImageUpload } from "@/hooks/useImageUpload";
import {
  HiXMark,
  HiPhoto,
  HiFolder,
  HiTag,
  HiMagnifyingGlass,
  HiCamera,
} from "react-icons/hi2";
import { Input, Button, Checkbox, LoadingSpinner } from '@/components/ui';



export default function EditCategory() {
  const navigate = useNavigate();
  const { categoryId, restaurantId } = useParams();
  const { uploadImage, uploading } = useImageUpload();
  const [formData, setFormData] = useState({
    name: "",
    parentCategoryId: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showParentSelector, setShowParentSelector] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [items, setItems] = useState([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemSearch, setItemSearch] = useState("");

  useEffect(() => {
    if (!restaurantId || !categoryId) return;
    setLoading(true);
    Promise.all([
      fetchCategory(restaurantId, categoryId),
      fetchCategories(restaurantId),
      import("../../api/items").then(({ fetchItems }) => fetchItems(restaurantId)),
    ])
      .then(([categoryData, allCategories, itemsData]) => {
        setFormData({
          name: categoryData.name || "",
          parentCategoryId: categoryData.parentCategoryId || null,
        });

        if (categoryData.image) {
          setExistingImageUrl(categoryData.image);
          setImagePreview(categoryData.image);
        } 

        const categoriesArray = allCategories?.categories || allCategories || [];
        const topLevelCategories = categoriesArray.filter(
          (cat) => !cat.parentCategoryId && cat.id !== categoryId 
        );
        setCategories(topLevelCategories);

        if (categoryData.parentCategoryId) {
          const parent = categoriesArray.find(
            (cat) => cat.id === categoryData.parentCategoryId
          );
          if (parent) setSelectedParent(parent);
        } 

        const allItems = itemsData?.items || itemsData || [];
        setItems(allItems);

        if (categoryData.itemIds && Array.isArray(categoryData.itemIds)) {
          const categoryItems = allItems.filter((item) =>
            categoryData.itemIds.includes(item.id)
          );
          setSelectedItems(categoryItems);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading category:", err);
        alert("Failed to load category");
        navigate(`/${restaurantId}/categories`);
      });
  }, [restaurantId, categoryId, navigate]);

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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
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
      alert("Category name is required");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = existingImageUrl;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, "categories");
      } else if (!imagePreview) {
        imageUrl = null;
      }

      await updateCategory(restaurantId, categoryId, {
        name: formData.name,
        image: imageUrl,
        parentCategoryId: formData.parentCategoryId,
        itemIds: selectedItems.map((item) => item.id),
      });

      navigate(`/${restaurantId}/categories`);
    } catch (err) {
      console.error("Failed to update category:", err);
      alert("Failed to update category: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/70 z-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">
            Loading category...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Edit Category: {formData.name}</h2>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving || uploading}>
              {saving || uploading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
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
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-600/90 text-white rounded-full p-2 hover:bg-red-700 transition-colors shadow-md"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <HiCamera className="w-12 h-12 mx-auto text-red-400 mb-3" />

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
                    Select a parent category to make this a subcategory.
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
                      None selected
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
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
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
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

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
                            <input
                              type="checkbox"
                              checked={
                                !!selectedItems.find((i) => i.id === item.id)
                              }
                              onChange={() => {}}
                              className="rounded text-red-600 focus:ring-red-500"
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
                            ${item.price?.toFixed(2) || "0.00"}
                          </span>
                        </button>
                      ))}
                    {items.filter((item) =>
                      item.name.toLowerCase().includes(itemSearch.toLowerCase())
                    ).length === 0 && (
                      <p className="text-sm text-gray-500 text-center p-3">
                        No items found.
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
