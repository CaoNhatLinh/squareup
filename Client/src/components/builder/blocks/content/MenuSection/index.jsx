import { useRef, useState } from "react";
import { useShop } from "@/context/ShopContext";
import { resolveColor } from "@/components/builder/utils/colorUtils";
import CategoryNav from "@/components/builder/blocks/content/MenuSection/CategoryNav";
import ProductGrid from "@/components/builder/blocks/content/MenuSection/ProductGrid";
import ProductCardTemplate from "@/components/builder/blocks/content/MenuSection/ProductCardTemplate";
import StyledText from '@/components/builder/atoms/StyledText';
import { useContainerQuery } from "@/components/builder/hooks/useContainerQuery";

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
  const { containerRef, isMobile } = useContainerQuery();
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const categoriesList = categories
    ? [
      { id: "all", name: "All Items" },
      ...(Array.isArray(categories)
        ? categories.map((cat) => {
          const itemCount = cat.itemIds
            ? Array.isArray(cat.itemIds)
              ? cat.itemIds.length
              : Object.keys(cat.itemIds || {}).length
            : 0;
          return { ...cat, count: itemCount };
        })
        : Object.entries(categories).map(([key, val]) => {
          const itemCount = val.itemIds
            ? Array.isArray(val.itemIds)
              ? val.itemIds.length
              : Object.keys(val.itemIds || {}).length
            : 0;
          return { id: key, ...val, count: itemCount };
        })
      ),
    ]
    : [{ id: "all", name: "All Items" }];

  const getFilteredItems = () => {
    if (!items) return [];

    let filtered = [];

    if (activeCategoryId === "all") {
      filtered = Object.entries(items).map(([id, item]) => ({ id, ...item }));
    } else {
      // Handle both array and object formats for categories
      let cat;
      if (Array.isArray(categories)) {
        cat = categories.find(c => c.id === activeCategoryId);
      } else {
        cat = categories[activeCategoryId];
      }

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
      ref={containerRef}
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
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row gap-8'}`}>
            <aside className={`${isMobile ? 'w-full mb-6' : 'w-1/4'}`}>
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
            <div className={`${isMobile ? 'w-full' : 'w-3/4'}`}>
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
              isMobile={isMobile}
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
  isMobile = false,
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
      {!isMobile && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <button
            aria-label="Previous"
            onClick={() => scrollBy(-1)}
            className="bg-white shadow rounded-full p-2 ml-1"
          >
            ‹
          </button>
        </div>
      )}
      {!isMobile && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button
            aria-label="Next"
            onClick={() => scrollBy(1)}
            className="bg-white shadow rounded-full p-2 mr-1"
          >
            ›
          </button>
        </div>
      )}

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
