import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  HiXMark,
  HiUserCircle,
  HiCog8Tooth,
  HiCreditCard,
} from "react-icons/hi2";
import { FiLogOut } from "react-icons/fi";

export default function RestaurantDropdown({ restaurantName }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between font-bold text-lg text-gray-800 hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors"
        aria-expanded={isOpen}
        aria-controls="account-drawer"
      >
        <div className="flex items-center gap-3">
          <span>{restaurantName}</span>
        </div>
        <svg
          className="w-5 h-5 text-gray-500 transform rotate-90 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            <div
              id="account-drawer"
              className={`fixed top-0 right-0 h-screen w-full max-w-sm bg-white shadow-2xl z-[9999] flex flex-col transform transition-transform duration-300 ease-out ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Account
                </h2>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <HiXMark className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="flex-grow p-6 space-y-8">
                <div className="p-5 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 mb-4 border-b border-red-100 pb-3">
                    <HiUserCircle className="w-8 h-8 text-red-600" />

                    <p className="font-bold text-lg text-gray-900">
                      {user?.displayName || "User Admin"}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mb-1">
                    Email:
                    <span className="font-medium text-gray-700">
                      {user?.email || "N/A"}
                    </span>
                  </p>

                  <p className="text-sm text-gray-600">
                    Restaurant:
                    <span className="font-medium text-gray-700">
                      {restaurantName}
                    </span>
                  </p>
                </div>
                <nav className="space-y-1 border border-gray-200 rounded-xl p-2 bg-white">
                  <Link
                    to="/settings/profile"
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <HiCog8Tooth className="w-5 h-5 text-gray-500" />
                    Account Settings
                  </Link>

                  <Link
                    to="/settings/billing"
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <HiCreditCard className="w-5 h-5 text-gray-500" />
                    Billing & Plans
                  </Link>
                </nav>
                <Link
                  to="/signout"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors mt-6 font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Sign out</span>
                </Link>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
