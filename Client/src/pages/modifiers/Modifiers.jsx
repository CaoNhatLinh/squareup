import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLoaderData, useParams } from "react-router-dom";
import {
  HiPlus,
  HiOutlineSquares2X2,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";
import PageHeader from '@/components/common/PageHeader';

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
  const [modifiers, setModifiers] = useState(loaderData?.modifiers || []);
  const [itemMenus, setItemMenus] = useState({});

  useEffect(() => {
    if (loaderData?.modifiers) {
      setModifiers(loaderData.modifiers);
    }
  }, [loaderData]);

  const filteredModifiers = React.useMemo(() => {
    if (!modifiers) return [];
    return modifiers.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.displayName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [modifiers, searchQuery]);

  const refetch = async () => {
    if (!restaurantId) return;
    try {
      const data = await fetchModifiers(restaurantId);
      setModifiers(Object.values(data || {}));
    } catch (err) {
      console.error("Failed to refetch modifiers:", err);
    }
  };

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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-400 text-red-600 w-4 h-4"
                  checked={
                    (filteredModifiers || []).length > 0 &&
                    selectedModifiers.length ===
                      (filteredModifiers || []).length
                  }
                  onChange={handleSelectAll}
                />
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Display Name
              </th>

              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                System Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Configuration
              </th>
              <th className="px-6 py-4 w-16">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredModifiers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-base text-gray-500"
                >
                  <p className="mb-2">No modifier sets found.</p>

                  <Link
                    to={`/${restaurantId}/modifiers/new`}
                    className="text-red-600 hover:text-red-800 font-medium flex items-center justify-center gap-1"
                  >
                    <HiPlus className="w-4 h-4" /> Create your first one!
                  </Link>
                </td>
              </tr>
            ) : (
              filteredModifiers.map((modifier) => (
                <tr
                  key={modifier.id}
                  className="group hover:bg-red-50/30 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate(`/${restaurantId}/modifiers/${modifier.id}/edit`)}
                >
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded-md border-gray-300 text-red-600 shadow-sm focus:border-red-300 w-4 h-4 "
                      checked={selectedModifiers.includes(modifier.id)}
                      onChange={() =>
                        setSelectedModifiers((prev) =>
                          prev.includes(modifier.id)
                            ? prev.filter((id) => id !== modifier.id)
                            : [...prev, modifier.id]
                        )
                      }
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </td>

                  <td className="px-6 py-4 font-semibold text-lg text-gray-900">
                    {modifier.displayName || modifier.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                      {modifier.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          modifier.selectionType === "single"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {modifier.selectionType === "single"
                          ? "Single Select"
                          : "Multi Select"}
                      </span>
                      {modifier.required && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                          REQUIRED
                        </span>
                      )}
                    </div>
                  </td>

                  <td
                    className="px-6 py-4 "
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex justify-end"
                    >
                      <ActionMenu
                        isOpen={itemMenus[modifier.id]}
                        onToggle={(open) =>
                          setItemMenus({ ...itemMenus, [modifier.id]: open })
                        }
                        editPath={`/${restaurantId}/modifiers/${modifier.id}/edit`}
                        onDelete={() => handleDeleteModifier(modifier.id)}
                        itemName={modifier.displayName || modifier.name}
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
        selectedCount={selectedModifiers.length}
        onDelete={handleBulkDelete}
        onCancel={() => setSelectedModifiers([])}
        position="bottom"
      />
    </div>
  );
}
