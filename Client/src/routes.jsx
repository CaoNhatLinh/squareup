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
import { fetchRestaurant } from "@/api/restaurants";
import { fetchCategories } from "@/api/categories";
import { fetchItems } from "@/api/items";
import Modifiers from "@/pages/modifiers/Modifiers";
import CreateModifier from "@/pages/modifiers/CreateModifier";
import EditModifier from "@/pages/modifiers/EditModifier";
import { fetchModifiers } from "@/api/modifers";
import Discounts from "@/pages/discounts/Discounts";
import CreateDiscount from "@/pages/discounts/CreateDiscount";
import EditDiscount from "@/pages/discounts/EditDiscount";
import { fetchDiscounts } from "@/api/discounts";
import ShopPage from "@/pages/shop/ShopPage";
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
import RestaurantSettings from "@/pages/settings/RestaurantSettings";
// import Profile from "@/pages/Profile";
import Reviews from "@/pages/reviews/Reviews";
import Transactions from "@/pages/transactions/Transactions";
import TransactionDetails from "@/pages/transactions/TransactionDetails";
import RolesManagement from "@/pages/settings/RolesManagement";
import RoleForm from "@/pages/settings/RoleForm";
import StaffManagement from "@/pages/settings/StaffManagement";
import AcceptInvitation from "@/pages/auth/AcceptInvitation";


export const dashboardLoader = async ({ params }) => {
  try {
    const { restaurantId } = params;
    // Only load restaurant data - individual pages will load their own data when needed
    const restaurant = await fetchRestaurant(restaurantId).catch(() => null);

    return { restaurant };
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw redirect("/signin");
    }
    throw redirect("/signin");
  }
};

export const itemsLoader = async ({ params }) => {
  try {
    const { restaurantId } = params;
    const [itemsData, categoriesData, modifiersData] = await Promise.all([
      fetchItems(restaurantId).catch(() => ({})),
      fetchCategories(restaurantId).catch(() => ({})),
      fetchModifiers(restaurantId).catch(() => ({})),
    ]);

    const items = Object.values(itemsData || {});
    const categories = Object.values(categoriesData || {});
    const modifiers = Object.values(modifiersData || {});

    return { items, categories, modifiers };
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw redirect("/signin");
    }
    throw redirect("/signin");
  } 
};

export const categoriesLoader = async ({ params }) => {
  try {
    const { restaurantId } = params;
    const data = await fetchCategories(restaurantId).catch(() => ({}));
    const categories = Object.values(data || {});
    return { categories };
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw redirect("/signin");
    }
    throw redirect("/signin");
  }
};

export const modifiersLoader = async ({ params }) => {
  try {
    const { restaurantId } = params;
    const data = await fetchModifiers(restaurantId).catch(() => ({}));
    const modifiers = Object.values(data || {});
    return { modifiers };
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw redirect("/signin");
    }
    throw redirect("/signin");
  }
};

export const discountsLoader = async ({ params }) => {
  try {
    const { restaurantId } = params;
    const data = await fetchDiscounts(restaurantId).catch(() => ({}));
    const discounts = Object.values(data || {});
    return { discounts };
  } catch (error) {
    if (error?.response?.status === 401) {
      throw redirect("/signin");
    }
    throw redirect("/signin");
  }
};

export const ordersLoader = async ({ params }) => {
  try {
    return { restaurantId: params.restaurantId };
  } catch (error) {
    console.error("Error in orders loader:", error);
    throw redirect("/signin");
  }
};


export const router = createBrowserRouter([
  {
    path: "/shop/:restaurantId",
    element: <ShopLayout />,
    children: [
      {
        index: true,
        element: <ShopPage />,
      },
      {
        path: "order-history",
        element: <OrderHistory />,
      },
      {
        path: "review/:orderId",
        element: <OrderReview />,
      },
      {
        path: "success",
        element: <CheckoutSuccessWrapper />,
      },
      {
        path: "cancelled",
        element: <CheckoutCancelled />,
      },
    ],
  },
  {
    path: "/track-order/:orderId",
    element: <TrackOrder />,
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
    element: <AdminRoute><Layout /></AdminRoute>,
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
        path: ":restaurantId",
        children: [
          {
            index: true,
            element: <Dashboard />,
            loader: dashboardLoader, 
          },
          {
            path: "dashboard",
            element: <Dashboard />,
            loader: dashboardLoader,
          },
          {
            path: "items",
            element: (
              <ProtectedRoute resource="items" action="read">
                <ItemLibrary />
              </ProtectedRoute>
            ),
            loader: itemsLoader,
          },
          { path: "items/new", element: <CreateItem />, loader: itemsLoader },
          { path: "items/:itemId/edit", element: <ProtectedRoute resource="items" action="update"><EditItem /></ProtectedRoute> ,loader: itemsLoader },
          {
            path: "categories",
            element: <ProtectedRoute resource="categories" action="read"><Categories /></ProtectedRoute>,
            loader: categoriesLoader,
          },
          { path: "categories/new", element: <ProtectedRoute resource="categories" action="create"><CreateCategory /></ProtectedRoute> },
          { path: "categories/:categoryId/edit", element: <ProtectedRoute resource="categories" action="update"><EditCategory /></ProtectedRoute> },
          {
            path: "modifiers",
            element: <ProtectedRoute resource="modifiers" action="read"><Modifiers /></ProtectedRoute>,
            loader: modifiersLoader,
          },
          { path: "modifiers/new", element: <ProtectedRoute resource="modifiers" action="create"><CreateModifier /></ProtectedRoute> },
          { path: "modifiers/:modifierId/edit", element: <ProtectedRoute resource="modifiers" action="update"><EditModifier /></ProtectedRoute> },
          {
            path: "discounts",
            element: <ProtectedRoute resource="discounts" action="read"><Discounts /></ProtectedRoute>,
            loader: discountsLoader,
          },
          { path: "discounts/new", element: <ProtectedRoute resource="discounts" action="create"><CreateDiscount /></ProtectedRoute> },
          { path: "discounts/:discountId/edit", element: <ProtectedRoute resource="discounts" action="update"><EditDiscount /></ProtectedRoute> },
          {
            path: "orders",
            element: <Orders />,
            loader: ordersLoader,
          },
          { path: "orders/:orderId", element: <OrderDetails /> },
          { path: "reviews", element: <ProtectedRoute resource="reviews" action="read"><Reviews /></ProtectedRoute> },
          { path: "transactions", element: <Transactions /> },
          { path: "transactions/:paymentIntentId", element: <TransactionDetails /> },
          { path: "settings/business/about", element: <BusinessAbout /> },
          { path: "settings/business/hours", element: <BusinessHours /> },
          {
            path: "settings/business/special-closures",
            element: <SpecialClosures />,
          },
          { path: "settings/restaurant", element: <RestaurantSettings /> },
          { path: "settings/developer-tools", element: <DeveloperTools /> },
          { path: "settings/roles", element: <ProtectedRoute resource="staff" action="read"><RolesManagement /></ProtectedRoute> },
          { path: "settings/roles/create", element: <ProtectedRoute resource="staff" action="create"><RoleForm /></ProtectedRoute> },
          { path: "settings/roles/:roleId/edit", element: <ProtectedRoute resource="staff" action="update"><RoleForm /></ProtectedRoute> },
          { path: "settings/staff", element: <ProtectedRoute resource="staff" action="read"><StaffManagement /></ProtectedRoute> },
        ],
      },
      { path: "*", element: <NotFound /> }, 
    ],
  },
]);
