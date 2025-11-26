import { useMemo } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { CardPresetSelector } from "@/components/builder/VariantSelector";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/useToast";
import { getValidImageSrc } from "@/components/builder/utils/imageUtils";
import { PALETTE_OPTIONS } from "@/components/builder/blockTypes";
import ListEditor from "@/components/builder/inputs/ListEditor";

function PaletteField({ value, onChange, globalStyles, listIndex, field }) {
  const paletteKeys = globalStyles?.palette ? Object.keys(globalStyles.palette) : [];

  let selectValue = "custom";
  if (typeof value === "string") {
    if (paletteKeys.includes(value)) {
      selectValue = value;
    } else if (value.startsWith("#")) {
      selectValue = "custom";
    } else {
      selectValue = value;
    }
  }

  const resolvedColor = useMemo(() => {
    if (typeof value === "string") {
      if (value.startsWith("#")) return value;
      return globalStyles?.palette?.[value] || "#000000";
    }
    return "#000000";
  }, [value, globalStyles?.palette]);

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "custom") {
            onChange("#000000");
          } else {
            onChange(v);
          }
        }}
        className="px-2 py-2 rounded border text-sm flex-1 min-w-[100px]"
      >
        <option value="custom">Custom (Hex)</option>
        {paletteKeys.map((k) => (
          <option key={k} value={k}>
            {PALETTE_OPTIONS.find((p) => p.value === k)?.label || k}
          </option>
        ))}
      </select>

      <div className="relative group">
        <input
          type="color"
          value={resolvedColor}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 rounded border cursor-pointer p-0 overflow-hidden"
          title="Pick Custom Color"
        />
      </div>

      {selectValue === 'custom' && (
        <Input
          key={`palette-hex-${field.name}-${String(listIndex)}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
          className="w-24 text-center"
          maxLength={7}
        />
      )}
    </div>
  );
}

function ImageField({ value, onChange, field, listIndex }) {
  const { uploadImage, uploading } = useImageUpload();
  const { success, error: showError } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImage(file);
        if (url) {
          onChange(url);
          success("Image uploaded successfully");
        }
      } catch (error) {
        console.error("Upload failed:", error);
        showError("Image upload failed");
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          key={`image-url-${field.name}-${String(listIndex)}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="flex-1 cursor-pointer">
          <Button variant="secondary" className="w-full" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
      {value && (
        <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden border">
          <img
            src={getValidImageSrc(value)}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

export default function SchemaField({ field, value, onChange, globalStyles, listIndex, block }) {
  if (field.name === 'cardConfig.preset') {
    return (
      <CardPresetSelector
        currentPreset={value}
        onChange={onChange}
      />
    );
  }

  switch (field.type) {
    case "text":
      return (
        <Input
          key={`text-${field.name}-${listIndex || 'default'}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          label={field.label}
          placeholder={field.placeholder}
        />
      );
    case "textarea":
      return (
        <Input
          key={`textarea-${field.name}-${listIndex || 'default'}`}
          as="textarea"
          rows={4}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          label={field.label}
          className="font-mono"
        />
      );
    case "palette":
    case "color":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <PaletteField value={value} onChange={onChange} globalStyles={globalStyles} listIndex={listIndex} field={field} />
        </div>
      );

    case "select": {
      let selectOptions = field.options || [];
      if (field.name === 'category' && block) {
        const filters = block.props?.filters || [];
        const allLabel = block.props?.allLabel || 'All';
        selectOptions = [{ label: allLabel, value: allLabel }];
        filters.forEach(item => {
          const category = typeof item === 'string' ? item : item.category;
          if (category && category !== allLabel) {
            selectOptions.push({ label: category, value: category });
          }
        });
        console.log('selectOptions:', selectOptions);
      }
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <select
            key={`select-${field.name}-${listIndex || 'default'}`}
            value={value}
            onChange={(e) =>
              onChange(
                selectOptions[0]?.value?.constructor === Number
                  ? parseFloat(e.target.value)
                  : e.target.value
              )
            }
            className="w-full px-3 py-2 border rounded-md text-sm bg-white"
          >
            {selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    case "number":
      return (
        <Input
          key={`number-${field.name}-${listIndex || 'default'}`}
          type="number"
          label={field.label}
          value={value === undefined || value === null ? "" : value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );

    case "range":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <div className="flex items-center gap-2">
            <input
              key={`range-slider-${field.name}-${String(listIndex)}`}
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={value || 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChange(val);
              }}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />

            <Input
              key={`range-number-${field.name}-${String(listIndex)}`}
              type="number"
              value={String(value || 0)}
              onChange={(e) => {
                let val = parseFloat(e.target.value);
                if (isNaN(val)) val = 0;
                onChange(val);
              }}
              className="w-16 text-center h-8 px-1"
            />
          </div>
        </div>
      );

    case "boolean":
      return (
        <Checkbox
          key={`boolean-${field.name}-${String(listIndex)}`}
          label={field.label}
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
      );

    case "image":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <ImageField value={value} onChange={onChange} field={field} listIndex={listIndex} />
        </div>
      );

    case "list":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <ListEditor
            value={value}
            itemSchema={field.itemSchema || []}
            onChange={onChange}
            globalStyles={globalStyles}
            field={field}
            block={block}
          />
        </div>
      );

    default:
      return null;
  }
}