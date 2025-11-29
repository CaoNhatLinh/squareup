# SquareUp - Restaurant Management System

## Project Description

SquareUp is a comprehensive restaurant management system built with **React.js** (frontend) and **Node.js with Express** (backend). This system empowers restaurant owners to manage their businesses effectively, from menu configuration and order processing to online payments and customer engagement.

## 🌟 Key Features

### For Restaurant Owners
- **Multi-Restaurant Management**: Create and manage multiple restaurant locations from a single admin account.
- **Business Configuration**: 
  - Configure basic info (name, address, currency).
  - Set opening hours and manage special closures (holidays).
- **Menu Management**:
  - **Categories**: Organize your menu into logical sections.
  - **Items**: Add detailed items with images, descriptions, and pricing.
  - **Modifiers**: Create customization options (e.g., toppings, sizes).
  - **Discounts**: Run promotional campaigns and automated discounts.
- **Order Management**:
  - Real-time order dashboard for kitchen and staff.
  - Order status tracking (Pending, Confirmed, Preparing, Ready, Delivered).
  - New order notifications.
- **Staff & Roles**:
  - Invite staff members via email.
  - Granular role-based access control (Owner, Manager, Staff, etc.).
  - **Developer Tools**:
  - Fake orders for testing.
### For System Administrators
- **User Management**: View and manage all registered users and restaurants.
- **Developer Tools**:
  - System health checks.


### For Customers
- **Online Ordering**: 
  - Modern, mobile-responsive storefront.
  - Easy-to-use cart and checkout process.
  - Guest checkout support (no login required).
- **Secure Payments**: 
  - Integrated **Stripe** payment processing.
  - Support for credit cards and test modes.
- **Order Tracking**: 
  - Real-time updates on order progress.
  - Review order history.

## 📸 Screenshots

Please update the image URLs below with your actual screenshots.

### 1. Admin Dashboard
*Overview of business performance, sales stats, and quick actions.*
![Admin Dashboard](PLACEHOLDER_DASHBOARD_IMAGE_URL)

### 2. Website Builder
*Drag-and-drop interface to customize the restaurant's landing page.*
![Website Builder](PLACEHOLDER_BUILDER_IMAGE_URL)

### 3. Point of Sale (POS)
*Streamlined interface for staff to take orders and manage tables.*
![POS System](PLACEHOLDER_POS_IMAGE_URL)

### 4. Menu Management
*Interface for managing categories, items, modifiers, and discounts.*
![Menu Management](PLACEHOLDER_MENU_IMAGE_URL)

### 5. Customer Storefront
*Mobile-responsive online ordering page for customers.*
![Customer Storefront](PLACEHOLDER_STOREFRONT_IMAGE_URL)

### 6. Order Tracking
*Real-time order status updates for customers.*
![Order Tracking](PLACEHOLDER_TRACKING_IMAGE_URL)

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React 19, Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Database/Auth**: Firebase SDK

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database/Auth**: Firebase Admin SDK
- **Payments**: Stripe

## 📂 Project Structure

This project is divided into two main parts:

- **[Client](./Client/README.md)**: The frontend application (React).
- **[Server](./server/README.md)**: The backend API (Node.js/Express).

Please refer to the `README.md` files in each directory for detailed documentation, installation instructions, and directory structure specific to that part of the application.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Firebase Account
- Stripe Account

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd squareup
    ```

2.  **Setup Client:**
    Follow the instructions in [Client/README.md](./Client/README.md).

3.  **Setup Server:**
    Follow the instructions in [server/README.md](./server/README.md).

## 💳 Stripe Test Cards for Payment Testing

When testing payment in **test mode**, use these card numbers. They won't be charged.

### Common Test Cards

| Card Number | Type | Description |
|-------------|------|-------------|
| `4242 4242 4242 4242` | ✅ Success | Basic successful payment (most common) |
| `5555 5555 5555 4444` | ✅ Success | Mastercard successful payment |
| `4000 0027 6000 3184` | 🔐 3D Secure | Requires authentication (succeeds) |
| `4000 0000 0000 0002` | ❌ Decline | Generic card decline |
| `4000 0000 0000 9995` | ❌ Decline | Insufficient funds |

**For all test cards:**
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any valid format (e.g., `12345`)

**More test cards:** [Stripe Testing Docs](https://stripe.com/docs/testing#cards)

---

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

If you have any questions or need support, please create an issue on GitHub or contact the maintainer directly.