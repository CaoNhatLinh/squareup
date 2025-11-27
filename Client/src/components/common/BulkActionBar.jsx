import { HiOutlineTrash } from "react-icons/hi2";
import Button from "@/components/ui/Button";

export default function BulkActionBar({
  selectedCount,
  onDelete,
  onCancel,
  position = "bottom",
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`${position === "bottom"
        ? "fixed bottom-0 left-0 md:left-[256px] right-0"
        : "mb-4"
        } bg-red-600 text-white shadow-2xl z-50 transition-transform duration-300 transform translate-y-0`}
    >
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-base font-bold">
          {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
        </span>

        <div className="flex gap-3">
          <Button
            onClick={onDelete}
            variant="secondary"
            size="small"
            icon={HiOutlineTrash}
            className="text-red-600 hover:bg-gray-100"
          >
            Delete Selected
          </Button>

          <Button
            onClick={onCancel}
            variant="primary"
            size="small"
            className="bg-red-700 hover:bg-red-800 border-none"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
