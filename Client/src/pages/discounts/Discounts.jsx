import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAppStore from '@/store/useAppStore';
import { HiPlus, HiTag } from "react-icons/hi2";
import PageHeader from '@/components/common/PageHeader';
import Table from '@/components/ui/Table';
import BulkActionBar from "@/components/common/BulkActionBar";
import { Checkbox } from '@/components/ui';
import { useToast } from "@/hooks/useToast";
import { fetchDiscounts, deleteDiscount } from "@/api/discounts.js";
import SearchBar from "@/components/common/SearchBar";
import ActionMenu from "@/components/common/ActionMenu";
import { Button } from '@/components/ui';

export default function Discounts() {
  const restaurantId = useAppStore(s => s.restaurantId);
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [discountMenus, setDiscountMenus] = useState({});
  const loadDiscounts = async (opts = {}) => {
    try {
      const data = await fetchDiscounts(restaurantId, { page: opts.page || page, limit: opts.limit || limit, q: opts.q || searchQuery });
      setDiscounts(data.discounts || []);
      setTotal((data.meta && data.meta.total) || 0);
    } catch (err) {
      console.error("Failed to load discounts:", err);
      error("Failed to load discounts");
    }
  };
  useEffect(() => {
  loadDiscounts();
  }, [restaurantId])
  const handleDelete = async (discountId, discountName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete discount "${discountName}"?`
      )
    )
      return;

    try {
      await deleteDiscount(restaurantId, discountId);
      success(`Discount "${discountName}" deleted successfully!`);
      loadDiscounts();
    } catch (err) {
      console.error("Failed to delete discount:", err);
      error("Failed to delete discount");
    }
  };

  const handleSelectDiscount = (discountId) => {
    if (selectedDiscounts.includes(discountId)) setSelectedDiscounts(selectedDiscounts.filter(id => id !== discountId));
    else setSelectedDiscounts([...selectedDiscounts, discountId]);
  };

  const handleBulkDelete = async () => {
    if (selectedDiscounts.length === 0) return;
    if (!window.confirm(`Delete ${selectedDiscounts.length} discount(s)?`)) return;
    try {
      await Promise.all(selectedDiscounts.map(id => deleteDiscount(restaurantId, id)));
      setSelectedDiscounts([]);
      loadDiscounts();
    } catch (err) {
      console.error('Failed to bulk delete discounts', err);
      error('Failed to delete discounts');
    }
  };

  const filteredDiscounts = discounts; 

  const getAmountDisplay = (discount) => {
    if (discount.amountType === "percentage") {
      return `${discount.amount}%`;
    } else if (discount.amountType === "fixed") {
      return `₫${discount.amount}`;
    } else if (discount.amountType === "variable_amount") {
      return "Variable amount";
    } else if (discount.amountType === "variable_percentage") {
      return "Variable %";
    }
    return "-";
  };

  return (
    <div className="p-8 pb-24 bg-gray-50 min-h-screen">
      <PageHeader
        title="Discounts"
        Icon={HiTag}
        SearchBarComponent={SearchBar}
        searchBarProps={{ value: searchQuery, onChange: setSearchQuery, placeholder: 'Search discounts...', className: 'w-72' }}
        actionLabel={<><HiPlus className="w-5 h-5" /> Create Discount</>}
        actionLink={`/restaurant/discounts/new`}
      />

      {filteredDiscounts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <HiTag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No discounts yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first discount to start offering promotions to your
            customers.
          </p>
          <Link
            to={`/restaurant/discounts/new`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            <HiPlus className="w-5 h-5" /> Create Your First Discount
          </Link>
        </div>
      ) : (
        <div className="p-4">
          <Table
            columns={[
              { key: 'select', title: (
                  <input
                    type="checkbox"
                    className="rounded border-gray-400 text-red-600 w-4 h-4"
                    checked={(discounts || []).length > 0 && selectedDiscounts.length === (discounts || []).length}
                    onChange={(e) => { if (e.target.checked) setSelectedDiscounts((discounts || []).map(c => c.id)); else setSelectedDiscounts([]); }}
                  />
                ), render: (r) => (<Checkbox checked={selectedDiscounts.includes(r.id)} onChange={(e) => { e.stopPropagation(); handleSelectDiscount(r.id); }} />) },
              { key: 'name', title: 'Discount Name', render: (r) => <div className="font-semibold text-gray-900">{r.name}</div> },
              { key: 'type', title: 'Type', render: (r) => <span className="capitalize">{r.amountType.replace('_', ' ')}</span> },
              { key: 'amount', title: 'Amount', render: (r) => getAmountDisplay(r), align: 'right' },
              { key: 'auto', title: 'Automatic', render: (r) => (r.automaticDiscount ? <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Yes</span> : <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">No</span>) },
              { key: 'status', title: 'Status', render: () => <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Active</span> },
              { key: 'actions', title: '', render: (r) => (<div className="flex justify-end"><ActionMenu isOpen={discountMenus[r.id]} onToggle={(open) => setDiscountMenus({ ...discountMenus, [r.id]: open })} editPath={`/restaurant/discounts/${r.id}/edit`} onDelete={() => handleDelete(r.id, r.name)} itemName={r.name} /></div>) },
            ]}
            data={discounts}
            loading={false}
            rowKey={'id'}
              onRowClick={(r) => navigate(`/restaurant/discounts/${r.id}/edit`)}
            pagination={{ page, limit, total }}
            onPageChange={(p) => { setSelectedDiscounts([]); setPage(p); loadDiscounts({ page: p, limit }); }}
            onLimitChange={(l) => { setSelectedDiscounts([]); setLimit(l); setPage(1); loadDiscounts({ page: 1, limit: l }); }}
          />
              
        </div>
      )}
      <BulkActionBar
        selectedCount={selectedDiscounts.length}
        onDelete={handleBulkDelete}
        onCancel={() => setSelectedDiscounts([])}
        position="bottom"
      />
    </div>
  );
}
