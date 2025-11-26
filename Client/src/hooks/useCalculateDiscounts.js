import { useEffect, useState } from "react";
import { calculateDiscounts } from '@/api/checkoutClient';

export default function useCalculateDiscounts(restaurantId, items = [], options = {}) {
  const [loading, setLoading] = useState(false);
  const [discountResult, setDiscountResult] = useState({
    totalDiscount: 0,
    appliedDiscounts: [],
    itemDiscounts: {},
    discountBreakdown: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const calc = async () => {
      if (!restaurantId) return;
      if (!items || items.length === 0) {
        setDiscountResult({ totalDiscount: 0, appliedDiscounts: [], itemDiscounts: {}, discountBreakdown: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await calculateDiscounts(restaurantId, items, options);
        if (!cancelled) {
          setDiscountResult(res || { totalDiscount: 0, appliedDiscounts: [], itemDiscounts: {}, discountBreakdown: [] });
        }
      } catch (err) {
        console.error('useCalculateDiscounts error', err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    calc();
    return () => { cancelled = true; };
  }, [restaurantId, JSON.stringify(items), JSON.stringify(options)]);

  return { loading, discountResult, error };
}
