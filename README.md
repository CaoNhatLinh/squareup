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
![Admin Dashboard](https://github.com/user-attachments/assets/a3617d44-f6e8-445a-b75d-54d472dd3da7)

### 2. Website Builder
*Drag-and-drop interface to customize the restaurant's landing page.*
![Website Builder](https://github.com/user-attachments/assets/b019c350-09fe-4dab-9fdd-1b17c592589b)

### 3. Point of Sale (POS)
*Streamlined interface for staff to take orders and manage tables.*
![POS System](https://github.com/user-attachments/assets/401d21be-1b94-4fed-85ff-6c87fa6ffc8)

### 4. Menu Management
*Interface for managing categories, items, modifiers, and discounts.*
<img width="1919" height="873" alt="image" src="https://github.com/user-attachments/assets/8a25c1ef-d0bf-4457-99a3-13d61a098ba3" />
<img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/f80ebac6-6a1f-422d-b8ef-87b072e42d91" />







### 5. Customer Storefront
*Mobile-responsive online ordering page for customers.*
![Customer Storefront](https://github.com/user-attachments/assets/60235c77-4f26-4c4f-8770-ad66a19c08e3)
![Menu Management](https://github.com/user-attachments/assets/3b421dc1-5722-43ac-ab6f-e9acf450159e)
<img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/9738d385-ed08-4057-bad2-ea9d7d1c773e" />
### 6. Order Tracking
*Real-time order status updates for customers.*
![Order Tracking](https://github.com/user-attachments/assets/c6f25194-ef94-4120-b197-c8e4311d609a)

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
