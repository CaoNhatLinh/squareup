import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import * as authApi from "@/api/auth";
import {
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineShieldCheck,
  HiOutlineClipboardList,
  HiOutlineUserAdd,
  HiChevronDown,
  HiOutlineSparkles,
} from "react-icons/hi";

export default function ProfileMenu({ collapsed = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, loading: authLoading } = useAuth();
  const isGuestUser = user?.role === "guest";
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      try {
        await authApi.sessionLogout();
      } catch (e) {
        console.warn("sessionLogout failed:", e?.message || e);
      }
      try {
        localStorage.removeItem("selectedRestaurantId");
      } catch (e) {
        console.warn("localStorage removeItem failed:", e?.message || e);
      }
      try {
        sessionStorage.removeItem("adminManagingRestaurant");
      } catch (e) {
        console.warn("sessionStorage removeItem failed:", e?.message || e);
      }
      await signOut(auth);
      setIsOpen(false);
      window.location.href = "/signin";
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
        className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 group`}
        title={collapsed ? (user?.displayName || user?.email || 'User') : undefined}
      >
        <div
          className={`rounded-full flex items-center justify-center flex-shrink-0 ${
            isGuestUser
              ? 'bg-purple-600 ring-2 ring-purple-200'
              : user?.isAdmin
              ? 'bg-yellow-600 ring-2 ring-yellow-200'
              : 'bg-blue-600'
          } ${collapsed ? 'w-10 h-10' : 'w-10 h-10'}`}
        >
          <span className="text-white font-bold text-sm">
            {user?.displayName?.charAt(0)?.toUpperCase() ||
              user?.email?.charAt(0)?.toUpperCase() ||
              'U'}
          </span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || 'User'}
              </p>
              {user?.isAdmin && (
                <HiOutlineShieldCheck className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        )}
        {!collapsed && (
          <HiChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isGuestUser
                    ? "bg-purple-600"
                    : user?.isAdmin
                    ? "bg-yellow-600"
                    : "bg-blue-600"
                }`}
              >
                <span className="text-white font-bold">
                  {user?.displayName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user?.displayName || "User"}
                </p>
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {user?.isAdmin && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <HiOutlineShieldCheck className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                  {!user?.isAdmin && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Member
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
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
