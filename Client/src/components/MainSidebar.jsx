import React from 'react'
import { useRestaurant } from '../hooks/useRestaurant'
import MenuItem from './navigation/MenuItem'
import RestaurantDropdown from './navigation/RestaurantDropdown'
import { menuItems } from '../config/menuConfig'
import { HiSearch, HiCreditCard, HiBell, HiCalendar, HiQuestionMarkCircle } from 'react-icons/hi'

export default function Sidebar({ isOpen, onClose }) {
  const { restaurant } = useRestaurant()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        flex flex-col w-64 bg-white border-r h-screen overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="px-4 py-6">
              <RestaurantDropdown restaurantName={restaurant?.name || 'Restaurant'} />
            </div>

            <div className="px-2 mb-4">
              <div className="relative">
                <HiSearch className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <nav className="px-2 space-y-1">
              {menuItems.map((item, idx) => (
                <MenuItem key={idx} item={item} level={0} />
              ))}
            </nav>
          </div>

          {/* <div className="p-4 space-y-3">
            <button className="w-full bg-gray-100 text-gray-700 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-2">
              <HiCreditCard className="w-5 h-5" />
              Take payment
            </button>
            <div className="flex items-center justify-around text-gray-600">
              <button className="p-2 hover:bg-gray-100 rounded">
                <HiBell className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <HiCalendar className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <HiQuestionMarkCircle className="w-5 h-5" />
              </button>
            </div>
          </div> */}
        </div>
      </aside>
    </>
  )
}
