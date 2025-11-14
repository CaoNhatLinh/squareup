import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import {
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineShieldCheck,
  HiOutlineClipboardList,
  HiOutlineUserAdd,
  HiChevronDown,
  HiOutlineSparkles,
} from 'react-icons/hi';

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { user, loading: authLoading } = useAuth();

  const isGuestUser = user?.role === 'guest';
  const guestUuid = isGuestUser && user?.email ? user.email.replace('guest_', '').replace('@guest.local', '') : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOrderHistory = () => {
    if (restaurantId) {
      navigate(`/shop/${restaurantId}/order-history`);
    }
    setIsOpen(false);
  };

  const handleUpgradeAccount = () => {
    navigate('/signup', { state: { fromGuest: true, guestUuid } });
    setIsOpen(false);
  };

  const handleProfile = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
      >
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isGuestUser
              ? 'bg-purple-600 ring-2 ring-purple-200'
              : user?.isAdmin
              ? 'bg-yellow-600 ring-2 ring-yellow-200'
              : 'bg-blue-600'
          }`}
        >
          <span className="text-white font-bold text-sm">
            {user?.displayName?.charAt(0)?.toUpperCase() ||
              user?.email?.charAt(0)?.toUpperCase() ||
              'U'}
          </span>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || (isGuestUser ? 'Guest User' : 'User')}
            </p>
            {user?.isAdmin && (
              <HiOutlineShieldCheck className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            )}
            {isGuestUser && (
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded flex-shrink-0">
                Guest
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {isGuestUser ? `ID: ${guestUuid?.slice(0, 8)}...` : user?.email}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <HiChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isGuestUser
                    ? 'bg-purple-600'
                    : user?.isAdmin
                    ? 'bg-yellow-600'
                    : 'bg-blue-600'
                }`}
              >
                <span className="text-white font-bold">
                  {user?.displayName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user?.displayName || (isGuestUser ? 'Guest User' : 'User')}
                </p>
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  {isGuestUser ? user?.email : user?.email}
                </p>
                {isGuestUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    Guest ID: {guestUuid}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {user?.isAdmin && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <HiOutlineShieldCheck className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                  {isGuestUser && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      Guest Account
                    </span>
                  )}
                  {!isGuestUser && !user?.isAdmin && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Member
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {!isGuestUser && (
              <button
                onClick={handleProfile}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <HiOutlineUser className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">
                  Profile Settings
                </span>
              </button>
            )}

            {restaurantId && (
              <button
                onClick={handleOrderHistory}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <HiOutlineClipboardList className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">
                  Order History
                </span>
              </button>
            )}

            {isGuestUser && (
              <>
                <div className="my-2 border-t border-gray-200"></div>
                <button
                  onClick={handleUpgradeAccount}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors duration-200 text-left group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <HiOutlineSparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Upgrade Account
                    </p>
                    <p className="text-xs text-gray-600">
                      Create full account & keep your orders
                    </p>
                  </div>
                  <HiOutlineUserAdd className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 rounded-lg transition-colors duration-200 text-left group"
            >
              <HiOutlineLogout className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
              <span className="text-sm text-gray-700 font-medium group-hover:text-red-600">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
