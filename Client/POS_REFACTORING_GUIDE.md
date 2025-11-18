# POS System Refactoring - Implementation Guide

## ✅ Completed Changes

### 1. Payment System Overhaul
- **Removed**: MoMo, ZaloPay e-wallet payments
- **Added**: Stripe card payments, Bank Transfer with QR code generation
- **Files Modified**:
  - `constants/paymentConstants.js` - Updated payment methods
  - `utils/stripeUtils.js` - NEW: Stripe payment utilities
  - Payment modal updated to support Stripe integration

### 2. Cart Logic Improvements
- **Implemented**: Smart cart merging - items with same ID and modifiers consolidate quantities
- **Files Created**:
  - `utils/cartUtils.js` - NEW: Cart helper functions
    - `generateCartKey()` - Unique key for items with modifiers
    - `isSameCartItem()` - Compare items for duplication
    - `mergeOrAddCartItem()` - Merge or add logic
    - `categorizeItemsForPrint()` - Kitchen/Bar routing

### 3. Product Modal Enhancements  
- **Added**: Special instructions field (like shop page)
- **Improved**: Out-of-stock handling, UI component usage
- **Files Modified**:
  - `pages/pos/components/ProductModal.jsx` - Rewritten with Modal, Button, Input, Badge components
  - Now accepts `specialInstruction` parameter

### 4. Kitchen/Bar Order Routing
- **Implemented**: Category-based item routing
- **Constants**: `KITCHEN_CATEGORIES`, `BAR_CATEGORIES` in paymentConstants.js
- **Utils**: `categorizeItemsForPrint()` in cartUtils.js

### 5. UI Component Integration
- **ProductModal**: Now uses Button, Input, Modal, Badge from `/ui`
- **ProductCard**: Uses Badge component for stock/discount indicators
- **English**: All text changed from Vietnamese to English

## 🚧 Remaining Tasks

### POSPage.jsx Updates Needed
```javascript
import { mergeOrAddCartItem } from "@/utils/cartUtils";
import { KITCHEN_CATEGORIES, BAR_CATEGORIES } from "@/constants/paymentConstants";
import { categorizeItemsForPrint } from "@/utils/cartUtils";

// In addToCart function:
const addToCart = (item, selectedOptions = [], quantity = 1, specialInstruction = "") => {
  const displayPrice = Number(item?.discountedPrice ?? item?.price ?? 0);
  const cartItem = {
    itemId: item.id,
    name: item.name,
    price: displayPrice,
    quantity,
    selectedOptions,
    specialInstruction,
    modifierTotal: selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0),
    image: item.image,
    category: item.category, // Important for kitchen/bar routing
  };

  setCart((prev) => mergeOrAddCartItem(prev, cartItem));
};

// In handleCompletePayment - print kitchen/bar tickets:
const { kitchen, bar } = categorizeItemsForPrint(
  orderData.items,
  KITCHEN_CATEGORIES,
  BAR_CATEGORIES
);

if (kitchen.length > 0) {
  printKitchenOrder({ ...orderData, items: kitchen }, restaurant, 'kitchen');
}
if (bar.length > 0) {
  printKitchenOrder({ ...orderData, items: bar }, restaurant, 'bar');
}
```

### Cart.jsx Updates Needed
- Replace custom inputs with Input component from `/ui`
- Use Button component for all actions
- Add English labels (replace Vietnamese)
- Hook coupon/loyalty to `calculateDiscounts` API

```javascript
// Coupon apply logic:
const handleApplyCoupon = async () => {
  if (!couponCode.trim()) return;
  try {
    // Call your backend discount API
    const result = await applyDiscount(restaurant.id, {
      couponCode,
      cart: cart.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
    setAppliedCoupon(result);
    setCouponCode("");
  } catch (error) {
    showToast("Invalid coupon code", "error");
  }
};
```

### PaymentModal.jsx Updates Needed
- Remove MoMo/ZaloPay UI
- Add Stripe card input (use Stripe Elements)
- Add QR code display for bank transfer
- English labels

```javascript
import { createStripePaymentLink, generateQRCode } from "@/utils/stripeUtils";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// For bank transfer:
const [qrCode, setQrCode] = useState(null);

const handleBankTransfer = async () => {
  const link = await createStripePaymentLink(orderData, total);
  setQrCode(generateQRCode(link.url));
};

// In JSX:
{paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && qrCode && (
  <div className="text-center">
    <img src={qrCode} alt="Payment QR Code" className="mx-auto" />
    <p className="text-sm text-gray-500 mt-2">Scan to pay</p>
  </div>
)}
```

### BillSplitModal.jsx Updates Needed
- Use Modal, Button, Input from `/ui`
- English labels
- Better UX with Card component

### Hold Orders Enhancement
```javascript
// Better hold order structure:
const holdOrder = {
  id: `hold-${Date.now()}`,
  cart,
  customerInfo,
  orderNotes,
  discount: discountResult,
  createdAt: Date.now(),
  tableName: "Table 5", // Add table selection
};

// Hold order list with better UI:
<Card>
  <Card.Header>
    <Card.Title>Held Orders</Card.Title>
  </Card.Header>
  <Card.Body>
    {heldOrders.map(order => (
      <div key={order.id} className="border-b pb-2 mb-2">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">{order.tableName || "Order"}</p>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
            <p className="text-sm">{order.cart.length} items</p>
          </div>
          <div className="flex gap-2">
            <Button size="small" onClick={() => restoreHeldOrder(order)}>
              Restore
            </Button>
            <Button size="small" variant="danger" onClick={() => deleteHeldOrder(order.id)}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    ))}
  </Card.Body>
</Card>
```

### Merge Bills Feature
Create `MergeBillsModal.jsx`:
```javascript
// Allow selecting multiple held orders or tables to merge
const MergeBillsModal = ({ heldOrders, onMerge, onClose }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  const handleMerge = () => {
    const mergedCart = selectedOrders.reduce((acc, orderId) => {
      const order = heldOrders.find(o => o.id === orderId);
      return [...acc, ...order.cart];
    }, []);
    
    onMerge(mergedCart);
  };
  
  return (
    <Modal isOpen={true} onClose={onClose} title="Merge Bills">
      {/* Checkbox list of orders */}
      <Button onClick={handleMerge}>Merge Selected</Button>
    </Modal>
  );
};
```

## 📝 Backend API Requirements

### Stripe Integration
Create these endpoints:
1. `POST /api/stripe/create-payment-link` - Generate payment link with QR
2. `POST /api/stripe/process-payment` - Process card payment
3. `GET /api/stripe/payment-status/:id` - Check payment status

### Discount API
Ensure `/api/discounts/calculate` supports:
- Coupon codes
- Loyalty card numbers
- Returns detailed breakdown

## 🎨 UI Component Usage Examples

### Button
```jsx
<Button variant="primary" size="large" loading={isLoading}>
  Submit
</Button>
```

### Input
```jsx
<Input
  label="Customer Name"
  placeholder="Enter name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={errors.name}
/>
```

### Modal
```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="large"
  footer={<Button onClick={handleSave}>Save</Button>}
>
  {/* Content */}
</Modal>
```

### Badge
```jsx
<Badge variant="success" size="medium">
  Active
</Badge>
```

## 🔄 Next Steps

1. Update POSPage.jsx with cart merging logic
2. Refactor Cart.jsx to use UI components
3. Refactor PaymentModal.jsx with Stripe integration
4. Refactor BillSplitModal.jsx with UI components
5. Add MergeBillsModal.jsx component
6. Update all text to English
7. Connect coupon/loyalty to backend
8. Test end-to-end POS flow
9. Add Stripe public key to environment variables
10. Test payment flows (cash, card, bank transfer, split)

## 📦 Required NPM Packages

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js qrcode
```

## 🌐 Environment Variables

Add to `.env`:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
VITE_API_BASE_URL=https://your-backend.com/api
```

---

**Status**: Core architecture complete. UI components integrated in ProductModal and ProductCard. Cart merging logic ready. Payment constants updated. Stripe utilities created. Kitchen/Bar routing implemented.

**Priority**: Complete PaymentModal refactor with Stripe, then Cart component with UI components and English text.
