import { useState, useEffect, useCallback } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { fetchCategories } from "@/api/categories";
import { fetchItems } from "@/api/items";
import { fetchModifiers } from "@/api/modifers";
import { createOrder } from "@/api/orders";
import { useToast } from "@/hooks/useToast";
import POSHeader from "./components/POSHeader";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import PaymentModal from "./components/PaymentModal";

export default function POSPage() {
  const { selectedRestaurant } = useRestaurant();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState({});
  const [modifiers, setModifiers] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const loadPOSData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesData, itemsData, modifiersData] = await Promise.all([
        fetchCategories(selectedRestaurant.id),
        fetchItems(selectedRestaurant.id),
        fetchModifiers(selectedRestaurant.id),
      ]);

      setCategories(Object.values(categoriesData || {}));
      setItems(itemsData || {});
      setModifiers(modifiersData || {});
    } catch (error) {
      console.error("Failed to load POS data:", error);
      showToast("Không thể tải dữ liệu. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant?.id, showToast]);

  useEffect(() => {
    if (selectedRestaurant?.id) {
      loadPOSData();
    }
  }, [selectedRestaurant?.id, loadPOSData]);

  const addToCart = (item, selectedOptions = [], quantity = 1) => {
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      selectedOptions,
      modifierTotal: selectedOptions.reduce(
        (sum, opt) => sum + (opt.price || 0),
        0
      ),
      image: item.image,
    };

    setCart((prev) => [...prev, cartItem]);
  };

  const updateCartItemQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ name: "", phone: "", email: "" });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const itemTotal = (item.price + item.modifierTotal) * item.quantity;
      return sum + itemTotal;
    }, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast("Giỏ hàng trống", "error");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleCompletePayment = async (paymentMethod) => {
    try {
      const orderData = {
        restaurantId: selectedRestaurant.id,
        items: cart.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
        })),
        customerInfo,
        total: calculateTotal(),
        paymentMethod,
        orderType: "dine_in",
        status: "completed",
        createdAt: Date.now(),
      };

      await createOrder(selectedRestaurant.id, orderData);
      showToast("Đơn hàng đã được tạo thành công!", "success");
      clearCart();
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error("Failed to create order:", error);
      showToast("Không thể tạo đơn hàng. Vui lòng thử lại.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!selectedRestaurant) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          Vui lòng chọn nhà hàng để tiếp tục
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <POSHeader
        restaurantName={selectedRestaurant.name}
        onRefresh={loadPOSData}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Product Section - Left Side */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <ProductGrid
            categories={categories}
            items={items}
            selectedCategory={selectedCategory}
            onAddToCart={addToCart}
            modifiers={modifiers}
          />
        </div>

        {/* Cart Section - Right Side */}
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
          <Cart
            cart={cart}
            onUpdateQuantity={updateCartItemQuantity}
            onRemove={removeFromCart}
            onClear={clearCart}
            total={calculateTotal()}
            customerInfo={customerInfo}
            onCustomerInfoChange={setCustomerInfo}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          total={calculateTotal()}
          onClose={() => setIsPaymentModalOpen(false)}
          onComplete={handleCompletePayment}
        />
      )}
    </div>
  );
}
