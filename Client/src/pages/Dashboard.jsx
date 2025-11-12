import { Link, useLoaderData } from 'react-router-dom';
import {
  HiOutlineEye,
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineLink,
  HiOutlineClipboard,
  HiOutlineCog
} from 'react-icons/hi2';

export default function Dashboard() {
  const { restaurant } = useLoaderData();
  const shopUrl = `/shop/${restaurant?.id || 'unknown'}`;

  const copyToClipboard = () => {
    const urlToCopy = `${window.location.origin}/shop/${restaurant?.id}`;
    navigator.clipboard.writeText(urlToCopy);
    alert('Shop link copied to clipboard!');
  };
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl shadow-lg">
            <HiOutlineChartBar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your restaurant today.</p>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <HiOutlineEye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Public Shop</h2>
                <p className="text-slate-600">Share this link with your customers to start taking orders</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  disabled={!restaurant?.id}
                >
                  <HiOutlineLink className="w-5 h-5" />
                  View Shop Page
                </Link>

                {restaurant?.id && (
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-xl font-semibold transition-all duration-200 border border-slate-300"
                  >
                    <HiOutlineClipboard className="w-5 h-5" />
                    Copy Link
                  </button>
                )}
              </div>

              {restaurant?.id && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">Your shop URL:</p>
                  <code className="text-sm bg-white px-3 py-2 rounded-lg border border-slate-300 text-slate-800 break-all">
                    {window.location.origin}/shop/{restaurant.id}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              to={`/${restaurant?.id}/items`}
              className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <HiOutlineShoppingBag className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-900">Manage Items</p>
              </div>
            </Link>

            <Link
              to={`/${restaurant?.id}/orders`}
              className="p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <HiOutlineShoppingBag className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-900">View Orders</p>
              </div>
            </Link>

            <Link
              to={`/${restaurant?.id}/settings/restaurant`}
              className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <HiOutlineCog className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-slate-900">Settings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}