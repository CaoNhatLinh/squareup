import { HiPencil, HiSwitchHorizontal, HiChevronUp, HiChevronDown, HiDuplicate, HiTrash } from 'react-icons/hi';

export default function InlineToolbar({ onEdit, onQuickSwap, onMoveUp, onMoveDown, onDuplicate, onRemove }) {
  return (
    <div className="absolute top-2 right-2 z-50 flex items-center gap-2 bg-white/95 border border-gray-200 rounded-md shadow-sm p-1">
      <button title="Edit" onClick={onEdit} className="p-1 rounded hover:bg-gray-100">
        <HiPencil className="w-4 h-4 text-gray-700" />
      </button>
      <button title="Swap Variant" onClick={onQuickSwap} className="p-1 rounded hover:bg-gray-100">
        <HiSwitchHorizontal className="w-4 h-4 text-gray-700" />
      </button>
      <button title="Move Up" onClick={onMoveUp} className="p-1 rounded hover:bg-gray-100">
        <HiChevronUp className="w-4 h-4 text-gray-700" />
      </button>
      <button title="Move Down" onClick={onMoveDown} className="p-1 rounded hover:bg-gray-100">
        <HiChevronDown className="w-4 h-4 text-gray-700" />
      </button>
      <button title="Duplicate" onClick={onDuplicate} className="p-1 rounded hover:bg-gray-100">
        <HiDuplicate className="w-4 h-4 text-gray-700" />
      </button>
      <button title="Remove" onClick={onRemove} className="p-1 rounded hover:bg-red-50">
        <HiTrash className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
}
