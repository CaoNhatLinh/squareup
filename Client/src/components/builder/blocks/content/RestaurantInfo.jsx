import { useEffect, useState } from "react";
import { useShop } from '@/context/ShopContext';
import { HiOfficeBuilding, HiPhone, HiLocationMarker, HiClock, HiGlobe } from 'react-icons/hi';
import { resolveColor } from '@/components/builder/utils/colorUtils';
import StyledText from "@/components/builder/atoms/StyledText";
import { fetchItems } from '@/api/items';
import { getRestaurantReviews } from '@/api/reviews';
import { useContainerQuery } from '@/components/builder/hooks/useContainerQuery';

export default function RestaurantInfoBlock({
  layout = 'card',
  showHours = true,
  showContact = true,
  showAddress = true,
  useRealData = false,
  globalUseRealData,
  globalStyles,
  themeColor,
  isPublic = false,
  customTitle,
  customDescription,
  customAddress,
  customPhone,
  customEmail,
  customWebsite,
  backgroundColor = "background",
  textColor = "text",
  blockId,
  anchorId,
}) {
  const { restaurant } = useShop();
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [hasReviews, setHasReviews] = useState(false);
  const [hasItems, setHasItems] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const actualUseRealData = globalUseRealData !== undefined ? globalUseRealData : useRealData;

  const { containerRef, isMobile, isTablet, isDesktop } = useContainerQuery();

  const getColor = (colorKey) => {
    return resolveColor(colorKey, globalStyles);
  };

  useEffect(() => {
    const fetchRealData = async () => {
      if (actualUseRealData && restaurant?.id) {
        try {
          const itemsResponse = await fetchItems(restaurant.id, { limit: 1 });
          const totalItems = itemsResponse.meta?.total || 0;
          setMenuItemsCount(totalItems);
          setHasItems(totalItems > 0);

          const reviewsResponse = await getRestaurantReviews(restaurant.id, { limit: 1 });
          const avgRating = reviewsResponse.averageRating || 0;
          const totalReviews = reviewsResponse.meta?.totalReviews || 0;
          setAverageRating(avgRating);
          setHasReviews(totalReviews > 0);
        } catch (error) {
          console.error('Error fetching restaurant data:', error);
          setHasItems(false);
          setHasReviews(false);
        }
      }
    };

    fetchRealData();
  }, [actualUseRealData, restaurant?.id]);

  const primaryColor = globalStyles?.colors?.primary || globalStyles?.palette?.primary || themeColor || '#F97316';
  const resolvedPrimary = resolveColor(primaryColor, globalStyles) || primaryColor;
  const currentLayout = layout;

  const slug = isPublic ? window.location.pathname.split('/')[1] : null;
  const displayRestaurant = (actualUseRealData && restaurant) ? restaurant : {
    name: customTitle || 'Sample Restaurant',
    description: customDescription || 'A delicious dining experience with fresh ingredients and amazing flavors.',
    address: customAddress || '123 Main Street, Downtown',
    phone: customPhone || '(555) 123-4567',
    email: customEmail || 'info@samplerestaurant.com',
    website: customWebsite || 'www.samplerestaurant.com',
    hours: {
      monday: '9:00 AM - 10:00 PM',
      tuesday: '9:00 AM - 10:00 PM',
      wednesday: '9:00 AM - 10:00 PM',
      thursday: '9:00 AM - 10:00 PM',
      friday: '9:00 AM - 11:00 PM',
      saturday: '10:00 AM - 11:00 PM',
      sunday: '10:00 AM - 9:00 PM'
    },
    image: null
  };

  const getCurrentDayHours = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const dayHours = displayRestaurant.hours?.[days[today]];
    if (typeof dayHours === 'string') {
      return dayHours;
    } else if (dayHours && typeof dayHours === 'object') {
      if (dayHours.isClosed) {
        return 'Closed';
      }
      if (Array.isArray(dayHours.timeSlots) && dayHours.timeSlots.length > 0) {
        return dayHours.timeSlots.map(slot => `${slot.open} - ${slot.close}`).join(', ');
      }
      if (dayHours.open && dayHours.close) {
        return `${dayHours.open} - ${dayHours.close}`;
      }
    }

    return 'Hours not available';
  };

  const renderRestaurantContent = () => {
    switch (currentLayout) {
      case 'hero':
        return (
          <div className="relative w-full min-h-screen overflow-hidden" ref={containerRef} style={{ background: `linear-gradient(135deg, ${resolvedPrimary}e6, ${resolvedPrimary}b3, ${resolvedPrimary}80)` }} id={anchorId || 'restaurantinfo'} data-block-id={blockId}>
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full py-20">
                <div className={`grid ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'} gap-12 items-center`}>
                  <div className="text-white space-y-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <HiOfficeBuilding className="w-4 h-4" />
                        <span className="text-sm font-medium">Restaurant</span>
                      </div>
                      <StyledText
                        tag="h1"
                        className={`font-bold leading-tight ${isDesktop ? 'text-7xl' : 'text-5xl'}`}
                        dataControl="restaurant-title"
                        dataBlockId={blockId}
                      >
                        {displayRestaurant.name}
                      </StyledText>
                      <StyledText
                        tag="p"
                        className="text-xl text-white/90 max-w-lg leading-relaxed"
                        dataControl="restaurant-description"
                        dataBlockId={blockId}
                      >
                        {displayRestaurant.description}
                      </StyledText>
                    </div>
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                      {showAddress && displayRestaurant.address && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20" data-control="restaurant-address" data-block-id={blockId}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-white/20">
                              <HiLocationMarker className="w-5 h-5" />
                            </div>
                            <StyledText tag="h3" className="font-semibold">Location</StyledText>
                          </div>
                          <StyledText tag="p" className="text-white/80 text-sm leading-relaxed">{displayRestaurant.address}</StyledText>
                        </div>
                      )}

                      {showContact && displayRestaurant.phone && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20" data-control="restaurant-contact" data-block-id={blockId}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-xl bg-white/20">
                              <HiPhone className="w-5 h-5" />
                            </div>
                            <StyledText tag="h3" className="font-semibold">Contact</StyledText>
                          </div>
                          <div className="space-y-1">
                            <StyledText tag="p" className="text-white/90 text-sm">{displayRestaurant.phone}</StyledText>
                            {displayRestaurant.email && (
                              <StyledText tag="p" className="text-white/80 text-sm">{displayRestaurant.email}</StyledText>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {showHours && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20" data-control="restaurant-hours" data-block-id={blockId}>
                          <div className="flex items-center gap-3">
                            <HiClock className="w-5 h-5" />
                            <div>
                              <StyledText tag="p" className="text-sm font-medium">Open Today</StyledText>
                              <StyledText tag="p" className="text-white/90 text-sm">{getCurrentDayHours()}</StyledText>
                            </div>
                          </div>
                        </div>
                      )}

                      {displayRestaurant.website && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                          <div className="flex items-center gap-3">
                            <HiGlobe className="w-5 h-5" />
                            <div>
                              <StyledText tag="p" className="text-sm font-medium">Website</StyledText>
                              <StyledText tag="p" className="text-white/90 text-sm">{displayRestaurant.website}</StyledText>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-4">
                      {isPublic && slug ? (
                        <a
                          href={`/${slug}/order`}
                          className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                          style={{ background: `linear-gradient(90deg, ${resolvedPrimary}, ${resolvedPrimary}dd)` }}
                        >
                          <span>Order Now</span>
                          <HiOfficeBuilding className="w-5 h-5" />
                        </a>
                      ) : (
                        <button
                          className="inline-flex items-center gap-3 px-8 py-4 text-white font-bold rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                          style={{ background: `linear-gradient(90deg, ${resolvedPrimary}, ${resolvedPrimary}dd)` }}
                        >
                          <span>View Our Menu</span>
                          <HiOfficeBuilding className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={isDesktop ? 'text-right' : ''}>
                    <div className="relative">
                      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: `${resolvedPrimary}20` }}></div>
                      <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full blur-xl" style={{ backgroundColor: `${resolvedPrimary}30` }}></div>

                      <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                        <div className="text-center space-y-6">
                          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                            <HiOfficeBuilding className="w-10 h-10 text-white" />
                          </div>
                          <div>
                            <StyledText tag="h3" className="text-2xl font-bold text-white mb-2">Welcome to Our Restaurant</StyledText>
                            <StyledText tag="p" className="text-white/80 text-sm leading-relaxed">
                              Experience exceptional dining with our carefully crafted menu and warm hospitality.
                            </StyledText>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-center">
                            {(actualUseRealData ? hasItems : true) && (
                              <div className="rounded-xl p-3" style={{ backgroundColor: `${resolvedPrimary}15` }}>
                                <div className="text-lg font-bold text-white">
                                  {actualUseRealData ? `${menuItemsCount}+` : '50+'}
                                </div>
                                <div className="text-xs text-white/70">Menu Items</div>
                              </div>
                            )}
                            {(actualUseRealData ? hasReviews : true) && (
                              <div className="rounded-xl p-3" style={{ backgroundColor: `${resolvedPrimary}25` }}>
                                <div className="text-lg font-bold text-white">
                                  {actualUseRealData ? `${averageRating.toFixed(1)}★` : '4.8★'}
                                </div>
                                <div className="text-xs text-white/70">Rating</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sidebar':
        return (
          <div ref={containerRef} className={`relative w-full bg-gray-100/50 border-2 border-dashed border-gray-300 rounded-lg`} id={anchorId || 'restaurantinfo'} data-block-id={blockId}>
            {!isSidebarOpen && (
              <div className="fixed bottom-6 right-6 z-40">
                <div className="w-14 h-14 rounded-full animate-ping" style={{ backgroundColor: `${resolvedPrimary}30` }}></div>
              </div>
            )}
            <button
              className={`fixed bottom-6 right-6 z-50 w-14 h-14 text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group`}
              style={{
                background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedPrimary}dd)`,
                boxShadow: `0 10px 30px -5px ${resolvedPrimary}40`
              }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle restaurant information"
            >
              <HiOfficeBuilding className={`w-6 h-6 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''
                }`} />
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>


            <div
              className={`fixed top-0 left-0 h-full w-96 transform transition-all duration-500 ease-out z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
              <div
                className="absolute inset-0 backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${getColor(backgroundColor)}f0, ${getColor(backgroundColor)}e0)`,
                  borderRight: `1px solid ${resolvedPrimary}20`
                }}
              ></div>
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: resolvedPrimary }}></div>
                <div className="absolute bottom-40 left-10 w-24 h-24 rounded-full blur-2xl opacity-15" style={{ backgroundColor: resolvedPrimary }}></div>
                <div className="absolute top-1/2 right-20 w-16 h-16 border-2 rounded-full opacity-10 rotate-45" style={{ borderColor: resolvedPrimary }}></div>
              </div>
              <div className="relative h-full flex flex-col">
                <div className="flex-shrink-0 p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="p-3 rounded-2xl shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedPrimary}dd)`,
                          boxShadow: `0 8px 25px -5px ${resolvedPrimary}40`
                        }}
                      >
                        <HiOfficeBuilding className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <StyledText
                          tag="h2"
                          className="text-2xl font-bold"
                          styleConfig={{ color: getColor(textColor) }}
                          dataControl="restaurant-title"
                          dataBlockId={blockId}
                        >
                          {displayRestaurant.name}
                        </StyledText>
                        <StyledText
                          tag="p"
                          className="text-sm opacity-70"
                          styleConfig={{ color: getColor('muted') }}
                        >
                          Restaurant Information
                        </StyledText>
                      </div>
                    </div>

                    <button
                      className="w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200/80 transition-colors flex items-center justify-center group"
                      onClick={() => setIsSidebarOpen(false)}
                      aria-label="Close sidebar"
                    >
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4">
                    <StyledText
                      tag="p"
                      className="text-sm leading-relaxed"
                      styleConfig={{ color: getColor('muted') }}
                      dataControl="restaurant-description"
                      dataBlockId={blockId}
                    >
                      {displayRestaurant.description}
                    </StyledText>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {showAddress && displayRestaurant.address && (
                      <div
                        className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102"
                        data-control="restaurant-address"
                        data-block-id={blockId}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                            style={{ backgroundColor: `${resolvedPrimary}15` }}
                          >
                            <HiLocationMarker className="w-5 h-5" style={{ color: resolvedPrimary }} />
                          </div>
                          <div className="flex-1">
                            <StyledText
                              tag="h4"
                              className="font-semibold text-gray-900 mb-2"
                            >
                              Location
                            </StyledText>
                            <StyledText
                              tag="p"
                              className="text-sm text-gray-700 leading-relaxed"
                            >
                              {displayRestaurant.address}
                            </StyledText>
                          </div>
                        </div>
                      </div>
                    )}

                    {showContact && displayRestaurant.phone && (
                      <div
                        className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102"
                        data-control="restaurant-contact"
                        data-block-id={blockId}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-blue-100 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <HiPhone className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <StyledText
                              tag="h4"
                              className="font-semibold text-gray-900 mb-2"
                            >
                              Contact
                            </StyledText>
                            <div className="space-y-1">
                              <StyledText tag="p" className="text-sm text-gray-700 font-medium">
                                {displayRestaurant.phone}
                              </StyledText>
                              {displayRestaurant.email && (
                                <StyledText tag="p" className="text-sm text-gray-600">
                                  {displayRestaurant.email}
                                </StyledText>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {showHours && (
                      <div
                        className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102"
                        data-control="restaurant-hours"
                        data-block-id={blockId}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-green-100 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <HiClock className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <StyledText
                              tag="h4"
                              className="font-semibold text-gray-900 mb-2"
                            >
                              Hours
                            </StyledText>
                            <div className="space-y-2">
                              <StyledText tag="p" className="text-sm text-gray-700 font-medium">
                                Today: {getCurrentDayHours()}
                              </StyledText>
                              <button
                                className="text-xs font-medium hover:underline transition-colors"
                                style={{ color: resolvedPrimary }}
                              >
                                View full schedule →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {displayRestaurant.website && (
                      <div
                        className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-purple-100 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <HiGlobe className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <StyledText
                              tag="h4"
                              className="font-semibold text-gray-900 mb-2"
                            >
                              Website
                            </StyledText>
                            <a
                              href={displayRestaurant.website.startsWith('http') ? displayRestaurant.website : `https://${displayRestaurant.website}`}
                              className="text-sm font-medium hover:underline transition-colors inline-flex items-center gap-1"
                              style={{ color: resolvedPrimary }}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {displayRestaurant.website}
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {(actualUseRealData ? hasItems : true) && (
                      <div
                        className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-4 text-center border border-orange-100/50 shadow-lg"
                      >
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {actualUseRealData ? `${menuItemsCount}+` : '50+'}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Menu Items</div>
                      </div>
                    )}
                    {(actualUseRealData ? hasReviews : true) && (
                      <div
                        className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 text-center border border-green-100/50 shadow-lg"
                      >
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {actualUseRealData ? `${averageRating.toFixed(1)}★` : '4.8★'}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Rating</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 p-6 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm">
                  {isPublic && slug ? (
                    <a
                      href={`/${slug}/order`}
                      className="w-full text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3 group"
                      style={{
                        background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedPrimary}dd)`,
                        boxShadow: `0 10px 30px -5px ${resolvedPrimary}40`
                      }}
                    >
                      <span>Order Now</span>
                      <HiOfficeBuilding className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    </a>
                  ) : (
                    <button
                      className="w-full text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3 group"
                      style={{
                        background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedPrimary}dd)`,
                        boxShadow: `0 10px 30px -5px ${resolvedPrimary}40`
                      }}
                    >
                      <span>View Menu</span>
                      <HiOfficeBuilding className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div
              className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-500 ease-out z-30 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          </div>
        );

      default:
        return (
          <div ref={containerRef} className="w-full max-w-4xl mx-auto rounded-2xl shadow-xl overflow-hidden m-8" style={{ backgroundColor: getColor(backgroundColor) }} id={anchorId || 'restaurantinfo'} data-block-id={blockId}>
            <div className="p-8 text-white" style={{ background: `linear-gradient(90deg, ${resolvedPrimary}, ${resolvedPrimary}dd)` }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <HiOfficeBuilding className="w-8 h-8" />
                </div>
                <div>
                  <StyledText
                    tag="h2"
                    className="text-3xl font-bold"
                    dataControl="restaurant-title"
                    dataBlockId={blockId}
                  >
                    {displayRestaurant.name}
                  </StyledText>
                  <StyledText
                    tag="p"
                    className="text-white/90 text-lg mt-1"
                    dataControl="restaurant-description"
                    dataBlockId={blockId}
                  >
                    {displayRestaurant.description}
                  </StyledText>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className={`grid ${isDesktop ? 'grid-cols-3' : isTablet ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                {showAddress && displayRestaurant.address && (
                  <div className="bg-gray-50 rounded-xl p-6" data-control="restaurant-address" data-block-id={blockId}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${resolvedPrimary}20` }}>
                        <HiLocationMarker className="w-5 h-5" style={{ color: resolvedPrimary }} />
                      </div>
                      <StyledText tag="h3" className="font-semibold text-gray-900">Location</StyledText>
                    </div>
                    <StyledText tag="p" className="text-gray-700 text-sm leading-relaxed">{displayRestaurant.address}</StyledText>
                  </div>
                )}

                {showContact && displayRestaurant.phone && (
                  <div className="bg-gray-50 rounded-xl p-6" data-control="restaurant-contact" data-block-id={blockId}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <HiPhone className="w-5 h-5 text-blue-600" />
                      </div>
                      <StyledText tag="h3" className="font-semibold text-gray-900">Contact</StyledText>
                    </div>
                    <div className="space-y-2">
                      <StyledText tag="p" className="text-gray-700 text-sm">{displayRestaurant.phone}</StyledText>
                      {displayRestaurant.email && (
                        <StyledText tag="p" className="text-gray-700 text-sm">{displayRestaurant.email}</StyledText>
                      )}
                    </div>
                  </div>
                )}

                {showHours && (
                  <div className="bg-gray-50 rounded-xl p-6" data-control="restaurant-hours" data-block-id={blockId}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <HiClock className="w-5 h-5 text-green-600" />
                      </div>
                      <StyledText tag="h3" className="font-semibold text-gray-900">Hours</StyledText>
                    </div>
                    <div className="space-y-1">
                      <StyledText tag="p" className="text-gray-700 text-sm font-medium">Today: {getCurrentDayHours()}</StyledText>
                      <StyledText tag="p" className="text-gray-500 text-xs cursor-pointer hover:text-gray-700">View full schedule</StyledText>
                    </div>
                  </div>
                )}
              </div>

              {displayRestaurant.website && (
                <div className="mt-8 text-center">
                  <button
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    style={{ background: `linear-gradient(90deg, ${resolvedPrimary}, ${resolvedPrimary}dd)` }}
                  >
                    <HiGlobe className="w-5 h-5" />
                    Visit Our Website
                  </button>
                </div>
              )}
              {isPublic && slug && (
                <div className="mt-6 text-center">
                  <a
                    href={`/${slug}/order`}
                    className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    style={{ background: `linear-gradient(90deg, ${resolvedPrimary}, ${resolvedPrimary}dd)` }}
                  >
                    <span>Order Now</span>
                    <HiOfficeBuilding className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return renderRestaurantContent();
}