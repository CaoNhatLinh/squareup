export default function TypographyControl({ value = {}, onChange }) {
  const handle = (key, val) => onChange({ ...value, [key]: val });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-600 mb-1">Font Size (px)</label>
        <input type="number" value={value.fontSize || 16} onChange={(e) => handle('fontSize', Number(e.target.value))} className="w-full px-3 py-2 border rounded-md text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
        <select value={value.fontWeight || 400} onChange={(e) => handle('fontWeight', Number(e.target.value))} className="w-full px-3 py-2 border rounded-md text-sm">
          <option value={300}>300</option>
          <option value={400}>400</option>
          <option value={500}>500</option>
          <option value={600}>600</option>
          <option value={700}>700</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Color</label>
        <input type="color" value={value.color || '#000000'} onChange={(e) => handle('color', e.target.value)} className="h-9 w-16" />
      </div>
    </div>
  );
}
