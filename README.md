# Dự Án Quản Lý Nhà Hàng - SquareUp

## Mô Tả Dự Án

Đây là một hệ thống quản lý nhà hàng toàn diện được xây dựng bằng React.js (frontend) và Node.js với Express (backend). Hệ thống cho phép quản lý các nhà hàng, menu, đơn hàng, thanh toán trực tuyến và nhiều tính năng khác để hỗ trợ hoạt động kinh doanh nhà hàng.

## Tính Năng Chính

### Quản Lý Nhà Hàng
- Tạo và quản lý nhiều nhà hàng
- Cấu hình thông tin cơ bản (tên, địa chỉ, giờ mở cửa)
- Quản lý đặc biệt đóng cửa (special closures)

### Quản Lý Menu
- **Danh mục (Categories)**: Tạo và chỉnh sửa danh mục món ăn
- **Món ăn (Items)**: Thêm, sửa, xóa món ăn với hình ảnh, giá cả, mô tả
- **Bổ sung (Modifiers)**: Quản lý các tùy chọn bổ sung cho món ăn
- **Giảm giá (Discounts)**: Tạo các chương trình giảm giá

### Quản Lý Đơn Hàng
- Xem danh sách đơn hàng
- Chi tiết đơn hàng với trạng thái
- Theo dõi đơn hàng cho khách hàng
- Thông báo đơn hàng mới

### Thanh Toán Trực Tuyến
- Tích hợp Stripe để thanh toán an toàn
- Xử lý thanh toán cho đơn hàng
- Webhook để cập nhật trạng thái thanh toán

### Giao Diện Khách Hàng
- Trang mua hàng trực tuyến cho khách hàng
- Giỏ hàng và thanh toán
- Theo dõi trạng thái đơn hàng

### Quản Trị Viên
- Dashboard quản trị
- Quản lý người dùng
- Công cụ phát triển (Developer Tools)

### Xác Thực và Bảo Mật
- Đăng nhập/đăng ký với Firebase Authentication
- Phân quyền admin và user
- Bảo vệ API với token

## Công Nghệ Sử Dụng

### Frontend (Client)
- **React 19.1.1**: Framework JavaScript cho giao diện người dùng
- **Vite 7.1.7**: Công cụ build và dev server nhanh
- **React Router DOM 6.14.1**: Điều hướng trang
- **TailwindCSS 4.1.16**: Framework CSS utility-first
- **Axios 1.13.1**: HTTP client cho API calls
- **Firebase 9.22.2**: Xác thực và cơ sở dữ liệu thời gian thực
- **Stripe React/JS**: Tích hợp thanh toán
- **React Toastify**: Thông báo người dùng
- **React Icons**: Bộ icon
- **React DatePicker**: Chọn ngày tháng

### Backend (Server)
- **Node.js với Express 5.1.0**: Framework server
- **Firebase Admin 11.10.0**: Quản lý Firebase từ server
- **Stripe 19.2.0**: Xử lý thanh toán server-side
- **Multer 2.0.2**: Upload file
- **CORS**: Cross-Origin Resource Sharing
- **Cookie Parser**: Xử lý cookie
- **Nodemon**: Auto-restart server trong development

### Upload Ảnh với ImgBB API

Hệ thống sử dụng **ImgBB API** để lưu trữ hình ảnh món ăn và các tài nguyên khác. Đây là giải pháp đám mây miễn phí cho việc lưu trữ ảnh.

#### Cách hoạt động:
1. **Nén ảnh tự động**: Ảnh được nén tối đa 1MB và kích thước 1920px trước khi upload
2. **Upload lên ImgBB**: Sử dụng API key để upload ảnh lên server ImgBB
3. **Lưu URL**: Lưu URL ảnh trả về vào Firebase database

#### API Endpoints:
- `POST /api/upload/image` - Upload ảnh base64
- `POST /api/upload/image-file` - Upload file ảnh (multipart/form-data)

#### Cấu hình:
```env
# Server .env
IMGBB_API_KEY=your_imgbb_api_key_here
```

#### Ưu điểm:
- ✅ **Miễn phí**: Không tốn chi phí lưu trữ
- ✅ **Tự động nén**: Giảm dung lượng ảnh
- ✅ **CDN**: Ảnh được phân phối nhanh trên toàn cầu
- ✅ **API đơn giản**: Dễ tích hợp

#### Giới hạn:
- ⚠️ Dung lượng tối đa: 10MB/ảnh
- ⚠️ Thời gian lưu trữ: Vĩnh viễn (miễn phí)
- ⚠️ Không có tùy chỉnh watermark

## Cấu Trúc Dự Án

```
squareup/
├── Client/                    # Frontend React
│   ├── .env.example          # Environment variables template
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── api/             # API calls
│   │   ├── components/      # React components
│   │   │   ├── common/      # Common components
│   │   │   ├── navigation/  # Navigation components
│   │   │   └── ...
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── categories/  # Category management
│   │   │   ├── items/       # Item management
│   │   │   ├── orders/      # Order management
│   │   │   ├── settings/    # Settings pages
│   │   │   └── shop/        # Customer shop pages
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── package.json
│   └── vite.config.js
│
├── server/                   # Backend Node.js
│   ├── .env.example          # Environment variables template
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── firebase-rules.json  # Firebase Security Rules
│   ├── package.json
│   └── server.js            # Main server file
│
├── start-webhook.ps1        # Script setup webhook cho Windows
├── start-webhook.sh         # Script setup webhook cho Linux/Mac
├── .gitignore               # Git ignore rules
├── README.md                # This file
```

## Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống
- Node.js (phiên bản 16+)
- npm hoặc yarn
- Tài khoản Firebase
- Tài khoản Stripe (cho thanh toán)

### 1. Clone Repository
```bash
git clone <repository-url>
cd squareup
```

### 2. Cài Đặt Dependencies

#### Client (Frontend)
```bash
cd Client
npm install
```

#### Server (Backend)
```bash
cd ../server
npm install
```

### 3. Cấu Hình Môi Trường

#### Chuẩn bị file .env
cài đặt file .env, sau đó bạn thay đổi các giá trị phù hợp trong file .env của bạn:
**Server:**
```bash
cd server
cp .env.example .env
```

**Client:**
```bash
cd Client
cp .env.example .env
```



### 4. Cấu Hình Firebase
1. Tạo project Firebase tại [Firebase Console](https://console.firebase.google.com/)
2. Bật Authentication và Firestore
3. Tạo service account key và tải về `serviceAccountKey.json` vào `server/src/config/`
4. Cập nhật Firebase Security Rules theo file `firebase-rules.json`

### 5. Cấu Hình Stripe
1. Tạo tài khoản Stripe tại [Stripe Dashboard](https://dashboard.stripe.com/)
2. Lấy publishable key và secret key
3. Cấu hình webhook endpoint cho thanh toán

#### Cấu Hình Webhook Stripe
Để xử lý thanh toán thành công và lưu đơn hàng vào Firebase, bạn cần cấu hình webhook.

**Cách 1: Sử dụng Script Tự Động (Khuyến nghị)**
Dự án đã cung cấp script tự động để setup webhook:

**Windows (PowerShell):**
```powershell
.\start-webhook.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x start-webhook.sh
./start-webhook.sh
```

Script sẽ tự động:
- ✅ Kiểm tra Stripe CLI đã cài đặt
- ✅ Kiểm tra backend và frontend đang chạy
- ✅ Khởi động webhook listener
- ✅ Hiển thị hướng dẫn copy webhook secret

**Cách 2: Manual Setup**
Chi tiết xem file [WEBHOOK_SETUP.md](server/WEBHOOK_SETUP.md).

**Các bước cơ bản:**
1. Cài đặt Stripe CLI
2. Đăng nhập: `stripe login`
3. Chạy webhook listener: `stripe listen --forward-to localhost:5000/api/checkout/webhook`
4. Copy webhook secret vào file `.env`

### 6. Cấu Hình Firebase Security Rules
Firebase Security Rules đảm bảo an toàn dữ liệu. Copy nội dung từ file `firebase-rules.json` và paste vào Firebase Console:

1. Vào [Firebase Console](https://console.firebase.google.com/) > Project > Firestore Database > Rules
2. Thay thế rules mặc định bằng nội dung trong `server/firebase-rules.json`

**Rules bao gồm:**
- Quyền đọc/ghi cho restaurants, categories, items, modifiers
- Index cho tìm kiếm hiệu quả
- Bảo vệ dữ liệu orders và users

### 7. Chạy Dự Án

#### Chạy Backend (Server)
```bash
cd server
npm run dev
```
Server sẽ chạy tại `http://localhost:5000`

#### Chạy Frontend (Client)
```bash
cd Client
npm run dev
```
Client sẽ chạy tại `http://localhost:5173`

### Test Thanh Toán
Sau khi cấu hình webhook, test thanh toán với các thẻ test của Stripe:

#### Chuẩn Bị Test
1. Đảm bảo backend đang chạy: `cd server && npm run dev`
2. Đảm bảo frontend đang chạy: `cd Client && npm run dev`
3. Chạy script webhook: `.\start-webhook.ps1` (Windows) hoặc `./start-webhook.sh` (Linux/Mac)
4. Copy webhook secret vào file `.env`

#### Guest Users (Khách Vãng Lai)
Hệ thống hỗ trợ guest users để khách hàng có thể đặt hàng mà không cần đăng ký:

**Cách hoạt động:**
- ✅ Tự động tạo UUID khi truy cập `/shop/:restaurantId`
- ✅ Lưu UUID trong localStorage (không cần đăng nhập)
- ✅ Mỗi restaurant có UUID riêng
- ✅ Có thể xem lịch sử đơn hàng và đánh giá
- ❌ Không thể truy cập trang quản lý

**LocalStorage Keys:**
```
guest_uuid_{restaurantId} = "uuid-here"
```

#### Thẻ Test Stripe
- **Thành công**: `4242 4242 4242 4242`
- **Cần xác thực**: `4000 0025 0000 3155`
- **Từ chối**: `4000 0000 0000 9995`

**Thông tin bổ sung:**
- Ngày hết hạn: Bất kỳ tháng/năm tương lai
- CVC: Bất kỳ 3 số
- Mã ZIP: Bất kỳ 5 số

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Đăng ký
- `POST /api/auth/signin` - Đăng nhập
- `POST /api/auth/signout` - Đăng xuất

### Restaurants
- `GET /api/restaurants` - Lấy danh sách nhà hàng
- `POST /api/restaurants` - Tạo nhà hàng mới
- `GET /api/restaurants/:id` - Lấy thông tin nhà hàng
- `PUT /api/restaurants/:id` - Cập nhật nhà hàng
- `DELETE /api/restaurants/:id` - Xóa nhà hàng

### Categories
- `GET /api/restaurants/:restaurantId/categories` - Lấy danh mục
- `POST /api/restaurants/:restaurantId/categories` - Tạo danh mục
- `PUT /api/restaurants/:restaurantId/categories/:id` - Cập nhật danh mục
- `DELETE /api/restaurants/:restaurantId/categories/:id` - Xóa danh mục

### Items
- `GET /api/restaurants/:restaurantId/items` - Lấy món ăn
- `POST /api/restaurants/:restaurantId/items` - Tạo món ăn
- `PUT /api/restaurants/:restaurantId/items/:id` - Cập nhật món ăn
- `DELETE /api/restaurants/:restaurantId/items/:id` - Xóa món ăn

### Modifiers
- `GET /api/restaurants/:restaurantId/modifiers` - Lấy bổ sung
- `POST /api/restaurants/:restaurantId/modifiers` - Tạo bổ sung
- `PUT /api/restaurants/:restaurantId/modifiers/:id` - Cập nhật bổ sung
- `DELETE /api/restaurants/:restaurantId/modifiers/:id` - Xóa bổ sung

### Discounts
- `GET /api/restaurants/:restaurantId/discounts` - Lấy giảm giá
- `POST /api/restaurants/:restaurantId/discounts` - Tạo giảm giá
- `PUT /api/restaurants/:restaurantId/discounts/:id` - Cập nhật giảm giá
- `DELETE /api/restaurants/:restaurantId/discounts/:id` - Xóa giảm giá

### Orders
- `GET /api/orders` - Lấy đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng

### Checkout
- `POST /api/checkout/create-session` - Tạo phiên thanh toán Stripe
- Webhook endpoint cho Stripe

### Upload
- `POST /api/upload` - Upload hình ảnh

### Admin
- `GET /api/admin/users` - Quản lý người dùng
- Các endpoint quản trị khác

## Scripts Có Sẵn

### Client
- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint

### Server
- `npm run dev` - Chạy server với nodemon
- `npm start` - Chạy server production
- `npm test` - Chạy tests (chưa implement)

### Webhook Setup Scripts
- `.\start-webhook.ps1` - Script tự động setup webhook cho Windows
- `./start-webhook.sh` - Script tự động setup webhook cho Linux/Mac

**Cách chạy trên Windows:**
1. **Cách đơn giản nhất**: Chuột phải vào file `start-webhook.ps1` → Chọn "Run with PowerShell"
2. **Cách thủ công**: Mở PowerShell → Điều hướng đến thư mục dự án → Chạy `.\start-webhook.ps1`

**Cách chạy trên Linux/Mac:**
```bash
chmod +x start-webhook.sh
./start-webhook.sh
```

Scripts sẽ tự động kiểm tra môi trường và khởi động webhook listener.

## Triển Khai

### Frontend
```bash
cd Client
npm run build
```
Upload thư mục `dist/` lên hosting service (Vercel, Netlify, etc.)

### Backend
Deploy lên cloud service như Heroku, Railway, Render, etc. với các biến môi trường đã cấu hình.

## Đóng Góp

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Giấy Phép

Dự án này sử dụng giấy phép ISC.

## Liên Hệ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng tạo issue trên GitHub hoặc liên hệ trực tiếp với tôi qua email: caonhatlinh1312@gmail.com

## Cập Nhật

### Version 1.0.0
- Phát hành phiên bản đầu tiên
- Tính năng quản lý nhà hàng cơ bản
- Tích hợp thanh toán Stripe
- Giao diện khách hàng
- Quản lý đơn hàng và thông báo