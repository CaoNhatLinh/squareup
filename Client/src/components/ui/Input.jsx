import React, { forwardRef } from 'react';
import { HiExclamationCircle } from 'react-icons/hi';

const Input = forwardRef(({
  type = 'text',
  as = 'input',
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'medium',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-4 py-3 text-base',
  };

  const inputClasses = [
    'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
    LeftIcon ? 'pl-10' : '',
    RightIcon || error ? 'pr-10' : '',
    sizeStyles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        {as === 'textarea' ? (
          <textarea
            ref={ref}
            rows={props.rows || 3}
            disabled={disabled}
            required={required}
            className={inputClasses}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            required={required}
            className={inputClasses}
            {...props}
          />
        )}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <HiExclamationCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
        {!error && RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
