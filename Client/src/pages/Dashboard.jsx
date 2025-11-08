import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { HiOutlineEye, HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineChartBar } from 'react-icons/hi'; // Icons mới

export default function Dashboard() {
  const { user } = useAuth();
  const shopUrl = `/shop/${user?.uid || 'unknown'}`;
  
  // Hàm sao chép URL
  const copyToClipboard = () => {
    const urlToCopy = `${window.location.origin}/shop/${user.uid}`;
    navigator.clipboard.writeText(urlToCopy);
    alert('Shop link copied to clipboard!');
  };

  return (
    <div className="p-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HiOutlineEye className="w-6 h-6 text-blue-600" />
          Your Public Shop Page
        </h2>
        <p className="text-gray-600 mb-6 max-w-lg">
          Customers can view your full menu and place orders using the dedicated public shop link below.
        </p>
        
        {!user?.uid ? (
          <div className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
            ⚠️ User ID is not available. Please try signing in again.
          </div>
        ) : null}
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Link
            to={shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
            disabled={!user?.uid}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Shop Now
          </Link>
          
          {user?.uid && (
            <div className="flex-1 w-full flex items-stretch">
              <code className="flex-1 p-3 bg-gray-100 text-gray-700 text-sm rounded-l-lg border border-gray-300 overflow-x-auto whitespace-nowrap">
                {window.location.origin}/shop/{user.uid}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-gray-200 text-gray-700 p-3 rounded-r-lg border border-gray-300 hover:bg-gray-300 transition-colors text-sm font-medium flex-shrink-0"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}