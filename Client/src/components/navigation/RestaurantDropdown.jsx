import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HiChevronRight, HiXMark ,  HiUserCircle, HiBuildingStorefront } from 'react-icons/hi2' 
import { FiLogOut } from "react-icons/fi";
export default function RestaurantDropdown({ restaurantName }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Xử lý đóng/mở (Giữ nguyên - Đã rất tốt)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Nút Kích hoạt Dropdown/Drawer (TỐI ƯU HÓA) */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between font-bold text-lg text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors"
        aria-expanded={isOpen}
        aria-controls="account-drawer"
      >
        <div className="flex items-center gap-2">
            <span>{restaurantName}</span>
        </div>
        <HiChevronRight className="w-5 h-5 text-gray-500" />
      </button>
      
      {isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="account-drawer"
            className={`fixed top-0 right-0 h-screen w-full max-w-sm bg-white shadow-2xl z-[9999] flex flex-col transform transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">Your Account</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <HiXMark  className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Nội dung Tài khoản */}
            <div className="flex-grow p-6 space-y-6">
              
              {/* Khối Thông tin User */}
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                    <HiUserCircle className="w-8 h-8 text-blue-600" />
                    <p className="font-bold text-lg text-gray-900">{user?.displayName || 'User Admin'}</p>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">Email: <span className="font-medium text-gray-700">{user?.email || 'N/A'}</span></p>
                <p className="text-sm text-gray-600">Restaurant: <span className="font-medium text-gray-700">{restaurantName}</span></p>
              </div>

              {/* Tùy chọn Điều hướng (Có thể thêm Settings, Profile...) */}
              <nav className="space-y-1">
                <Link
                  to="/settings/profile"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <HiChevronRight className="w-5 h-5 opacity-0" /> {/* Dùng làm placeholder để căn lề */}
                  Account Settings
                </Link>
                
                <Link
                  to="/settings/billing"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <HiChevronRight className="w-5 h-5 opacity-0" />
                  Billing & Plans
                </Link>
              </nav>

              {/* Nút Đăng xuất */}
              <Link
                to="/signout"
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors mt-6"
                onClick={() => setIsOpen(false)}
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-semibold">Sign out</span>
              </Link>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}