import { Outlet } from "react-router-dom";
import { GuestUserProvider } from "@/context/GuestUserProvider";

export default function ShopLayout() {
  return (
    <GuestUserProvider>
      <Outlet />
    </GuestUserProvider>
  );
}
