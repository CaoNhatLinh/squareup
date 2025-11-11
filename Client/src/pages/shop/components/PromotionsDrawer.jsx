import { MdClose } from "react-icons/md";
import { useState, useEffect } from "react";
import DiscountDetailModal from "./DiscountDetailModal";
import { fetchDiscounts } from "../../../api/discounts";

export default function PromotionsDrawer({ isOpen, onClose, restaurantId }) {
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [allDiscounts, setAllDiscounts] = useState({});
  const [loading, setLoading] = useState(false);
  
  const discountsList = Object.values(allDiscounts || {}).filter(d => d.automaticDiscount);

  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        setLoading(true);
        const discounts = await fetchDiscounts(restaurantId);
        setAllDiscounts(discounts || {});
      } catch (error) {
        console.error('Error loading discounts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && restaurantId) {
      loadDiscounts();
    }
  }, [isOpen, restaurantId]);

  const getDiscountStatus = (discount) => {
    const now = Date.now();
    if (discount.setDateRange) {
      const startTime = discount.dateRangeStart ? new Date(discount.dateRangeStart + 'T00:00:00').getTime() : 0;
      const endTime = discount.dateRangeEnd ? new Date(discount.dateRangeEnd + 'T23:59:59').getTime() : Infinity;
      
      if (now < startTime) {
        return 'upcoming';
      }
      if (now > endTime) {
        return 'expired';
      }
    }
    
    if (discount.setSchedule) {
      const currentDate = new Date();
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = currentDate.toTimeString().slice(0, 5);
      const isDayEnabled = discount.scheduleDays?.[dayName];

      const isTimeInRange = currentTime >= (discount.scheduleTimeStart || '00:00') && 
                           currentTime <= (discount.scheduleTimeEnd || '23:59');
      if (!isDayEnabled || !isTimeInRange) {
        return 'inactive';
      }
    }
    return 'active';
  };

  const sortedDiscounts = [...discountsList].sort((a, b) => {
    const statusOrder = { active: 0, inactive: 1, upcoming: 2, expired: 3 };
    const statusA = getDiscountStatus(a);
    const statusB = getDiscountStatus(b);
    return statusOrder[statusA] - statusOrder[statusB];
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const getAppliedToText = (discount) => {
    if (discount.discountApplyTo === 'item_category') {
      if (discount.addAllItemsToPurchase) {
        return 'All Items';
      }
      const items = discount.purchaseItems || [];
      const categories = discount.purchaseCategories || [];
      const count = items.length + categories.length;
      return `Applied to ${count} item(s)`;
    } else if (discount.discountApplyTo === 'quantity') {
      const purchaseQty = discount.purchaseQuantity || 1;
      const discountText = discount.amountType === 'percentage' 
        ? `${discount.amount}% off` 
        : `$${discount.amount} off`;
      
      if (discount.quantityRuleType === 'exact') {
        return `Buy exactly ${purchaseQty}, Get ${discountText}`;
      } else if (discount.quantityRuleType === 'minimum') {
        return `Buy ${purchaseQty}+, Get ${discountText}`;
      } else if (discount.quantityRuleType === 'bogo') {
        const discountQty = discount.discountQuantity || 1;
        return `Buy ${purchaseQty}, Get ${discountQty} at ${discountText}`;
      }
    }
    return 'Special Offer';
  };

  const getTimeText = (discount) => {
    if (discount.setSchedule && discount.scheduleTimeStart && discount.scheduleTimeEnd) {
      return `${formatTime(discount.scheduleTimeStart)} - ${formatTime(discount.scheduleTimeEnd)}`;
    }
    return 'All Day';
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-500 to-red-500">
          <h2 className="text-2xl font-bold text-white">Promotions</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-80px)] bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-center">Loading promotions...</p>
            </div>
          ) : sortedDiscounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <p className="text-gray-500 text-center">No promotions available at the moment</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {sortedDiscounts.map((discount) => {
                const status = getDiscountStatus(discount);
                const isActive = status === 'active';
                const isUpcoming = status === 'upcoming';
                const isExpired = status === 'expired';
                const isInactive = status === 'inactive';

                return (
                  <div
                    key={discount.id}
                    className={`bg-white rounded-2xl shadow-md overflow-hidden border-2 ${
                      isActive ? 'border-green-400' : 
                      isExpired ? 'border-gray-300' : 
                      isInactive ? 'border-yellow-300' : 
                      'border-orange-300'
                    }`}
                  >
                    <div className="flex">
                      <div className={`w-32 flex flex-col items-center justify-center p-4 ${
                        isActive ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 
                        isExpired ? 'bg-gray-400' : 
                        isInactive ? 'bg-yellow-400' : 
                        'bg-orange-300'
                      }`}>
                        <div className="text-white text-center">
                          <p className="text-sm font-semibold mb-1">Discount</p>
                          <p className="text-4xl font-bold">
                            {discount.amountType === 'percentage' ? `${discount.amount}%` : `$${discount.amount}`}
                          </p>
                          <p className="text-sm font-semibold mt-1">OFF</p>
                        </div>
                      </div>

                      {/* Right side - Details */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{discount.name}</h3>
                          {isActive && (
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                              Active
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                              Upcoming
                            </span>
                          )}
                          {isInactive && (
                            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                              Scheduled
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                              Expired
                            </span>
                          )}
                        </div>

                        {/* Date */}
                        {discount.setDateRange && (discount.dateRangeStart || discount.dateRangeEnd) && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>
                              {formatDate(discount.dateRangeStart)}
                              {discount.dateRangeEnd && ` - ${formatDate(discount.dateRangeEnd)}`}
                            </span>
                          </div>
                        )}

                        {/* Schedule */}
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>{getTimeText(discount)}</span>
                        </div>

                        {/* Applied to */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {getAppliedToText(discount)}
                          </p>
                          
                          {/* Show items for all discount types */}
                          {!discount.addAllItemsToPurchase && (
                            <div className="space-y-2">
                              {/* Purchase Items */}
                              {(discount.purchaseItems?.length > 0 || discount.purchaseCategories?.length > 0) && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    {discount.discountApplyTo === 'quantity' && discount.quantityRuleType === 'bogo' ? 'Purchase:' : 'Applies to:'}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {discount.purchaseItems?.map((item, idx) => (
                                      <span key={`item-${idx}`} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        {item.name}
                                      </span>
                                    ))}
                                    {discount.purchaseCategories?.map((cat, idx) => (
                                      <span key={`cat-${idx}`} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                        {cat.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Discount Target Items (for BOGO only) */}
                              {discount.discountApplyTo === 'quantity' && 
                               discount.quantityRuleType === 'bogo' && 
                               !discount.copyEligibleItems &&
                               (discount.discountTargetItems?.length > 0) && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Get discount on:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {discount.discountTargetItems?.map((item, idx) => (
                                      <span key={`discount-${idx}`} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                        {item.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Show message for "All items" or "Copy eligible items" */}
                          {discount.addAllItemsToPurchase && (
                            <p className="text-xs text-gray-500 italic mt-2">Applies to all items in store</p>
                          )}
                          {discount.discountApplyTo === 'quantity' && 
                           discount.quantityRuleType === 'bogo' && 
                           discount.copyEligibleItems && (
                            <p className="text-xs text-gray-500 italic mt-2">Discount applies to same items as purchase</p>
                          )}

                          {/* View Details Button */}
                          <button
                            onClick={() => setSelectedDiscount(discount)}
                            className="mt-3 w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDiscount && (
        <DiscountDetailModal
          discount={selectedDiscount}
          onClose={() => setSelectedDiscount(null)}
        />
      )}
    </>
  );
}
