import React from 'react'
import { createBrowserRouter, redirect } from 'react-router-dom'
import Layout from './components/Layout'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import SignOut from './pages/auth/SignOut'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Categories from './pages/categories/Categories'
import CreateCategory from './pages/categories/CreateCategory'
import EditCategory from './pages/categories/EditCategory'
import ItemLibrary from './pages/items/ItemLibrary'
import CreateItem from './pages/items/CreateItem'
import EditItem from './pages/items/EditItem'
import BusinessAbout from './pages/settings/BusinessAbout'
import { verifySession } from './api/auth'
import { fetchRestaurant } from './api/restaurants'
import { fetchCategories } from './api/categories'
import { fetchItems } from './api/items'
import Modifiers from './pages/modifiers/Modifiers'
import CreateModifier from './pages/modifiers/CreateModifier'
import EditModifier from './pages/modifiers/EditModifier'
import { fetchModifiers } from './api/modifers'
import ShopPage from './pages/shop/ShopPage'
import CheckoutSuccessWrapper from './pages/shop/CheckoutSuccessWrapper'
import CheckoutCancelled from './pages/shop/CheckoutCancelled'
import Orders from './pages/orders/Orders'
import NotFound from './pages/NotFound'
import OrderDetails from './pages/orders/OrderDetails'
export const dashboardLoader = async () => {
  try {
    const session = await verifySession()
    const uid = session.uid
    const [restaurant, categories, items] = await Promise.all([
      fetchRestaurant(uid).catch(() => null),
      fetchCategories(uid).catch(() => ({})),
      fetchItems(uid).catch(() => ({})),
      fetchModifiers(uid).catch(() => ({}))
    ])
    return { restaurant, categories, items }
  } catch {
    throw redirect('/signin')
  }
}



export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },
      { path: 'signout', element: <SignOut /> },
      { path: 'dashboard', element: <Dashboard />, loader: dashboardLoader },
      { path: 'items', element: <ItemLibrary /> },
      { path: 'items/new', element: <CreateItem /> },
      { path: 'items/:itemId/edit', element: <EditItem /> },
      { path: 'categories', element: <Categories /> },
      { path: 'categories/new', element: <CreateCategory /> },
      { path: 'categories/:categoryId/edit', element: <EditCategory /> },
      { path: 'modifiers', element: <Modifiers />, },
      { path: 'modifiers/new', element: <CreateModifier /> },
      { path: 'modifiers/:modifierId/edit', element: <EditModifier /> },
      { path: 'orders', element: <Orders /> },
      { path: 'orders/:orderId', element: <OrderDetails /> },
      { path: 'settings/business/about', element: <BusinessAbout /> },
      { path: 'shop/:restaurantId', element: <ShopPage /> },
      { path: 'shop/:restaurantId/success', element: <CheckoutSuccessWrapper /> },
      { path: 'shop/:restaurantId/cancelled', element: <CheckoutCancelled /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
