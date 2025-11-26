import { useEffect, useState } from "react";
import { HiTag, HiSparkles } from 'react-icons/hi';
import { resolveColor } from '@/components/builder/utils/colorUtils';
import { fetchActiveDiscounts } from '@/api/discounts';
import useAppStore from '@/store/useAppStore';
import { useShop } from '@/context/ShopContext';
import StyledText from '@/components/builder/atoms/StyledText';

export default function PromoGridBlock({ 
  layout = 'slider', 
  showCode = true, 
  globalStyles, 
  themeColor,  
  globalUseRealData = false, 
  isPublic = false,
  blockId,
  backgroundColor,
  textColor,
  titleStyle,
  subtitleStyle
}) {
  const restaurantId = useAppStore(s => s.restaurantId);
  const { activeDiscounts } = useShop();
  const [discounts, setDiscounts] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const loadDiscounts = async () => {
      if (!restaurantId) return;
      
      if (!globalUseRealData) {
        setDiscounts({});
        return;
      }

      if (isPublic) {
        
        return;
      }
      
      try {
        const data = await fetchActiveDiscounts(restaurantId);
        setDiscounts(data.discounts || {});
      } catch (error) {
        console.error('Error loading discounts:', error);
        setDiscounts({});
      }
    };

    loadDiscounts();
  }, [restaurantId, globalUseRealData, isPublic]);

  const promos = globalUseRealData ? Object.values((isPublic ? activeDiscounts : discounts) || {}).filter(d => d.automaticDiscount) : [];
  const displayPromos = globalUseRealData ? promos : [
    { 
      id: 1, 
      name: 'Summer Sale', 
      description: '20% off all drinks', 
      code: 'SUMMER20', 
      color: 'bg-gradient-to-br from-blue-400 to-cyan-500',
      icon: '🔥',
      discountType: 'percentage',
      discountValue: 20
    },
    { 
      id: 2, 
      name: 'Free Delivery', 
      description: 'On orders over $50', 
      code: 'FREEDEL', 
      color: 'bg-gradient-to-br from-green-400 to-emerald-500',
      icon: '🚚',
      discountType: 'free_delivery'
    },
    { 
      id: 3, 
      name: 'New User Special', 
      description: '$5 off your first order', 
      code: 'WELCOME5', 
      color: 'bg-gradient-to-br from-amber-400 to-orange-500',
      icon: '🎉',
      discountType: 'fixed',
      discountValue: 5
    }
  ];

  const primaryColor = themeColor || globalStyles?.palette?.primary || globalStyles?.colors?.primary || '#F97316';
  const secondaryColor = globalStyles?.palette?.secondary || globalStyles?.colors?.secondary || '#3B82F6';
  const resolvedPrimary = resolveColor(primaryColor, globalStyles) || primaryColor;
  const resolvedSecondary = resolveColor(secondaryColor, globalStyles) || secondaryColor;
  const resolvedText = resolveColor(textColor || globalStyles?.palette?.onPrimary || globalStyles?.colors?.text, globalStyles) || '#ffffff';
  const currentLayout = layout;

  useEffect(() => {
    if (currentLayout === 'popup') {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [currentLayout]);

  const getDiscountDisplay = (promo) => {
    if (promo.amountType === 'percentage') {
      return `${promo.amount || 20}% OFF`;
    } else if (promo.amountType === 'fixed') {
      return `$${promo.amount || 5} OFF`;
    } else if (promo.discountType === 'free_delivery') {
      return 'FREE DELIVERY';
    }
    if (promo.discountType === 'percentage') {
      return `${promo.discountValue || 20}% OFF`;
    } else if (promo.discountType === 'fixed') {
      return `$${promo.discountValue || 5} OFF`;
    } else if (promo.discountType === 'free_delivery') {
      return 'FREE DELIVERY';
    }
    return promo.name || 'Special Offer';
  };

  const renderPromotionContent = () => {
    switch (currentLayout) {
      case 'banner':
        return (
          <div 
            className="relative overflow-hidden" 
            style={{ background: backgroundColor || `linear-gradient(135deg, ${resolvedPrimary} 0%, ${resolvedSecondary} 100%)` }}
            data-block-id={blockId}
            data-control="container"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white animate-pulse"></div>
              <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-white animate-pulse delay-1000"></div>
              <div className="absolute bottom-10 left-1/3 w-20 h-20 rounded-full bg-white animate-pulse delay-500"></div>
              <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-white animate-pulse delay-1500"></div>
            </div>

            <div className="relative py-16 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                    <HiSparkles className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-white font-bold text-lg">🔥 Special Offers</span>
                  </div>
                  <StyledText 
                    tag="h2"
                    className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
                    styleConfig={{ ...titleStyle, color: resolvedText }}
                    data-control="title"
                    data-block-id={blockId}
                  >
                    Don't Miss Out on Amazing Deals!
                  </StyledText>
                  <StyledText 
                    tag="p"
                    className="text-white/90 text-xl max-w-3xl mx-auto leading-relaxed"
                    styleConfig={{ ...subtitleStyle, color: resolvedText ? `${resolvedText}E6` : undefined }}
                    data-control="subtitle"
                    data-block-id={blockId}
                  >
                    Limited time promotions and exclusive discounts just for you. Save big on your favorite items!
                  </StyledText>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
                  {displayPromos.slice(0, 3).map((promo, index) => (
                    <div
                      key={promo.id}
                      className="group bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
                      style={{ animationDelay: `${index * 200}ms` }}
                      data-control={`promo-item-${index}`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${promo.color || ''}`}
                             style={promo.color ? {} : { background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedSecondary})` }}>
                          {promo.icon || '🎁'}
                        </div>
                        <div>
                          <StyledText
                            tag="div"
                            className="text-2xl font-bold"
                            styleConfig={{ color: resolvedPrimary }}
                            dataControl={`promo-discount-${index}`}
                            dataBlockId={blockId}
                          >
                            {getDiscountDisplay(promo)}
                          </StyledText>
                          <StyledText
                            tag="div"
                            className="text-sm text-gray-600 font-medium"
                            dataControl={`promo-title-${index}`}
                            dataBlockId={blockId}
                          >
                            {promo.name || promo.title}
                          </StyledText>
                        </div>
                      </div>

                      {showCode && (promo.code || promo.promoCode) && (
                        <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed" style={{ borderColor: `${resolvedPrimary}30` }}>
                          <div className="text-xs text-gray-500 mb-1 font-medium">Use Code</div>
                          <div className="font-mono font-bold text-lg tracking-wider" style={{ color: resolvedPrimary }}>
                            {promo.code || promo.promoCode}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowPopup(true)}
                    className="group inline-flex items-center gap-3 bg-white text-gray-900 font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <HiSparkles className="w-6 h-6 group-hover:animate-bounce" />
                    <span>View All Special Offers</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'popup':
        return (
          <div 
            className="w-full py-12 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50"
            style={{ backgroundColor: backgroundColor }}
            data-block-id={blockId}
            data-control="container"
          >
            <div className="max-w-4xl mx-auto text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="p-4 rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedSecondary})` }}>
                      <HiSparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                    <div>
                      <StyledText tag="h3" className="text-2xl font-bold text-gray-900 mb-2" styleConfig={{ ...titleStyle, color: resolvedText }}>Exclusive Special Offers</StyledText>
                      <StyledText tag="p" className="text-gray-600" styleConfig={{ ...subtitleStyle, color: resolvedText ? `${resolvedText}CC` : undefined }}>Discover amazing deals and promotions</StyledText>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {displayPromos.slice(0, 3).map((promo, index) => (
                      <div
                        key={promo.id}
                        className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                        style={{ animationDelay: `${index * 150}ms` }}
                        data-control={`promo-item-${index}`}
                      >
                        <div className="text-center mb-4">
                          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white font-bold shadow-lg mb-4 ${promo.color || ''}`}
                               style={promo.color ? {} : { background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedSecondary})` }}>
                            <span className="text-2xl">{promo.icon || '🎁'}</span>
                          </div>
                          <div className="text-3xl font-bold mb-2" style={{ color: resolvedPrimary }}>
                            {getDiscountDisplay(promo)}
                          </div>
                          <StyledText tag="h4" className="font-bold text-gray-900 mb-2" dataControl={`promo-title-${index}`} dataBlockId={blockId}>{promo.name || promo.title}</StyledText>
                          <StyledText tag="p" className="text-sm text-gray-600 leading-relaxed" dataControl={`promo-desc-${index}`} dataBlockId={blockId}>{promo.description}</StyledText>
                        </div>

                        {showCode && (promo.code || promo.promoCode) && (
                          <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed" style={{ borderColor: `${resolvedPrimary}30` }}>
                            <div className="text-xs text-gray-500 mb-1 font-medium">PROMO CODE</div>
                            <div className="font-mono font-bold text-lg tracking-wider text-center" style={{ color: resolvedPrimary }}>
                              {promo.code || promo.promoCode}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowPopup(true)}
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <HiSparkles className="w-6 h-6 group-hover:animate-bounce" />
                    <span>Open Special Offers Modal</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'inline':
        return (
          <div 
            className="w-full py-16 px-4 bg-gradient-to-br from-slate-50 via-white to-slate-50"
            style={{ backgroundColor: backgroundColor }}
            data-block-id={blockId}
            data-control="container"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-6">
                  <div className="p-2 rounded-full" style={{ background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedSecondary})` }}>
                    <HiSparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">Current Promotions</span>
                </div>
                <StyledText tag="h2" className="text-4xl font-bold text-gray-900 mb-4" styleConfig={{ ...titleStyle, color: resolvedText }}>
                  Exclusive Deals & Offers
                </StyledText>
                <StyledText tag="p" className="text-gray-600 text-lg max-w-2xl mx-auto" styleConfig={{ ...subtitleStyle, color: resolvedText ? `${resolvedText}CC` : undefined }}>
                  Take advantage of our limited-time promotions and save on your favorite items
                </StyledText>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayPromos.map((promo, index) => (
                  <div
                    key={promo.id}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                    style={{ animationDelay: `${index * 100}ms` }}
                    data-control={`promo-item-${index}`}
                  >
                    <div className="relative p-8">
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 opacity-10">
                        <div className="w-16 h-16 rounded-full" style={{ background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedSecondary})` }}></div>
                      </div>
                      <div className="absolute bottom-4 left-4 opacity-10">
                        <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                      </div>

                      <div className="relative">
                        <div className="flex items-start gap-4 mb-6">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl flex-shrink-0 ${promo.color || ''}`}
                               style={promo.color ? {} : { background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedSecondary})` }}>
                            <span className="text-2xl">{promo.icon || '🎁'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <StyledText
                              tag="div"
                              className="text-3xl font-bold mb-2 leading-tight"
                              styleConfig={{ color: resolvedPrimary }}
                              dataControl={`promo-discount-${index}`}
                              dataBlockId={blockId}
                            >
                              {getDiscountDisplay(promo)}
                            </StyledText>
                            <StyledText
                              tag="h3"
                              className="text-xl font-bold text-gray-900 mb-2 leading-tight"
                              dataControl={`promo-title-${index}`}
                              dataBlockId={blockId}
                            >
                              {promo.name || promo.title}
                            </StyledText>
                            <StyledText
                              tag="p"
                              className="text-gray-600 leading-relaxed text-sm"
                              dataControl={`promo-desc-${index}`}
                              dataBlockId={blockId}
                            >
                              {promo.description || 'Special promotional offer for you'}
                            </StyledText>
                          </div>
                        </div>

                        {showCode && (promo.code || promo.promoCode) && (
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-gray-500 font-medium mb-1">PROMO CODE</div>
                                <div className="font-mono font-bold text-lg tracking-wider" style={{ color: resolvedPrimary }}>
                                  {promo.code || promo.promoCode}
                                </div>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <HiTag className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                            Claim Offer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <button
                  onClick={() => setShowPopup(true)}
                  className="group inline-flex items-center gap-3 bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-gray-300"
                >
                  <HiSparkles className="w-6 h-6 group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                  <span>View All Promotions</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </button>
              </div>
            </div>
          </div>
        );

      default: // 'grid'
        return (
          <div 
            className="w-full py-12 px-4 bg-gradient-to-br from-gray-50 to-white"
            style={{ backgroundColor: backgroundColor }}
            data-block-id={blockId}
            data-control="container"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 rounded-full shadow-lg " style={{ background: `linear-gradient(90deg, ${resolvedPrimary}, ${resolvedSecondary}dd)  ` }}>
                    <HiSparkles className="w-6 h-6 text-white" />
                  </div>
                  <StyledText tag="h2" className="text-3xl font-bold" styleConfig={{ 
                    ...titleStyle,
                    background: `linear-gradient(90deg, ${resolvedPrimary}, ${resolvedSecondary})  text`, 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: resolvedText || 'transparent'
                  }}>
                    Special Offers
                  </StyledText>
                </div>
                <StyledText tag="p" className="text-gray-600 text-lg max-w-2xl mx-auto" styleConfig={{ ...subtitleStyle, color: resolvedText ? `${resolvedText}CC` : undefined }}>
                  Don't miss out on our amazing deals and promotions. Limited time offers available now!
                </StyledText>
              </div>

              <div className={`
                ${currentLayout === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x px-2'
                }
              `}>
                {displayPromos.map((promo, index) => (
                  <div 
                    key={promo.id}
                    className={`
                      ${currentLayout === 'slider' ? 'min-w-[320px] snap-start' : ''}
                      group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2
                      ${promo.color || ''}
                    `}
                    style={promo.color ? {} : { background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedSecondary}dd)  ` }}
                    data-control={`promo-item-${index}`}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 text-6xl">{promo.icon || '🎁'}</div>
                      <div className="absolute bottom-4 left-4 text-4xl">✨</div>
                    </div>

                    <div className="relative p-6 text-white">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold mb-4">
                        <HiTag className="w-4 h-4" />
                        {getDiscountDisplay(promo)}
                      </div>

                      <StyledText
                        tag="h3"
                        className="text-xl font-bold mb-2 leading-tight"
                        dataControl={`promo-title-${index}`}
                        dataBlockId={blockId}
                      >
                        {promo.name || promo.title}
                      </StyledText>

                      <StyledText
                        tag="p"
                        className="text-white/90 mb-4 leading-relaxed"
                        dataControl={`promo-desc-${index}`}
                        dataBlockId={blockId}
                      >
                        {promo.description || 'Special offer for you'}
                      </StyledText>

                      {showCode && (promo.code || promo.promoCode) && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                          <div className="text-xs text-white/70 mb-1">Promo Code</div>
                          <div className="font-mono font-bold text-lg tracking-wider">
                            {promo.code || promo.promoCode}
                          </div>
                        </div>
                      )}

                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <StyledText tag="p" className="text-gray-600 mb-4" styleConfig={{ color: resolvedText ? `${resolvedText}CC` : undefined }}>More deals coming soon!</StyledText>
                <button 
                  onClick={() => setShowPopup(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mr-4"
                  style={{ background: `linear-gradient(90deg, ${resolvedPrimary}, ${resolvedSecondary}dd)` }}
                >
                  <HiTag className="w-5 h-5" />
                  View All Promotions
                </button>
                <button 
                  onClick={() => setShowPopup(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-full border-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{ borderColor: resolvedPrimary, color: resolvedPrimary }}
                >
                  <HiSparkles className="w-5 h-5" />
                  Special Offers
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderPromotionContent()}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 rounded-lg">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full -translate-x-16 -translate-y-16 opacity-10"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-400 to-red-500 rounded-full translate-x-12 translate-y-12 opacity-10"></div>

            <div className="relative p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl shadow-xl" style={{ background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedSecondary})` }}>
                    <HiSparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div>
                    <StyledText tag="h3" className="text-2xl font-bold text-gray-900">Exclusive Special Offers</StyledText>
                    <StyledText tag="p" className="text-gray-600 mt-1">Limited time promotions just for you</StyledText>
                  </div>
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <HiTag className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayPromos.map((promo, index) => (
                  <div
                    key={promo.id}
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 ${promo.color || ''}`}
                           style={promo.color ? {} : { background: `linear-gradient(135deg, ${resolvedPrimary}, ${resolvedSecondary})` }}>
                        <span className="text-xl">{promo.icon || '🎁'}</span>
                      </div>
                      <div className="flex-1">
                        <StyledText
                          tag="div"
                          className="text-3xl font-bold mb-2"
                          styleConfig={{ color: resolvedPrimary }}
                          dataControl={`promo-discount-${index}`}
                          dataBlockId={blockId}
                        >
                          {getDiscountDisplay(promo)}
                        </StyledText>
                        <StyledText
                          tag="h4"
                          className="font-bold text-gray-900 mb-2"
                          dataControl={`promo-title-${index}`}
                          dataBlockId={blockId}
                        >
                          {promo.name || promo.title}
                        </StyledText>
                        <StyledText
                          tag="p"
                          className="text-sm text-gray-600 leading-relaxed"
                          dataControl={`promo-desc-${index}`}
                          dataBlockId={blockId}
                        >
                          {promo.description}
                        </StyledText>
                      </div>
                    </div>

                    {showCode && (promo.code || promo.promoCode) && (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-500 font-medium mb-1">PROMO CODE</div>
                            <div className="font-mono font-bold text-lg tracking-wider" style={{ color: resolvedPrimary }}>
                              {promo.code || promo.promoCode}
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                            <HiTag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex gap-4">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-6 py-4 text-gray-700 font-semibold rounded-2xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 hover:bg-gray-50"
                  style={{ color: resolvedPrimary, borderColor: resolvedPrimary }}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
