import React, { useState, useRef, useEffect } from "react";

/**
 * Component Dropdown Tái Sử Dụng
 * @param {Array<{value: string, label: string}>} options - Danh sách các tùy chọn.
 * @param {string} value - Giá trị hiện tại được chọn.
 * @param {function(string): void} onChange - Hàm callback khi chọn một giá trị mới.
 * @param {string} [label] - Nhãn hiển thị phía trên dropdown (Tùy chọn).
 */
const ReusableDropdown = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm flex justify-between items-center transition duration-150 ease-in-out hover:border-red-400"
        aria-haspopup="listbox" 
        aria-expanded={isOpen} 
      >
        <span>{selectedOption?.label || "Select an option"}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto divide-y divide-gray-100"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-3 cursor-pointer transition duration-100 ease-in-out ${
                value === option.value
                  ? "bg-red-50 text-red-700 font-bold"
                  : "hover:bg-gray-50"
              } flex items-center justify-between`}
              role="option" 
              aria-selected={value === option.value} 
            >
              {option.label}
              {value === option.value && (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReusableDropdown;
