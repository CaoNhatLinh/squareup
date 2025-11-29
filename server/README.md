# SquareUp Server (Backend)

## 📖 Overview

The backend API service for the SquareUp Restaurant Management System. This server handles business logic, payment processing, email notifications, and administrative tasks using **Node.js** and **Express**.

## 🚀 Features

- **Authentication**: Secure user verification via Firebase Admin SDK.
- **Restaurant Management**: CRUD operations for restaurants, menus, and settings.
- **Order Processing**: Handle order creation, status updates, and history.
- **Payment Integration**: Secure checkout sessions and webhook handling with Stripe.
- **Image Upload**: Integration with ImgBB for image storage.
- **Email Notifications**: Automated emails for order confirmations and invitations.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: Firebase Firestore (via Admin SDK)
- **Payments**: Stripe API
- **File Uploads**: Multer
- **Utilities**: Nodemailer, Node-cron

## ⚙️ Installation & Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Firebase Setup (Crucial)

The server uses the **Firebase Admin SDK** to interact with Firebase services (Authentication, Realtime Database) with privileged access.

1.  **Create a Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Create a new project (or use an existing one).

2.  **Generate Service Account Key:**
    *   In your Firebase project, go to **Project Settings** (gear icon) > **Service accounts**.
    *   Click **Generate new private key**.
    *   Save the downloaded JSON file as `serviceAccountKey.json` in the `server/` root directory.
    *   **IMPORTANT:** Do not commit this file to version control. It is already in `.gitignore`.

3.  **Enable Realtime Database:**
    *   Go to **Build** > **Realtime Database** in the Firebase sidebar.
    *   Create a database (start in test mode for development).
    *   Copy the database URL (e.g., `https://your-project-id-default-rtdb.firebaseio.com/`).

4.  **Enable Authentication:**
    *   Go to **Build** > **Authentication** > **Sign-in method**.
    *   Enable **Email/Password**.
    *   Enable **Google**.

### 3. Environment Configuration

Create a `.env` file in the `server/` directory based on the example below:

```env
PORT=5000
# Path to your service account key relative to server root
SERVICE_ACCOUNT_PATH=serviceAccountKey.json
# Your Firebase Realtime Database URL
FIREBASE_DB_URL=https://your-project-id-default-rtdb.firebaseio.com/
# Stripe Secret Key (if using payments)
STRIPE_SECRET_KEY=sk_test_...
# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

### 4. Running the Server

**Development Mode (with nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```
The server runs on port `5000` by default.



## 💳 Webhook Setup

To handle Stripe payments locally, you need to forward webhooks to your local server.

**Using the provided script (Windows):**
```powershell
.\start-webhook.ps1
```

**Using the provided script (Linux/Mac):**
```bash
./start-webhook.sh
```

**Manual Setup:**
```bash
stripe listen --forward-to localhost:5000/api/checkout/webhook
```

## 📂 Directory Structure

```
server
├─ firebase-rules.json
├─ jest.config.js
├─ package.json
├─ README.md
├─ server.js
├─ src
│  ├─ app.js
│  ├─ config
│  ├─ controllers
│  ├─ middleware
│  ├─ routes
│  ├─ services
│  └─ utils
└─ __tests__
```
