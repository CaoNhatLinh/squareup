import { createBrowserRouter, redirect } from "react-router-dom";
import Layout from "@/components/Layout";
import AdminRoute from "@/components/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import SignOut from "@/pages/auth/SignOut";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import RestaurantSelector from "@/pages/restaurants/RestaurantSelector";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Categories from "@/pages/categories/Categories";
import CreateCategory from "@/pages/categories/CreateCategory";
import EditCategory from "@/pages/categories/EditCategory";
import ItemLibrary from "@/pages/items/ItemLibrary";
import CreateItem from "@/pages/items/CreateItem";
import EditItem from "@/pages/items/EditItem";
import BusinessAbout from "@/pages/settings/BusinessAbout";
import BusinessHours from "@/pages/settings/BusinessHours";
import SpecialClosures from "@/pages/settings/SpecialClosures";
import Modifiers from "@/pages/modifiers/Modifiers";
import CreateModifier from "@/pages/modifiers/CreateModifier";
import EditModifier from "@/pages/modifiers/EditModifier";
import Discounts from "@/pages/discounts/Discounts";
import CreateDiscount from "@/pages/discounts/CreateDiscount";
import EditDiscount from "@/pages/discounts/EditDiscount";
import { fetchDiscounts } from "@/api/discounts";
import ShopPage from "@/pages/shop/ShopPage";
import { ShopProvider } from "@/context/ShopProvider";
import ShopLayout from "@/pages/shop/ShopLayout";
import CheckoutSuccessWrapper from "@/pages/shop/checkout/CheckoutSuccessWrapper";
import CheckoutCancelled from "@/pages/shop/checkout/CheckoutCancelled";
import OrderHistory from "@/pages/shop/OrderHistory";
import OrderReview from "@/pages/shop/OrderReview";
import Orders from "@/pages/orders/Orders";
import NotFound from "@/pages/NotFound";
import OrderDetails from "@/pages/orders/OrderDetails";
import DeveloperTools from "@/pages/settings/DeveloperTools";
import TrackOrder from "@/pages/public/TrackOrder";
import PublicStorefront from "@/pages/public/PublicStorefront";
import RestaurantSettings from "@/pages/settings/RestaurantSettings";
import WebsiteBuilder from "@/pages/settings/WebsiteBuilder";
import Reviews from "@/pages/reviews/Reviews";
import Transactions from "@/pages/transactions/Transactions";
import TransactionDetails from "@/pages/transactions/TransactionDetails";
import RolesManagement from "@/pages/settings/RolesManagement";
import RoleForm from "@/pages/settings/RoleForm";
import StaffManagement from "@/pages/settings/StaffManagement";
import AcceptInvitation from "@/pages/auth/AcceptInvitation";
import Customers from "@/pages/customers/Customers";
import CustomerOrders from "@/pages/customers/CustomerOrders";
import TableListPage from "@/pages/pos/TableListPage";
import TablePOSPage from "@/pages/pos/TablePOSPage";



export const discountsLoader = async () => {
  try {
    const restaurantId =
      typeof window !== "undefined"
        ? localStorage.getItem("restaurantId")
        : null;
    const data = await fetchDiscounts(restaurantId).catch(() => ({
      discounts: [],
      meta: {},
    }));
    const discounts = data.discounts || [];
    return { discounts };
  } catch (error) {
    if (error?.response?.status === 401) {
      throw redirect("/signin");
    }
    throw redirect("/signin");
  }
};

export const router = createBrowserRouter([
  {
    path: "/shop",
    element: <ShopLayout />,
    children: [
      {
        index: true,
        element: <ShopPage />,
      },
      {
        path: "order-history",
        element: <ShopProvider><OrderHistory /></ShopProvider>,
      },
      {
        path: "review/:orderId",
        element: <ShopProvider><OrderReview /></ShopProvider>,
      },
      {
        path: "success",
        element: <CheckoutSuccessWrapper />,
      },
      {
        path: "cancelled",
        element: <ShopProvider><CheckoutCancelled /></ShopProvider>,
      },
    ],
  },
  {
    path: "/:slug/order",
    element: <ShopLayout />,
    children: [
      { index: true, element: <ShopPage /> },
      { path: "order-history", element: <ShopProvider><OrderHistory /></ShopProvider> },
      { path: "review/:orderId", element: <ShopProvider><OrderReview /></ShopProvider> },
      { path: "success", element: <CheckoutSuccessWrapper /> },
      { path: "cancelled", element: <ShopProvider><CheckoutCancelled /></ShopProvider> },
      { path: "track-order/:orderId", element: <TrackOrder /> },
    ]
  },

  {
    path: "/restaurants",
    element: <RestaurantSelector />,
    loader: async () => {
      return {};
    },
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Layout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
    ],
  },
  { index: true, element: <Home /> },
  { path: "signin", element: <SignIn /> },
  { path: "signup", element: <SignUp /> },
  { path: "signout", element: <SignOut /> },
  { path: "accept-invitation", element: <AcceptInvitation /> },

  {
    element: <Layout />,
    children: [
      {
        path: "dashboard",
        loader: async () => {
          throw redirect("/restaurants");
        },
      },
      {
        path: "pos",
        element: (
          <ProtectedRoute resource="pos" action="access">
            <TableListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "pos/table/:tableId",
        element: (
          <ProtectedRoute resource="pos" action="access">
            <TablePOSPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "pos/table/new",
        element: (
          <ProtectedRoute resource="pos" action="create">
            <TablePOSPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "restaurant",
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          { path: "settings/website-builder", element: <WebsiteBuilder /> },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "items",
            element: (
              <ProtectedRoute resource="items" action="read">
                <ItemLibrary />
              </ProtectedRoute>
            ),
          },
          { path: "items/new", element: <CreateItem /> },
          {
            path: "items/:itemId/edit",
            element: (
              <ProtectedRoute resource="items" action="update">
                <EditItem />
              </ProtectedRoute>
            ),
          },
          {
            path: "categories",
            element: (
              <ProtectedRoute resource="categories" action="read">
                <Categories />
              </ProtectedRoute>
            ),
          },
          {
            path: "categories/new",
            element: (
              <ProtectedRoute resource="categories" action="create">
                <CreateCategory />
              </ProtectedRoute>
            ),
          },
          {
            path: "categories/:categoryId/edit",
            element: (
              <ProtectedRoute resource="categories" action="update">
                <EditCategory />
              </ProtectedRoute>
            ),
          },
          {
            path: "modifiers",
            element: (
              <ProtectedRoute resource="modifiers" action="read">
                <Modifiers />
              </ProtectedRoute>
            ),
          },
          {
            path: "modifiers/new",
            element: (
              <ProtectedRoute resource="modifiers" action="create">
                <CreateModifier />
              </ProtectedRoute>
            ),
          },
          {
            path: "modifiers/:modifierId/edit",
            element: (
              <ProtectedRoute resource="modifiers" action="update">
                <EditModifier />
              </ProtectedRoute>
            ),
          },
          {
            path: "discounts",
            element: (
              <ProtectedRoute resource="discounts" action="read">
                <Discounts />
              </ProtectedRoute>
            ),
            loader: discountsLoader,
          },
          {
            path: "discounts/new",
            element: (
              <ProtectedRoute resource="discounts" action="create">
                <CreateDiscount />
              </ProtectedRoute>
            ),
          },
          {
            path: "discounts/:discountId/edit",
            element: (
              <ProtectedRoute resource="discounts" action="update">
                <EditDiscount />
              </ProtectedRoute>
            ),
          },
          {
            path: "orders",
            element: <Orders />,
          },
          { path: "orders/:orderId", element: <OrderDetails /> },
          {
            path: "reviews",
            element: (
              <ProtectedRoute resource="reviews" action="read">
                <Reviews />
              </ProtectedRoute>
            ),
          },
          { path: "transactions", element: <Transactions /> },
          {
            path: "transactions/:paymentIntentId",
            element: <TransactionDetails />,
          },
          { path: "settings/business/about", element: <BusinessAbout /> },
          { path: "settings/business/hours", element: <BusinessHours /> },
          {
            path: "settings/business/special-closures",
            element: <SpecialClosures />,
          },
          { path: "settings/restaurant", element: <RestaurantSettings /> },
          { path: "settings/website-builder", element: <WebsiteBuilder /> },
          { path: "settings/developer-tools", element: <DeveloperTools /> },
          {
            path: "settings/roles",
            element: (
              <ProtectedRoute resource="staff" action="read">
                <RolesManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: "settings/roles/create",
            element: (
              <ProtectedRoute resource="staff" action="create">
                <RoleForm />
              </ProtectedRoute>
            ),
          },
          {
            path: "settings/roles/:roleId/edit",
            element: (
              <ProtectedRoute resource="staff" action="update">
                <RoleForm />
              </ProtectedRoute>
            ),
          },
          {
            path: "settings/staff",
            element: (
              <ProtectedRoute resource="staff" action="read">
                <StaffManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: "customers",
            element: (
              <ProtectedRoute resource="customers" action="read">
                <Customers />
              </ProtectedRoute>
            ),
          },
          {
            path: "customers/:customerEmail/orders",
            element: (
              <ProtectedRoute resource="customers" action="read">
                <CustomerOrders />
              </ProtectedRoute>
            ),
          },
          {
            path: "pos",
            element: (
              <ProtectedRoute resource="pos" action="access">
                <TableListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "pos/table/:tableId",
            element: (
              <ProtectedRoute resource="pos" action="access">
                <TablePOSPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "pos/table/new",
            element: (
              <ProtectedRoute resource="pos" action="create">
                <TablePOSPage />
              </ProtectedRoute>
            ),
          },
        ],
      },

    ],
  },
  { path: "/:slug", element: <PublicStorefront /> },
  { path: "*", element: <NotFound /> },
]);
