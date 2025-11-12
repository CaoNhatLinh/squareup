import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiPlus,
  HiOutlineSquares2X2,
  HiChevronRight,
  HiOutlineTag,
} from "react-icons/hi2";
import { fetchCategories, deleteCategory } from "@/api/categories.js";
import SearchBar from "@/components/common/SearchBar";
import BulkActionBar from "@/components/common/BulkActionBar";
import ActionMenu from "@/components/common/ActionMenu";

export default function Categories() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryMenus, setCategoryMenus] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories(restaurantId);
        setCategories(Object.values(data || {}));
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [restaurantId]);

  const refetchCategories = async () => {
    if (!restaurantId) return;
    try {
      const data = await fetchCategories(restaurantId);
      setCategories(Object.values(data || {}));
    } catch (err) {
      console.error("Failed to refetch categories:", err);
    }
  };

  const organizedCategories = React.useMemo(() => {
    if (!categories) return [];
    const parentCategories = categories
      .filter((cat) => !cat.parentCategoryId)
      .sort((a, b) => a.name.localeCompare(b.name));

    const result = [];
    parentCategories.forEach((parent) => {
      result.push(parent);
      const children = categories
        .filter((cat) => cat.parentCategoryId === parent.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      result.push(...children);
    });

    return result;
  }, [categories]);

  const isSubcategory = (category) => {
    return !!category.parentCategoryId;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories((categories || []).map((cat) => cat.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedCategories.length} selected categor${
          selectedCategories.length > 1 ? "ies" : "y"
        }?`
      )
    )
      return;

    try {
      await Promise.all(
        selectedCategories.map((catId) => deleteCategory(restaurantId, catId))
      );
      setSelectedCategories([]);
      refetchCategories();
    } catch (err) {
      console.error("Failed to delete categories:", err);
      alert("Failed to delete some categories");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm(`Are you sure you want to delete this category?`))
      return;
    try {
      await deleteCategory(restaurantId, categoryId);
      refetchCategories();
    } catch {
      alert("Failed to delete category");
    }
  };

  const filteredCategories = organizedCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <HiOutlineSquares2X2 className="w-10 h-10 text-red-600" />{" "}
          {/* Icon mới */}
          <h1 className="text-4xl font-extrabold text-gray-900">
            Menu Categories
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search categories..."
            className="w-72"
          />
          <Link
            to={`/${restaurantId}/categories/new`}
            className="px-6 py-3 text-base font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <HiPlus className="w-5 h-5" /> Create Category
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-400 text-red-600 w-4 h-4"
                  checked={
                    (categories || []).length > 0 &&
                    selectedCategories.length === (categories || []).length
                  }
                  onChange={handleSelectAll}
                />
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Category Name
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Type
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Items Count
              </th>
              <th className="px-6 py-3 w-16">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-4 border-red-600"></div>

                  <p className="mt-2">Loading categories...</p>
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No categories found. Click 'Create Category' to begin.
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className={`hover:bg-red-50/50 cursor-pointer ${
                    isSubcategory(category) ? "bg-gray-50/50" : "bg-white"
                  }`}
                  onClick={() => navigate(`/${restaurantId}/categories/${category.id}/edit`)}
                >
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-400 text-red-600 w-4 h-4"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleSelectCategory(category.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {isSubcategory(category) ? (
                        <HiChevronRight className="w-4 h-4 text-gray-500 ml-4 flex-shrink-0" />
                      ) : (
                        <HiOutlineTag className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}

                      <span
                        className={`text-base font-semibold ${
                          isSubcategory(category)
                            ? "text-gray-700"
                            : "text-gray-900"
                        }`}
                      >
                        {category.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        isSubcategory(category)
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isSubcategory(category)
                        ? "Subcategory"
                        : "Parent Category"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-base font-semibold text-gray-800">
                    {Array.isArray(category.itemIds)
                      ? category.itemIds.length
                      : category.itemIds
                      ? Object.values(category.itemIds).length
                      : 0}
                  </td>

                  <td
                    className="px-6 py-4 w-16"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end">
                      <ActionMenu
                        isOpen={categoryMenus[category.id]}
                        onToggle={(open) =>
                          setCategoryMenus({
                            ...categoryMenus,
                            [category.id]: open,
                          })
                        }
                        editPath={`/${restaurantId}/categories/${category.id}/edit`}
                        onDelete={() => handleDeleteCategory(category.id)}
                        itemName={category.name}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <BulkActionBar
        selectedCount={selectedCategories.length}
        onDelete={handleBulkDelete}
        onCancel={() => setSelectedCategories([])}
        position="bottom"
      />
    </div>
  );
}
