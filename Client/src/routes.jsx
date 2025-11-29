import { lazy } from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import Layout from "@/components/Layout";
import AdminRoute from "@/components/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ShopProvider } from "@/context/ShopProvider";
import Loadable from "@/components/Loadable";

const SignIn = Loadable(lazy(() => import("@/pages/auth/SignIn")));
const SignUp = Loadable(lazy(() => import("@/pages/auth/SignUp")));
const SignOut = Loadable(lazy(() => import("@/pages/auth/SignOut")));
const AcceptInvitation = Loadable(
  lazy(() => import("@/pages/auth/AcceptInvitation"))
);

const Dashboard = Loadable(lazy(() => import("@/pages/Dashboard")));
const Home = Loadable(lazy(() => import("@/pages/Home")));
const RestaurantSelector = Loadable(
  lazy(() => import("@/pages/restaurants/RestaurantSelector"))
);
const NotFound = Loadable(lazy(() => import("@/pages/NotFound")));

const AdminDashboard = Loadable(
  lazy(() => import("@/pages/admin/AdminDashboard"))
);
const Categories = Loadable(
  lazy(() => import("@/pages/categories/Categories"))
);
const CreateCategory = Loadable(
  lazy(() => import("@/pages/categories/CreateCategory"))
);
const EditCategory = Loadable(
  lazy(() => import("@/pages/categories/EditCategory"))
);

const ItemLibrary = Loadable(lazy(() => import("@/pages/items/ItemLibrary")));
const CreateItem = Loadable(lazy(() => import("@/pages/items/CreateItem")));
const EditItem = Loadable(lazy(() => import("@/pages/items/EditItem")));

const BusinessAbout = Loadable(
  lazy(() => import("@/pages/settings/BusinessAbout"))
);
const BusinessHours = Loadable(
  lazy(() => import("@/pages/settings/BusinessHours"))
);
const SpecialClosures = Loadable(
  lazy(() => import("@/pages/settings/SpecialClosures"))
);
const RestaurantSettings = Loadable(
  lazy(() => import("@/pages/settings/RestaurantSettings"))
);
const WebsiteBuilder = Loadable(
  lazy(() => import("@/pages/settings/WebsiteBuilder"))
);
const DeveloperTools = Loadable(
  lazy(() => import("@/pages/settings/DeveloperTools"))
);
const RolesManagement = Loadable(
  lazy(() => import("@/pages/settings/RolesManagement"))
);
const RoleForm = Loadable(lazy(() => import("@/pages/settings/RoleForm")));
const StaffManagement = Loadable(
  lazy(() => import("@/pages/settings/StaffManagement"))
);

const Modifiers = Loadable(lazy(() => import("@/pages/modifiers/Modifiers")));
const CreateModifier = Loadable(
  lazy(() => import("@/pages/modifiers/CreateModifier"))
);
const EditModifier = Loadable(
  lazy(() => import("@/pages/modifiers/EditModifier"))
);
const Discounts = Loadable(lazy(() => import("@/pages/discounts/Discounts")));
const CreateDiscount = Loadable(
  lazy(() => import("@/pages/discounts/CreateDiscount"))
);
const EditDiscount = Loadable(
  lazy(() => import("@/pages/discounts/EditDiscount"))
);

const ShopPage = Loadable(lazy(() => import("@/pages/shop/ShopPage")));
const ShopLayout = Loadable(lazy(() => import("@/pages/shop/ShopLayout")));
const CheckoutSuccessWrapper = Loadable(
  lazy(() => import("@/pages/shop/checkout/CheckoutSuccessWrapper"))
);
const CheckoutCancelled = Loadable(
  lazy(() => import("@/pages/shop/checkout/CheckoutCancelled"))
);
const OrderHistory = Loadable(lazy(() => import("@/pages/shop/OrderHistory")));
const OrderReview = Loadable(lazy(() => import("@/pages/shop/OrderReview")));

const Orders = Loadable(lazy(() => import("@/pages/orders/Orders")));
const OrderDetails = Loadable(
  lazy(() => import("@/pages/orders/OrderDetails"))
);
const TrackOrder = Loadable(lazy(() => import("@/pages/public/TrackOrder")));
const PublicStorefront = Loadable(
  lazy(() => import("@/pages/public/PublicStorefront"))
);

const Reviews = Loadable(lazy(() => import("@/pages/reviews/Reviews")));

const Transactions = Loadable(
  lazy(() => import("@/pages/transactions/Transactions"))
);
const TransactionDetails = Loadable(
  lazy(() => import("@/pages/transactions/TransactionDetails"))
);

const Customers = Loadable(lazy(() => import("@/pages/customers/Customers")));
const CustomerOrders = Loadable(
  lazy(() => import("@/pages/customers/CustomerOrders"))
);

const TableListPage = Loadable(lazy(() => import("@/pages/pos/TableListPage")));
const TablePOSPage = Loadable(lazy(() => import("@/pages/pos/TablePOSPage")));

export const router = createBrowserRouter(
  [
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
          element: (
            <ShopProvider>
              <OrderHistory />
            </ShopProvider>
          ),
        },
        {
          path: "review/:orderId",
          element: (
            <ShopProvider>
              <OrderReview />
            </ShopProvider>
          ),
        },
        {
          path: "success",
          element: <CheckoutSuccessWrapper />,
        },
        {
          path: "cancelled",
          element: (
            <ShopProvider>
              <CheckoutCancelled />
            </ShopProvider>
          ),
        },
      ],
    },
    {
      path: "/:slug/order",
      element: <ShopLayout />,
      children: [
        { index: true, element: <ShopPage /> },
        {
          path: "order-history",
          element: (
            <ShopProvider>
              <OrderHistory />
            </ShopProvider>
          ),
        },
        {
          path: "review/:orderId",
          element: (
            <ShopProvider>
              <OrderReview />
            </ShopProvider>
          ),
        },
        { path: "success", element: <CheckoutSuccessWrapper /> },
        {
          path: "cancelled",
          element: (
            <ShopProvider>
              <CheckoutCancelled />
            </ShopProvider>
          ),
        },
        { path: "track-order/:orderId", element: <TrackOrder /> },
      ],
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
            {
              path: "settings/website-builder",
              element: (
                <ProtectedRoute resource="web_builder" action="access">
                  <WebsiteBuilder />
                </ProtectedRoute>
              ),
            },
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
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);
