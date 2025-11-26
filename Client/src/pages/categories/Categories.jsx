import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAppStore from '@/store/useAppStore';
import {
  HiPlus,
  HiOutlineSquares2X2,
  HiChevronRight,
  HiOutlineTag,
} from "react-icons/hi2";
import PageHeader from '@/components/common/PageHeader';
import { fetchCategories, deleteCategory } from "@/api/categories.js";
import Table from '@/components/ui/Table';
import SearchBar from "@/components/common/SearchBar";
import BulkActionBar from "@/components/common/BulkActionBar";
import ActionMenu from "@/components/common/ActionMenu";
import { LoadingSpinner, Checkbox, Button } from '@/components/ui';

export default function Categories() {
  const restaurantId = useAppStore(s => s.restaurantId);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryMenus, setCategoryMenus] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    if (!restaurantId) return;
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories(restaurantId, { page, limit, q: searchQuery, sortBy, sortDir });
        setCategories(data.categories || []);
        setTotal((data.meta && data.meta.total) || 0);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [restaurantId, page, limit, searchQuery, sortBy, sortDir]);

  const refetchCategories = async () => {
    if (!restaurantId) return;
    try {
      const data = await fetchCategories(restaurantId, { page, limit, q: searchQuery });
      setCategories(data.categories || []);
      setTotal((data.meta && data.meta.total) || 0);
    } catch (err) {
      console.error("Failed to refetch categories:", err);
    }
  };

  

  const isSubcategory = (category) => {
    return !!category.parentCategoryId;
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

  

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <PageHeader
        title="Menu Categories"
        Icon={HiOutlineSquares2X2}
        SearchBarComponent={SearchBar}
        searchBarProps={{ value: searchQuery, onChange: setSearchQuery, placeholder: 'Search categories...', className: 'w-72' }}
        actionLabel={<><HiPlus className="w-5 h-5" /> Create Category</>}
        actionLink={`/restaurant/categories/new`}
      />

      <div className="p-4">
        <Table
          columns={[
            {
              key: 'select',
              title: (
                <input
                  type="checkbox"
                  className="rounded border-gray-400 text-red-600 w-4 h-4"
                  checked={(categories || []).length > 0 && selectedCategories.length === (categories || []).length}
                  onChange={(e) => { if (e.target.checked) setSelectedCategories((categories || []).map(c => c.id)); else setSelectedCategories([]); }}
                />
              ),
              render: (r) => (
                <input
                  type="checkbox"
                  className="rounded border-gray-400 text-red-600 w-4 h-4"
                  checked={selectedCategories.includes(r.id)}
                  onChange={(e) => { e.stopPropagation(); handleSelectCategory(r.id); }}
                />
              ),
            },
            {
              key: 'name',
              title: 'Category Name',
              sortable: true,
              render: (r) => (
                <div className="flex items-center gap-2">
                  {isSubcategory(r) ? (
                    <HiChevronRight className="w-4 h-4 text-gray-500 ml-4 flex-shrink-0" />
                  ) : (
                    <HiOutlineTag className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-base font-semibold ${isSubcategory(r) ? 'text-gray-700' : 'text-gray-900'}`}>{r.name}</span>
                </div>
              ),
            },
            { key: 'type', title: 'Type', render: (r) => (isSubcategory(r) ? 'Subcategory' : 'Parent Category'), },
            { key: 'item_count', title: 'Items Count', align: 'right', render: (r) => (Array.isArray(r.itemIds) ? r.itemIds.length : (r.itemIds ? Object.values(r.itemIds).length : 0)), },
            { key: 'actions', title: 'Actions', render: (r) => (
                <div className="flex justify-end">
                  <ActionMenu
                    isOpen={categoryMenus[r.id]}
                    onToggle={(open) => setCategoryMenus({ ...categoryMenus, [r.id]: open })}
                    editPath={`/restaurant/categories/${r.id}/edit`}
                    onDelete={() => handleDeleteCategory(r.id)}
                    itemName={r.name}
                  />
                </div>
              ),
            },
          ]}
          data={categories}
          loading={loading}
          rowKey={'id'}
          onRowClick={(r) => navigate(`/restaurant/categories/${r.id}/edit`)}
          pagination={{ page, limit, total }}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          sortBy={null}
          sortDir={'asc'}
          onSortChange={(key) => {
            if (key === sortBy) {
              setSortDir(d => d === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy(key);
              setSortDir('asc');
            }
            setPage(1);
          }}
        />
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
