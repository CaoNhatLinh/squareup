import React from "react";
import { HiOutlineTrash } from "react-icons/hi2";

export default function BulkActionBar({
  selectedCount,
  onDelete,
  onCancel,
  position = "bottom",
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`${
        position === "bottom"
          ? "fixed bottom-0 left-0 md:left-[256px] right-0"
          : "mb-4"
      } bg-red-600 text-white shadow-2xl z-50 transition-transform duration-300 transform translate-y-0`}
    >
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-base font-bold">
          {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
        </span>

        <div className="flex gap-3">
          <button
            onClick={onDelete}
            className="px-5 py-2 text-sm font-semibold bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-md"
          >
            <HiOutlineTrash className="w-5 h-5" /> Delete Selected
          </button>

          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm font-medium bg-red-700 hover:bg-red-800 rounded-lg transition-colors" 
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
