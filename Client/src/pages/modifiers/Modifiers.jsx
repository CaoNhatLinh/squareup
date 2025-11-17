import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLoaderData, useParams } from "react-router-dom";
import {
  HiPlus,
  HiOutlineSquares2X2,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";
import PageHeader from '@/components/common/PageHeader';
import Table from '@/components/ui/Table';

import { fetchModifiers, deleteModifier } from "@/api/modifers.js";
import SearchBar from "@/components/common/SearchBar";
import BulkActionBar from "@/components/common/BulkActionBar";
import ActionMenu from "@/components/common/ActionMenu";
import { LoadingSpinner, Button, Modal } from '@/components/ui';

export default function Modifiers() {
  const { restaurantId } = useParams();
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [itemMenus, setItemMenus] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchModifiers(restaurantId, { page, limit, q: searchQuery });
        setModifiers(data.modifiers || []);
        setTotal((data.meta && data.meta.total) || 0);
      } catch (err) {
        console.error('Failed to fetch modifiers:', err);
      }
    };
    load();
  }, [loaderData, restaurantId, page, limit, searchQuery]);

  const filteredModifiers = modifiers; // server-side filtered

  const refetch = async () => setPage(1);

  const handleDeleteModifier = async (modifierId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this modifier set? This action cannot be undone."
      )
    )
      return;
    try {
      await deleteModifier(restaurantId, modifierId);
      refetch();
      setSelectedModifiers(selectedModifiers.filter((id) => id !== modifierId));
    } catch (err) {
      console.error("Failed to delete modifier", err);
      alert("Failed to delete modifier");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked)
      setSelectedModifiers((filteredModifiers || []).map((m) => m.id));
    else setSelectedModifiers([]);
  };

  const handleBulkDelete = async () => {
    if (selectedModifiers.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedModifiers.length} selected modifier set(s)? This action cannot be undone.`
      )
    )
      return;
    try {
      await Promise.all(
        selectedModifiers.map((id) => deleteModifier(restaurantId, id))
      );
      setSelectedModifiers([]);
      refetch();
    } catch (err) {
      console.error("Failed bulk delete", err);
      alert("Failed to delete some modifiers");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <PageHeader
        title="Modifier Sets"
        Icon={HiOutlineAdjustmentsHorizontal}
        SearchBarComponent={SearchBar}
        searchBarProps={{ value: searchQuery, onChange: setSearchQuery, placeholder: 'Search modifier sets...', className: 'w-72' }}
        actionLabel={<><HiPlus className="w-5 h-5" /> New Modifier Set</>}
        actionLink={`/${restaurantId}/modifiers/new`}
      />
      <div className="p-4">
        <Table
          columns={[
            { key: 'select', title: (<input type="checkbox" className="rounded border-gray-400 text-red-600 w-4 h-4" checked={(modifiers || []).length > 0 && selectedModifiers.length === (modifiers || []).length} onChange={(e) => { if (e.target.checked) setSelectedModifiers((modifiers || []).map(m => m.id)); else setSelectedModifiers([]); }} />), render: (r) => (<input type="checkbox" className="rounded border-gray-400 text-red-600 w-4 h-4" checked={selectedModifiers.includes(r.id)} onChange={(e) => { e.stopPropagation(); setSelectedModifiers(prev => prev.includes(r.id) ? prev.filter(id => id !== r.id) : [...prev, r.id]); }} />) },
            { key: 'displayName', title: 'Display Name', sortable: true, render: (r) => (r.displayName || r.name) },
            { key: 'name', title: 'System Name', render: (r) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md border border-gray-200">{r.name}</span> },
            { key: 'configuration', title: 'Configuration', render: (r) => (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${r.selectionType === 'single' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{r.selectionType === 'single' ? 'Single Select' : 'Multi Select'}</span>
                  {r.required && <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">REQUIRED</span>}
                </div>
            ) },
            { key: 'actions', title: 'Actions', render: (r) => (<div className="flex justify-end"><ActionMenu isOpen={itemMenus[r.id]} onToggle={(open) => setItemMenus({ ...itemMenus, [r.id]: open })} editPath={`/${restaurantId}/modifiers/${r.id}/edit`} onDelete={() => handleDeleteModifier(r.id)} itemName={r.displayName || r.name} /></div>) }
          ]}
          data={modifiers}
          loading={false}
          rowKey={'id'}
          onRowClick={(r) => navigate(`/${restaurantId}/modifiers/${r.id}/edit`)}
          pagination={{ page, limit, total }}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          sortBy={null}
          sortDir={'asc'}
        />
      </div>
      <BulkActionBar
        selectedCount={selectedModifiers.length}
        onDelete={handleBulkDelete}
        onCancel={() => setSelectedModifiers([])}
        position="bottom"
      />
    </div>
  );
}
