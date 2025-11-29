# SquareUp Client (Frontend)

## 📖 Overview

The client-side application for SquareUp is a modern, responsive single-page application (SPA) built with **React 19** and **Vite**. It provides a rich user interface for restaurant owners to manage their business and for customers to browse menus and place orders.

## 🚀 Features

### 🏗️ Website Builder
- **Drag-and-Drop Interface**: Customize your restaurant's landing page.
- **Live Preview**: See changes instantly.
- **Responsive Blocks**: Pre-designed sections for Menus, Galleries, and Info.

### 🏪 Point of Sale (POS) & Management
- **Menu Management**: Create and edit categories, items, and modifiers.
- **Order Dashboard**: View and manage incoming orders in real-time.
- **Staff Roles**: Manage permissions for different staff members.

### 🛒 Customer Experience
- **Online Ordering**: Smooth checkout flow with Stripe integration.
- **Mobile Optimized**: Great experience on all devices.
- **Order Tracking**: Real-time status updates.

## 🛠️ Tech Stack

- **Core**: React 19, Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Authentication**: Firebase Auth
- **Payments**: Stripe Elements

## ⚙️ Installation & Setup

### 1. Install Dependencies

```bash
cd Client
npm install
```

### 2. Firebase Setup

The client connects directly to Firebase for Authentication and Realtime Database listeners.

1.  **Register Web App:**
    *   Go to your [Firebase Console](https://console.firebase.google.com/).
    *   Open your project.
    *   Click the **Web** icon (</>) to add an app.
    *   Register the app (e.g., "SquareUp Client").

2.  **Get Configuration:**
    *   After registering, you will see a `firebaseConfig` object.
    *   You will need these values for your environment variables.

### 3. Environment Variables

Create a `.env` file in the `Client/` directory. **Note:** Vite requires environment variables to start with `VITE_`.

```env
# Firebase Configuration (Get these from Firebase Console > Project Settings)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com

# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

### 4. Running the Application

**Development Mode:**
```bash
npm run dev
```
The app will typically run at `http://localhost:5173`.

**Build for Production:**
```bash
npm run build
```

## Features

- **Authentication**: Email/Password and Google Sign-In.
- **Realtime Updates**: Uses Firebase Realtime Database for live data.
- **Responsive Design**: Optimized for Mobile, Tablet, and Desktop.

## Troubleshooting

- **Firebase Error (auth/configuration-not-found)**: Ensure you have enabled the sign-in methods (Email/Password, Google) in the Firebase Console.
- **CORS Errors**: Ensure your Server's `.env` has the correct `CLIENT_URL`.

## 📂 Directory Structure
```
Client
├─ .env
├─ index.html
├─ package.json
├─ public
├─ README.md
├─ src
│  ├─ api
│  ├─ components
│  ├─ config
│  ├─ constants
│  ├─ context
│  ├─ firebase.js
│  ├─ hooks
│  ├─ pages
│  ├─ store
│  └─ utils
└─ vite.config.js
``` 