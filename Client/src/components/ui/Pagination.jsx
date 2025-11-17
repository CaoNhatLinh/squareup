import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Dropdown from "./Dropdown";
import Button from "./Button";
/**
 * Component Phân trang đơn giản, trực quan và đẹp mắt.
 * Sử dụng các phần tử HTML cơ bản.
 * * Props:
 * - currentPage: Trang hiện tại
 * - totalPages: Tổng số trang
 * - totalItems: Tổng số mục
 * - itemsPerPage: Số mục trên mỗi trang (để tính toán thông tin hiển thị)
 * - onPageChange(page): Hàm xử lý khi chuyển trang
 * - onLimitChange(limit): Hàm xử lý khi thay đổi giới hạn
 * - className: Lớp CSS tùy chỉnh cho container
 */
const Pagination = ({
  currentPage = 1,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  onLimitChange,
  className = "",
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Ẩn toàn bộ nếu chỉ có 1 trang và không có mục nào
  if (totalPages <= 1 && totalItems === 0) return null;

  // Logic hiển thị số trang tinh gọn
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Chỉ hiển thị tối đa 5 nút số trang

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }

      if (end < totalPages - 1) pages.push("...");

      pages.push(totalPages);
    }

    // Đảm bảo không có '...' trùng lặp hoặc ở cạnh nhau
    return pages.filter(
      (page, index, arr) => page !== "..." || arr[index - 1] !== "..."
    );
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl${className}`}
    >
      <div className="flex items-center gap-4">
        {totalItems > 0 && (
          <div className="text-sm text-gray-600 whitespace-nowrap">
            Display <span className="font-bold text-red-600">{startItem}</span>{" "}
            to <span className="font-bold text-red-600">{endItem}</span> of{" "}
            <span className="font-bold text-red-600">{totalItems}</span> items
          </div>
        )}
        <Dropdown
          value={itemsPerPage}
          onChange={(val) => {
            onLimitChange && onLimitChange(parseInt(val, 10));
            onPageChange && onPageChange(1);
          }}
          options={[
            { value: 10, label: "10" },
            { value: 25, label: "25" },
            { value: 50, label: "50" },
          ]}
          className="border px-3 py-2 rounded"
        />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="link"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 disabled:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
        >
          <FaChevronLeft />
        </Button>

        <div className="flex gap-1 items-center mx-1">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-gray-500 font-medium"
              >
                ...
              </span>
            ) : currentPage === page ? (
              <Button
                variant="primary"
                key={page}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <Button
                variant="ghost"
                key={page}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button
          variant="link"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 disabled:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
        >
          <FaChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
