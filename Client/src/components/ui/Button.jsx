import { HiOutlineExclamationCircle } from 'react-icons/hi';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  
  btnStyle,      // 'filled' (default) | 'outline'
  btnTextColor,  // Custom text color override
  radius, 
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border-2';

  // Định nghĩa style cho dạng nền đặc (Filled)
  const filledStyles = {
    primary: 'bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700 focus:ring-red-500 shadow-sm',
    secondary: 'bg-gray-600 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-700 focus:ring-gray-500 shadow-sm', // Sửa lại secondary chuẩn hơn
    danger: 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700 hover:border-rose-700 focus:ring-rose-500 shadow-sm',
    success: 'bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 focus:ring-green-500 shadow-sm',
    warning: 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600 hover:border-amber-600 focus:ring-amber-500 shadow-sm',
    ghost: 'bg-transparent border-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'bg-transparent border-transparent text-indigo-600 hover:text-indigo-700 hover:underline p-0 shadow-none',
  };

  // Định nghĩa style cho dạng viền (Outline) - Đảo ngược màu nền và màu chữ
  const outlineStyles = {
    primary: 'bg-transparent border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
    secondary: 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-transparent border-rose-600 text-rose-600 hover:bg-rose-50 focus:ring-rose-500',
    success: 'bg-transparent border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
    warning: 'bg-transparent border-amber-500 text-amber-500 hover:bg-amber-50 focus:ring-amber-500',
    ghost: 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500', // Ghost outline giống secondary
    link: 'bg-transparent border-transparent text-indigo-600 hover:text-indigo-700',
  };

  const sizeStyles = {
    small: 'px-3 py-1 text-sm rounded-md gap-1.5',
    medium: 'px-4 py-2 text-sm rounded-lg gap-2',
    large: 'px-6 py-3 text-base rounded-lg gap-2.5',
  };

  const iconSizeStyles = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  // Xử lý logic chọn style (Filled hay Outline)
  const isOutline = btnStyle === 'outline';
  const selectedVariantClass = isOutline ? outlineStyles[variant] : filledStyles[variant];

  // Xử lý Inline Style (Custom overrides)
  const incomingStyle = props.style || {};
  const mergedStyle = {
    ...incomingStyle,
    borderRadius: radius ? `${radius}px` : incomingStyle.borderRadius,
  };

  // Nếu có btnTextColor, ta ghi đè màu chữ (và màu viền nếu là outline để đồng bộ)
  if (btnTextColor) {
    mergedStyle.color = btnTextColor;
    if (isOutline) {
      mergedStyle.borderColor = btnTextColor;
    }
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${selectedVariantClass || ''} ${sizeStyles[size] || ''} ${widthStyles} ${className}`}
      style={mergedStyle}
      {...props}
    >
      {loading && (
        <svg className={`animate-spin ${iconSizeStyles[size]}`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className={iconSizeStyles[size]} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className={iconSizeStyles[size]} />}
    </button>
  );
};

export default Button;