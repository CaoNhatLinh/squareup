import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-datepicker/dist/react-datepicker.css';

import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { RestaurantProvider } from './context/RestaurantProvider'
import { ToastProvider } from './context/ToastContext'
import { router } from './routes'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RestaurantProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </RestaurantProvider>
    </AuthProvider>
  </StrictMode>,
)
