import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getModifier, updateModifier } from '../../api/modifers';
import { MdOutlineDelete, MdAdd, MdClose, MdDragIndicator } from "react-icons/md";

export default function EditModifier() {
  const { modifierId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ 
    name: '', 
    displayName: '', 
    selectionType: 'multiple', 
    required: false 
  });
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    let mounted = true;
    (async () => {
      try {
        const mod = await getModifier(user.uid, modifierId);
        if (!mounted) return;
        setFormData({ 
          name: mod.name || '', 
          displayName: mod.displayName || '',
          selectionType: mod.selectionType || 'multiple',
          required: mod.required || false
        });
        const opts = mod.options ? Object.values(mod.options) : [];
        setOptions(opts.sort((a, b) => (a.index || 0) - (b.index || 0)));
      } catch (err) {
        console.error('Failed to load modifier', err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user?.uid, modifierId]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.displayName.trim()) {
      alert('Name and Display Name are required');
      return;
    }
    setSaving(true);
    try {
      const opts = (options || []).map((o, idx) => ({ 
        ...o, 
        index: o.index !== undefined ? Number(o.index) : idx 
      }));
      
      await updateModifier(user.uid, modifierId, { 
        name: formData.name, 
        displayName: formData.displayName, 
        options: opts,
        selectionType: formData.selectionType,
        required: formData.required
      });
      navigate(-1);
    } catch (err) {
      console.error('Failed to update modifier', err);
      alert('Failed to update modifier: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };
  
  const handleDragDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === dropIndex) {
      setDraggingIndex(null);
      return;
    }

    const newOptions = [...options];
    const [moved] = newOptions.splice(draggingIndex, 1);
    newOptions.splice(dropIndex, 0, moved);

    const withIndex = newOptions.map((o, i) => ({ ...o, index: i }));
    
    setOptions(withIndex);
    setDraggingIndex(null);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const optionsValid = (options || []).every((o) => !!String(o?.name || '').trim());
  const isSaveDisabled = saving || !formData.name.trim() || !formData.displayName.trim() || !optionsValid;

  // Biến kiểm tra validation
  const isNameInvalid = !formData.name.trim();
  const isDisplayNameInvalid = !formData.displayName.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600"><MdClose className="w-6 h-6" /></button>
          <h2 className="text-xl font-semibold">Edit modifier set</h2>
          <button onClick={handleSave} disabled={isSaveDisabled} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input fields */}
          <div className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Modifier name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className={`
                  w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                  ${isNameInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                `} 
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Display name" 
                value={formData.displayName} 
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} 
                className={`
                  w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                  ${isDisplayNameInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                `} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selection Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="single"
                    checked={formData.selectionType === 'single'}
                    onChange={(e) => setFormData({ ...formData, selectionType: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Choose one option</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="multiple"
                    checked={formData.selectionType === 'multiple'}
                    onChange={(e) => setFormData({ ...formData, selectionType: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Choose multiple options</span>
                </label>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Required (customer must select)</span>
              </label>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Modifier list</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 text-xs text-gray-600 font-medium">
                <div className="w-5"></div>
                <div className="flex-1">Name</div>
                <div className="w-24">Price</div>
                <div className="w-10 text-right"></div>
              </div>
              
              <div className="space-y-1">
                {(options || []).map((opt, idx) => {
                  const isOptionNameInvalid = !String(opt.name || '').trim();
                  
                  return (
                    <div 
                      key={opt.id || idx} 
                      className={`flex gap-3 items-center px-4 py-2 border-t border-gray-100 ${draggingIndex === idx ? 'opacity-50 bg-blue-50' : 'bg-white'}`}
                      draggable
                      onDragStart={() => setDraggingIndex(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDragDrop(e, idx)}
                      onDragEnd={() => setDraggingIndex(null)}
                    >
                      <div className="text-gray-400 cursor-move">
                        <MdDragIndicator className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <input 
                          className={`
                            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                            ${isOptionNameInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                          `}
                          placeholder="Option name" 
                          value={opt.name || ''} 
                          onChange={(e) => { 
                            const next = [...options]; 
                            next[idx] = { ...next[idx], name: e.target.value }; 
                            setOptions(next); 
                          }} 
                        />
                      </div>
                      
                      <div className="w-24">
                        <input 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          placeholder="Price" 
                          type="number" 
                          step="0.01" 
                          value={opt.price || 0} 
                          onChange={(e) => { 
                            const next = [...options]; 
                            next[idx] = { ...next[idx], price: parseFloat(e.target.value || 0) }; 
                            setOptions(next); 
                          }} 
                        />
                      </div>
                      
                      <div className="w-10 flex justify-end">
                        <button 
                          className="text-red-500 hover:text-red-700 p-1" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setOptions(options.filter((_, i) => i !== idx)); 
                          }} 
                          aria-label="Remove option"
                        >
                          <MdOutlineDelete className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-gray-200">
                <button 
                  className="px-3 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 text-sm hover:bg-green-700" 
                  onClick={() => setOptions([...options, { id: `tmp_${Date.now()}`, name: '', price: 0, index: options.length }])} 
                  aria-label="Add option"
                >
                  <MdAdd className="w-4 h-4" />
                  <span>Add option</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}