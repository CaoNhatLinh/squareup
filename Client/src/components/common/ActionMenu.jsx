import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiDotsVertical } from 'react-icons/hi';

export default function ActionMenu({ 
  isOpen, 
  onToggle, 
  editPath, 
  onDelete,
  itemName = 'this item'
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onToggle(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        className="text-gray-400 hover:text-gray-600 p-1"
      >
        <HiDotsVertical className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <Link
            to={editPath}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-md"
            onClick={() => onToggle(false)}
          >
            Edit
          </Link>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${itemName}?`)) {
                onDelete();
              }
              onToggle(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-md"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
