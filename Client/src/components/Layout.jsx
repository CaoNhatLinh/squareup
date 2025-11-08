import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import MainSidebar from './MainSidebar'
import { useAuth } from '../hooks/useAuth'
import NotificationPermissionBanner from './notifications/NotificationPermissionBanner'
import { OrderNotificationProvider } from '../context/OrderNotificationProvider'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  
  const publicRoutes = ['/', '/signin', '/signup']
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const isShopRoute = location.pathname.startsWith('/shop/')
  
  const showSidebar = user && !isPublicRoute && !isShopRoute

  return (
    <OrderNotificationProvider>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        {showSidebar && (
          <MainSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <div className="flex-1 min-h-screen overflow-y-auto flex flex-col">
          {showSidebar && <NotificationPermissionBanner />}
          
          <main className={showSidebar ? 'w-full flex-1 p-6' : 'flex-1'}>
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </OrderNotificationProvider>
  )
}
