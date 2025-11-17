import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLoaderData } from "react-router-dom";
import {
  HiPlus,
  HiOutlineTag,
  HiTag,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import PageHeader from '@/components/common/PageHeader';
import { Input, Button, Checkbox } from '@/components/ui';

import { useToast } from "@/hooks/useToast";

import { deleteItem, fetchItems, createItem } from "@/api/items.js";
import Table from '@/components/ui/Table';
import SearchBar from "@/components/common/SearchBar";
import BulkActionBar from "@/components/common/BulkActionBar";
import ActionMenu from "@/components/common/ActionMenu";

export default function ItemLibrary() {
  const { restaurantId } = useParams();
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemMenus, setItemMenus] = useState({});
  const [items, setItems] = useState([]);
  const [_categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (loaderData) {
      const categoriesArray = loaderData.categories || [];
      setCategories(categoriesArray);
    }
  }, [loaderData]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchItems(restaurantId, { page, limit, q: searchQuery });
        const itemsList = data.items || [];
        const categoriesArray = loaderData?.categories || [];
        const itemsWithCategories = itemsList.map((item) => {
          const categoryNames = categoriesArray
            .filter((cat) => cat.itemIds && cat.itemIds.includes(item.id))
            .map((cat) => cat.name);
          return { ...item, categoryNames: categoryNames.length > 0 ? categoryNames : null };
        });
        setItems(itemsWithCategories);
        setTotal((data.meta && data.meta.total) || 0);
      } catch (err) {
        console.error('Failed to load items:', err);
      }
    };
    loadItems();
  }, [restaurantId, page, limit, searchQuery, loaderData]);

  const refetchItems = async () => setPage(1);

  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState('');

  const getCategoryNames = (item) => {
    if (!item.categoryNames || item.categoryNames.length === 0) return "-";
    return item.categoryNames.join(", ");
  };

  // Quick create removed for now

  // header select handled via Table header checkbox in future

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

  const openEditItem = (itemId) => {
    navigate(`/${restaurantId}/items/${itemId}/edit`);
  };

  const handleQuickCreate = async () => {
    if (!quickName) return error('Name is required');
    try {
      const payload = { name: quickName, price: parseFloat(quickPrice || 0) };
      const res = await createItem(restaurantId, payload);
      const created = res && res.data !== undefined ? (res.data || res) : res;
      const createdName = created?.name || quickName;
      success(`Item "${createdName}" created`);
      setQuickName('');
      setQuickPrice('');
      setShowQuickCreate(false);
      setSelectedItems([]);
      setPage(1);
    } catch (err) {
      console.error('Failed to quick create item', err);
      error('Failed to quick create item');
    }
  };
  
  return (
    <div className="p-8 pb-24 bg-gray-50 min-h-screen">
      <PageHeader
        title="Item Library"
        Icon={HiOutlineTag}
        showBack={false}
        SearchBarComponent={SearchBar}
        searchBarProps={{ value: searchQuery, onChange: setSearchQuery, placeholder: 'Search items...', className: 'w-72' }}
        actionLabel={<><HiPlus className="w-5 h-5" /> Create New Item</>}
        actionLink={`/${restaurantId}/items/new`}
        rightChildren={<div className="flex items-center gap-2"><button onClick={() => setShowQuickCreate(s => !s)} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"><HiOutlinePlusCircle className="w-4 h-4" /> Quick Create</button></div>}
      />

      <div className="p-4">
        {showQuickCreate && (
          <div className="mb-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex gap-3 items-center">
              <Input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="Item name" className="w-64" />
              <Input value={quickPrice} onChange={(e) => setQuickPrice(e.target.value)} placeholder="Price" className="w-40" />
              <Button onClick={handleQuickCreate} className="bg-indigo-600 text-white">Create</Button>
              <Button onClick={() => setShowQuickCreate(false)} className="bg-gray-100">Cancel</Button>
            </div>
          </div>
        )}
          <Table
          columns={[
            { key: 'select', title: (
                <input
                  type="checkbox"
                  className="rounded border-gray-400 text-red-600 w-4 h-4"
                  checked={(items || []).length > 0 && selectedItems.length === (items || []).length}
                  onChange={(e) => { if (e.target.checked) setSelectedItems((items || []).map(c => c.id)); else setSelectedItems([]); }}
                />
              ), render: (r) => (<Checkbox checked={selectedItems.includes(r.id)} onChange={(e) => { e.stopPropagation(); handleSelectItem(r.id); }} />) },
            { key: 'name', title: 'Item Name', render: (r) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {r.image ? (<img src={r.image} alt={r.name} className="w-full h-full object-cover" />) : (<HiTag className="w-5 h-5 text-gray-500" />)}
                </div>
                <span className="text-base font-semibold text-gray-800">{r.name}</span>
              </div>
            )},
            { key: 'category', title: 'Category', render: (r) => (<span className="text-gray-700 italic">{getCategoryNames(r)}</span>) },
            { key: 'availability', title: 'Availability', render: () => (<span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Available</span>) },
            { key: 'price', title: 'Price', align: 'right', render: (r) => `$${r.price?.toFixed(2) || '0.00'}` },
            { key: 'actions', title: 'Actions', render: (r) => (<div className="flex justify-end"><ActionMenu isOpen={itemMenus[r.id]} onToggle={(open) => setItemMenus({ ...itemMenus, [r.id]: open })} editPath={`/${restaurantId}/items/${r.id}/edit`} onDelete={() => handleDeleteItem(r.id)} itemName={r.name} /></div>) },
          ]}
          data={items}
          loading={false}
          rowKey={'id'}
          onRowClick={(r) => openEditItem(r.id)}
          pagination={{ page, limit, total }}
          onPageChange={(p) => { setSelectedItems([]); setPage(p); }}
          onLimitChange={(l) => { setSelectedItems([]); setLimit(l); setPage(1); }}
        />
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
