import  { useState } from "react";
import { useShop } from "@/context/ShopContext.jsx";
import { useNavigate } from "react-router-dom";
export default function ShopHeader({ 
  onCartClick, 
  onPromotionsClick, 
  hasActiveDiscounts, 
  isRestaurantActive = true,
  restaurantId,
}) {
  const { getTotalItemsCount } = useShop();
  const navigate = useNavigate();
  const totalItems = getTotalItemsCount();
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleTrackOrder = () => {
    if (orderId.trim()) {
      navigate(`/track-order/${orderId.trim()}`);
      setShowTrackOrder(false);
      setOrderId("");
    }
  };
  return (
    <>
      <div className="text-white bg-black border-b border-gray-200 sticky top-0 z-30">
        <div className=" mx-auto">
          <div className="flex flex-col gap-2 ">
            <div className="text-center text-sm px-4 py-2">
              Order here for best price, faster service, savings on fees, and to support local business.
            </div>
            <div className=" bg-white flex justify-center px-4 py-2">
              <div className="flex items-center justify-between bg-white w-full max-w-7xl">
              <div className="flex-1"></div>

              <div className="flex items-center justify-center gap-2 py-2 px-4 flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 60" className="h-8">
                  <path d="m59.813 0-.465.93a13.8 13.8 0 0 1-4.102 4.914q-.473.353-.976.672a13.84 13.84 0 0 1-6.762 2.058H25.637a12.8 12.8 0 0 0-4.274.73 12.88 12.88 0 0 0-7.816 7.837 12.9 12.9 0 0 0-.73 4.289c0 1.504.253 2.941.73 4.285a12.5 12.5 0 0 0 1.605 3.11 12.86 12.86 0 0 0 6.211 4.73q.445.153.895.277c1.078.297 2.207.45 3.375.45h8.543a4.28 4.28 0 0 1 4.273 4.288 4.277 4.277 0 0 1-4.273 4.285h-8.54a21 21 0 0 1-3.648-.312q-.315-.05-.625-.113a21.2 21.2 0 0 1-8.547-3.86 21.5 21.5 0 0 1-4.273-4.285 21.3 21.3 0 0 1-3.844-8.57 21.8 21.8 0 0 1 0-8.574 21.3 21.3 0 0 1 3.844-8.57 21.6 21.6 0 0 1 4.273-4.286A21.15 21.15 0 0 1 21.363.43 21.4 21.4 0 0 1 25.637 0Zm0 0" style={{ stroke: 'none', fillRule: 'nonzero', fill: 'rgb(235, 23, 0)', fillOpacity: 1 }}></path>
                  <path d="M55.543 38.57c0 1.465-.148 2.899-.43 4.285a21.25 21.25 0 0 1-3.843 8.57 21.5 21.5 0 0 1-4.274 4.29 21.2 21.2 0 0 1-8.543 3.855 21.7 21.7 0 0 1-4.273.426H12.816V60H0l.465-.93a13.76 13.76 0 0 1 4.101-4.91c.317-.238.641-.465.977-.672a13.7 13.7 0 0 1 7.008-2.066h21.633c1.5 0 2.933-.258 4.273-.727a12.89 12.89 0 0 0 7.816-7.843 13 13 0 0 0 0-8.574 12.84 12.84 0 0 0-8.715-8.113 12.7 12.7 0 0 0-3.37-.454h-8.551a4.277 4.277 0 0 1-4.274-4.285 4.28 4.28 0 0 1 4.274-4.29h8.543c1.246 0 2.465.11 3.648.317q.316.053.621.113a21.1 21.1 0 0 1 8.543 3.856 21.4 21.4 0 0 1 8.55 17.148Zm23.129-1.96q1.178.674 3.27 1.253c1.41.375 2.796.563 4.167.563s2.368-.188 2.993-.563q.932-.579.933-1.855 0-.88-.543-1.52-.54-.638-1.605-1.218-1.066-.598-3.625-1.817-3.087-1.465-4.88-3.562-1.794-2.103-1.796-5.29 0-2.53 1.254-4.292 1.271-1.765 3.55-2.645 2.3-.881 5.348-.883c1.89 0 3.532.176 4.914.528q2.075.506 3.102 1.105l-1.102 5.363q-.915-.713-2.726-1.257a11.9 11.9 0 0 0-3.57-.563q-1.966.002-2.958.637-.967.64-.968 1.765-.001.845.484 1.5.505.655 1.531 1.274 1.031.599 2.899 1.46 2.671 1.202 4.336 2.384c1.12.789 1.984 1.707 2.582 2.757.597 1.036.894 2.282.894 3.73q0 2.57-1.215 4.481-1.194 1.892-3.53 2.946-2.339 1.03-5.626 1.03-1.909 0-3.777-.28a24 24 0 0 1-3.235-.696c-.921-.273-1.582-.539-1.98-.789Zm48.039 7.011h-7.98q-.17-.262-.637-1.164l-.578-1.086q-2.674-5.044-5.29-8.945l-2.597 3.094v8.101h-7.086V15.082h7.086v12.02l8.879-12.02h7.719l-9.329 12.3q1.214 1.706 3.067 4.782a717 717 0 0 1 4.523 7.648l1.008 1.727Zm11.629-28.539v28.54h-7.176v-28.54Zm10.418 0q1.25 0 3.828-.148c1.797-.102 3.184-.153 4.172-.153q5.378.002 8.168 2.364 2.8 2.344 2.8 7.707-.001 3.376-1.343 5.738-1.347 2.363-3.965 3.582c-1.742.812-3.875 1.219-6.39 1.219-1.133 0-2.102-.016-2.9-.04v8.27h-7.14V15.082Zm7.27 15.188q2.167 0 3.437-1.313c.86-.875 1.293-2.254 1.293-4.145q-.001-2.343-1.18-3.69-1.158-1.353-3.476-1.352c-1.172 0-2.16.07-2.973.207V30.12q1.57.148 2.898.149Zm24.171-15.188v23.156h9.383v5.383h-16.617V15.082Zm22.098 0v28.54h-7.18v-28.54Zm0 0" style={{ stroke: 'none', fillRule: 'nonzero', fill: 'rgb(235, 23, 0)', fillOpacity: 1 }}></path>
                </svg>
              </div>
              <div className="flex-1 flex justify-end gap-3 pr-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    disabled={!isRestaurantActive}
                    className={`border-2 rounded-xl px-4 py-2 flex items-center gap-2 transition-colors ${
                      isRestaurantActive 
                        ? 'bg-white text-black border-black hover:bg-gray-50' 
                        : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold text-sm">Profile</span>
                  </button>
                  {showProfileMenu && isRestaurantActive && (
                    <>
                      <div 
                        className="fixed inset-0 z-30"
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-40 overflow-hidden">
                        <div className="py-2">
                          <button 
                            onClick={() => {
                              navigate(`/shop/${restaurantId}/order-history`);
                              setShowProfileMenu(false);
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors text-left"
                          >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <div>
                              <p className="font-semibold text-gray-900">Order History</p>
                              <p className="text-xs text-gray-500">View all your orders</p>
                            </div>
                          </button>
                          <button 
                            onClick={() => {
                              setShowTrackOrder(true);
                              setShowProfileMenu(false);
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors text-left"
                          >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                              <p className="font-semibold text-gray-900">Track Order</p>
                              <p className="text-xs text-gray-500">Track by order ID</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={onPromotionsClick}
                  disabled={!isRestaurantActive}
                  className={`relative rounded-xl px-4 py-2 flex items-center gap-2 shadow-md transition-colors ${
                    isRestaurantActive 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span className="font-semibold text-sm">Offers</span>
                  {hasActiveDiscounts && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{Object.keys(hasActiveDiscounts).length > 9 ? '9+' : hasActiveDiscounts}</span>
                    </span>
                  )}
                </button>

                <button 
                  onClick={onCartClick}
                  disabled={!isRestaurantActive}
                  className={`rounded-xl px-4 py-2 flex items-center gap-3 shadow-md transition-colors ${
                    isRestaurantActive 
                      ? 'bg-black text-white hover:bg-gray-900' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-lg">{totalItems}</span>
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTrackOrder && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowTrackOrder(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 z-50 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Track Your Order</h2>
              <button 
                onClick={() => setShowTrackOrder(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Enter your order ID to track its status
            </p>
            
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
              placeholder="Enter Order ID"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            
            <button
              onClick={handleTrackOrder}
              disabled={!orderId.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Track Order
            </button>
          </div>
        </>
      )}
    </>
  );
}
