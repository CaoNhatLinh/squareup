# Copilot Instructions for SquareUp Restaurant App

## Architecture Overview
This is a full-stack restaurant ordering and management system:
- **Frontend**: React 19 app built with Vite, using Firebase Auth for authentication and Tailwind CSS for styling
- **Backend**: Node.js/Express API server with Firebase Admin SDK for database operations
- **Database**: Firebase Realtime Database (RTDB) with restaurant-scoped data structure (`restaurants/{restaurantId}/items`, etc.)
- **Payment**: Stripe integration for checkout
- **State Management**: React Context providers for auth, restaurant selection, orders, and notifications

## Key Components
- **Client/src/components/**: Reusable UI components (Layout, Toast, AdminRoute)
- **Client/src/pages/**: Route-based pages for admin dashboard, shop, auth
- **Client/src/context/**: Global state providers (AuthProvider, RestaurantProvider)
- **Client/src/api/**: Axios-based API client functions for CRUD operations
- **Server/src/controllers/**: Express route handlers for business logic
- **Server/src/routes/**: API endpoint definitions

## Developer Workflows
- **Start development**: Run `npm run dev` in both Client and server directories (server on port 5000, client on 5173)
- **Build client**: `npm run build` in Client directory
- **Start production server**: `npm start` in server directory
- **Debug auth issues**: Check Firebase Auth state and session cookies; use `/api/debug/token` endpoint for token claims
- **Database queries**: Use Firebase RTDB refs like `db.ref(\`restaurants/\${restaurantId}/items\`)`

## Project Conventions
- **File naming**: camelCase for components (.jsx), PascalCase for component files
- **Imports**: Use `@/` alias for `src/` directory (configured in vite.config.js)
- **API calls**: Use axios instance from `apiClient.js` with automatic Firebase token injection
- **Data fetching**: Implement route loaders in `routes.jsx` for pre-loading data
- **Error handling**: 401 responses redirect to `/signin` via axios interceptor
- **State updates**: Use Context providers for global state; avoid prop drilling
- **Firebase operations**: Server uses admin SDK for RTDB writes; client uses auth SDK for tokens

## Integration Patterns
- **Authentication**: Firebase Auth with custom claims (isAdmin, role) verified server-side
- **Session management**: Cookie-based sessions with ID token validation
- **File uploads**: Multer middleware for image handling
- **Cross-origin**: CORS configured for client-server communication
- **Payment flow**: Stripe Elements in client, webhook handling in server

## Common Patterns
- **CRUD operations**: Follow RESTful API design with consistent error responses
- **Data relationships**: Items belong to categories via `categoryIds` arrays; use transactions for consistency
- **Guest orders**: Support anonymous users with session-based cart storage
- **Admin checks**: Use `verifyAdmin.js` middleware for protected routes
- **Toast notifications**: Use ToastContext for user feedback messages</content>
<parameter name="filePath">e:\WORKSPACE\Reactjs\learnReact\squareup\.github\copilot-instructions.md