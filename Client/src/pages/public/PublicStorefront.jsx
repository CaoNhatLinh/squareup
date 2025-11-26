import { useParams } from "react-router-dom";
import { ShopProvider } from "@/context/ShopProvider";
import StorefrontContent from "@/pages/public/components/StorefrontContent";

export default function PublicStorefront() {
  const { slug } = useParams();
  return (
    <ShopProvider>
      <StorefrontContent slug={slug} />
    </ShopProvider>
  );
}
