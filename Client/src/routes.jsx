import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";
import Layout from "./components/Layout";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import SignOut from "./pages/auth/SignOut";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import RestaurantSelector from "./pages/restaurants/RestaurantSelector";
import Categories from "./pages/categories/Categories";
import CreateCategory from "./pages/categories/CreateCategory";
import EditCategory from "./pages/categories/EditCategory";
import ItemLibrary from "./pages/items/ItemLibrary";
import CreateItem from "./pages/items/CreateItem";
import EditItem from "./pages/items/EditItem";
import BusinessAbout from "./pages/settings/BusinessAbout";
import BusinessHours from "./pages/settings/BusinessHours";
import SpecialClosures from "./pages/settings/SpecialClosures";
import { fetchRestaurant } from "./api/restaurants";
import { fetchCategories } from "./api/categories";
import { fetchItems } from "./api/items";
import Modifiers from "./pages/modifiers/Modifiers";
import CreateModifier from "./pages/modifiers/CreateModifier";
import EditModifier from "./pages/modifiers/EditModifier";
import { fetchModifiers } from "./api/modifers";
import Discounts from "./pages/discounts/Discounts";
import CreateDiscount from "./pages/discounts/CreateDiscount";
import EditDiscount from "./pages/discounts/EditDiscount";
import { fetchDiscounts } from "./api/discounts";
import ShopPage from "./pages/shop/ShopPage";
import CheckoutSuccessWrapper from "./pages/shop/CheckoutSuccessWrapper";
import CheckoutCancelled from "./pages/shop/CheckoutCancelled";
import Orders from "./pages/orders/Orders";
import NotFound from "./pages/NotFound";
import OrderDetails from "./pages/orders/OrderDetails";
import DeveloperTools from "./pages/settings/DeveloperTools";
import TrackOrder from "./pages/public/TrackOrder";
import RestaurantSettings from "./pages/settings/RestaurantSettings";
export const homeLoader = async () => {
  return null;
};

export const dashboardLoader = async ({ params }) => {
  try {
    const { restaurantId } = params;
    const [restaurant, categories, items, modifiers] = await Promise.all([
      fetchRestaurant(restaurantId).catch(() => null),
      fetchCategories(restaurantId).catch(() => ({})),
      fetchItems(restaurantId).catch(() => ({})),
      fetchModifiers(restaurantId).catch(() => ({})),
    ]);

    return { restaurant, categories, items, modifiers };
  } catch (error) {
    if (error?.response?.status === 401) {
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
    if (error?.response?.status === 401) {
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
    if (error?.response?.status === 401) {
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
    if (error?.response?.status === 401) {
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
    element: <ShopPage />,
  },
  {
    path: "/shop/:restaurantId/success",
    element: <CheckoutSuccessWrapper />,
  },
  {
    path: "/shop/:restaurantId/cancelled",
    element: <CheckoutCancelled />,
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
    element: <Layout />,
    children: [
      { index: true, element: <Home />, loader: homeLoader }, 
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
      { path: "signout", element: <SignOut /> }, 
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
            element: <ItemLibrary />,
            loader: itemsLoader,
          },
          { path: "items/new", element: <CreateItem /> },
          { path: "items/:itemId/edit", element: <EditItem /> },
          {
            path: "categories",
            element: <Categories />,
            loader: categoriesLoader,
          },
          { path: "categories/new", element: <CreateCategory /> },
          { path: "categories/:categoryId/edit", element: <EditCategory /> },
          {
            path: "modifiers",
            element: <Modifiers />,
            loader: modifiersLoader,
          },
          { path: "modifiers/new", element: <CreateModifier /> },
          { path: "modifiers/:modifierId/edit", element: <EditModifier /> },
          {
            path: "discounts",
            element: <Discounts />,
            loader: discountsLoader,
          },
          { path: "discounts/new", element: <CreateDiscount /> },
          { path: "discounts/:discountId/edit", element: <EditDiscount /> },
          {
            path: "orders",
            element: <Orders />,
            loader: ordersLoader,
          },
          { path: "orders/:orderId", element: <OrderDetails /> },
          { path: "settings/business/about", element: <BusinessAbout /> },
          { path: "settings/business/hours", element: <BusinessHours /> },
          {
            path: "settings/business/special-closures",
            element: <SpecialClosures />,
          },
          { path: "settings/restaurant", element: <RestaurantSettings /> },
          { path: "settings/developer-tools", element: <DeveloperTools /> },
        ],
      },
      { path: "*", element: <NotFound /> }, 
    ],
  },
]);
