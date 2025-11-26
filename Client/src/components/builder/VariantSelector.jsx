import { HiCheckCircle } from 'react-icons/hi2';
import { VARIANT_THUMBNAILS } from '@/components/builder/variantThumbnails.jsx';

const CARD_PRESETS = {
  classic: (
    <div className="w-full h-16 rounded border bg-white p-2 flex flex-col">
      <div className="h-8 bg-gray-100 rounded mb-1"></div>
      <div className="h-4 bg-gray-50 rounded w-3/4"></div>
    </div>
  ),
  'image-left': (
    <div className="w-full h-16 rounded border bg-white p-2 flex">
      <div className="w-1/3 h-full bg-gray-100 rounded mr-2"></div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="h-3 bg-gray-50 rounded mb-1 w-3/4"></div>
        <div className="h-3 bg-gray-50 rounded w-1/2"></div>
      </div>
    </div>
  ),
  compact: (
    <div className="w-full h-16 rounded border bg-white p-2 flex items-center gap-2">
      <div className="w-12 h-12 bg-gray-100 rounded"></div>
      <div className="flex-1">
        <div className="h-3 bg-gray-50 rounded mb-1 w-2/3"></div>
        <div className="h-3 bg-gray-50 rounded w-1/2"></div>
      </div>
    </div>
  ),
  cover: (
    <div className="w-full h-16 rounded border bg-gray-200 p-0 overflow-hidden">
      <div className="w-full h-full bg-gradient-to-b from-transparent to-gray-700"></div>
    </div>
  )
};

export default function VariantSelector({ blockType, currentVariant, onChange }) {
  const thumbnails = VARIANT_THUMBNAILS[blockType] || {};
  
  if (Object.keys(thumbnails).length === 0) return null;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Choose Layout
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(thumbnails).map(([variant, thumbnail]) => (
          <button
            key={variant}
            onClick={() => onChange(variant)}
            className={`relative group p-1 rounded-lg border-2 transition-all ${
              currentVariant === variant
                ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-200'
                : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            {thumbnail}
            <div className="mt-1 text-xs font-medium text-gray-600 capitalize text-center">
              {variant}
            </div>
            
            {currentVariant === variant && (
              <div className="absolute -top-2 -right-2 bg-white rounded-full text-orange-500 shadow-sm">
                <HiCheckCircle className="w-5 h-5" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CardPresetSelector({ currentPreset, onChange }) {
  const thumbnails = CARD_PRESETS || {};
  if (Object.keys(thumbnails).length === 0) return null;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">Card Preset</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(thumbnails).map(([variant, thumbnail]) => (
          <button
            key={variant}
            onClick={() => onChange(variant)}
            className={`relative group p-1 rounded-lg border-2 transition-all ${
              currentPreset === variant
                ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-200'
                : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            {thumbnail}
            <div className="mt-1 text-xs font-medium text-gray-600 capitalize text-center">{variant}</div>
            {currentPreset === variant && (
              <div className="absolute -top-2 -right-2 bg-white rounded-full text-orange-500 shadow-sm">
                <HiCheckCircle className="w-5 h-5" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
