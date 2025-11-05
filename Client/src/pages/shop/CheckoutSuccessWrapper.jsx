import { ShopProvider } from "../../context/ShopProvider";
import CheckoutSuccess from "./CheckoutSuccess";

export default function CheckoutSuccessWrapper() {
  return (
    <ShopProvider>
      <CheckoutSuccess />
    </ShopProvider>
  );
}
