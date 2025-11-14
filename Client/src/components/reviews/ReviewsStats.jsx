import { HiOutlineStar, HiFire } from "react-icons/hi2";

const StarDisplay = ({ rating, size = "w-5 h-5" }) => (
  <div className="flex gap-0.5 justify-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`${size} ${
          star <= rating ? "text-yellow-500 fill-current text-shadow-lg/20" : "text-gray-300"
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
    ))}
  </div>
);

const RatingBar = ({ count, total, rating }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 w-16">
        <span className="text-sm font-medium text-gray-700">{rating}</span>
        <HiOutlineStar className="w-4 h-4 text-yellow-500" />
      </div>

      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-yellow-500 h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
    </div>
  );
};

const ReviewsStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
        <div className="text-center">
          <p className="text-gray-600 mb-2 font-medium">Overall Rating</p>

          <div className="text-6xl font-extrabold text-red-600 mb-3 text-shadow-lg/20 ">
            {stats.averageRating.toFixed(1)}
          </div>

          <StarDisplay
            rating={Math.round(stats.averageRating)}
            size="w-7 h-7 "
          />

          <p className="text-gray-500 mt-3 text-sm">
            Total: {stats.totalReviews}
            {stats.totalReviews === 1 ? "Review" : "Reviews"}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 lg:col-span-2">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HiFire className="w-5 h-5 text-red-500" />
          Rating Distribution
        </h3>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <RatingBar
              key={rating}
              rating={rating}
              count={stats.ratingDistribution[rating]}
              total={stats.totalReviews}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsStats;