import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-datepicker/dist/react-datepicker.css';

import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import RestaurantSelectionProvider from './context/RestaurantSelectionProvider'
import { ToastProvider } from './context/ToastContext'
import { router } from './routes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RestaurantSelectionProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </RestaurantSelectionProvider>
    </AuthProvider>
  </StrictMode>,
)
