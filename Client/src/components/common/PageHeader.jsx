import { Link, useNavigate } from 'react-router-dom';


















export default function PageHeader({
  title,
  subtitle,
  Icon,
  iconClassName = 'w-10 h-10 text-red-600',
  showBack = false,
  onBack,
  backTo,
  SearchBarComponent,
  searchBarProps,
  actionLabel,
  actionLink,
  onAction,
  actionClassName = '',
  rightChildren,
  className = '',
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof onBack === 'function') return onBack();
    if (typeof backTo === 'string') return navigate(backTo);
    return navigate(-1);
  };

  return (
    <div className={`mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-50"
            aria-label="Back"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {Icon && (
          <div className="flex-shrink-0">
            <Icon className={iconClassName} />
          </div>
        )}

        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {SearchBarComponent && <SearchBarComponent {...(searchBarProps || {})} />}

        {rightChildren}

        {actionLabel && (
          actionLink ? (
            <Link
              to={actionLink}
              className={`px-6 py-3 text-base font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg ${actionClassName}`}
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              type="button"
              className={`px-6 py-3 text-base font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg ${actionClassName}`}
            >
              {actionLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}
