import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import MainSidebar from './MainSidebar'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  
  const publicRoutes = ['/', '/signin', '/signup']
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const isShopRoute = location.pathname.startsWith('/shop/')
  
  const showSidebar = user && !isPublicRoute && !isShopRoute

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {showSidebar && (
        <MainSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className="flex-1 min-h-screen overflow-y-auto">
        <main className={showSidebar ? 'max-w-7xl mx-auto p-6' : ''}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}
