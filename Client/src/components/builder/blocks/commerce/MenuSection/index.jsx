import { useRef, useState } from "react";
import { useShop } from "@/context/ShopContext";
import { resolveColor } from "@/components/builder/utils/colorUtils";
import CategoryNav from "@/components/builder/blocks/commerce/MenuSection/CategoryNav";
import ProductGrid from "@/components/builder/blocks/commerce/MenuSection/ProductGrid";
import ProductCardTemplate from "@/components/builder/blocks/commerce/MenuSection/ProductCardTemplate";
import StyledText from '@/components/builder/atoms/StyledText';

export default function MenuSection({
  title = "Our Menu",
  background = "white",
  paddingY = "medium",
  containerWidth = "standard",
  sectionLayout = "standard",

  navConfig = {},
  gridConfig = {},
  cardConfig = {},

  globalStyles = {},
  blockId,
  useRealData = false,
  globalUseRealData = false,
  onItemClick,
  onQuickAdd,
  isPublic = false,
  titleStyle,
  anchorId,
}) {
  const { categories, items, activeDiscounts } = useShop();
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const categoriesList = categories
    ? [
      { id: "all", name: "All Items" },
      ...Object.entries(categories).map(([key, val]) => {
        const itemCount = val.itemIds
          ? Array.isArray(val.itemIds)
            ? val.itemIds.length
            : Object.keys(val.itemIds || {}).length
          : 0;
        return { id: key, ...val, count: itemCount };
      }),
    ]
    : [{ id: "all", name: "All Items" }];

  const getFilteredItems = () => {
    if (!items) return [];

    let filtered = [];

    if (activeCategoryId === "all") {
      filtered = Object.entries(items).map(([id, item]) => ({ id, ...item }));
    } else {
      const cat = categories[activeCategoryId];
      if (cat && cat.itemIds) {
        const ids = Array.isArray(cat.itemIds)
          ? cat.itemIds
          : Object.keys(cat.itemIds);
        filtered = ids
          .map((id) => (items[id] ? { id, ...items[id] } : null))
          .filter(Boolean);
      }
    }


    const seen = new Set();
    const deduped = [];
    for (const it of filtered) {
      if (!it) continue;
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      deduped.push(it);
    }

    return deduped.filter((i) => i.available !== false);
  };

  const useReal = !!(useRealData || globalUseRealData);
  const allRealItems = getFilteredItems();
  const sampleItems = cardConfig.sampleItems || gridConfig.sampleItems || [];
  const displayItems = useReal
    ? allRealItems
    : sampleItems.length
      ? sampleItems
      : allRealItems;


  const paddingMap = {
    small: "py-8",
    medium: "py-16",
    large: "py-24",
  };

  const widthMap = {
    standard: "max-w-7xl",
    full: "max-w-full px-4",
    narrow: "max-w-4xl",
  };

  const bgColor = resolveColor(background, globalStyles, "white");
  const resolvedTitleColor = resolveColor(globalStyles?.colors?.text, globalStyles) || '#111827';

  return (
    <section
      className={`w-full relative ${paddingMap[paddingY]}`}
      style={{ backgroundColor: bgColor }}
      id={anchorId || "menu"}
      data-block-id={blockId}
    >
      <div className={`mx-auto px-4 md:px-8 ${widthMap[containerWidth]}`}>
        {title && (
          <StyledText
            tag="h2"
            className="text-3xl md:text-4xl font-bold text-center mb-8"
            styleConfig={{ ...titleStyle, color: titleStyle?.color || resolvedTitleColor }}
            data-control="title"
            data-block-id={blockId}
          >
            {title}
          </StyledText>
        )}
        {sectionLayout === "split" ? (
          <div className="flex flex-col md:flex-row md:gap-8">
            <aside className="md:w-1/4 mb-6 md:mb-0">
              <CategoryNav
                categories={categoriesList}
                activeCategory={activeCategoryId}
                onSelect={setActiveCategoryId}
                config={navConfig}
                globalStyles={globalStyles}
                blockId={blockId}
                vertical={true}
              />
            </aside>
            <div className="md:w-3/4">
              <ProductGrid
                items={displayItems}
                config={gridConfig}
                cardConfig={cardConfig}
                globalStyles={globalStyles}
                blockId={blockId}
                sectionLayout={sectionLayout}
                activeDiscounts={activeDiscounts}
                onItemClick={onItemClick}
                onQuickAdd={onQuickAdd}
                isPublic={isPublic}
              />
            </div>
          </div>
        ) : sectionLayout === "carousel" ? (
          <>
            <div className="mb-4">
              <CategoryNav
                categories={categoriesList}
                activeCategory={activeCategoryId}
                onSelect={setActiveCategoryId}
                config={navConfig}
                globalStyles={globalStyles}
                blockId={blockId}
              />
            </div>
            <CarouselView
              items={displayItems}
              cardConfig={cardConfig}
              globalStyles={globalStyles}
              blockId={blockId}
              activeDiscounts={activeDiscounts}
              onItemClick={onItemClick}
              onQuickAdd={onQuickAdd}
              isPublic={isPublic}
            />
          </>
        ) : (
          <>
            <div className="mb-8">
              <CategoryNav
                categories={categoriesList}
                activeCategory={activeCategoryId}
                onSelect={setActiveCategoryId}
                config={navConfig}
                globalStyles={globalStyles}
                blockId={blockId}
              />
            </div>
            <ProductGrid
              items={displayItems}
              config={gridConfig}
              cardConfig={cardConfig}
              globalStyles={globalStyles}
              blockId={blockId}
              sectionLayout={sectionLayout}
              activeDiscounts={activeDiscounts}
              onItemClick={onItemClick}
              onQuickAdd={onQuickAdd}
              isPublic={isPublic}
            />
          </>
        )}
      </div>
    </section>
  );
}

function CarouselView({
  items = [],
  cardConfig = {},
  globalStyles = {},
  blockId,
  onAddToCart,
  activeDiscounts,
  onItemClick,
  onQuickAdd,
  isPublic = false,
}) {
  const containerRef = useRef(null);

  const scrollBy = (dir = 1) => {
    const el =
      containerRef.current ||
      document.querySelector("#menu-carousel-" + (blockId || ""));
    if (!el) return;
    const width = el.clientWidth || window.innerWidth;
    el.scrollBy({ left: dir * width * 0.8, behavior: "smooth" });
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <StyledText tag="p" className="text-gray-500" styleConfig={{ fontFamily: globalStyles?.typography?.bodyFont }}>No items found in this category.</StyledText>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
          className="bg-white shadow rounded-full p-2 ml-1"
        >
          ‹
        </button>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <button
          aria-label="Next"
          onClick={() => scrollBy(1)}
          className="bg-white shadow rounded-full p-2 mr-1"
        >
          ›
        </button>
      </div>

      <div
        id={`menu-carousel-${blockId || ""}`}
        ref={containerRef}
        className="overflow-x-auto no-scrollbar py-2"
      >
        <div className="flex gap-4 px-2">
          {items.map((item) => (
            <div key={item.id} className="min-w-[220px] max-w-xs flex-shrink-0">
              <ProductCardTemplate
                item={item}
                config={cardConfig}
                globalStyles={globalStyles}
                blockId={blockId}
                previewMode="desktop"
                onAddToCart={onAddToCart}
                activeDiscounts={activeDiscounts}
                onItemClick={onItemClick}
                onQuickAdd={onQuickAdd}
                isPublic={isPublic}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
