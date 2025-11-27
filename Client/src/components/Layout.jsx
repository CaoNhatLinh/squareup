import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAppStore from '@/store/useAppStore'
import MainSidebar from "@/components/MainSidebar";
import { useAuth } from "@/hooks/useAuth";
import NotificationPermissionBanner from "@/components/notifications/NotificationPermissionBanner";
import { OrderNotificationProvider } from "@/context/OrderNotificationProvider.jsx";
import { RestaurantProvider } from "@/context/RestaurantProvider.jsx";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const restaurantId = useAppStore((s) => s.restaurantId);

  const isSelectorRoute = location.pathname === "/restaurants";
  const isShopRoute = (() => {
    const firstSegment = (location.pathname.split('/')[1] || '').toLowerCase();
    const reserved = ['admin', 'signin', 'signup', 'signout', 'restaurant', 'accept-invitation', 'pos', 'restaurants', 'dashboard', 'settings', 'api', 'track-order'];
    if (location.pathname.startsWith('/shop/') || location.pathname.startsWith('/track-order/')) return true;
    if (firstSegment && !reserved.includes(firstSegment)) return true;
    return false;
  })();
  const isPublicStorefront = location.pathname !== "/" &&
    !location.pathname.startsWith("/restaurant") &&
    !location.pathname.startsWith("/admin") &&
    !location.pathname.startsWith("/signin") &&
    !location.pathname.startsWith("/signup") &&
    !location.pathname.startsWith("/signout") &&
    !location.pathname.startsWith("/accept-invitation") &&
    !location.pathname.startsWith("/pos");

  useEffect(() => {
    if (authLoading) return;

    // Skip check for shop, public storefront, selector page, and admin pages
    if (isShopRoute || isPublicStorefront || isSelectorRoute || location.pathname.startsWith('/admin')) {
      return;
    }

    if (!user) {
      navigate('/signin', { replace: true });
      return;
    }

    if (!restaurantId) {
      navigate('/restaurants', { replace: true });
    }
  }, [authLoading, user, restaurantId, isShopRoute, isPublicStorefront, isSelectorRoute, location.pathname, navigate]);

  const showSidebar = !isSelectorRoute && !isShopRoute && !isPublicStorefront &&
    (user || authLoading);
  const collapsed = useAppStore(s => s.sidebarCollapsed)
  const mainClass = showSidebar ? `flex-1 ${collapsed ? 'md:ml-20' : 'md:ml-64'}` : 'flex-1'
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
            {showSidebar && (
              <>
                <NotificationPermissionBanner />
              </>
            )}

            <main className={mainClass}>
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </OrderNotificationProvider>
    </RestaurantProvider>
  );
}
