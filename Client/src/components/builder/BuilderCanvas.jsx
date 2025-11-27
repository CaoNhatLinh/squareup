import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BLOCK_TYPES } from "@/components/builder/blockTypes";
import { useShop } from "@/context/ShopContext";
import HeaderBlock from "@/components/builder/blocks/core/Header";
import FooterBlock from "@/components/builder/blocks/core/Footer";
import SortableBlockItem from "@/components/builder/ui/SortableBlockItem";
import {
  useBuilderData,
  useCanvasInteractions,
} from "@/hooks/useBuilderInteractions";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { DAY_LABELS } from "@/constants/scheduleConstants";
import { HiDesktopComputer, HiTrash, HiX } from "react-icons/hi";
import { HiDevicePhoneMobile, HiDeviceTablet } from "react-icons/hi2";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";

const BuilderCanvas = ({
  restaurantId,
  layout,
  selectedBlockId,
  selectedSection,
  setSelectedSection,
  setSelectedBlockId,
  activeControl,
  setActiveControl,
  headerConfig,
  footerConfig,
  componentStyles,
  globalStyles,
  slug,
  viewMode,
  setViewMode,
  useRealDataGlobal,
  setUseRealDataGlobal,
  setLayout,
  handleDragEnd,
  handleRemoveBlock,
  handleMoveBlockUp,
  handleMoveBlockDown,
  handleDuplicateBlock,
  handleQuickSwapVariant,
  sensors,
}) => {
  const canvasRef = useRef(null);
  const headerRef = useRef(null);
  const { restaurant } = useShop();
  const [selectedFooterElement, setSelectedFooterElement] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(80);


  useEffect(() => {
    const measureHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };


    setTimeout(measureHeight, 100);


    const observer = new MutationObserver(measureHeight);
    if (headerRef.current)
      observer.observe(headerRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [headerConfig, footerConfig, globalStyles, viewMode]);


  useBuilderData(restaurantId);
  useCanvasInteractions(
    canvasRef,
    activeControl,
    selectedSection,
    selectedBlockId,
    setActiveControl,
    setSelectedSection,
    setSelectedBlockId
  );

  const themeColor = globalStyles?.colors?.primary;

  const footerData = useMemo(() => {
    if (useRealDataGlobal && restaurant) {
      return {
        name: restaurant.name || footerConfig.companyName,
        description: restaurant.description || footerConfig.companyDescription,
        address: restaurant.address || footerConfig.address,
        phone: restaurant.phone || footerConfig.phone,
        email: restaurant.email || footerConfig.email,
      };
    }
    return {
      name: footerConfig.companyName || "Restaurant Name",
      description:
        footerConfig.companyDescription ||
        "Serving the best food in town since 2010.",
      address: footerConfig.address || "123 Food Street, City",
      phone: footerConfig.phone || "(555) 123-4567",
      email: footerConfig.email || "hello@restaurant.com",
    };
  }, [useRealDataGlobal, restaurant, footerConfig]);

  const socialIcons = useMemo(() => {
    const socialSource = useRealDataGlobal
      ? restaurant?.socialMedia || footerConfig.socialLinks
      : footerConfig.socialLinks;
    let icons = [];

    const getSocialIcon = (name, url, svgIcon) => {
      if (svgIcon) {
        return (
          <div
            dangerouslySetInnerHTML={{ __html: svgIcon }}
            className="w-5 h-5 flex items-center justify-center"
            style={{
              color: "inherit",
              fill: "currentColor",
            }}
          />
        );
      }

      const lowerName = name?.toLowerCase() || "";
      const lowerUrl = url?.toLowerCase() || "";

      if (
        lowerName.includes("facebook") ||
        lowerUrl.includes("facebook.com") ||
        lowerUrl.includes("fb.com")
      ) {
        return <FaFacebook />;
      } else if (
        lowerName.includes("instagram") ||
        lowerUrl.includes("instagram.com")
      ) {
        return <FaInstagram />;
      } else if (
        lowerName.includes("tiktok") ||
        lowerUrl.includes("tiktok.com")
      ) {
        return <FaTiktok />;
      }
      return <FaFacebook />;
    };

    if (socialSource) {
      if (Array.isArray(socialSource)) {
        icons = socialSource.map((s) => ({
          ...s,
          icon: getSocialIcon(s.name, s.url, s.svgIcon),
        }));
      } else {
        if (socialSource.facebook)
          icons.push({
            name: "Facebook",
            url: socialSource.facebook,
            icon: <FaFacebook />,
          });
        if (socialSource.instagram)
          icons.push({
            name: "Instagram",
            url: socialSource.instagram,
            icon: <FaInstagram />,
          });
        if (socialSource.tiktok)
          icons.push({
            name: "TikTok",
            url: socialSource.tiktok,
            icon: <FaTiktok />,
          });
      }
    }

    if (icons.length === 0 && !useRealDataGlobal) {
      icons = [
        { name: "Facebook", url: "#", icon: <FaFacebook /> },
        { name: "Instagram", url: "#", icon: <FaInstagram /> },
      ];
    }

    return icons;
  }, [useRealDataGlobal, restaurant, footerConfig]);


  const openingHours = useMemo(() => {
    const hoursData = useRealDataGlobal
      ? restaurant?.openingHours || restaurant?.hours
      : footerConfig.openingHours;
    let array = [];
    if (Array.isArray(hoursData)) {
      array = hoursData;
    } else if (hoursData && typeof hoursData === "object") {
      array = Object.entries(hoursData).map(([day, data]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        ...data,
      }));
    }
    return array.sort((a, b) => {
      const dayOrder = DAY_LABELS.map((day) => day.label);
      return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });
  }, [useRealDataGlobal, restaurant, footerConfig]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-200 relative">
      <div className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <Button
              onClick={() => setViewMode("desktop")}
              variant="ghost"
              size="small"
              className={`p-2 rounded-md transition ${viewMode === "desktop"
                ? "bg-white shadow text-orange-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-transparent"
                }`}
              title="Desktop View"
            >
              <HiDesktopComputer className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setViewMode("tablet")}
              variant="ghost"
              size="small"
              className={`p-2 rounded-md transition ${viewMode === "tablet"
                ? "bg-white shadow text-orange-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-transparent"
                }`}
              title="Tablet View"
            >
              <HiDeviceTablet className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setViewMode("mobile")}
              variant="ghost"
              size="small"
              className={`p-2 rounded-md transition ${viewMode === "mobile"
                ? "bg-white shadow text-orange-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-transparent"
                }`}
              title="Mobile View"
            >
              <HiDevicePhoneMobile className="w-5 h-5" />
            </Button>
          </div>
          <span className="text-sm text-gray-500">
            {viewMode === "desktop" ? "Desktop Preview" : viewMode === "tablet" ? "Tablet Preview" : "Mobile Preview"}
          </span>

          <div className="ml-4 flex items-center">
            <Checkbox
              label="Use Restaurant Data"
              checked={useRealDataGlobal}
              onChange={(e) => {
                const val = e.target.checked;
                setUseRealDataGlobal(val);
                setLayout((prev) =>
                  prev.map((b) => ({
                    ...b,
                    props: { ...b.props, useRealData: val },
                  }))
                );
              }}
            />
          </div>
        </div>
        <div className="text-sm font-medium text-gray-600">
          {slug ? (
            <Button
              onClick={() => window.open(`/${slug}`, "_blank")}
              variant="ghost"
              size="small"
              className="inline-flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700"
              title="View published site"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              /{slug}
            </Button>
          ) : (
            "No URL set"
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4 flex items-start justify-center bg-gray-200/50 relative">
        <div className="relative h-full w-full max-w-5xl">
          <header
            ref={headerRef}
            className="absolute top-0 left-0 right-0 z-50 bg-white shadow-sm"
            style={{
              width: viewMode === "mobile" ? "375px" : viewMode === "tablet" ? "768px" : "100%",
              marginLeft: viewMode !== "desktop" ? "auto" : "0",
              marginRight: viewMode !== "desktop" ? "auto" : "0",
              borderRadius:
                viewMode === "mobile" ? "30px 30px 0 0" : viewMode === "tablet" ? "20px 20px 0 0" : "8px 8px 0 0",
              borderWidth:
                viewMode === "mobile" ? "8px 8px 0 8px" : viewMode === "tablet" ? "6px 6px 0 6px" : "1px 1px 0 1px",
              borderColor: viewMode !== "desktop" ? "#1f2937" : "#d1d5db",
              borderStyle: "solid",
            }}
            onClick={() => {
              setSelectedSection("header");
              setSelectedBlockId(null);
            }}
          >
            <div
              className={`relative group cursor-pointer border-b-2 border-transparent hover:border-orange-400 transition-colors ${selectedSection === "header" ? "ring-2 ring-orange-500" : ""
                }`}
            >
              <HeaderBlock
                config={headerConfig}
                globalStyles={globalStyles}
                blockId={"HEADER"}
                globalUseRealData={useRealDataGlobal}
                slug={slug}
                isPublic={false}
                onElementClick={(key) => {
                  setSelectedSection("header");
                  setSelectedBlockId(null);
                  setActiveControl({ blockId: "HEADER", controlId: key });
                }}
              />
            </div>
          </header>
          <main
            className="absolute left-0 right-0 overflow-hidden bg-white shadow-2xl"
            style={{
              top: `${headerHeight}px`,
              bottom: "0px",
              width: viewMode === "mobile" ? "375px" : viewMode === "tablet" ? "768px" : "100%",
              marginLeft: viewMode !== "desktop" ? "auto" : "0",
              marginRight: viewMode !== "desktop" ? "auto" : "0",
              borderRadius: viewMode === "mobile" ? "0" : "0",
              borderWidth:
                viewMode === "mobile" ? "0 8px 8px 8px" : viewMode === "tablet" ? "0 6px 6px 6px" : "0 1px 1px 1px",
              borderColor: viewMode !== "desktop" ? "#1f2937" : "#d1d5db",
              borderStyle: "solid",
              transform: "translate(0)", // Creates containing block for fixed elements
              contain: "paint", // Optimization and containment
            }}
          >
            <div
              ref={canvasRef}
              className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide"
              style={{ scrollBehavior: "smooth", scrollbarWidth: "thin" }}
            >
              <div
                className="flex flex-col min-h-full relative"
                style={{
                  fontFamily: globalStyles.typography.bodyFont,
                  backgroundColor: globalStyles.colors.background,
                  color: globalStyles.colors.text,
                }}
              >
                <div className="flex-1 w-full relative p-4 z-10">
                  {layout.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg bg-white/50 mt-10">
                      <p className="text-gray-500 font-medium">
                        Main Content Area
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Drag and drop blocks here
                      </p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={layout.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {layout.map((block) => (
                          <SortableBlockItem
                            key={block.id}
                            block={block}
                            globalStyles={globalStyles}
                            globalUseRealData={useRealDataGlobal}
                            viewMode={viewMode}
                            componentStyles={componentStyles}
                            themeColor={themeColor}
                            isSelected={selectedBlockId === block.id}
                            onClick={(e, controlInfo) => {
                              if (controlInfo && controlInfo.controlId) {
                                setActiveControl({
                                  blockId: block.id,
                                  controlId: controlInfo.controlId,
                                });
                              } else {
                                setSelectedBlockId(block.id);
                                setSelectedSection("block");
                                setActiveControl(null);
                              }
                            }}
                            onItemClick={(controlId) => {
                              setActiveControl({
                                blockId: block.id,
                                controlId: controlId,
                              });
                            }}
                            onRemove={handleRemoveBlock}
                            onMoveUp={handleMoveBlockUp}
                            onMoveDown={handleMoveBlockDown}
                            onDuplicate={handleDuplicateBlock}
                            onQuickSwap={handleQuickSwapVariant}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>

                <div
                  className={`mt-auto relative group cursor-pointer border-t-2 border-transparent hover:border-orange-400 transition-colors z-20 ${selectedSection === "footer" ? "ring-2 ring-orange-500" : ""
                    }`}
                  onClick={() => {
                    setSelectedSection("footer");
                    setSelectedBlockId(null);
                    setSelectedFooterElement(null);
                  }}
                >
                  <FooterBlock
                    config={footerConfig}
                    globalStyles={globalStyles}
                    restaurantData={footerData}
                    socialIcons={socialIcons}
                    openingHours={openingHours}
                    links={footerConfig.links || []}
                    onElementClick={(key) => {
                      setSelectedSection("footer");
                      setSelectedBlockId(null);
                      setSelectedFooterElement(key);
                      setActiveControl({ blockId: "FOOTER", controlId: key });
                    }}
                    selectedElement={selectedFooterElement}
                    blockId={"FOOTER"}
                  />
                </div>
              </div>
            </div>
          </main>
        </div >
      </div >
    </div >
  );
};

export default BuilderCanvas;
