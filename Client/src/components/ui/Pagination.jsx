import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import Button from './Button';

const Pagination = ({
  currentPage = 1,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  showPageNumbers = true,
  showItemCount = true,
  size = 'medium',
  className = '',
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {showItemCount && (
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size={size}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon={HiChevronLeft}
          iconPosition="left"
        >
          Previous
        </Button>

        {showPageNumbers && (
          <div className="flex gap-1">
            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={[
                    'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  ].join(' ')}
                >
                  {page}
                </button>
              )
            )}
          </div>
        )}

        <Button
          variant="secondary"
          size={size}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          icon={HiChevronRight}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
