import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
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
    return modifiers.filter((m) =>
      (m.name || "").toLowerCase().includes(searchQuery.toLowerCase())
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
    if (!window.confirm("Delete this modifier set?")) return;
    try {
      await deleteModifier(user.uid, modifierId);
      refetch();
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
        `Delete ${selectedModifiers.length} selected modifier set(s)?`
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
    <div className="p-6 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Modifier sets</h1>
        <div className="flex items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search modifiers"
          />
          <Link
            to="/modifiers/new"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <HiPlus className="w-4 h-4" />
            Create modifier
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 ">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={
                    (filteredModifiers || []).length > 0 &&
                    selectedModifiers.length ===
                      (filteredModifiers || []).length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Modifier Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Display name
              </th>
              <th className="px-6 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  Loading modifiers...
                </td>
              </tr>
            ) : filteredModifiers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No modifiers yet. Create your first modifier!
                </td>
              </tr>
            ) : (
              filteredModifiers.map((modifier) => (
                <tr key={modifier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedModifiers.includes(modifier.id)}
                      onChange={() =>
                        setSelectedModifiers((prev) =>
                          prev.includes(modifier.id)
                            ? prev.filter((id) => id !== modifier.id)
                            : [...prev, modifier.id]
                        )
                      }
                    />
                  </td>
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => navigate(`/modifiers/${modifier.id}/edit`)}
                  >
                    <div className="font-medium">{modifier.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {modifier.displayName || ""}
                  </td>
                
                  <td
                    className="px-6 py-4 "
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionMenu
                        isOpen={itemMenus[modifier.id]}
                        onToggle={(open) =>
                          setItemMenus({ ...itemMenus, [modifier.id]: open })
                        }
                        editPath={`/modifiers/${modifier.id}/edit`}
                        onDelete={() => handleDeleteModifier(modifier.id)}
                        itemName={modifier.name}
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
