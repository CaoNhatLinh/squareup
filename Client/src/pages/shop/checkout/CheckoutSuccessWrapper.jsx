import { ShopProvider } from "@/context/ShopProvider.jsx";
import CheckoutSuccess from "./CheckoutSuccess";

export default function CheckoutSuccessWrapper() {
  return (
    <ShopProvider>
      <CheckoutSuccess />
    </ShopProvider>
  );
}
