import React from 'react';
import { HiCheck } from 'react-icons/hi';

const Checkbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  helperText,
  size = 'medium',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  const iconSizeStyles = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5',
  };

  const labelSizeStyles = {
    small: 'text-sm',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div className={className}>
      <label className="inline-flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={[
              sizeStyles[size],
              'rounded border-2 transition-all duration-200 flex items-center justify-center',
              checked ? 'bg-indigo-600 border-indigo-600' : error ? 'border-red-300 bg-white' : 'border-gray-300 bg-white',
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              !checked && !disabled && 'hover:border-indigo-500'
            ].filter(Boolean).join(' ')}
          >
            {checked && (
              <HiCheck className={`${iconSizeStyles[size]} text-white`} />
            )}
          </div>
        </div>
        {label && (
          <span
            className={`
              ml-2 ${labelSizeStyles[size]}
              ${disabled ? 'text-gray-400' : error ? 'text-red-600' : 'text-gray-700'}
            `}
          >
            {label}
          </span>
        )}
      </label>
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Checkbox;
