import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAppStore from "@/store/useAppStore";
import MainSidebar from "@/components/MainSidebar";
import { useAuth } from "@/hooks/useAuth";
import NotificationPermissionBanner from "@/components/notifications/NotificationPermissionBanner";
import { OrderNotificationProvider } from "@/context/OrderNotificationProvider.jsx";
import { RestaurantProvider } from "@/context/RestaurantProvider.jsx";
import { STORAGE_KEYS } from "@/constants/storageConstants";
import { HiMenu } from "react-icons/hi";

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const restaurantId = useAppStore((s) => s.restaurantId);

    const isSelectorRoute = location.pathname === "/restaurants";
    const isShopRoute = (() => {
        const firstSegment = (location.pathname.split("/")[1] || "").toLowerCase();
        const reserved = [
            "admin",
            "signin",
            "signup",
            "signout",
            "restaurant",
            "accept-invitation",
            "pos",
            "restaurants",
            "settings",
            "api",
            "track-order",
        ];
        if (
            location.pathname.startsWith("/shop/") ||
            location.pathname.startsWith("/track-order/")
        )
            return true;
        if (firstSegment && !reserved.includes(firstSegment)) return true;
        return false;
    })();

    const isPublicStorefront =
        location.pathname !== "/" &&
        !location.pathname.startsWith("/restaurant") &&
        !location.pathname.startsWith("/admin") &&
        !location.pathname.startsWith("/signin") &&
        !location.pathname.startsWith("/signup") &&
        !location.pathname.startsWith("/signout") &&
        !location.pathname.startsWith("/accept-invitation") &&
        !location.pathname.startsWith("/pos");

    useEffect(() => {
        if (authLoading) return;
        if (
            isShopRoute ||
            isPublicStorefront ||
            isSelectorRoute ||
            location.pathname.startsWith("/admin")
        ) {
            return;
        }

        if (!user) {
            navigate("/signin", { replace: true });
            return;
        }

        if (!restaurantId) {
            const adminManagedId = sessionStorage.getItem(
                STORAGE_KEYS.ADMIN_MANAGING_RESTAURANT
            );
            if (adminManagedId) {
                useAppStore.getState().setRestaurantId(adminManagedId);
                return;
            }
            navigate("/restaurants", { replace: true });
        }
    }, [
        authLoading,
        user,
        restaurantId,
        isShopRoute,
        isPublicStorefront,
        isSelectorRoute,
        location.pathname,
        navigate,
    ]);

    const showSidebar =
        !isSelectorRoute &&
        !isShopRoute &&
        !isPublicStorefront &&
        (user || authLoading);

    const collapsed = useAppStore((s) => s.sidebarCollapsed);
    const mainClass = showSidebar
        ? `flex-1 ${collapsed ? "md:ml-20" : "md:ml-64"} transition-all duration-300`
        : "flex-1";

    if (
        authLoading &&
        !isShopRoute &&
        !isPublicStorefront &&
        !isSelectorRoute &&
        !location.pathname.startsWith("/signin") &&
        !location.pathname.startsWith("/signup")
    ) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <RestaurantProvider>
            <OrderNotificationProvider>
                <div className="bg-gray-50 flex min-h-screen">
                    {showSidebar && (
                        <MainSidebar
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                        />
                    )}
                    <div className="flex-1 flex flex-col min-h-screen relative w-full">
                        {showSidebar && (
                            <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                >
                                    <span className="sr-only">Open sidebar</span>
                                    <HiMenu className="h-6 w-6" aria-hidden="true" />
                                </button>
                                <span className="font-semibold text-gray-900">Dashboard</span>
                                <div className="w-8"></div>
                            </div>
                        )}
                        <main className={`${mainClass}`}>
                            {showSidebar && (
                                <div className="hidden md:block">
                                    <NotificationPermissionBanner />
                                </div>
                            )}
                            {showSidebar && (
                                <div className="md:hidden">
                                    <NotificationPermissionBanner />
                                </div>
                            )}
                            {children || <Outlet />}
                        </main>
                    </div>
                </div>
            </OrderNotificationProvider>
        </RestaurantProvider>
    );
}