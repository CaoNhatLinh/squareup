import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiPlus, HiFilter, HiChevronDown } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { fetchItems, createItem, deleteItem } from '../../api/items';
import { fetchCategories } from '../../api/categories';
import SearchBar from '../../components/common/SearchBar';
import BulkActionBar from '../../components/common/BulkActionBar';
import ActionMenu from '../../components/common/ActionMenu';

export default function ItemLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCreateMode, setQuickCreateMode] = useState(false);
  const [quickFormData, setQuickFormData] = useState({ name: '', price: '' });
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemMenus, setItemMenus] = useState({});
  const [items, setItems] = useState([]);
  const [_categories, setCategories] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    const loadData = async () => {
      setItemsLoading(true);
      try {
        const [itemsData, categoriesData] = await Promise.all([
          fetchItems(user.uid),
          fetchCategories(user.uid)
        ]);
        const itemsArray = Object.values(itemsData || {});
        const categoriesArray = Object.values(categoriesData || {});
        
        const itemsWithCategories = itemsArray.map(item => {
          const categoryNames = categoriesArray
            .filter(cat => cat.itemIds && cat.itemIds.includes(item.id))
            .map(cat => cat.name);
          return {
            ...item,
            categoryNames: categoryNames.length > 0 ? categoryNames : null
          };
        });
        
        setItems(itemsWithCategories);
        setCategories(categoriesArray);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setItemsLoading(false);
      }
    };

    loadData();
  }, [user?.uid]);

  const refetchItems = async () => {
    if (!user?.uid) return;
    try {
      const data = await fetchItems(user.uid);
      setItems(Object.values(data || {}));
    } catch (err) {
      console.error('Failed to refetch items:', err);
    }
  };

  const getCategoryNames = (item) => {
    if (!item.categoryNames || item.categoryNames.length === 0) return '-';
    return item.categoryNames.join(', ');
  };

  const handleQuickCreate = async () => {
    if (!quickFormData.name.trim()) return;
    try {
      await createItem(user.uid, {
        name: quickFormData.name,
        price: parseFloat(quickFormData.price) || 0,
        type: 'Physical good',
      });
      setQuickFormData({ name: '', price: '' });
      setQuickCreateMode(false);
      refetchItems();
    } catch (err) {
      console.error('Failed to create item:', err);
      alert('Failed to create item');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems((items || []).map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Delete ${selectedItems.length} selected item(s)?`)) return;

    try {
      await Promise.all(selectedItems.map(itemId => deleteItem(user.uid, itemId)));
      setSelectedItems([]);
      refetchItems();
    } catch (err) {
      console.error('Failed to delete items:', err);
      alert('Failed to delete some items');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteItem(user.uid, itemId);
      refetchItems();
    } catch {
      alert('Failed to delete item');
    }
  };

  const filteredItems = (items || []).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const openEditItem = (itemId) => {
    navigate(`/items/${itemId}/edit`);
  }
  return (
    <div className="p-6 pb-24">
      <div className="mb-6 flex gap-3 items-center">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="flex-1"></div>
        <Link
          to="/items/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <HiPlus className="w-4 h-4" />
          Create item
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
                    checked={(items || []).length > 0 && selectedItems.length === (items || []).length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quickCreateMode ? (
                <tr className="bg-blue-50">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300" disabled />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={quickFormData.name}
                      onChange={(e) => setQuickFormData({ ...quickFormData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">-</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">Available</span>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      placeholder="Price"
                      value={quickFormData.price}
                      onChange={(e) => setQuickFormData({ ...quickFormData, price: e.target.value })}
                      className="w-24 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={handleQuickCreate}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setQuickCreateMode(false);
                        setQuickFormData({ name: '', price: '' });
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr className="hover:bg-gray-50">
                  <td colSpan="6" className="px-6 py-4"
                    onClick={() => setQuickCreateMode(true)}
                  >
                    <button
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <HiPlus className="w-4 h-4" />
                      Quick create
                    </button>
                  </td>
                </tr>
              )}
              {itemsLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                    No items yet. Create your first item!
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openEditItem(item.id)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <HiPlus className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-blue-600">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {getCategoryNames(item)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Available
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₫{item.price || 0}
                    </td>
                    <td className="px-6 py-4 " onClick={(e) => e.stopPropagation()}>
                      <div onClick={(e) => e.stopPropagation()}>
                        <ActionMenu
                          isOpen={itemMenus[item.id]}
                          onToggle={(open) => setItemMenus({ ...itemMenus, [item.id]: open })}
                          editPath={`/items/${item.id}/edit`}
                          onDelete={() => handleDeleteItem(item.id)}
                          itemName={item.name}
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
        selectedCount={selectedItems.length}
        onDelete={handleBulkDelete}
        onCancel={() => setSelectedItems([])}
        position="bottom"
      />
    </div>
  );
}
