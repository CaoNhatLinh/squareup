import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { RestaurantProvider } from './context/RestaurantProvider'
import { router } from './routes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RestaurantProvider>
        <RouterProvider router={router} />
      </RestaurantProvider>
    </AuthProvider>
  </StrictMode>,
)
