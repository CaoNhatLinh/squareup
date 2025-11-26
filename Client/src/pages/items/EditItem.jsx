import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAppStore from '@/store/useAppStore';
import { fetchItems, updateItem } from "@/api/items";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/useToast";
import {
  HiXMark,
  HiTag,
  HiOutlineCurrencyDollar,
  HiCamera,
  HiRectangleGroup,
  HiAdjustmentsHorizontal,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { Button, Input, Dropdown, Checkbox, LoadingSpinner } from '@/components/ui';

const renderFilterList = (
  list,
  search,
  setSearch,
  selected,
  setSelected,
  title,
  icon
) => {
  const IconComponent = icon;
  const filtered = list.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border border-gray-300 rounded-xl bg-white shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <IconComponent className="w-5 h-5 text-red-600" />
          {title}
        </h3>
          <div className="px-3 py-2">
            <Input placeholder={`Search or add to ${title.toLowerCase()}`} value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={HiMagnifyingGlass} className="text-sm" />
          </div>
      </div>

      {selected.length > 0 && (
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 rounded-full text-sm text-red-800 font-medium"
            >
              {item.name}
              <Button
                variant="ghost"
                size="small"
                onClick={() => setSelected(selected.filter((s) => s.id !== item.id))}
                icon={HiXMark}
                className="p-0.5 text-red-500 hover:text-red-700"
                aria-label={`Remove ${item.name}`}
              />
            </span>
          ))}
        </div>
      )}

      {search && (
        <div className="max-h-56 overflow-y-auto">
          {filtered.map((item) => {
            const isSelected = selected.find((s) => s.id === item.id);
            if (isSelected) return null;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelected([...selected, item]);
                  setSearch("");
                }}
                className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-100 transition-colors"
              >
                {item.name}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No matching {title.toLowerCase()} found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function EditItem() {
  const navigate = useNavigate();
  const { itemId, restaurantId: paramRestaurantId } = useParams();
  const restaurantId = useAppStore(s => s.restaurantId) || paramRestaurantId;
  const { uploadImage, uploading } = useImageUpload();
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    itemType: "Physical good",
    name: "",
    price: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [modifierSearch, setModifierSearch] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (!restaurantId || !itemId) return;
    setLoading(true);
    Promise.all([
      fetchItems(restaurantId),
      import("../../api/categories").then(({ fetchCategories }) =>
        fetchCategories(restaurantId)
      ),
      import("../../api/modifers").then(({ fetchModifiers }) =>
        fetchModifiers(restaurantId)
      ),
    ])
      .then(([itemsData, categoriesData, modifiersData]) => {
        const items = itemsData?.items || itemsData || [];
        const item = items.find((i) => i.id === itemId);
        if (item) {
          setFormData({
            itemType: item.type || "Physical good",
            name: item.name || "",
            price: item.price?.toString() || "",
            description: item.description || "",
          });
          if (item.image) setImagePreview(item.image);
        }
        const cats = categoriesData?.categories || categoriesData || [];
        setCategories(cats);
        const itemCategories = cats.filter(
          (cat) => cat.itemIds && cat.itemIds.includes(itemId)
        );
        setSelectedCategories(itemCategories);

        const mods = modifiersData?.modifiers || modifiersData || [];
        setModifiers(mods);
        if (item && Array.isArray(item.modifierIds)) {
          const itemMods = mods.filter((m) => item.modifierIds.includes(m.id));
          setSelectedModifiers(itemMods);
        } else {
          const itemMods = mods.filter((m) => {
            const current = Array.isArray(m.itemIds)
              ? m.itemIds
              : m.itemIds
              ? Object.values(m.itemIds)
              : [];
            return current.includes(itemId);
          });
          setSelectedModifiers(itemMods);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId, itemId]);

  const handleClose = () => navigate('/restaurant/items');

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

  const handleSave = async () => {
    if (!formData.name.trim()) {
      error("Item name is required");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, "items");
      }
      await updateItem(restaurantId, itemId, {
        type: formData.itemType,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        image: imageUrl,
        categoryIds: selectedCategories.map((c) => c.id),
        modifierIds: selectedModifiers.map((m) => m.id),
      });
      success(`Item "${formData.name}" updated successfully!`);
      navigate('/restaurant/items');
    } catch (err) {
      console.error("Failed to update item:", err);
      error("Failed to update item: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner.Overlay message="Loading item data..." />;
  }

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Edit Item: {formData.name || itemId}</h2>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="small" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" size="medium" onClick={handleSave} loading={saving || uploading} disabled={saving || uploading}>{saving || uploading ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex gap-8">
            <div className="flex-1 space-y-6">
              <div className="border border-red-500 rounded-xl p-4 bg-red-50/50">
                <div className="flex items-center gap-3">
                  <HiTag className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <div className="text-xs text-red-800 font-semibold mb-1">
                      Item type
                    </div>
                    <Dropdown
                      value={formData.itemType}
                      onChange={(val) => setFormData({ ...formData, itemType: val })}
                      options={[
                        { value: 'Prepared food and beverage', label: 'Prepared food and beverage' },
                        { value: 'Physical good', label: 'Physical good' },
                        { value: 'Membership', label: 'Membership' },
                        { value: 'Digital', label: 'Digital' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      placeholder="Select item type"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input label="Name" placeholder="Name (required)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="text-lg font-semibold" />
                </div>
                <div className="relative col-span-1">
                  <HiOutlineCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} leftIcon={HiOutlineCurrencyDollar} className="pl-10" />
                </div>
              </div>
              <div>
                  <Input as="textarea" rows={4} placeholder="Customer-facing description (Optional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="border-2 border-dashed border-red-300 rounded-xl p-8 text-center bg-gray-50">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg shadow-lg object-cover w-full"
                    />
                    <Button variant="ghost" size="small" onClick={() => { setImageFile(null); setImagePreview(null); }} icon={HiXMark} className="absolute top-2 right-2 p-2" aria-label="Remove image preview" />
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
                    {uploading && (
                      <p className="text-sm text-red-500 mt-2">
                        Uploading image...
                      </p>
                    )}
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
                "Categories",
                HiRectangleGroup
              )}
              {renderFilterList(
                modifiers,
                modifierSearch,
                setModifierSearch,
                selectedModifiers,
                setSelectedModifiers,
                "Modifiers",
                HiAdjustmentsHorizontal
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
