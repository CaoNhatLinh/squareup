export const VARIANT_THUMBNAILS = {
  HERO_BANNER: {
    overlay: (
      <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 p-2 h-full flex flex-col justify-center">
          <div className="w-4/5 h-1 bg-white rounded mb-1"></div>
          <div className="w-3/5 h-1 bg-white bg-opacity-90 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-8 h-3 bg-orange-400 rounded"></div>
            <div className="w-10 h-3 bg-white bg-opacity-20 rounded"></div>
          </div>
        </div>
      </div>
    ),
    split: (
      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 flex overflow-hidden">
        <div className="w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-2 flex flex-col justify-center">
          <div className="w-full h-1 bg-gray-800 rounded mb-1"></div>
          <div className="w-3/4 h-1 bg-gray-600 rounded mb-1"></div>
          <div className="w-2/3 h-1 bg-gray-400 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-6 h-2 bg-orange-500 rounded"></div>
            <div className="w-8 h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
      </div>
    ),
    minimal: (
      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 flex flex-col justify-center items-center p-2">
        <div className="w-4/5 h-1 bg-gray-800 rounded mb-1"></div>
        <div className="w-3/5 h-1 bg-gray-600 rounded mb-2"></div>
        <div className="flex gap-2  flex flex-col items-center">
          <div className="w-5 h-1 bg-gray-200 rounded-full"></div>
          <div className="w-3 h-1 bg-orange-500 rounded-full"></div>
        </div>
      </div>
    )
  },
  MENU_SECTION: {
    standard: (
      <div className="w-full h-16 bg-white rounded relative overflow-hidden flex flex-col p-1">
        <div className="flex items-center gap-2 px-1">
          <div className="w-20 h-3 bg-gray-200 rounded"></div>
          <div className="w-12 h-3 bg-gray-100 rounded"></div>
          <div className="w-14 h-3 bg-gray-100 rounded"></div>
        </div>
        <div className="flex mt-1 gap-2 px-1">
          <div className="w-1/3 h-8 bg-gray-100 rounded"></div>
          <div className="w-1/3 h-8 bg-gray-100 rounded"></div>
          <div className="w-1/3 h-8 bg-gray-100 rounded"></div>
        </div>
      </div>
    ),
    split: (
      <div className="w-full h-16 border rounded overflow-hidden flex">
        <div className="w-1/4 bg-gray-100 p-1 flex flex-col gap-1">
          <div className="w-full h-2 bg-gray-300 rounded"></div>
          <div className="w-full h-2 bg-gray-200 rounded"></div>
          <div className="w-full h-2 bg-gray-200 rounded"></div>
        </div>
        <div className="flex-1 p-1 grid grid-cols-2 gap-1">
          <div className="h-6 bg-gray-100 rounded"></div>
          <div className="h-6 bg-gray-100 rounded"></div>
          <div className="h-6 bg-gray-100 rounded"></div>
          <div className="h-6 bg-gray-100 rounded"></div>
        </div>
      </div>
    ),
    carousel: (
      <div className="w-full h-16 rounded border overflow-hidden flex items-center gap-2 px-2">
        <div className="w-24 h-12 bg-gray-100 rounded"></div>
        <div className="w-24 h-12 bg-gray-100 rounded"></div>
        <div className="w-24 h-12 bg-gray-100 rounded hidden md:block"></div>
      </div>
    )
  },
  FOOTER: {
    'multi-col': (
      <div className="w-full h-16 bg-white rounded relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-start p-1 flex-1">
          <div className="flex flex-col gap-0.5">
            <div className="w-3 h-0.5 bg-gray-800 rounded"></div>
            <div className="w-4 h-0.5 bg-gray-500 rounded"></div>
          </div>
          <div className="flex gap-0.5">
            <div className="w-2 h-0.5 bg-gray-500 rounded"></div>
            <div className="w-2 h-0.5 bg-gray-500 rounded"></div>
            <div className="w-2 h-0.5 bg-gray-500 rounded"></div>
          </div>
        </div>
        <div className="flex justify-between items-end p-1 flex-1">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1 bg-gray-500 rounded"></div>
            <div className="w-1.5 h-1 bg-gray-500 rounded"></div>
            <div className="w-1.5 h-1 bg-gray-500 rounded"></div>
          </div>
          <div className="w-3 h-1 bg-orange-500 rounded"></div>
        </div>
      </div>
    ),
    simple: (
      <div className="w-full h-16 bg-white rounded flex flex-col items-center justify-center">
        <div className="w-4 h-0.5 bg-gray-800 rounded mb-0.5"></div>
        <div className="w-5 h-0.5 bg-gray-500 rounded mb-1"></div>
        <div className="flex gap-0.5">
          <div className="w-1.5 h-1 bg-gray-500 rounded"></div>
          <div className="w-1.5 h-1 bg-gray-500 rounded"></div>
          <div className="w-1.5 h-1 bg-gray-500 rounded"></div>
        </div>
      </div>
    ),
    split: (
      <div className="w-full h-16 bg-white rounded flex">
        <div className="w-1/2 flex flex-col justify-center p-1">
          <div className="w-3 h-0.5 bg-gray-800 rounded mb-0.5"></div>
          <div className="w-4 h-0.5 bg-gray-500 rounded"></div>
        </div>
        <div className="w-1/2 flex flex-col justify-center items-end p-1">
          <div className="flex gap-0.5 mb-0.5">
            <div className="w-2 h-0.5 bg-gray-500 rounded"></div>
            <div className="w-2 h-0.5 bg-gray-500 rounded"></div>
          </div>
          <div className="flex gap-0.5">
            <div className="w-1 h-1 bg-gray-500 rounded"></div>
            <div className="w-1 h-1 bg-gray-500 rounded"></div>
            <div className="w-1 h-1 bg-gray-500 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  OUR_STORY: {
    'elegant-split': (
      <div className="w-full h-16 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 flex overflow-hidden">
        <div className="w-1/2 bg-gradient-to-br from-amber-50 to-orange-50 p-2 flex flex-col justify-center">
          <div className="w-4/5 h-1 bg-amber-800 rounded mb-1"></div>
          <div className="w-3/5 h-1 bg-amber-600 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-6 h-2 bg-amber-500 rounded"></div>
            <div className="w-8 h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-amber-400 rounded-full"></div>
        </div>
      </div>
    ),
    'luxury-centered': (
      <div className="w-full h-16 bg-gradient-to-br from-amber-50 to-gold-50 rounded-lg border-2 border-amber-200 flex flex-col justify-center items-center p-2">
        <div className="w-4/5 h-1 bg-amber-800 rounded mb-1"></div>
        <div className="w-3/5 h-1 bg-amber-600 rounded mb-2"></div>
        <div className="flex gap-2 flex flex-col items-center">
          <div className="w-4 h-1 bg-amber-500 rounded-full"></div>
          <div className="w-2 h-1 bg-amber-300 rounded-full"></div>
        </div>
        <div className="absolute top-2 left-2 w-2 h-2 bg-amber-400 rounded-full"></div>
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
      </div>
    ),
    'modern-asymmetric': (
      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 flex overflow-hidden relative">
        <div className="w-3/5 bg-gradient-to-br from-gray-50 to-gray-100 p-2 flex flex-col justify-center">
          <div className="w-full h-1 bg-gray-800 rounded mb-1"></div>
          <div className="w-4/5 h-1 bg-gray-600 rounded mb-1"></div>
          <div className="w-3/5 h-1 bg-gray-400 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-5 h-2 bg-amber-500 rounded"></div>
            <div className="w-7 h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-2/5 bg-gradient-to-br from-amber-500 to-orange-600 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full"></div>
        </div>
      </div>
    ),
    'classic-overlap': (
      <div className="w-full h-16 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 flex overflow-hidden relative">
        <div className="w-1/2 bg-white p-2 flex flex-col justify-center relative z-10">
          <div className="w-4/5 h-1 bg-gray-800 rounded mb-1"></div>
          <div className="w-3/5 h-1 bg-gray-600 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-6 h-2 bg-amber-500 rounded"></div>
            <div className="w-8 h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-1/2 bg-gradient-to-br from-amber-100 to-orange-100 absolute right-0 top-0 h-full transform translate-x-4 rounded-r-lg">
          <div className="absolute inset-0 bg-black bg-opacity-5"></div>
        </div>
      </div>
    ),
    'minimalist': (
      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 flex flex-col justify-center items-center p-2">
        <div className="w-4/5 h-1 bg-gray-800 rounded mb-1"></div>
        <div className="w-3/5 h-1 bg-gray-600 rounded mb-2"></div>
        <div className="flex gap-2 flex flex-col items-center">
          <div className="w-3 h-1 bg-gray-200 rounded-full"></div>
          <div className="w-2 h-1 bg-amber-500 rounded-full"></div>
        </div>
      </div>
    ),
    'premium-showcase': (
      <div className="w-full h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 flex overflow-hidden">
        <div className="w-2/5 bg-gradient-to-br from-amber-100 to-orange-100 p-2 flex flex-col justify-center">
          <div className="w-full h-1 bg-amber-800 rounded mb-1"></div>
          <div className="w-4/5 h-1 bg-amber-600 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-5 h-2 bg-amber-500 rounded"></div>
            <div className="w-6 h-2 bg-white rounded"></div>
          </div>
        </div>
        <div className="w-3/5 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-3 right-3 w-2 h-2 bg-amber-400 rounded-full"></div>
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
        </div>
      </div>
    )
  },
  LOCATION: {
    'luxury-split': (
      <div className="w-full h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 flex overflow-hidden">
        <div className="w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-2 left-2 w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
        <div className="w-1/2 bg-white p-2 flex flex-col justify-center">
          <div className="w-4/5 h-1 bg-green-800 rounded mb-1"></div>
          <div className="w-3/5 h-1 bg-green-600 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-6 h-2 bg-green-500 rounded"></div>
            <div className="w-8 h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ),
    'elegant-centered': (
      <div className="w-full h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 flex flex-col justify-center items-center p-2">
        <div className="w-4/5 h-1 bg-green-800 rounded mb-1"></div>
        <div className="w-3/5 h-1 bg-green-600 rounded mb-2"></div>
        <div className="flex gap-2 flex flex-col items-center">
          <div className="w-4 h-1 bg-green-500 rounded-full"></div>
          <div className="w-2 h-1 bg-green-300 rounded-full"></div>
        </div>
        <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full"></div>
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
      </div>
    ),
    'modern-card': (
      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 flex flex-col p-1">
        <div className="h-8 bg-green-50 rounded mb-1 border border-green-100"></div>
        <div className="h-4 bg-gray-50 rounded w-3/4 border border-gray-100"></div>
      </div>
    ),
    'classic-info': (
      <div className="w-full h-16 bg-white rounded flex flex-col items-center justify-center">
        <div className="w-4 h-0.5 bg-green-800 rounded mb-0.5"></div>
        <div className="w-5 h-0.5 bg-green-500 rounded mb-1"></div>
        <div className="flex gap-0.5">
          <div className="w-1.5 h-1 bg-green-500 rounded"></div>
          <div className="w-1.5 h-1 bg-green-500 rounded"></div>
          <div className="w-1.5 h-1 bg-green-500 rounded"></div>
        </div>
      </div>
    ),
    'premium-showcase': (
      <div className="w-full h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 flex overflow-hidden">
        <div className="w-2/5 bg-gradient-to-br from-green-100 to-emerald-100 p-2 flex flex-col justify-center">
          <div className="w-full h-1 bg-green-800 rounded mb-1"></div>
          <div className="w-4/5 h-1 bg-green-600 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-5 h-2 bg-green-500 rounded"></div>
            <div className="w-6 h-2 bg-white rounded"></div>
          </div>
        </div>
        <div className="w-3/5 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full"></div>
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
        </div>
      </div>
    ),
    'minimal-contact': (
      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 flex flex-col justify-center items-center p-2">
        <div className="w-4/5 h-1 bg-gray-800 rounded mb-1"></div>
        <div className="w-3/5 h-1 bg-gray-600 rounded mb-2"></div>
        <div className="flex gap-2 flex flex-col items-center">
          <div className="w-3 h-1 bg-gray-200 rounded-full"></div>
          <div className="w-2 h-1 bg-green-500 rounded-full"></div>
        </div>
      </div>
    )
  },
  GALLERY: {
    'premium-grid': (
      <div className="w-full h-16 bg-white rounded relative overflow-hidden flex flex-col p-1">
        <div className="flex items-center gap-2 px-1">
          <div className="w-20 h-3 bg-gray-200 rounded"></div>
          <div className="w-12 h-3 bg-gray-100 rounded"></div>
          <div className="w-14 h-3 bg-gray-100 rounded"></div>
        </div>
        <div className="flex mt-1 gap-2 px-1">
          <div className="w-1/3 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300"></div>
          <div className="w-1/3 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300"></div>
          <div className="w-1/3 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300"></div>
        </div>
      </div>
    ),
    'elegant-masonry': (
      <div className="w-full h-16 rounded border overflow-hidden flex items-center gap-2 px-2 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-16 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300"></div>
        <div className="w-20 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300"></div>
        <div className="w-18 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300"></div>
        <div className="w-16 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300 hidden md:block"></div>
      </div>
    ),
    'luxury-carousel': (
      <div className="w-full h-16 rounded border overflow-hidden flex items-center gap-2 px-2 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="w-24 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded border-2 border-amber-200"></div>
        <div className="w-24 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded border-2 border-amber-200"></div>
        <div className="w-24 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded border-2 border-amber-200 hidden md:block"></div>
        <div className="ml-2 text-amber-600 text-xs">‹ ›</div>
      </div>
    ),
    'cinematic-slider': (
      <div className="w-full h-16 rounded border overflow-hidden bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-2 border-white ml-0.5"></div>
          </div>
        </div>
      </div>
    )
  },
  PROMO_GRID: {
    banner: (
      <div className="w-full h-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 flex items-center justify-center p-2">
        <div className="text-center">
          <div className="w-4/5 h-1 bg-orange-600 rounded mb-1"></div>
          <div className="w-3/5 h-1 bg-orange-400 rounded mb-2"></div>
          <div className="flex gap-1 justify-center">
            <div className="w-2 h-2 bg-orange-500 rounded"></div>
            <div className="w-2 h-2 bg-orange-500 rounded"></div>
            <div className="w-2 h-2 bg-orange-500 rounded"></div>
          </div>
        </div>
      </div>
    ),
    popup: (
      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2 relative">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded border border-orange-200 p-2 shadow-lg">
          <div className="w-16 h-1 bg-orange-600 rounded mb-1"></div>
          <div className="w-12 h-1 bg-orange-400 rounded mb-2"></div>
          <div className="flex gap-1 justify-center">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded"></div>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded"></div>
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
      </div>
    ),
    inline: (
      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-6 bg-gradient-to-br from-orange-100 to-red-100 rounded border border-orange-200 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded"></div>
          </div>
          <div className="text-xs text-gray-600">Special Offer</div>
          <div className="w-8 h-3 bg-orange-500 rounded"></div>
        </div>
      </div>
    ),
    grid: (
      <div className="w-full h-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 grid grid-cols-2 gap-2 p-2">
        <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded border border-orange-200 flex flex-col justify-center items-center p-1">
          <div className="w-3 h-1 bg-orange-600 rounded mb-1"></div>
          <div className="w-4 h-1 bg-orange-400 rounded"></div>
        </div>
        <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded border border-orange-200 flex flex-col justify-center items-center p-1">
          <div className="w-3 h-1 bg-orange-600 rounded mb-1"></div>
          <div className="w-4 h-1 bg-orange-400 rounded"></div>
        </div>
      </div>
    )
  },
  RESTAURANT_INFO: {
    card: (
      <div className="w-full h-16 bg-white rounded-lg border border-gray-200 flex flex-col p-2">
        <div className="h-6 bg-gray-100 rounded mb-2"></div>
        <div className="h-4 bg-gray-50 rounded w-3/4 mb-1"></div>
        <div className="h-4 bg-gray-50 rounded w-1/2"></div>
      </div>
    ),
    hero: (
      <div className="w-full h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 flex items-center justify-center p-2">
        <div className="text-center">
          <div className="w-4 h-1 bg-blue-600 rounded mb-1"></div>
          <div className="w-5 h-1 bg-blue-400 rounded mb-2"></div>
          <div className="flex gap-1 justify-center">
            <div className="w-1.5 h-1 bg-blue-500 rounded"></div>
            <div className="w-1.5 h-1 bg-blue-500 rounded"></div>
            <div className="w-1.5 h-1 bg-blue-500 rounded"></div>
          </div>
        </div>
      </div>
    ),
    sidebar: (
      <div className="w-full h-16 bg-white rounded flex">
        <div className="w-1/3 bg-gray-50 p-2 flex flex-col justify-center">
          <div className="w-full h-1 bg-gray-600 rounded mb-1"></div>
          <div className="w-3/4 h-1 bg-gray-400 rounded mb-1"></div>
          <div className="w-2/3 h-1 bg-gray-400 rounded"></div>
        </div>
        <div className="w-2/3 bg-gradient-to-br from-blue-50 to-purple-50 p-2 flex flex-col justify-center">
          <div className="w-4/5 h-1 bg-blue-600 rounded mb-1"></div>
          <div className="w-3/5 h-1 bg-blue-400 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-4 h-1 bg-blue-500 rounded"></div>
            <div className="w-6 h-1 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  CATERING: {
    'luxury-packages': (
      <div className="w-full h-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 flex flex-col p-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-16 h-2 bg-orange-500 rounded"></div>
          <div className="w-12 h-2 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="h-6 bg-gradient-to-br from-orange-100 to-red-100 rounded border border-orange-200"></div>
          <div className="h-6 bg-gradient-to-br from-orange-100 to-red-100 rounded border border-orange-200"></div>
          <div className="h-6 bg-gradient-to-br from-orange-100 to-red-100 rounded border border-orange-200"></div>
        </div>
      </div>
    ),
    'elegant-services': (
      <div className="w-full h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 flex flex-col justify-center items-center p-2">
        <div className="w-4/5 h-1 bg-purple-800 rounded mb-1"></div>
        <div className="w-3/5 h-1 bg-purple-600 rounded mb-2"></div>
        <div className="flex gap-2 flex flex-col items-center">
          <div className="w-4 h-1 bg-purple-500 rounded-full"></div>
          <div className="w-2 h-1 bg-purple-300 rounded-full"></div>
        </div>
      </div>
    ),
    'premium-showcase': (
      <div className="w-full h-16 bg-gradient-to-br from-gold-50 to-amber-50 rounded-lg border-2 border-amber-300 flex overflow-hidden">
        <div className="w-2/5 bg-gradient-to-br from-amber-100 to-orange-100 p-2 flex flex-col justify-center">
          <div className="w-full h-1 bg-amber-800 rounded mb-1"></div>
          <div className="w-4/5 h-1 bg-amber-600 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-5 h-2 bg-amber-500 rounded"></div>
            <div className="w-6 h-2 bg-white rounded"></div>
          </div>
        </div>
        <div className="w-3/5 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-3 right-3 w-2 h-2 bg-amber-400 rounded-full"></div>
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
        </div>
      </div>
    )
  },
  ABOUT_US: {
    'luxury-story': (
      <div className="w-full h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 flex overflow-hidden">
        <div className="w-1/2 bg-gradient-to-br from-blue-100 to-purple-100 p-2 flex flex-col justify-center">
          <div className="w-4/5 h-1 bg-blue-800 rounded mb-1"></div>
          <div className="w-3/5 h-1 bg-blue-600 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-6 h-2 bg-blue-500 rounded"></div>
            <div className="w-8 h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full"></div>
        </div>
      </div>
    ),
    'elegant-team': (
      <div className="w-full h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 flex flex-col justify-center items-center p-2">
        <div className="w-4/5 h-1 bg-indigo-800 rounded mb-1"></div>
        <div className="w-3/5 h-1 bg-indigo-600 rounded mb-2"></div>
        <div className="grid grid-cols-3 gap-1 mt-2">
          <div className="h-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded border border-indigo-200"></div>
          <div className="h-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded border border-indigo-200"></div>
          <div className="h-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded border border-indigo-200"></div>
        </div>
      </div>
    ),
    'premium-stats': (
      <div className="w-full h-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200 flex overflow-hidden">
        <div className="w-2/5 bg-gradient-to-br from-emerald-100 to-teal-100 p-2 flex flex-col justify-center">
          <div className="w-full h-1 bg-emerald-800 rounded mb-1"></div>
          <div className="w-4/5 h-1 bg-emerald-600 rounded mb-2"></div>
          <div className="flex gap-1">
            <div className="w-5 h-2 bg-emerald-500 rounded"></div>
            <div className="w-6 h-2 bg-white rounded"></div>
          </div>
        </div>
        <div className="w-3/5 bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-400 rounded-full"></div>
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
        </div>
      </div>
    )
  }
};