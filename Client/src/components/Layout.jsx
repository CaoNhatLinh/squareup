import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MainSidebar from "./MainSidebar";
import { useAuth } from "../hooks/useAuth";
import NotificationPermissionBanner from "./notifications/NotificationPermissionBanner";
import { OrderNotificationProvider } from "../context/OrderNotificationProvider";
import { RestaurantProvider } from "../context/RestaurantProvider";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isAuthRoute =
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname === "/signout";
  const isSelectorRoute = location.pathname === "/restaurants";
  const isShopRoute =
    location.pathname.startsWith("/shop/") ||
    location.pathname.startsWith("/track-order/");
  const showSidebar = user && !isAuthRoute && !isSelectorRoute && !isShopRoute;

  return (
    <RestaurantProvider>
      <OrderNotificationProvider>
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">
          {showSidebar && (
            <MainSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 min-h-screen overflow-y-auto flex flex-col">
            {showSidebar && <NotificationPermissionBanner />}

            <main className={showSidebar ? "w-full flex-1 p-6" : "flex-1"}>
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </OrderNotificationProvider>
    </RestaurantProvider>
  );
}
