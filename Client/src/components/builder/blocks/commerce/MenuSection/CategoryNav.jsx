import { HiViewGrid } from 'react-icons/hi';
import { resolveColor } from '@/components/builder/utils/colorUtils';
import StyledText from '@/components/builder/atoms/StyledText';

export default function CategoryNav({
  categories = [],
  activeCategory,
  onSelect,
  config = {},
  globalStyles = {},
  blockId,
  vertical = false,
}) {
  const {
    style = 'tabs',
    isSticky = false,
    spacing = 'medium',
    showIcons = false,
    showCount = false,
    highlightStyle = 'underline',
    alignment = 'center',
  } = config;


  const primaryColor = resolveColor('primary', globalStyles, '#F97316');
  const spacingMap = { small: 'gap-2', medium: 'gap-4', large: 'gap-6' };
  const alignMap = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };

  return (
    <div
      className={`w-full z-30 transition-all duration-300 ${isSticky ? 'sticky top-20 bg-white/95 backdrop-blur-sm shadow-sm py-3' : 'relative py-4'}`}
      data-control="nav-container"
      data-block-id={blockId}
    >
      <div
        className={vertical ? `flex flex-col items-start ${spacingMap[spacing]} px-2` : `flex flex-nowrap items-center ${alignMap[alignment]} ${spacingMap[spacing]} px-4 overflow-x-auto no-scrollbar`}
      >

        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;

          if (style === 'tabs') {
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={`${vertical ? 'flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded-md' : 'inline-flex items-center gap-2 pb-2 px-3 py-2 text-sm font-medium transition-all whitespace-nowrap rounded-md'} ${highlightStyle === 'underline' && !vertical ? (isActive ? 'border-b-2 border-current' : 'border-b-2 border-transparent') : ''} ${highlightStyle === 'underline' && vertical ? (isActive ? 'border-l-4 border-current pl-2' : 'border-l-4 border-transparent pl-2') : ''} ${highlightStyle === 'background' ? (isActive ? 'bg-gray-100' : 'hover:bg-gray-50') : ''} ${highlightStyle === 'outline' ? (isActive ? 'ring-2 ring-orange-200' : '') : ''}`}
                style={{ color: isActive ? primaryColor : undefined }}
              >
                {showIcons && <span className="mr-1">🍽️</span>}
                <StyledText tag="span" className={`${vertical ? 'truncate' : 'truncate max-w-[12rem]'}`} styleConfig={{ fontFamily: globalStyles?.typography?.bodyFont }}>{cat.name}</StyledText>
                {showCount && typeof cat.count !== 'undefined' && <span className="ml-2 text-xs text-gray-400">({cat.count})</span>}
              </button>
            );
          }

          if (style === 'pills') {
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={`${vertical ? 'w-full text-left px-3 py-2 rounded-md' : 'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-sm'} ${isActive ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={{ backgroundColor: isActive ? primaryColor : undefined }}
              >
                {showIcons && <span className="mr-2">🍽️</span>}
                <StyledText tag="span" className="truncate max-w-[12rem]" styleConfig={{ fontFamily: globalStyles?.typography?.bodyFont }}>{cat.name}</StyledText>
                {showCount && typeof cat.count !== 'undefined' && <span className="ml-2 text-xs text-gray-400">({cat.count})</span>}
              </button>
            );
          }

          if (style === 'icons') {
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={`${vertical ? 'flex flex-row items-center gap-3 p-2 rounded-md w-full' : 'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]'} ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isActive ? 'text-white' : 'bg-gray-100 text-gray-500'}`} style={{ backgroundColor: isActive ? primaryColor : undefined }}>
                  {cat.icon || <HiViewGrid />}
                </div>
                <StyledText tag="span" className={`${vertical ? 'ml-3 text-sm font-medium' : 'text-xs font-medium'} ${isActive ? 'text-gray-900' : 'text-gray-500'}`} styleConfig={{ color: isActive ? primaryColor : undefined, fontFamily: globalStyles?.typography?.bodyFont }}>{cat.name}</StyledText>
                {showCount && typeof cat.count !== 'undefined' && <span className="text-xxs text-gray-400">{cat.count}</span>}
              </button>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
