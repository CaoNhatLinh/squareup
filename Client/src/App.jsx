import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider.jsx";
import RestaurantSelectionProvider from "@/context/RestaurantSelectionProvider.jsx";
import { ToastProvider } from "@/context/ToastContext.jsx";
import { LoadingProvider } from "@/context/LoadingContext.jsx";
import { router } from "@/routes";
import "./index.css";
import "react-datepicker/dist/react-datepicker.css";
export default function App() {
  return (
    <AuthProvider>
      <RestaurantSelectionProvider>
        <ToastProvider>
          <LoadingProvider>
            <RouterProvider router={router} />
          </LoadingProvider>
        </ToastProvider>
      </RestaurantSelectionProvider>
    </AuthProvider>
  );
}
