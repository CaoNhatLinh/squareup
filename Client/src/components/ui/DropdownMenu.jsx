import React, { useState, useRef, useEffect } from 'react';

export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { isOpen, setIsOpen });
        }
        if (child.type === DropdownMenuContent) {
          return React.cloneElement(child, { isOpen, setIsOpen });
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger = ({ children, asChild, isOpen, setIsOpen, onClick }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    onClick?.(e);
  };

  if (asChild) {
    return React.cloneElement(children, {
      onClick: handleClick,
    });
  }

  return (
    <button onClick={handleClick} type="button">
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({ children, align = 'start', isOpen, setIsOpen }) => {
  if (!isOpen) return null;

  const alignmentClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };

  return (
    <div
      className={`absolute ${alignmentClasses[align]} mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        {React.Children.map(children, (child) => {
          if (child.type === DropdownMenuItem) {
            return React.cloneElement(child, { setIsOpen });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, disabled, className = '', setIsOpen }) => {
  const handleClick = (e) => {
    if (disabled) return;
    e.stopPropagation();
    onClick?.(e);
    setIsOpen?.(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${className}`}
    >
      {children}
    </button>
  );
};
