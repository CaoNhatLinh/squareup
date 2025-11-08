import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiPencilSquare, HiTrash } from "react-icons/hi2";
import { HiDotsHorizontal } from "react-icons/hi";
export default function ActionMenu({
  isOpen,
  onToggle,
  editPath,
  onDelete,
  itemName = "this item",
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onToggle(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("scroll", handleClickOutside);
      };
    }
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        className={`p-2 rounded-full transition-all duration-200 ease-in-out ${
          isOpen
            ? "bg-red-100 text-red-700 shadow-sm" 
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700" 
        }`}
        aria-label={`Actions for ${itemName}`}
      >
        <HiDotsHorizontal className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
          
          <Link
            to={editPath}
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150" // padding, font và hover mới
            onClick={() => onToggle(false)}
          >
            <HiPencilSquare className="w-4 h-4 flex-shrink-0 text-gray-500 hover:text-red-700" />
           Edit
          </Link>
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete ${itemName}? This action cannot be undone.`
                )
              ) {
                onDelete();
              }
              onToggle(false);
            }}
            className="flex items-center gap-3 w-full text-left px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 border-t border-gray-100" // padding, font và hover mới, border mỏng hơn
          >
            <HiTrash className="w-4 h-4 flex-shrink-0 text-red-500" />
             Delete
          </button>
        </div>
      )}
    </div>
  );
}
