import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiPlus, HiFilter, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { fetchCategories, deleteCategory } from '../../api/categories';
import SearchBar from '../../components/common/SearchBar';
import BulkActionBar from '../../components/common/BulkActionBar';
import ActionMenu from '../../components/common/ActionMenu';

export default function Categories() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryMenus, setCategoryMenus] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories(user.uid);
        setCategories(Object.values(data || {}));
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [user?.uid]);

  const refetchCategories = async () => {
    if (!user?.uid) return;
    try {
      const data = await fetchCategories(user.uid);
      setCategories(Object.values(data || {}));
    } catch (err) {
      console.error('Failed to refetch categories:', err);
    }
  };

  const organizedCategories = React.useMemo(() => {
    if (!categories) return [];
    
    const parentCategories = categories.filter(cat => !cat.parentCategoryId);
    const result = [];

    parentCategories.forEach(parent => {
      result.push(parent);
      const children = categories.filter(cat => cat.parentCategoryId === parent.id);
      result.push(...children);
    });

    return result;
  }, [categories]);

  const isSubcategory = (category) => {
    return !!category.parentCategoryId;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories((categories || []).map(cat => cat.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    if (!window.confirm(`Delete ${selectedCategories.length} selected categor${selectedCategories.length > 1 ? 'ies' : 'y'}?`)) return;

    try {
      await Promise.all(selectedCategories.map(catId => deleteCategory(user.uid, catId)));
      setSelectedCategories([]);
      refetchCategories();
    } catch (err) {
      console.error('Failed to delete categories:', err);
      alert('Failed to delete some categories');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(user.uid, categoryId);
      refetchCategories();
    } catch {
      alert('Failed to delete category');
    }
  };

  const filteredCategories = organizedCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 pb-24">
      <div className="mb-6 flex gap-3 items-center">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search categories" />
        
        {/* <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
          <HiFilter className="w-4 h-4" />
          All filters
        </button> */}
        <div className="flex-1"></div>
        {/* <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Actions
          <HiChevronDown className="w-4 h-4" />
        </button> */}
        <Link
          to="/categories/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <HiPlus className="w-4 h-4" />
          Create category
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 ">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={(categories || []).length > 0 && selectedCategories.length === (categories || []).length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No categories yet. Create your first category!
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/categories/${category.id}/edit`)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleSelectCategory(category.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isSubcategory(category) && (
                          <HiChevronRight className="w-4 h-4 text-gray-400 ml-4" />
                        )}
                        <span className={`text-sm ${isSubcategory(category) ? 'text-gray-600' : 'font-medium text-gray-900'}`}>
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {isSubcategory(category) ? 'Subcategory' : 'Parent'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {Array.isArray(category.itemIds) ? category.itemIds.length : (category.itemIds ? Object.values(category.itemIds).length : 0)}
                    </td>
                    <td className="px-6 py-4 " onClick={(e) => e.stopPropagation()}>
                      <div onClick={(e) => e.stopPropagation()}>
                        <ActionMenu
                          isOpen={categoryMenus[category.id]}
                          onToggle={(open) => setCategoryMenus({ ...categoryMenus, [category.id]: open })}
                          editPath={`/categories/${category.id}/edit`}
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
