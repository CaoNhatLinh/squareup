export default function ClosedBanner({ restaurant }) {
  if (!restaurant || restaurant.isOpen !== false) return null;

  const isSpecialClosure = !!restaurant.closureReason;

  return (
    <div className={`border-b-4 py-8 px-4 ${
      isSpecialClosure 
        ? 'bg-gradient-to-r from-purple-50 via-red-50 to-orange-50 border-purple-600' 
        : 'bg-red-50 border-red-600'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${
                isSpecialClosure 
                  ? 'bg-purple-100' 
                  : 'bg-red-100'
              }`}>
                <svg 
                  className={`w-16 h-16 ${
                    isSpecialClosure 
                      ? 'text-purple-600' 
                      : 'text-red-600'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900">
              {isSpecialClosure 
                ? '🔒 Special Closure' 
                : '🔒 Currently Closed'}
            </h2>

            {/* Message */}
            <div className="space-y-2">
              {isSpecialClosure ? (
                <>
                  <p className="text-xl font-semibold text-purple-900">
                    {restaurant.closureReason}
                  </p>
                  <p className="text-gray-600">
                    We apologize for the inconvenience. We'll be back to serve you soon!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg text-gray-700">
                    We're currently closed.
                    {restaurant.nextOpenTime && (
                      <span className="block mt-2 text-xl font-semibold text-red-700">
                        We'll open {restaurant.nextOpenTime}
                      </span>
                    )}
                  </p>
                </>
              )}
            </div>

            {/* Notice */}
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
              isSpecialClosure 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">You can browse the menu, but orders cannot be placed at this time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
