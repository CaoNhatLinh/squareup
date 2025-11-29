import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { resolveColor } from "@/components/builder/utils/colorUtils";
import { getValidImageSrc } from "@/components/builder/utils/imageUtils";
import StyledText from "@/components/builder/atoms/StyledText";
import { useContainerQuery } from "@/components/builder/hooks/useContainerQuery";
export default function Gallery({
  title,
  images = [],
  layout = "premium-grid",
  columns = 3,
  gap = "medium",
  showCaptions = true,
  enableLightbox = true,
  showFilters = false,
  filters = ["All"],
  allLabel = "All",
  showBadge = true,
  backgroundColor = "background",
  textColor = "text",
  showNavigation = true,
  navStyle = "tabs",
  navPosition = "top",
  navAlignment = "center",
  navSpacing = "medium",
  globalStyles,
  blockId,
  onItemClick,
  anchorId,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState(allLabel);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [focusedImageIndex, setFocusedImageIndex] = useState(-1);
  const autoPlayRef = useRef(null);
  const { containerRef, isMobile, isTablet } = useContainerQuery();
  const getColor = (colorKey) => {
    return resolveColor(colorKey, globalStyles);
  };
  const processedFilters = Array.isArray(filters)
    ? filters
      .map((f) => (typeof f === "string" ? f : f.category))
      .filter((f) => f)
    : ["All"];
  const allFilters = [
    allLabel,
    ...processedFilters.filter((f) => f !== allLabel),
  ];
  const getGridCols = (cols) => {
    if (isMobile) return 'grid-cols-1';
    if (isTablet) return cols >= 2 ? 'grid-cols-2' : 'grid-cols-1';
    if (cols === 2) return 'grid-cols-2';
    if (cols === 3) return 'grid-cols-3';
    if (cols === 4) return 'grid-cols-4';
    return 'grid-cols-3';
  };
  const getMasonryCols = (cols) => {
    if (isMobile) return 'columns-1';
    if (isTablet) return cols >= 2 ? 'columns-2' : 'columns-1';
    if (cols === 2) return 'columns-2';
    if (cols === 3) return 'columns-3';
    if (cols === 4) return 'columns-4';
    return 'columns-3';
  };
  const gapClasses = {
    small: "gap-2",
    medium: "gap-4",
    large: "gap-6",
  };
  const navSpacingClasses = {
    small: "gap-2",
    medium: "gap-4",
    large: "gap-6",
  };
  const gapSpaceY = {
    small: "space-y-2",
    medium: "space-y-4",
    large: "space-y-6",
  };
  const gapPx = {
    small: 16,
    medium: 24,
    large: 32,
  };
  const getCarouselBreakpoints = (cols, gapSize) => {
    const space = gapPx[gapSize];
    return {
      640: { slidesPerView: 1, spaceBetween: space },
      768: { slidesPerView: Math.min(2, cols), spaceBetween: space },
      1024: { slidesPerView: Math.min(3, cols), spaceBetween: space },
      1280: { slidesPerView: cols, spaceBetween: space },
    };
  };
  const filteredImages =
    activeFilter === allLabel
      ? images
      : images.filter((img) => {
        const imgCategory = img.category || allLabel;
        return imgCategory === activeFilter;
      });
  useEffect(() => {
    if (
      layout === "cinematic-slider" &&
      isAutoPlaying &&
      filteredImages.length > 1
    ) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % filteredImages.length);
      }, 4000);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [layout, isAutoPlaying, filteredImages.length]);
  useEffect(() => {
    setCurrentSlide(0);
  }, [layout, activeFilter]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (layout === "premium-grid" && filteredImages.length > 0) {
        const maxIndex = filteredImages.length - 1;
        let newIndex = focusedImageIndex;
        switch (event.key) {
          case "ArrowRight":
            event.preventDefault();
            newIndex = Math.min(focusedImageIndex + 1, maxIndex);
            break;
          case "ArrowLeft":
            event.preventDefault();
            newIndex = Math.max(focusedImageIndex - 1, 0);
            break;
          case "ArrowDown":
            event.preventDefault();
            newIndex = Math.min(focusedImageIndex + columns, maxIndex);
            break;
          case "ArrowUp":
            event.preventDefault();
            newIndex = Math.max(focusedImageIndex - columns, 0);
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            if (focusedImageIndex >= 0 && focusedImageIndex <= maxIndex) {
              const img = filteredImages[focusedImageIndex];
              if (onItemClick) {
                onItemClick(`gallery-image-${focusedImageIndex}`);
              } else if (enableLightbox) {
                setSelectedImage(img);
              }
            }
            break;
          case "Escape":
            event.preventDefault();
            setFocusedImageIndex(-1);
            break;
          default:
            return;
        }
        if (newIndex !== focusedImageIndex) {
          setFocusedImageIndex(newIndex);
        }
      }
    };
    if (layout === "premium-grid") {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [
    layout,
    focusedImageIndex,
    filteredImages,
    columns,
    enableLightbox,
    onItemClick,
  ]);
  const handleItemClick = (img, index) => {
    if (onItemClick) {
      onItemClick(`gallery-image-${index}`);
    } else if (enableLightbox) {
      openLightbox(img);
    }
  };
  const handleItemFocus = (index) => {
    setFocusedImageIndex(index);
  };
  const handleItemBlur = () => {
    setFocusedImageIndex(-1);
  };
  const openLightbox = (image) => {
    if (enableLightbox) {
      setSelectedImage(image);
    }
  };
  const closeLightbox = () => {
    setSelectedImage(null);
  };
  const renderNavigation = () => {
    if (!showNavigation || !showFilters || filters.length <= 1) return null;
    const navClasses = {
      tabs: `inline-flex items-center gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-opacity-20`,
      pills: `flex flex-wrap gap-3`,
      minimal: `flex flex-wrap gap-2`,
    };
    const buttonClasses = {
      tabs: (isActive) =>
        `px-6 py-3 rounded-full font-medium transition-all duration-300 ${isActive
          ? `text-white shadow-lg transform scale-105`
          : `text-gray-600 hover:bg-white/50`
        }`,
      pills: (isActive) =>
        `px-6 py-3 rounded-full font-medium transition-all duration-300 ${isActive
          ? `text-white shadow-lg transform scale-105`
          : `bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200`
        }`,
      minimal: (isActive) =>
        `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? `text-white` : `text-gray-600 hover:bg-gray-50`
        }`,
    };
    const alignmentClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };
    return (
      <div
        className={`flex ${alignmentClasses[navAlignment]} mb-8`}
        data-control="gallery-navigation"
        data-block-id={blockId}
      >
        <div
          className={`${navClasses[navStyle]} ${navSpacingClasses[navSpacing]}`}
          style={navStyle === "tabs" ? { borderColor: getColor("muted") } : {}}
        >
          {allFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={buttonClasses[navStyle](activeFilter === filter)}
              style={
                activeFilter === filter
                  ? {
                    background: `linear-gradient(to right, ${getColor(
                      "primary"
                    )}, ${getColor("secondary")})`,
                    color: getColor("onPrimary"),
                  }
                  : {
                    color: getColor("text"),
                  }
              }
              data-control={`gallery-nav-${filter.toLowerCase()}`}
              data-block-id={blockId}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    );
  };
  const renderPremiumGrid = () => (
    <section
      ref={containerRef}
      className="py-24 px-4 md:px-8 relative overflow-hidden"
      style={{ backgroundColor: getColor(backgroundColor) }}
      id={anchorId || "gallery"}
    >
      {showBadge && (
        <>
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute top-20 left-20 w-40 h-40 rounded-full blur-3xl"
              style={{ backgroundColor: getColor("primary") + "40" }}
            ></div>
            <div
              className="absolute bottom-20 right-20 w-32 h-32 rounded-full blur-3xl"
              style={{ backgroundColor: getColor("secondary") + "40" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: getColor("surface") + "60" }}
            ></div>
          </div>
          <div
            className="absolute top-10 right-10 w-20 h-20 border-2 rounded-full opacity-20"
            style={{ borderColor: getColor("primary") }}
          ></div>
          <div
            className="absolute bottom-10 left-10 w-16 h-16 border rounded-full opacity-30"
            style={{ borderColor: getColor("secondary") }}
          ></div>
        </>
      )}
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          {showBadge && (
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg border"
              style={{
                backgroundColor: getColor("surface"),
                color: getColor(textColor),
                borderColor: getColor("primary"),
                fontFamily: globalStyles?.typography?.bodyFont,
              }}
            >
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: getColor("primary") }}
              ></div>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Gallery
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: getColor("secondary") }}
              ></div>
            </div>
          )}
          {title && (
            <StyledText
              tag="h2"
              className="text-5xl lg:text-6xl font-bold mb-8 leading-tight"
              styleConfig={{
                fontFamily: globalStyles?.typography?.headingFont,
                color: getColor(textColor),
              }}
              dataControl="gallery-title"
              dataBlockId={blockId}
            >
              <span
                style={{
                  background: `linear-gradient(to right, ${getColor(
                    "primary"
                  )}, ${getColor("secondary")})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                {title}
              </span>
            </StyledText>
          )}
          {navPosition === "top" && renderNavigation()}
          {layout === "premium-grid" && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
        <div
          className={`grid place-items-center ${getGridCols(columns)} ${gapClasses[gap]}`}
          data-control="gallery-images"
          data-block-id={blockId}
        >
          {filteredImages.length > 0 ? (
            filteredImages.map((img, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-700 cursor-pointer border-4 ${focusedImageIndex === index
                  ? "border-blue-500 ring-4 ring-blue-300 ring-opacity-50 scale-105"
                  : "border-white"
                  }`}
                onClick={() => handleItemClick(img, index)}
                onFocus={() => handleItemFocus(index)}
                onBlur={handleItemBlur}
                tabIndex={0}
                role="button"
                aria-label={`View ${img.caption || `gallery image ${index + 1}`
                  }`}
                data-control={`gallery-image-${index}`}
                data-focus={`gallery-image-${index}`}
                data-block-id={blockId}
              >
                <div className="aspect-square overflow-hidden flex items-center justify-center bg-gray-50">
                  <img
                    src={getValidImageSrc(img.url)}
                    alt={img.caption || `Gallery image ${index + 1}`}
                    className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ backgroundColor: getColor("primary") + "10" }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                      <svg
                        className="w-8 h-8"
                        style={{ color: getColor("primary") }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                  {showCaptions && img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <StyledText
                        tag="p"
                        className="text-white font-medium text-lg"
                      >
                        {img.caption}
                      </StyledText>
                    </div>
                  )}
                </div>
                {showBadge && (
                  <>
                    <div
                      className="absolute -top-3 -left-3 w-6 h-6 rounded-full opacity-60 shadow-md animate-bounce pointer-events-none"
                      style={{ backgroundColor: getColor("primary") }}
                    ></div>
                    <div
                      className="absolute -bottom-3 -right-3 w-5 h-5 rounded-full opacity-50 shadow-md animate-bounce delay-1000 pointer-events-none"
                      style={{ backgroundColor: getColor("secondary") }}
                    ></div>
                    <div
                      className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-70 shadow-sm pointer-events-none"
                      style={{ backgroundColor: getColor("surface") }}
                    ></div>
                    <div
                      className="absolute bottom-2 left-2 w-2 h-2 rounded-full opacity-60 shadow-sm pointer-events-none"
                      style={{ backgroundColor: getColor("primary") }}
                    ></div>
                  </>
                )}
                {focusedImageIndex === index && (
                  <div
                    className="absolute inset-0 border-2 border-blue-500 rounded-2xl pointer-events-none"
                    style={{ boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" }}
                  ></div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <StyledText
                  tag="h3"
                  className="text-xl font-semibold text-gray-600 mb-2"
                >
                  No Images Yet
                </StyledText>
                <StyledText tag="p" className="text-gray-500 mb-6">
                  Click here to add your first gallery image
                </StyledText>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add First Image
                </button>
              </div>
            </div>
          )}
        </div>
        {navPosition === "bottom" && renderNavigation()}
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={getValidImageSrc(selectedImage.url)}
              alt={selectedImage.caption || "Gallery image"}
              className="max-w-full max-h-full object-contain"
            />
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4">
                <p className="text-lg font-medium">{selectedImage.caption}</p>
              </div>
            )}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
  const renderElegantMasonry = () => (
    <section
      ref={containerRef}
      className="py-20 px-4 md:px-8"
      style={{ backgroundColor: getColor(backgroundColor) }}
      id={anchorId || "gallery"}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          {showBadge && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-semibold mb-8 shadow-lg border border-amber-200">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Gallery
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          )}
          {title && (
            <StyledText
              tag="h2"
              className="text-5xl lg:text-6xl font-bold mb-8 leading-tight"
              styleConfig={{
                fontFamily: globalStyles?.typography?.headingFont,
              }}
              data-control="gallery-title"
              data-block-id={blockId}
            >
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                {title}
              </span>
            </StyledText>
          )}
          {showFilters && filters.length > 1 && (
            <div
              className="flex flex-wrap justify-center gap-3 mb-12"
              data-control="gallery-navigation"
              data-block-id={blockId}
            >
              {allFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeFilter === filter
                    ? "bg-amber-500 text-white shadow-lg transform scale-105"
                    : "bg-white text-amber-600 hover:bg-amber-50 shadow-md hover:shadow-lg"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          className={`${getMasonryCols(columns)} ${gapClasses[gap]} ${gapSpaceY[gap]}`}
          data-control="gallery-images"
          data-block-id={blockId}
        >
          {filteredImages.map((img, index) => (
            <div
              key={index}
              className="break-inside-avoid group relative overflow-hidden rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500 cursor-pointer border-4 border-white"
              onClick={() => handleItemClick(img, index)}
              data-control={`gallery-image-${index}`}
              data-block-id={blockId}
            >
              <img
                src={getValidImageSrc(img.url)}
                alt={img.caption || `Gallery image ${index + 1}`}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                  <svg
                    className="w-8 h-8 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
              {showCaptions && img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <StyledText
                    tag="p"
                    className="text-white font-medium text-lg"
                  >
                    {img.caption}
                  </StyledText>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={getValidImageSrc(selectedImage.url)}
              alt={selectedImage.caption || "Gallery image"}
              className="max-w-full max-h-full object-contain"
            />
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4">
                <p className="text-lg font-medium">{selectedImage.caption}</p>
              </div>
            )}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
  const renderLuxuryCarousel = () => {
    return (
      <section
        ref={containerRef}
        className="py-20 px-4 md:px-8"
        style={{ backgroundColor: getColor(backgroundColor) }}
        id={anchorId || "gallery"}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {showBadge && (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-semibold mb-8 shadow-lg border border-purple-200">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Luxury Gallery
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
              </div>
            )}
            {title && (
              <StyledText
                tag="h2"
                className="text-5xl lg:text-6xl font-bold mb-8 leading-tight"
                styleConfig={{
                  fontFamily: globalStyles?.typography?.headingFont,
                }}
                data-control="gallery-title"
                data-block-id={blockId}
              >
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                  {title}
                </span>
              </StyledText>
            )}
            {showFilters && filters.length > 1 && (
              <div
                className="flex flex-wrap justify-center gap-3 mb-12"
                data-control="gallery-navigation"
                data-block-id={blockId}
              >
                {allFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeFilter === filter
                      ? "bg-purple-500 text-white shadow-lg transform scale-105"
                      : "bg-white text-purple-600 hover:bg-purple-50 shadow-md hover:shadow-lg"
                      }`}
                    data-control={`gallery-filter-${filter.toLowerCase()}`}
                    data-block-id={blockId}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className="relative"
            data-control="gallery-images"
            data-block-id={blockId}
          >
            <Swiper
              modules={[Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              centeredSlides={false}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              speed={800}
              grabCursor={true}
              breakpoints={getCarouselBreakpoints(columns, gap)}
              className="pb-12"
            >
              {filteredImages.map((img, index) => (
                <SwiperSlide key={index} className="h-auto">
                  <div
                    className="group relative overflow-hidden rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500 cursor-pointer border-4 border-white hover:border-purple-200"
                    onClick={() => handleItemClick(img, index)}
                    data-control={`gallery-image-${index}`}
                    data-block-id={blockId}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={img.url || "/assets/image/no-image.png"}
                        alt={img.caption || `Gallery image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ backgroundColor: getColor("primary") + "10" }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                          <svg
                            className="w-8 h-8"
                            style={{ color: getColor("primary") }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                      {showCaptions && img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <StyledText
                            tag="p"
                            className="text-white font-medium text-lg"
                          >
                            {img.caption}
                          </StyledText>
                        </div>
                      )}
                    </div>
                    <div
                      className="absolute -top-2 -left-2 w-4 h-4 rounded-full opacity-80 shadow-lg animate-pulse"
                      style={{ backgroundColor: getColor("primary") }}
                    ></div>
                    <div
                      className="absolute -bottom-2 -right-2 w-3 h-3 rounded-full opacity-60 shadow-lg animate-pulse delay-1000"
                      style={{ backgroundColor: getColor("secondary") }}
                    ></div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            {filteredImages.length > 3 && (
              <div className="flex justify-center mt-6">
                <div className="bg-gray-200 rounded-full h-2 w-32 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption || "Gallery image"}
                className="max-w-full max-h-full object-contain"
              />
              {selectedImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4">
                  <p className="text-lg font-medium">{selectedImage.caption}</p>
                </div>
              )}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>
    );
  };
  const renderModernShowcase = () => (
    <section
      ref={containerRef}
      className="py-24 px-4 md:px-8"
      style={{ backgroundColor: getColor(backgroundColor) }}
      id={anchorId || "gallery"}
    >
      <div className="max-w-7xl mx-auto">
        <div className={`flex ${isMobile ? 'flex-col items-start' : 'flex-row justify-between items-end'} mb-12 gap-6`}>
          <div className="max-w-2xl">
            {showBadge && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
                style={{
                  borderColor: getColor("primary"),
                  color: getColor("primary"),
                  backgroundColor: "transparent"
                }}
              >
                Showcase
              </div>
            )}
            {title && (
              <StyledText
                tag="h2"
                className="text-5xl lg:text-7xl font-bold leading-none tracking-tight"
                styleConfig={{
                  fontFamily: globalStyles?.typography?.headingFont,
                  color: getColor(textColor),
                }}
                data-control="gallery-title"
                data-block-id={blockId}
              >
                {title}
              </StyledText>
            )}
          </div>
          {showFilters && filters.length > 1 && (
            <div className="flex flex-wrap gap-2" data-control="gallery-navigation" data-block-id={blockId}>
              {allFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFilter === filter
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  style={activeFilter === filter ? { backgroundColor: getColor("primary"), color: getColor("onPrimary") } : {}}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={`grid ${getGridCols(columns)} gap-8`} data-control="gallery-images" data-block-id={blockId}>
          {filteredImages.map((img, index) => (
            <div
              key={index}
              className={`group relative cursor-pointer ${!isMobile && index % 3 === 0 ? "col-span-2 row-span-2" : ""}`}
              onClick={() => handleItemClick(img, index)}
              data-control={`gallery-image-${index}`}
              data-block-id={blockId}
            >
              <div className="aspect-[4/3] w-full h-full overflow-hidden rounded-none">
                <img
                  src={getValidImageSrc(img.url)}
                  alt={img.caption || `Gallery image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
              {showCaptions && img.caption && (
                <div className="absolute bottom-0 left-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white p-4 shadow-xl max-w-[calc(100%-2rem)]">
                    <StyledText tag="p" className="text-black font-bold text-lg">
                      {img.caption}
                    </StyledText>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedImage && (
        <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            <img
              src={getValidImageSrc(selectedImage.url)}
              alt={selectedImage.caption}
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
            <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
  const renderClassicPortfolio = () => (
    <section
      ref={containerRef}
      className="py-20 px-4 md:px-8"
      style={{ backgroundColor: getColor(backgroundColor) }}
      id={anchorId || "gallery"}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          {title && (
            <StyledText
              tag="h2"
              className="text-4xl lg:text-5xl font-serif italic mb-6"
              styleConfig={{
                fontFamily: globalStyles?.typography?.headingFont,
                color: getColor(textColor),
              }}
              data-control="gallery-title"
              data-block-id={blockId}
            >
              {title}
            </StyledText>
          )}
          <div className="w-24 h-1 bg-gray-200 mx-auto"></div>
          {showFilters && filters.length > 1 && (
            <div className="flex justify-center gap-8 mt-10" data-control="gallery-navigation" data-block-id={blockId}>
              {allFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`text-sm uppercase tracking-widest transition-colors duration-300 pb-2 border-b-2 ${activeFilter === filter
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  style={activeFilter === filter ? { borderColor: getColor("primary"), color: getColor("primary") } : {}}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={`grid ${getGridCols(columns)} gap-12`} data-control="gallery-images" data-block-id={blockId}>
          {filteredImages.map((img, index) => (
            <div
              key={index}
              className="group cursor-pointer"
              onClick={() => handleItemClick(img, index)}
              data-control={`gallery-image-${index}`}
              data-block-id={blockId}
            >
              <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-6 relative">
                <img
                  src={getValidImageSrc(img.url)}
                  alt={img.caption || `Gallery image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors duration-300"></div>
              </div>
              <div className="text-center">
                {showCaptions && img.caption && (
                  <StyledText tag="h3" className="text-xl font-medium mb-2" styleConfig={{ color: getColor(textColor) }}>
                    {img.caption}
                  </StyledText>
                )}
                <p className="text-sm text-gray-400 uppercase tracking-wider">{img.category || "Portfolio"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedImage && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-8" onClick={closeLightbox}>
          <div className="relative max-w-5xl w-full">
            <img
              src={getValidImageSrc(selectedImage.url)}
              alt={selectedImage.caption}
              className="w-full h-auto shadow-xl"
            />
            <div className="mt-8 text-center">
              <h3 className="text-2xl font-serif italic mb-2">{selectedImage.caption}</h3>
              <p className="text-gray-500 uppercase tracking-widest text-sm">{selectedImage.category}</p>
            </div>
            <button onClick={closeLightbox} className="absolute -top-12 right-0 text-gray-400 hover:text-black transition-colors">
              <span className="text-sm uppercase tracking-widest">Close</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
  const renderCinematicSlider = () => {
    const nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % filteredImages.length);
    };
    const prevSlide = () => {
      setCurrentSlide(
        (prev) => (prev - 1 + filteredImages.length) % filteredImages.length
      );
    };
    const goToSlide = (index) => {
      setCurrentSlide(index);
    };
    return (
      <section
        ref={containerRef}
        className="py-24 px-4 md:px-8 relative overflow-hidden"
        style={{ backgroundColor: "#0f0f0f" }}
        id={anchorId || "gallery"}
      >
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-20 left-20 w-40 h-40 rounded-full blur-3xl"
            style={{ backgroundColor: "#ff6b35" }}
          ></div>
          <div
            className="absolute bottom-20 right-20 w-32 h-32 rounded-full blur-3xl"
            style={{ backgroundColor: "#f7931e" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: "#333" }}
          ></div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')]"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            {showBadge && (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-orange-400 rounded-full text-sm font-semibold mb-8 shadow-2xl border border-orange-500/30">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Cinematic Experience
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            )}
            {title && (
              <StyledText
                dataControl="gallery-title"
                dataBlockId={blockId}
                tag="h2"
                className="text-6xl lg:text-7xl font-bold mb-8 leading-tight"
                styleConfig={{
                  fontFamily: globalStyles?.typography?.headingFont,
                  color: "#ffffff",
                }}
                data-control="gallery-title"
                data-block-id={blockId}
              >
                <span
                  style={{
                    background:
                      "linear-gradient(to right, #ff6b35, #f7931e, #ff4757)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                    textShadow: "0 0 30px rgba(255, 107, 53, 0.5)",
                  }}
                >
                  {title}
                </span>
              </StyledText>
            )}
            {showFilters && filters.length > 1 && (
              <div
                className="flex flex-wrap justify-center gap-3 mb-12"
                data-control="gallery-navigation"
                data-block-id={blockId}
              >
                {allFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeFilter === filter
                      ? "bg-orange-500 text-black shadow-2xl transform scale-105"
                      : "bg-gray-800/80 text-orange-400 hover:bg-gray-700 shadow-lg hover:shadow-xl border border-orange-500/30"
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className="relative max-w-6xl mx-auto"
            data-control="gallery-images"
            data-block-id={blockId}
          >
            <div
              className="relative aspect-video overflow-hidden rounded-3xl shadow-2xl bg-black border-4 border-orange-500/20"
              data-block-id={blockId}
            >
              {filteredImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out cursor-pointer ${index === currentSlide
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                    }`}
                  onClick={() => handleItemClick(img, index)}
                  data-control={`gallery-image-${index}`}
                  data-block-id={blockId}
                >
                  <img
                    src={img.url || "/assets/image/no-image.png"}
                    alt={img.caption || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                  <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
                  {showCaptions && img.caption && (
                    <div className="absolute bottom-8 left-8 right-8">
                      <StyledText
                        tag="p"
                        className="text-white font-medium text-2xl drop-shadow-2xl"
                        styleConfig={{
                          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                        }}
                      >
                        {img.caption}
                      </StyledText>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-110 border border-orange-500/30"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-110 border border-orange-500/30"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <div className="absolute top-6 right-6 flex gap-2">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-300 border border-orange-500/30 ${isAutoPlaying ? "shadow-2xl" : "shadow-lg"
                    }`}
                  title={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
                >
                  {isAutoPlaying ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3 7.5A9.5 9.5 0 1121.5 12 9.5 9.5 0 0112 2.5z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-8">
              {filteredImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                    ? "bg-orange-500 scale-125 shadow-lg"
                    : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  data-control={`gallery-slide-indicator-${index}`}
                  data-block-id={blockId}
                />
              ))}
            </div>
            <div className="mt-6 max-w-md mx-auto">
              <div className="bg-gray-800 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-300 ease-linear"
                  style={{
                    width: `${((currentSlide + 1) / filteredImages.length) * 100
                      }%`,
                  }}
                ></div>
              </div>
              <div className="text-center text-gray-400 text-sm mt-2">
                {currentSlide + 1} / {filteredImages.length}
              </div>
            </div>
          </div>
        </div>
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-5xl max-h-full">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption || "Gallery image"}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              {selectedImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/90 text-white p-6 rounded-b-lg">
                  <p className="text-xl font-medium">{selectedImage.caption}</p>
                </div>
              )}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/70 transition-colors border border-orange-500/30"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>
    );
  };
  switch (layout) {
    case "elegant-masonry":
      return renderElegantMasonry();
    case "luxury-carousel":
      return renderLuxuryCarousel();
    case "cinematic-slider":
      return renderCinematicSlider();
    case "modern-showcase":
      return renderModernShowcase();
    case "classic-portfolio":
      return renderClassicPortfolio();
    case "premium-grid":
    default:
      return renderPremiumGrid();
  }
}
