import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLoaderData } from "react-router-dom";
import {
  HiPlus,
  HiOutlineTag,
  HiTag,
  HiOutlinePlusCircle,
} from "react-icons/hi2";

import { useToast } from "@/hooks/useToast";

import { createItem, deleteItem } from "@/api/items.js";
import SearchBar from "@/components/common/SearchBar";
import BulkActionBar from "@/components/common/BulkActionBar";
import ActionMenu from "@/components/common/ActionMenu";

export default function ItemLibrary() {
  const { restaurantId } = useParams();
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [quickCreateMode, setQuickCreateMode] = useState(false);
  const [quickFormData, setQuickFormData] = useState({ name: "", price: "" });
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemMenus, setItemMenus] = useState({});
  const [items, setItems] = useState([]);
  const [_categories, setCategories] = useState([]);

  useEffect(() => {
    if (loaderData) {
      const itemsArray = Object.values(loaderData.items || {});
      const categoriesArray = Object.values(loaderData.categories || {});
      const itemsWithCategories = itemsArray.map((item) => {
        const categoryNames = categoriesArray
          .filter((cat) => cat.itemIds && cat.itemIds.includes(item.id))
          .map((cat) => cat.name);
        return {
          ...item,
          categoryNames: categoryNames.length > 0 ? categoryNames : null,
        };
      });
      setItems(itemsWithCategories);
      setCategories(categoriesArray);
    }
  }, [loaderData]);

  const refetchItems = async () => {
    navigate(0);
  };

  const getCategoryNames = (item) => {
    if (!item.categoryNames || item.categoryNames.length === 0) return "-";
    return item.categoryNames.join(", ");
  };

  const handleQuickCreate = async () => {
    if (!quickFormData.name.trim()) return;
    try {
      await createItem(restaurantId, {
        name: quickFormData.name,
        price: parseFloat(quickFormData.price) || 0,
        type: "Physical good",
      });
      setQuickFormData({ name: "", price: "" });
      setQuickCreateMode(false);
      success(`Item "${quickFormData.name}" created successfully!`);
      refetchItems();
    } catch (err) {
      console.error("Failed to create item:", err);
      error("Failed to create item");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems((items || []).map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Delete ${selectedItems.length} selected item(s)?`))
      return;

    try {
      await Promise.all(
        selectedItems.map((itemId) => deleteItem(restaurantId, itemId))
      );
      setSelectedItems([]);
      success(`Deleted ${selectedItems.length} item(s) successfully!`);
      refetchItems();
    } catch (err) {
      console.error("Failed to delete items:", err);
      error("Failed to delete some items");
    }
  };

  const handleDeleteItem = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!window.confirm(`Are you sure you want to delete this item?`)) return;
    try {
      await deleteItem(restaurantId, itemId);
      success(`Item "${item?.name || 'Item'}" deleted successfully!`);
      refetchItems();
    } catch {
      error("Failed to delete item");
    }
  };

  const filteredItems = (items || []).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const openEditItem = (itemId) => {
    navigate(`/${restaurantId}/items/${itemId}/edit`);
  };
  
  return (
    <div className="p-8 pb-24 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <HiOutlineTag className="w-10 h-10 text-red-600" />
          <h1 className="text-4xl font-extrabold text-gray-900">
            Item Library
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search items..."
            className="w-72"
          />
          <Link
            to={`/${restaurantId}/items/new`}
            className="px-6 py-3 text-base font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <HiPlus className="w-5 h-5" /> Create New Item
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 ">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-400 text-red-600 w-4 h-4"
                  checked={
                    (items || []).length > 0 &&
                    selectedItems.length === (items || []).length
                  }
                  onChange={handleSelectAll}
                />
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Item Name
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Category
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Availability
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 w-16">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {quickCreateMode ? (
              <tr className="bg-red-50/50 border-y-2 border-red-200">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4"
                    disabled
                  />
                </td>

                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="Item name (Required)"
                    value={quickFormData.name}
                    onChange={(e) =>
                      setQuickFormData({
                        ...quickFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                </td>

                <td className="px-6 py-4"></td>

                <td className="px-6 py-4"></td>

                <td className="px-6 py-4">
                  <input
                    type="number"
                    placeholder="Price"
                    value={quickFormData.price}
                    onChange={(e) =>
                      setQuickFormData({
                        ...quickFormData,
                        price: e.target.value,
                      })
                    }
                    className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-3">
                    <button
                      onClick={handleQuickCreate}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setQuickCreateMode(false);
                        setQuickFormData({ name: "", price: "" });
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                    >
                     Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr
                className="hover:bg-red-50/50 transition-colors cursor-pointer"
                onClick={() => setQuickCreateMode(true)}
              >
                <td colSpan="6" className="px-6 py-4">
                  <button className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-2">
                    <HiOutlinePlusCircle className="w-5 h-5" />
                    Quick create item
                  </button>
                </td>
              </tr>
            )}
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No items matching your search.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => openEditItem(item.id)}
                >
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-400 text-red-600 focus:ring-red-500 w-4 h-4"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <HiTag className="w-5 h-5 text-gray-500" />
                        )}
                      </div>

                      <span className="text-base font-semibold text-gray-800">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span className="text-gray-700 italic">
                      {getCategoryNames(item)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      Available
                    </span>
                  </td>

                  <td className="px-6 py-4 text-base font-bold text-gray-800">
                    ${item.price?.toFixed(2) || "0.00"}
                  </td>

                  <td
                    className="px-6 py-4 w-16"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end">
                      <ActionMenu
                        isOpen={itemMenus[item.id]}
                        onToggle={(open) =>
                          setItemMenus({ ...itemMenus, [item.id]: open })
                        }
                        editPath={`/${restaurantId}/items/${item.id}/edit`}
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
