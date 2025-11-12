import  { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MainSidebar from "./MainSidebar";
import { useAuth } from "@/hooks/useAuth";
import NotificationPermissionBanner from "./notifications/NotificationPermissionBanner";
import { OrderNotificationProvider } from "@/context/OrderNotificationProvider.jsx";
import { RestaurantProvider } from "@/context/RestaurantProvider.jsx";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const isSelectorRoute = location.pathname === "/restaurants";
  const isShopRoute =
    location.pathname.startsWith("/shop/") ||
    location.pathname.startsWith("/track-order/");
  
  const showSidebar = !isSelectorRoute && !isShopRoute && 
    (user || authLoading);
  return (
    <RestaurantProvider>
      <OrderNotificationProvider>
        <div className=" bg-gray-50 flex">
          {showSidebar && (
            <MainSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}
          <div className="flex-1 min-h-screen overflow-y-auto flex flex-col ">
            {showSidebar && <NotificationPermissionBanner />}

            <main className={showSidebar ? "flex-1 p-6 md:ml-64" : "flex-1"}>
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </OrderNotificationProvider>
    </RestaurantProvider>
  );
}
