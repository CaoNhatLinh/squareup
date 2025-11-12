

/**
 * Get the status of a discount based on current time and settings
 * @param {object} discount - Discount object
 * @returns {string} Status: 'active', 'inactive', 'upcoming', 'expired'
 */
export const getDiscountStatus = (discount) => {
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

/**
 * Get descriptive text for what a discount applies to
 * @param {object} discount - Discount object
 * @returns {string} Description text
 */
export const getAppliedToText = (discount) => {
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

/**
 * Get time range text for discount display
 * @param {object} discount - Discount object
 * @returns {string} Time range text
 */
export const getTimeText = (discount) => {
  if (discount.setSchedule && discount.scheduleTimeStart && discount.scheduleTimeEnd) {
    return `${discount.scheduleTimeStart} - ${discount.scheduleTimeEnd}`;
  }
  return 'All Day';
};

/**
 * Get discount amount display text
 * @param {object} discount - Discount object
 * @returns {string} Amount display text
 */
export const getAmountDisplay = (discount) => {
  if (discount.amountType === 'percentage') {
    return `${discount.amount}%`;
  } else {
    return `$${discount.amount}`;
  }
};