# Stripe Webhook Setup

## Vấn đề
Order không được lưu vào Firebase sau khi thanh toán thành công vì webhook chưa nhận được event từ Stripe.

## Giải pháp: Sử dụng Stripe CLI

### 1. Cài đặt Stripe CLI (nếu chưa có)

**Windows:**
```bash
# Sử dụng Scoop
scoop install stripe

# Hoặc tải trực tiếp từ: https://github.com/stripe/stripe-cli/releases
```

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Ubuntu/Debian
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xvf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin/
```

### 2. Đăng nhập Stripe CLI

```bash
stripe login
```

Lệnh này sẽ mở browser để bạn xác thực. Sau khi xác thực thành công, API keys sẽ được lưu local.

### 3. Chạy Webhook Listener

**Mở terminal mới** và chạy:

```bash
stripe listen --forward-to localhost:5000/api/checkout/webhook
```

Lệnh này sẽ:
- ✅ Forward tất cả Stripe events đến local server của bạn
- ✅ Tự động tạo webhook signing secret
- ✅ Hiển thị webhook secret (dạng `whsec_...`)

### 4. Cập nhật Webhook Secret

Copy webhook secret từ output của `stripe listen` và cập nhật vào `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Chú ý:** Secret này chỉ hoạt động khi `stripe listen` đang chạy!

### 5. Test Thanh toán

1. Đảm bảo server đang chạy: `npm run dev`
2. Đảm bảo Stripe CLI đang listen: `stripe listen --forward-to localhost:5000/api/checkout/webhook`
3. Thực hiện thanh toán test từ frontend
4. Xem logs trong cả 2 terminals:
   - **Server terminal**: Xem webhook được xử lý
   - **Stripe CLI terminal**: Xem events được forward

### 6. Test Cards

Sử dụng test cards của Stripe:

- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Expiry: Bất kỳ tháng/năm tương lai  
CVC: Bất kỳ 3 số  
ZIP: Bất kỳ 5 số

## Logs Để Kiểm Tra

Khi webhook hoạt động đúng, bạn sẽ thấy:

```
🎣 Webhook received!
✅ Webhook signature verified
🎯 Event type: checkout.session.completed
💳 Payment successful! Session ID: cs_test_xxx
💰 Payment status: paid
💵 Payment status is 'paid', processing order...
📋 Metadata: { pendingOrderId: 'pending_xxx', restaurantId: 'xxx' }
🔍 Looking for pending order: pending_xxx
✅ Found pending order with 2 items
✅ Order xxx saved successfully via webhook with 2 items
🗑️ Pending order pending_xxx deleted
```

## Troubleshooting

### Webhook không nhận được event
- ✅ Kiểm tra Stripe CLI có đang chạy không
- ✅ Kiểm tra port đúng (5000)
- ✅ Kiểm tra STRIPE_WEBHOOK_SECRET đã được set

### Order không được lưu
- ✅ Kiểm tra logs để xem event type
- ✅ Kiểm tra payment_status === "paid"
- ✅ Kiểm tra pending order có tồn tại trong Firebase không
- ✅ Kiểm tra metadata có đầy đủ không

### Testing từ Stripe Dashboard
Nếu muốn test với webhook từ Stripe Dashboard (không dùng CLI):

1. Vào Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-deployed-url.com/api/checkout/webhook`
3. Select events: `checkout.session.completed`
4. Copy webhook signing secret và update vào `.env`

**Lưu ý:** Cách này chỉ dùng cho production, không dùng cho local development!
