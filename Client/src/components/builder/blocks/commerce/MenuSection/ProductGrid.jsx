import ProductCardTemplate from '@/components/builder/blocks/commerce/MenuSection/ProductCardTemplate';
import StyledText from '@/components/builder/atoms/StyledText';


export default function ProductGrid({ 
  items = [], 
  config = {}, 
  cardConfig = {}, 
  globalStyles = {} 
  , blockId
  , sectionLayout = 'standard'
  , onAddToCart
  , activeDiscounts
  , onItemClick
  , onQuickAdd
  , isPublic = false
}) {
  const {
    columns = 3, 
    gap = 'medium', 
    pagination = 'load-more', 
  } = config;

  
  const gapMap = {
    small: 'gap-3 md:gap-4',
    medium: 'gap-4 md:gap-6',
    large: 'gap-6 md:gap-8',
  };

  
  const getGridCols = (cols, layout) => {
    const requested = parseInt(cols) || 3;
    
    const isSplit = layout === 'split';
    const capped = isSplit ? Math.min(requested, 2) : requested;

    
    switch (capped) {
      case 1: 
        return 'grid-cols-1';
      case 2: 
        return 'grid-cols-1 sm:grid-cols-2'; 
      case 3: 
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'; 
      case 4: 
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; 
      default: 
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 mx-4">
        <StyledText tag="p" className="text-gray-500" styleConfig={{ fontFamily: globalStyles?.typography?.bodyFont }}>
            No items found.
        </StyledText>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`grid ${getGridCols(columns, sectionLayout)} ${gapMap[gap] || gapMap.medium} items-stretch`}
      >
        {items.map((item, index) => {
          const compactAndSplit = (cardConfig?.preset === 'compact' && sectionLayout === 'split');
          return (
            <div
              key={item.id || index}
              className={`flex flex-col h-full ${compactAndSplit ? 'min-w-0' : ''}`}
            >
              <ProductCardTemplate
                item={item}
                config={cardConfig}
                globalStyles={globalStyles}
                blockId={blockId}
                sectionLayout={sectionLayout} 
                onAddToCart={onAddToCart}
                activeDiscounts={activeDiscounts}
                onItemClick={onItemClick}
                onQuickAdd={onQuickAdd}
                isPublic={isPublic}
                index={index}
              />
            </div>
          );
        })}
      </div>
      {pagination === 'load-more' && items.length > 6 && (
        <div className="mt-8 md:mt-12 text-center">
          <button className="px-6 py-3 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors active:scale-95">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}