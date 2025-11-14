
import  { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getRestaurantReviews } from "@/api/reviews";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import ReviewsStats from "@/components/reviews/ReviewsStats";
import ReviewsFilters from "@/components/reviews/ReviewsFilters";
import ReviewsList from "@/components/reviews/ReviewsList";
import ItemsAnalysis from "@/components/reviews/ItemsAnalysis";
export default function Reviews() {
  const { restaurantId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedItem, setSelectedItem] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState("reviews");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true); 
      const data = await getRestaurantReviews(restaurantId);
      setReviews(data.reviews || data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const stats = useMemo(() => {
    if (!reviews.length) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        itemStats: [],
      };
    }

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    const itemMap = new Map();

    reviews.forEach((review) => {
      totalRating += review.rating;
      ratingDistribution[review.rating]++; 

      if (review.itemReviews && Array.isArray(review.itemReviews)) {
        review.itemReviews.forEach((itemReview) => {
          const key = itemReview.itemId;
          if (!itemMap.has(key)) {
            itemMap.set(key, {
              itemId: itemReview.itemId,
              name: itemReview.name || "Unknown Item",
              image: itemReview.image,
              ratings: [],
              ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            });
          }
          const item = itemMap.get(key);
          item.ratings.push(itemReview.rating);
          item.ratingDistribution[itemReview.rating]++;
        });
      }
    });

    const itemStats = Array.from(itemMap.values())
      .map((item) => ({
        ...item,
        averageRating:
          item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length,
        reviewCount: item.ratings.length,
      }))
      .sort((a, b) => b.reviewCount - a.reviewCount);

    return {
      averageRating: totalRating / reviews.length || 0,
      totalReviews: reviews.length,
      ratingDistribution,
      itemStats,
    };
  }, [reviews]); 

  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    if (selectedRating !== "all") {
      filtered = filtered.filter((r) => r.rating === parseInt(selectedRating));
    }

    if (selectedItem !== "all") {
      filtered = filtered.filter((r) =>
        r.itemReviews?.some((item) => item.itemId === selectedItem)
      );
    }
    filtered.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

    return filtered;
  }, [reviews, selectedRating, selectedItem, sortBy]);

  const handleClearFilters = () => {
    setSelectedRating("all");
    setSelectedItem("all");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }
  if (stats.totalReviews === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <HiOutlineChatBubbleLeftRight className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          No Reviews Yet
        </h1>
        <p className="text-gray-600">
          Start serving customers to gather valuable feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Customer Feedback Center
        </h1>
        <p className="text-gray-600">
          Analyze order and item ratings from your patrons.
        </p>
      </div>

      <ReviewsStats stats={stats} />
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b">
          <div className="flex px-6">
            <button
              onClick={() => setView("reviews")}
              className={`px-4 py-4 font-bold transition-colors ${
                view === "reviews"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-red-600"
              }`}
            >
              Order Reviews ({stats.totalReviews})
            </button>

            <button
              onClick={() => setView("items")}
              className={`px-4 py-4 font-bold transition-colors ${
                view === "items"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-red-600"
              }`}
            >
              Item Analysis ({stats.itemStats.length})
            </button>
          </div>
        </div>
        {view === "reviews" && (
          <div className="p-6">
            <ReviewsFilters
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              sortBy={sortBy}
              setSortBy={setSortBy}
              itemStats={stats.itemStats}
              onClearFilters={handleClearFilters}
            />

            <ReviewsList reviews={filteredReviews} />
          </div>
        )}
        {view === "items" && (
          <div className="p-6">
            <ItemsAnalysis itemStats={stats.itemStats} />
          </div>
        )}
      </div>
    </div>
  );
}
