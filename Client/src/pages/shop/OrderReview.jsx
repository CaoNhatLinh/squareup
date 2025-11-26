import { useEffect, useState } from "react";﻿
import { useParams, useNavigate } from "react-router-dom";
import { useShop } from "@/context/ShopContext";
import { getOrderById } from "@/api/orders";
import { addOrderReview } from "@/api/reviews";
import { useGuestUser } from "@/context/GuestUserContext";
import { format } from "date-fns";

const StarRating = ({
  rating,
  setRating,
  hoveredRating,
  setHoveredRating,
  size = "w-12 h-12",
}) => (
  <div className="flex justify-center gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
        className="transition-transform hover:scale-110 focus:outline-none"
      >
        <svg
          className={`${size} ${star <= (hoveredRating || rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    ))}
  </div>
);

const getRatingText = (rating) => {
  const texts = {
    0: "Select a rating",
    1: " Poor",
    2: " Fair",
    3: " Good",
    4: " Very Good",
    5: " Excellent",
  };
  return texts[rating] || "";
};

export default function OrderReview() {
  const { orderId, slug } = useParams();
  const navigate = useNavigate();
  const { restaurant } = useShop();
  const { guestUuid } = useGuestUser();
  const [order, setOrder] = useState(null);
  const [orderRating, setOrderRating] = useState(0);
  const [hoveredOrderRating, setHoveredOrderRating] = useState(0);
  const [orderFeedback, setOrderFeedback] = useState("");
  const [itemReviews, setItemReviews] = useState({});
  const [showItemReviews, setShowItemReviews] = useState(false);
  const [hoveredItemRatings, setHoveredItemRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getOrderById(orderId);
        if (response.order.guestUuid !== guestUuid) {
          setError("You are not authorized to review this order");
          return;
        }
        if (
          response.order.status !== "completed" &&
          response.order.status !== "paid"
        ) {
          setError("You can only review completed or paid orders");
          return;
        }
        if (response.order.review) {
          setError("You have already reviewed this order");
          return;
        }
        setOrder(response.order);
        const uniqueItems = {};
        response.order.items.forEach((item) => {
          if (!uniqueItems[item.itemId])
            uniqueItems[item.itemId] = {
              itemId: item.itemId,
              name: item.name,
              image: item.image,
              rating: 0,
              feedback: "",
            };
        });
        setItemReviews(uniqueItems);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Unable to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, guestUuid]);

  const handleSubmitReview = async () => {
    if (orderRating === 0) {
      alert("Please select an overall rating for your order");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const reviewedItems = Object.values(itemReviews)
        .filter((item) => item.rating > 0)
        .map((item) => ({
          itemId: item.itemId,
          rating: item.rating,
          feedback: item.feedback || "",
        }));
      await addOrderReview(orderId, {
        rating: orderRating,
        feedback: orderFeedback,
        guestUuid,
        itemReviews: reviewedItems.length > 0 ? reviewedItems : undefined,
      });
      alert("Thank you for your review!");
      navigate(`/${slug || restaurant?.slug || ""}/order/order-history`);
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Review
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() =>
              navigate(`/${slug || restaurant?.slug || ""}/order/order-history`)
            }
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Back to Order History
          </button>
        </div>
      </div>
    );
  if (!order) return null;

  const reviewedItemsCount = Object.values(itemReviews).filter(
    (item) => item.rating > 0
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() =>
              navigate(`/${slug || restaurant?.slug || ""}/order/order-history`)
            }
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
          <h1 className="text-2xl font-bold">Review Your Order</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Order #{order.id.slice(-8).toUpperCase()}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {format(new Date(order.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
          </p>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Overall Experience</h2>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
              Required
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            How was your overall experience?
          </p>
          <StarRating
            rating={orderRating}
            setRating={setOrderRating}
            hoveredRating={hoveredOrderRating}
            setHoveredRating={setHoveredOrderRating}
          />
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {getRatingText(orderRating)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Additional Comments</h2>
          <p className="text-sm text-gray-500 mb-4">
            Tell us more about your experience (Optional)
          </p>
          <textarea
            value={orderFeedback}
            onChange={(e) => setOrderFeedback(e.target.value)}
            placeholder="Share your thoughts about the food, service, and overall experience..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-black resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 text-right mt-1">
            {orderFeedback.length}/500 characters
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Rate Individual Items</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                  Optional
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Help others by rating each item{" "}
                {reviewedItemsCount > 0 &&
                  `(${reviewedItemsCount}/${Object.keys(itemReviews).length
                  } rated)`}
              </p>
            </div>
            <button
              onClick={() => setShowItemReviews(!showItemReviews)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showItemReviews ? "Hide" : "Show"}
            </button>
          </div>
          {showItemReviews && (
            <div className="space-y-6 mt-6 pt-6 border-t">
              {Object.values(itemReviews).map((item) => (
                <div key={item.itemId} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <h3 className="font-semibold">{item.name}</h3>
                  </div>
                  <StarRating
                    rating={item.rating}
                    setRating={(rating) =>
                      setItemReviews((prev) => ({
                        ...prev,
                        [item.itemId]: { ...prev[item.itemId], rating },
                      }))
                    }
                    hoveredRating={hoveredItemRatings[item.itemId] || 0}
                    setHoveredRating={(rating) =>
                      setHoveredItemRatings((prev) => ({
                        ...prev,
                        [item.itemId]: rating,
                      }))
                    }
                    size="w-8 h-8"
                  />
                  {item.rating > 0 && (
                    <div className="mt-3">
                      <textarea
                        value={item.feedback}
                        onChange={(e) =>
                          setItemReviews((prev) => ({
                            ...prev,
                            [item.itemId]: {
                              ...prev[item.itemId],
                              feedback: e.target.value,
                            },
                          }))
                        }
                        placeholder="Comments about this item (optional)..."
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500 text-right mt-1">
                        {item.feedback.length}/200
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSubmitReview}
          disabled={submitting || orderRating === 0}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${submitting || orderRating === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
            }`}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Your review helps other customers and the restaurant improve their
          service
        </p>
      </div>
    </div>
  );
}
