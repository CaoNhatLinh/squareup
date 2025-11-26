import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HiMenu } from "react-icons/hi";
import InlineToolbar from "@/components/builder/InlineToolbar";
import { BlockRenderer } from "@/components/builder/BlockRenderer";

export default function SortableBlockItem({
  block,
  globalStyles,
  isSelected,
  onClick,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onQuickSwap,
  globalUseRealData,
  viewMode,
  componentStyles,
  themeColor,
  onItemClick,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-block-id={block.id}
      className={`relative border-2 rounded-lg p-4 mb-3 group ${
        isSelected
          ? "border-orange-500 bg-orange-50"
          : "border-transparent hover:border-orange-300 bg-white"
      } transition-all duration-200`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(block);
      }}
    >
      <div
        {...listeners}
        className="absolute top-2 left-1/2 -translate-x-1/2 p-1.5 cursor-grab active:cursor-grabbing text-gray-900 hover:text-gray-500  hover:bg-white transition-opacity z-20 bg-white/50 rounded shadow-sm"
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <HiMenu className="w-5 h-5 rotate-90" />
      </div>

      {(isSelected || isDragging) && (
        <div
          className="absolute -top-10 right-0 z-10 bg-white shadow-lg rounded-lg border p-1 flex gap-1 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <InlineToolbar
            onEdit={(e) => {
              e.stopPropagation();
            }}
            onQuickSwap={() => onQuickSwap && onQuickSwap(block)}
            onMoveUp={() => onMoveUp && onMoveUp(block)}
            onMoveDown={() => onMoveDown && onMoveDown(block)}
            onDuplicate={() => onDuplicate && onDuplicate(block)}
            onRemove={() => onRemove && onRemove(block.id)}
          />
        </div>
      )}

      <div className="pointer-events-auto">
          <BlockRenderer block={block} globalStyles={globalStyles} globalUseRealData={globalUseRealData} previewMode={viewMode} componentStyles={componentStyles} themeColor={themeColor} onItemClick={onItemClick} />
      </div>

      <div className="absolute inset-0 pointer-events-none" />
    </div>
  );
}
