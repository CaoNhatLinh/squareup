import { useEffect, useRef } from "react";
import { HiTrash } from "react-icons/hi";
import SchemaField from "@/components/builder/inputs/SchemaField";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NO_IMAGE_SRC } from "@/components/builder/utils/imageUtils";

const SortableItem = ({
  item,
  index,
  itemSchema,
  onChange,
  onRemove,
  fixedCount,
  globalStyles,
  field,
  block,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: String(index) });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const fieldsToShow = field?.summaryFields
    ? itemSchema.filter((s) => field.summaryFields.includes(s.name))
    : itemSchema;

  const handleFieldChange = (fieldName, val) => {
    onChange(index, fieldName, val);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="border rounded-md p-3 bg-gray-50 mb-2 relative group"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-bold text-gray-500 uppercase">
          Item {index + 1}
        </div>
        <div className="flex gap-1">
          {!fixedCount && (
            <button
              {...listeners}
              className="cursor-grab px-2 py-1 bg-white border rounded text-xs hover:bg-gray-100"
              title="Drag to reorder"
            >
              ✥
            </button>
          )}
          {!fixedCount && (
            <button
              onClick={() => onRemove(index)}
              className="px-2 py-1 bg-white border border-red-200 text-red-500 rounded text-xs hover:bg-red-50"
              title="Remove"
            >
              <HiTrash />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {fieldsToShow.map((s) => (
          <div key={s.name}>
            <SchemaField
              field={s}
              value={item[s.name]}
              onChange={(val) => handleFieldChange(s.name, val)}
              globalStyles={globalStyles}
              listIndex={index}
              block={block}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ListEditor({
  value = [],
  itemSchema = [],
  onChange,
  globalStyles,
  field,
  block,
}) {
  const list = Array.isArray(value) ? value : [];
  const fixedCount = field?.fixedCount;
  const blockRef = useRef(null);
  useEffect(() => {
    if (block) {
      blockRef.current = block;
    }
  }, [block]);
  const sensors = useSensors(useSensor(PointerSensor));
  const handleItemUpdate = (index, key, val) => {
    const next = list.map((it, i) =>
      i === index ? { ...it, [key]: val } : it
    );
    onChange(next);
  };

  const remove = (i) => {
    if (fixedCount) return;
    const next = list.filter((_, idx) => idx !== i);
    onChange(next);
  };

  const add = () => {
    if (fixedCount) return;
    const empty = {};
    console.log('🧩 blockRef.current in ListEditor add():', blockRef.current);
    itemSchema.forEach((s) => {
      if (s.type === "boolean") empty[s.name] = false;
      else if (s.type === "number") empty[s.name] = 0;
      else if (s.type === "image") {
        empty[s.name] = NO_IMAGE_SRC;
      }
      else empty[s.name] = s.default ?? "";
    });
    onChange([...list, empty]);
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);

    if (oldIndex !== newIndex) {
      const next = arrayMove(list, oldIndex, newIndex);
      onChange(next);
    }
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={list.map((_, i) => String(i))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {list.map((item, idx) => (
              <SortableItem
                key={idx}
                index={idx}
                item={item}
                itemSchema={itemSchema}
                onChange={handleItemUpdate}
                onRemove={remove}
                fixedCount={fixedCount}
                globalStyles={globalStyles}
                field={field}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-3">
        {!fixedCount && (
          <button
            onClick={add}
            className="w-full px-3 py-2 bg-white border border-dashed border-gray-300 text-gray-600 rounded-md text-sm hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            + Add Item
          </button>
        )}
      </div>
    </div>
  );
}
