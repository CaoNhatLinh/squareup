const Skeleton = ({ variant = 'text', width, height, className = '', count = 1, ...props }) => {
  const baseStyles = 'animate-pulse bg-gray-200 rounded';

  const variantStyles = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'rounded-full',
    rect: '',
    circle: 'rounded-full',
  };

  const getVariantClasses = () => {
    if (variant === 'avatar' || variant === 'circle') {
      const size = width || height || 'w-10 h-10';
      return `${variantStyles[variant]} ${size}`;
    }
    return variantStyles[variant];
  };

  const widthClass = width ? `w-[${width}]` : '';
  const heightClass = height ? `h-[${height}]` : '';

  const skeletonElement = (
    <div
      className={`${baseStyles} ${getVariantClasses()} ${widthClass} ${heightClass} ${className}`}
      {...props}
    />
  );

  if (count === 1) return skeletonElement;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-2">
          {skeletonElement}
        </div>
      ))}
    </>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="avatar" width="40px" height="40px" />
      <div className="flex-1">
        <Skeleton variant="title" className="mb-2" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
    <Skeleton variant="text" count={3} />
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="border-b border-gray-200 bg-gray-50 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height="16px" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-b border-gray-200 p-4 last:border-b-0">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

Skeleton.Card = SkeletonCard;
Skeleton.Table = SkeletonTable;

export default Skeleton;
