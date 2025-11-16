import React from 'react';

const Avatar = ({
  src,
  alt = '',
  name,
  size = 'medium',
  shape = 'circle',
  status,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  const shapeStyles = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  const statusStyles = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500',
  };

  const statusSizeStyles = {
    small: 'w-2 h-2 border',
    medium: 'w-2.5 h-2.5 border-2',
    large: 'w-3 h-3 border-2',
    xl: 'w-3.5 h-3.5 border-2',
    '2xl': 'w-4 h-4 border-2',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={`${sizeStyles[size]} ${shapeStyles[shape]} object-cover`}
          {...props}
        />
      ) : (
        <div
          className={`${sizeStyles[size]} ${shapeStyles[shape]} bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold`}
          {...props}
        >
          {getInitials(name || alt)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizeStyles[size]} ${statusStyles[status]} ${shapeStyles[shape]} border-white`}
        />
      )}
    </div>
  );
};

const AvatarGroup = ({ children, max = 3, size = 'medium', className = '' }) => {
  const childrenArray = React.Children.toArray(children);
  const displayedChildren = childrenArray.slice(0, max);
  const remaining = childrenArray.length - max;

  const overlapStyles = {
    small: '-space-x-2',
    medium: '-space-x-3',
    large: '-space-x-4',
    xl: '-space-x-5',
    '2xl': '-space-x-6',
  };

  return (
    <div className={`flex items-center ${overlapStyles[size]} ${className}`}>
      {displayedChildren.map((child, index) => (
        <div
          key={index}
          className="relative ring-2 ring-white rounded-full"
          style={{ zIndex: max - index }}
        >
          {React.cloneElement(child, { size })}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`${
            {
              small: 'w-8 h-8 text-xs',
              medium: 'w-10 h-10 text-sm',
              large: 'w-12 h-12 text-base',
              xl: 'w-16 h-16 text-lg',
              '2xl': 'w-20 h-20 text-xl',
            }[size]
          } rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold ring-2 ring-white`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

Avatar.Group = AvatarGroup;

export default Avatar;
