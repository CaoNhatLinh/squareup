import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { HiOutlineInbox, HiChevronUp, HiChevronDown } from 'react-icons/hi';


export default function Table({
  columns = [],
  data = [],
  loading = false,
  rowKey = 'id',
  onRowClick,
  pagination,
  onPageChange,
  onLimitChange,
  emptyMessage = 'No records',
  className = '',
  sortBy,
  sortDir,
  onSortChange,
}) {
  const getRowKey = (r, i) => (typeof rowKey === 'function' ? rowKey(r) : r[rowKey] ?? i);
  return (
    <div className={`bg-white rounded-2xl shadow-sm  border border-gray-100 ${className}`}>
      <div className="overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <tr>
              {columns.map((col) => {
                const isCurrentSort = sortBy === col.key;
                const sortIcon = isCurrentSort ? (
                  sortDir === 'asc' ? <HiChevronUp className="w-4 h-4 text-red-600" /> : <HiChevronDown className="w-4 h-4 text-red-600" />
                ) : (
                  <HiChevronUp className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                );

                return (
                  <th
                    key={col.key || col.title}
                    className={`px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1">
                      {col.sortable ? (
                        <button
                          onClick={() => onSortChange && onSortChange(col.key)}
                          className={`flex items-center gap-1 transition-colors duration-200 group ${isCurrentSort ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                            }`}
                        >
                          <span>{col.title}</span>
                          {sortIcon}
                        </button>
                      ) : (
                        <span>{col.title}</span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner className="w-8 h-8 text-red-600" />
                    <div className="text-base text-gray-600 mt-2 font-medium">Loading...</div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 p-8 bg-gray-50 rounded-xl max-w-sm mx-auto border border-gray-200">
                    <HiOutlineInbox className="w-8 h-8 text-red-500" />
                    <div className="text-lg text-gray-700 font-medium">{emptyMessage}</div>
                    <p className="text-sm text-gray-500">No data found for your search.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={getRowKey(row, idx)}
                  onClick={() => (onRowClick ? onRowClick(row) : null)}
                  className={`transition-all duration-300 ${onRowClick ? 'cursor-pointer hover:bg-red-50/70' : 'hover:bg-gray-50'
                    } ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key || col.title}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${col.className || ''} ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {col.render ? col.render(row) : row[col.key] ?? <span className="text-gray-400 italic">—</span>}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Showing <span className="font-semibold text-gray-900">{Math.min(pagination.total, (pagination.page - 1) * pagination.limit + 1)}</span> to <span className="font-semibold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-red-600">{pagination.total}</span> records</div>
            <Pagination
              currentPage={pagination.page}
              totalPages={Math.max(1, Math.ceil(pagination.total / (pagination.limit || 10)))}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(p) => onPageChange && onPageChange(p)}
              onLimitChange={(l) => onLimitChange && onLimitChange(l)}
            />
          </div>
        </div>
      )}
    </div>
  );
}