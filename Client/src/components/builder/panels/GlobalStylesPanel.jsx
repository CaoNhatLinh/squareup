import { THEME_PRESETS } from '@/components/builder/themePresets';
import { PALETTE_OPTIONS } from '@/components/builder/blockTypes';
import { FONT_OPTIONS, PALETTE_KEYS } from '@/constants/builderConstants';

export default function GlobalStylesPanel({ globalStyles, onChange }) {
  const handleChange = (section, key, value) => {
    onChange({
      ...globalStyles,
      [section]: {
        ...globalStyles[section],
        [key]: value
      }
    });
  };

  const handlePaletteChange = (key, hex) => {
    const nextPalette = { ...(globalStyles.palette || {}), [key]: hex };
    const nextColors = {
      ...(globalStyles.colors || {}),
      primary: nextPalette.primary,
      onPrimary: nextPalette.onPrimary,
      secondary: nextPalette.secondary,
      onSecondary: nextPalette.onSecondary,
      background: nextPalette.background,
      text: nextPalette.text,
      surface: nextPalette.surface,
      muted: nextPalette.muted
    };
    onChange({ ...globalStyles, palette: nextPalette, colors: nextColors });
  };

  const applyPreset = (preset) => {
    const presetPalette = preset.palette || {};
    const nextPalette = {
      primary: presetPalette.primary ?? globalStyles.palette?.primary,
      onPrimary: presetPalette.onPrimary ?? globalStyles.palette?.onPrimary,
      secondary: presetPalette.secondary ?? globalStyles.palette?.secondary,
      onSecondary: presetPalette.onSecondary ?? globalStyles.palette?.onSecondary,
      background: presetPalette.background ?? globalStyles.palette?.background,
      surface: presetPalette.surface ?? globalStyles.palette?.surface,
      text: presetPalette.text ?? globalStyles.palette?.text,
      muted: presetPalette.muted ?? globalStyles.palette?.muted
    };

    const nextColors = {
      background: nextPalette.background,
      primary: nextPalette.primary,
      onPrimary: nextPalette.onPrimary,
      secondary: nextPalette.secondary,
      onSecondary: nextPalette.onSecondary,
      text: nextPalette.text,
      surface: nextPalette.surface,
      muted: nextPalette.muted
    };

    const nextTypography = { ...(globalStyles.typography || {}), headingFont: preset.font || globalStyles.typography?.headingFont };
    onChange({ ...globalStyles, palette: nextPalette, colors: nextColors, typography: nextTypography });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold">Site Styles</h3>
        <p className="text-sm text-gray-500">Global appearance settings</p>
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Color Palette</h4>
        <div className="mb-3 flex gap-2 flex-wrap">
          {THEME_PRESETS.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p)} className="flex items-center gap-2 px-3 py-2 border rounded bg-white hover:shadow-sm">
              <span style={{ backgroundColor: p.color }} className="w-6 h-6 rounded-full border" />
              <span className="text-sm">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {PALETTE_KEYS.map((key) => {
            const opt = PALETTE_OPTIONS.find(p => p.value === key);
            const label = opt ? opt.label : key;
            const hex = globalStyles.palette?.[key] || '';
            return (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => handlePaletteChange(key, e.target.value)}
                    className="h-8 w-12 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => handlePaletteChange(key, e.target.value)}
                    className="flex-1 px-3 py-1 border rounded text-sm uppercase"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Typography</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Heading Font</label>
            <select
              value={globalStyles.typography.headingFont}
              onChange={(e) => handleChange('typography', 'headingFont', e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              {FONT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Body Font</label>
            <select
              value={globalStyles.typography.bodyFont}
              onChange={(e) => handleChange('typography', 'bodyFont', e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              {FONT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
