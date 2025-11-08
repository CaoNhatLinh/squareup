import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiPlus,
  HiOutlineSquares2X2,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2"; 
import { useAuth } from "../../hooks/useAuth";

import { fetchModifiers, deleteModifier } from "../../api/modifers";
import SearchBar from "../../components/common/SearchBar";
import BulkActionBar from "../../components/common/BulkActionBar";
import ActionMenu from "../../components/common/ActionMenu";

export default function Modifiers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [itemMenus, setItemMenus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    fetchModifiers(user.uid)
      .then((data) => setModifiers(Object.values(data || {})))
      .catch((err) => console.error("Failed to load modifiers", err))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const filteredModifiers = React.useMemo(() => {
    if (!modifiers) return [];
    return modifiers.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.displayName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [modifiers, searchQuery]);

  const refetch = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await fetchModifiers(user.uid);
      setModifiers(Object.values(data || {}));
    } catch (err) {
      console.error("Failed to refetch modifiers:", err);
    } finally {
      setLoading(false);
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
      await deleteModifier(user.uid, modifierId);
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
        selectedModifiers.map((id) => deleteModifier(user.uid, id))
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
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <HiOutlineAdjustmentsHorizontal className="w-10 h-10 text-red-600" />

          <h1 className="text-4xl font-extrabold text-gray-900">
            Modifier Sets
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search modifier sets..."
            className="w-72" 
          />

          <Link
            to="/modifiers/new"
            className="px-6 py-3 text-base font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <HiPlus className="w-5 h-5" /> New Modifier Set
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
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
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-base text-gray-500"
                >
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-red-600 mb-2"></div>
                  <p>Loading modifier sets...</p>
                </td>
              </tr>
            ) : filteredModifiers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-base text-gray-500"
                >
                  <p className="mb-2">No modifier sets found.</p>

                  <Link
                    to="/modifiers/new"
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
                  onClick={() => navigate(`/modifiers/${modifier.id}/edit`)}
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
                        editPath={`/modifiers/${modifier.id}/edit`}
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
