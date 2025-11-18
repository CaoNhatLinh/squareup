import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import { fetchCategories } from "@/api/categories";
import { fetchItems } from "@/api/items";
import { fetchModifiers } from "@/api/modifers";
import { createOrder } from "@/api/orders";
import { calculateDiscounts } from "@/api/checkoutClient";
import { mergeOrAddCartItem } from "@/utils/cartUtils";
import { useToast } from "@/hooks/useToast";
import POSHeader from "./components/POSHeader";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid from "./components/ProductGrid";
import Cart from "./components/Cart";
import PaymentModal from "./components/PaymentModal";
import { printInvoice, printKitchenOrder } from "@/utils/printUtils";
import { Button } from "@/components/ui";
import { Printer, ArrowLeft } from "lucide-react";
import { getTableById, updateTable, createTable, clearTable } from "@/api/tables";

export default function TablePOSPage() {
  const { restaurantId, tableId } = useParams();
  const navigate = useNavigate();
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const { success: showSuccess, error: showError } = useToast();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState({});
  const [modifiers, setModifiers] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [loyaltyCard, setLoyaltyCard] = useState("");
  const [discountResult, setDiscountResult] = useState({
    totalDiscount: 0,
    appliedDiscounts: [],
    itemDiscounts: {},
    discountBreakdown: [],
  });
  const [discountLoading, setDiscountLoading] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [printInvoiceOnCheckout, setPrintInvoiceOnCheckout] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [orderNotes, setOrderNotes] = useState("");
  const [tableName, setTableName] = useState("");
  const [isSavingTable, setIsSavingTable] = useState(false);
  const isNewTable = tableId === "new";

  // Load POS data
  const loadPOSData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesData, itemsData, modifiersData] = await Promise.all([
        fetchCategories(restaurantId),
        fetchItems(restaurantId, { q: query }),
        fetchModifiers(restaurantId),
      ]);

      const catsArray = categoriesData?.categories || categoriesData || [];
      setCategories(
        Array.isArray(catsArray) ? catsArray : Object.values(catsArray)
      );

      const itemsArray = itemsData?.items || itemsData || [];
      const itemsMap = Array.isArray(itemsArray)
        ? itemsArray.reduce((acc, it) => ({ ...acc, [it.id]: it }), {})
        : itemsArray;
      setItems(itemsMap || {});

      const modsArray = modifiersData?.modifiers || modifiersData || [];
      const modsMap = Array.isArray(modsArray)
        ? modsArray.reduce((acc, m) => ({ ...acc, [m.id]: m }), {})
        : modsArray;
      setModifiers(modsMap || {});
    } catch (error) {
      console.error("Failed to load POS data:", error);
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, showError, query]);

  // Load table data if editing existing table
  const loadTableData = useCallback(async () => {
    if (isNewTable || !tableId) return;

    try {
      const tableData = await getTableById(restaurantId, tableId);
      setTableName(tableData.name || "");
      
      // Load existing items into cart
      if (tableData.items && tableData.items.length > 0) {
        const cartItems = tableData.items.map(item => ({
          id: `${item.itemId}-${Date.now()}-${Math.random()}`,
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedModifiers: item.selectedModifiers || item.selectedOptions || [],
          specialInstruction: item.notes || "",
          modifierTotal: (item.selectedModifiers || item.selectedOptions || []).reduce(
            (sum, opt) => sum + (opt.price || 0),
            0
          ),
        }));
        setCart(cartItems);
      }
    } catch (error) {
      console.error("Failed to load table:", error);
      showError("Failed to load table data");
    }
  }, [restaurantId, tableId, isNewTable, showError]);

  useEffect(() => {
    if (restaurantId) {
      loadPOSData();
    }
  }, [restaurantId, loadPOSData]);

  useEffect(() => {
    if (restaurantId) {
      loadTableData();
    }
  }, [restaurantId, loadTableData]);

  // Calculate discounts
  useEffect(() => {
    (async () => {
      setDiscountLoading(true);
      if (!restaurantId || cart.length === 0) {
        setDiscountResult({
          totalDiscount: 0,
          appliedDiscounts: [],
          itemDiscounts: {},
          discountBreakdown: [],
        });
        setDiscountLoading(false);
        return;
      }
      try {
        const cartItems = cart.map((c) => ({
          itemId: c.itemId,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          totalPrice:
            (Number(c.price ?? 0) + Number(c.modifierTotal ?? 0)) *
            Number(c.quantity ?? 0),
          groupKey: c.id,
          selectedOptions: c.selectedModifiers || [],
        }));
        const res = await calculateDiscounts(restaurantId, cartItems, {
          couponCode,
          loyaltyCard,
        });
        setDiscountResult(
          res || {
            totalDiscount: 0,
            appliedDiscounts: [],
            itemDiscounts: {},
            discountBreakdown: [],
          }
        );
      } catch (err) {
        console.error("Discount calculation error:", err);
        setDiscountResult({
          totalDiscount: 0,
          appliedDiscounts: [],
          itemDiscounts: {},
          discountBreakdown: [],
        });
      }
      setDiscountLoading(false);
    })();
  }, [cart, restaurantId, couponCode, loyaltyCard]);

  // Cart operations
  const addToCart = (
    item,
    selectedOptions = [],
    quantity = 1,
    specialInstruction = ""
  ) => {
    const displayPrice = Number(item?.discountedPrice ?? item?.price ?? 0);
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      name: item.name,
      price: displayPrice,
      quantity,
      selectedModifiers: selectedOptions,
      specialInstruction,
      modifierTotal: selectedOptions.reduce(
        (sum, opt) => sum + (opt.price || 0),
        0
      ),
      image: item.image,
      category: item.category,
    };
    setCart((prev) => mergeOrAddCartItem(prev, cartItem));
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

  const getCartSummary = () => {
    const subtotal = cart.reduce((sum, item) => {
      const itemTotal =
        (Number(item.price ?? 0) + Number(item.modifierTotal ?? 0)) *
        Number(item.quantity ?? 0);
      return sum + itemTotal;
    }, 0);
    const totalDiscount = Number(discountResult?.totalDiscount ?? 0);
    const taxableBase = subtotal - totalDiscount;
    const taxRate = Number(restaurant?.taxRate ?? restaurant?.tax ?? 0) || 0;
    const taxAmount = taxableBase * taxRate;
    const total = taxableBase + taxAmount;
    return { subtotal, totalDiscount, taxAmount, total, taxRate };
  };

  // Save table
  const handleSaveTable = async () => {
    if (!tableName.trim()) {
      showError("Please enter a table name");
      return;
    }

    setIsSavingTable(true);
    try {
      const tableData = {
        name: tableName.trim(),
        items: cart.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedModifiers: item.selectedModifiers,
          notes: item.specialInstruction,
        })),
      };

      if (isNewTable) {
        await createTable(restaurantId, tableData);
        showSuccess("Table created successfully");
      } else {
        await updateTable(restaurantId, tableId, tableData);
        showSuccess("Table saved successfully");
      }

      navigate(`/${restaurantId}/pos`);
    } catch (error) {
      console.error("Failed to save table:", error);
      showError(error.response?.data?.error || "Failed to save table");
    } finally {
      setIsSavingTable(false);
    }
  };

  // Print kitchen order
  const handlePrintKitchenOrder = () => {
    if (cart.length === 0) {
      showError("No items to print");
      return;
    }

    try {
      printKitchenOrder({
        tableName: tableName || "New Table",
        items: cart,
        restaurantName: restaurant?.name,
      });
      showSuccess("Kitchen order sent to printer");
    } catch (error) {
      console.error("Failed to print kitchen order:", error);
      showError("Failed to print kitchen order");
    }
  };

  // Checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      showError("Cart is empty");
      return;
    }
    if (!tableName.trim()) {
      showError("Please enter a table name before checkout");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleCompletePayment = async (
    paymentMethod,
    splitPayments,
    paymentDetails
  ) => {
    try {
      setIsCreatingOrder(true);

      const isFullyPaid = (() => {
        if (paymentMethod === "split")
          return (
            Array.isArray(splitPayments) &&
            splitPayments.length > 0 &&
            splitPayments.every((sp) => sp.status === "paid")
          );
        if (paymentMethod === "cash") return true;
        if (paymentMethod === "stripe")
          return !!(
            paymentDetails &&
            (paymentDetails.success || paymentDetails.paymentIntentId)
          );
        if (paymentMethod === "bank_transfer")
          return !!(paymentDetails && paymentDetails.paid);
        return !!(paymentDetails && paymentDetails.success);
      })();

      const orderData = {
        restaurantId,
        tableId: isNewTable ? undefined : tableId,
        tableName: tableName,
        items: cart.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedOptions: item.selectedModifiers,
        })),
        customerInfo,
        notes: orderNotes,
        total: getCartSummary().total,
        paymentMethod: paymentMethod === "split" ? "split" : paymentMethod,
        paymentStatus: isFullyPaid ? "paid" : "pending",
        splitPayments: paymentMethod === "split" ? splitPayments : undefined,
        paymentDetails,
        orderType: "dine_in",
        status: isFullyPaid ? "completed" : "pending",
        createdAt: Date.now(),
      };

      const created = await createOrder(restaurantId, orderData);
      showSuccess("Order completed successfully!");

      // Print invoice if enabled
      if (isFullyPaid && printInvoiceOnCheckout) {
        try {
          const { subtotal, totalDiscount, taxAmount, total, taxRate } =
            getCartSummary();
          const invoiceData = {
            orderNumber: created?.id || `ORD-${Date.now()}`,
            date: Date.now(),
            customerInfo,
            items: cart,
            subtotal: subtotal,
            discount: totalDiscount,
            taxAmount: taxAmount,
            taxRate: taxRate,
            total: total,
          };
          printInvoice(invoiceData, restaurant);
        } catch (printErr) {
          console.error("Failed to print invoice:", printErr);
        }
      }

      // Clear the table
      if (!isNewTable) {
        await clearTable(restaurantId, tableId);
      }

      // Navigate back to table list
      navigate(`/${restaurantId}/pos`);
    } catch (error) {
      console.error("Failed to complete payment:", error);
      showError("Failed to complete payment");
    } finally {
      setIsCreatingOrder(false);
      setIsPaymentModalOpen(false);
    }
  };

  if (restaurantLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/pos")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tables
            </Button>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Table Name:</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter table name..."
                className="px-3 py-1 border rounded-md min-w-[200px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintKitchenOrder}
              disabled={cart.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Kitchen Order
            </Button>
            <Button
              onClick={handleSaveTable}
              disabled={isSavingTable || !tableName.trim()}
              size="sm"
            >
              {isSavingTable ? "Saving..." : "Save Table"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <POSHeader
            query={query}
            onQueryChange={setQuery}
            restaurant={restaurant}
          />

          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <ProductGrid
            items={items}
            modifiers={modifiers}
            selectedCategory={selectedCategory}
            query={query}
            onAddToCart={addToCart}
            discountResult={discountResult}
          />
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-white border-l flex flex-col">
          <Cart
            cart={cart}
            onUpdateQuantity={updateCartItemQuantity}
            onRemove={removeFromCart}
            onClear={clearCart}
            getCartSummary={getCartSummary}
            discountResult={discountResult}
            discountLoading={discountLoading}
            couponCode={couponCode}
            onCouponChange={setCouponCode}
            loyaltyCard={loyaltyCard}
            onLoyaltyCardChange={setLoyaltyCard}
            onCheckout={handleCheckout}
            printInvoiceOnCheckout={printInvoiceOnCheckout}
            onPrintInvoiceChange={setPrintInvoiceOnCheckout}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        total={getCartSummary().total}
        cart={cart}
        onComplete={handleCompletePayment}
        isProcessing={isCreatingOrder}
        customerName={customerInfo.name || 'Guest'}
        customerInfo={customerInfo}
        orderNotes={orderNotes}
        onOrderNotesChange={setOrderNotes}
        onClose={() => setIsPaymentModalOpen(false)}
        initialSplitPayments={null}
        printOnCheckout={printInvoiceOnCheckout}
        setPrintOnCheckout={setPrintInvoiceOnCheckout}
        restaurantId={restaurantId}
      />
    </div>
  );
}
