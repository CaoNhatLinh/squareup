

import React from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useRestaurant } from '../hooks/useRestaurant'
import { useAuth } from '../hooks/useAuth'
import MenuItem from './navigation/MenuItem'
import RestaurantDropdown from './navigation/RestaurantDropdown'
import { getMenuItems } from '../config/menuConfig'
import {
  HiSearch,
  HiUserGroup,
  HiArrowLeft,
  HiOutlineShieldCheck
} from 'react-icons/hi'

export default function Sidebar({ isOpen, onClose }) {
  const { restaurantId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { restaurant, loading: restaurantLoading } = useRestaurant()
  const { user, loading: authLoading } = useAuth()

  const isAdminPath = location.pathname.startsWith('/admin')
  const adminManagedRestaurantId = sessionStorage.getItem('adminManagingRestaurant')
  const isAdminManagingRestaurant = user?.isAdmin && restaurantId &&
    (isAdminPath || adminManagedRestaurantId === restaurantId)

  React.useEffect(() => {
    if (adminManagedRestaurantId && adminManagedRestaurantId !== restaurantId) {
      sessionStorage.removeItem('adminManagingRestaurant')
    }
  }, [restaurantId, adminManagedRestaurantId])

  const menuItems = restaurantId ? getMenuItems(restaurantId) : []
  const isLoading = authLoading || (restaurantId && !['signin', 'signup', 'signout', 'admin', 'dashboard', 'restaurants', 'shop', 'track-order'].includes(restaurantId) && restaurantLoading)

  if (!authLoading && !user) {
    return null;
  }

  const adminMenuItems = [
    {
      label: 'All Restaurants',
      to: '/admin',
      icon: HiUserGroup
    }
  ]


  if (isLoading) {
    return (
      <aside className="fixed md:static inset-y-0 left-0 top-0 bottom-0 z-50 flex flex-col w-64 bg-white border-r border-gray-200 h-screen shadow-lg">
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0 px-6 py-8 border-b border-gray-200">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="px-4 mb-6">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="px-4 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50
        flex flex-col w-64 bg-white
        border-r border-gray-200 h-screen
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="flex-shrink-0">
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center mb-4">
              <RestaurantDropdown restaurantName={restaurant?.name || 'Select Restaurant'} />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-colors duration-200"
                />
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 min-h-0">
            {isAdminManagingRestaurant && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="px-2 mb-3">
                  <button
                    onClick={() => {
                      sessionStorage.removeItem('adminManagingRestaurant');
                      navigate('/admin');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 group"
                  >
                    <HiArrowLeft className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="flex-1 text-left font-medium text-sm">Back to Admin</span>
                  </button>
                </div>
              </div>
            )}
            {user?.isAdmin && !restaurantId && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <HiOutlineShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </h3>
                </div>
                {adminMenuItems.map((item, idx) => (
                  <MenuItem key={idx} item={item} level={0} />
                ))}
              </div>
            )}
            {menuItems.length > 0 && (
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Restaurant Menu
                </h3>
              </div>
            )}
            {menuItems.map((item, idx) => (
              <MenuItem key={idx} item={item} level={0} />
            ))}
          </nav>

          <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200 mt-auto">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.email}
                </p>
              </div>
              {user?.isAdmin && (
                <div className="flex-shrink-0">
                  <HiOutlineShieldCheck className="w-4 h-4 text-yellow-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
