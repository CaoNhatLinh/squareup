export default function ListEmpty({ title = 'No items', subtitle = '', actionLabel, onAction }) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      {actionLabel && (
        <div className="mt-6">
          <button onClick={onAction} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
