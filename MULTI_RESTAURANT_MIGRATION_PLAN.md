# Multi-Restaurant System Migration Plan

## Overview
Migrate from single restaurant per user to multiple restaurants per user system.

---

## TASK 1: Fix Order Details Display Issues ✅

### 1.1 Fix Item Base Price Display
**Problem**: Item price includes options, need to show base price only

**Location**: `Client/src/pages/orders/OrderDetails.jsx` line 352

**Current Code**:
```jsx
<p className="text-sm text-gray-600 mt-1">
  <span className="font-semibold">{item.quantity}x</span> @
  ${item.price.toFixed(2)}
</p>
```

**Fixed Code**:
```jsx
{(() => {
  const optionsPrice = item.selectedOptions?.reduce((sum, opt) => sum + (opt.price || 0), 0) || 0;
  const basePrice = item.price - optionsPrice;
  
  return (
    <p className="text-sm text-gray-600 mt-1">
      <span className="font-semibold">{item.quantity}x</span> @
      ${basePrice.toFixed(2)}
      {optionsPrice > 0 && (
        <span className="text-xs text-gray-500"> (base price)</span>
      )}
    </p>
  );
})()}
```

### 1.2 Fix Discount Name Badge Position  
**Problem**: Discount name badge displays on separate line

**Location**: `Client/src/pages/orders/OrderDetails.jsx` lines 330-346

**Current**: Badge is in title attribute of yellow box
**Needed**: Display discount name inline with item name or in better position

**Suggested Fix**:
```jsx
<div className="flex items-center gap-2 flex-wrap">
  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
  <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-bold rounded">
    {itemDiscountData.discountPercentage}% OFF
  </span>
  {discountName && (
    <span className="text-xs text-gray-500 italic">
      ({discountName})
    </span>
  )}
</div>
```

---

## TASK 2: Backend - Multi-Restaurant Architecture 🏗️

### 2.1 Database Schema Changes

**Current Structure**:
```
users/
  {userId}/
    email, name, etc.

restaurants/
  {restaurantId}/  // restaurantId === userId (❌ Problem!)
    name, items, orders, etc.
```

**New Structure**:
```
users/
  {userId}/
    email: string
    name: string
    createdAt: number
    restaurants: {
      [restaurantId]: true  // List of restaurant IDs user owns
    }

restaurants/
  {restaurantId}/  // Generated unique ID
    ownerId: userId
    name: string
    items: {}
    orders: {}
    discounts: {}
    etc.

userRestaurants/  // Index for faster queries
  {userId}/
    {restaurantId}: {
      name: string
      role: 'owner' | 'manager'  // Future: multi-user support
      createdAt: number
    }
```

### 2.2 Backend Controller Changes

#### A. Auth Controller (`authController.js`)
**Changes Needed**:
1. On signup/Google login:
   - Create user in `users/{userId}`
   - Create default restaurant with generated ID
   - Link restaurant to user in `users/{userId}/restaurants/{restaurantId}`
   - Store ownerId in restaurant

**New Functions**:
```javascript
async function createDefaultRestaurant(userId, userName) {
  const restaurantId = db.ref('restaurants').push().key;
  const restaurantData = {
    id: restaurantId,
    ownerId: userId,
    name: `${userName}'s Restaurant`,
    createdAt: Date.now(),
    // ... default settings
  };
  
  await db.ref(`restaurants/${restaurantId}`).set(restaurantData);
  await db.ref(`users/${userId}/restaurants/${restaurantId}`).set(true);
  await db.ref(`userRestaurants/${userId}/${restaurantId}`).set({
    name: restaurantData.name,
    role: 'owner',
    createdAt: Date.now()
  });
  
  return restaurantId;
}
```

#### B. New Restaurants Controller Functions
```javascript
// Get all restaurants for a user
exports.getUserRestaurants = async (req, res) => {
  const { uid } = req.user;
  const snapshot = await db.ref(`userRestaurants/${uid}`).get();
  const restaurants = snapshot.val() || {};
  res.json(restaurants);
};

// Create new restaurant
exports.createRestaurant = async (req, res) => {
  const { uid } = req.user;
  const { name, ...restaurantData } = req.body;
  
  const restaurantId = db.ref('restaurants').push().key;
  const newRestaurant = {
    id: restaurantId,
    ownerId: uid,
    name,
    ...restaurantData,
    createdAt: Date.now()
  };
  
  await db.ref(`restaurants/${restaurantId}`).set(newRestaurant);
  await db.ref(`users/${uid}/restaurants/${restaurantId}`).set(true);
  await db.ref(`userRestaurants/${uid}/${restaurantId}`).set({
    name,
    role: 'owner',
    createdAt: Date.now()
  });
  
  res.status(201).json(newRestaurant);
};
```

#### C. Middleware Changes (`verifyToken.js`)
**Add**:
```javascript
// Verify user owns restaurant
exports.verifyRestaurantOwnership = async (req, res, next) => {
  const { uid } = req.user;
  const { restaurantId } = req.params;
  
  const snapshot = await db.ref(`users/${uid}/restaurants/${restaurantId}`).once('value');
  if (!snapshot.exists()) {
    return res.status(403).json({ error: 'Not authorized to access this restaurant' });
  }
  
  req.restaurantId = restaurantId;
  next();
};
```

### 2.3 Route Changes

**Update ALL routes** that use `req.user.uid` as restaurant ID:
```javascript
// OLD (❌)
router.get('/items', verifyToken, itemsController.getItems);
// Items controller: const { uid } = req.user; // uid used as restaurantId

// NEW (✅)
router.get('/:restaurantId/items', verifyToken, verifyRestaurantOwnership, itemsController.getItems);
// Items controller: const { restaurantId } = req.params;
```

**Files to Update**:
- `routes/items.js`
- `routes/categories.js`
- `routes/modifiers.js`
- `routes/discounts.js`
- `routes/orders.js`
- `routes/specialClosures.js`

---

## TASK 3: Frontend - Multi-Restaurant UI 🎨

### 3.1 New Context: RestaurantSelectionContext
```jsx
// Client/src/context/RestaurantSelectionContext.jsx
export const RestaurantSelectionContext = createContext();

export function RestaurantSelectionProvider({ children }) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    localStorage.getItem('selectedRestaurantId') || null
  );
  const [userRestaurants, setUserRestaurants] = useState([]);

  useEffect(() => {
    if (selectedRestaurantId) {
      localStorage.setItem('selectedRestaurantId', selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  return (
    <RestaurantSelectionContext.Provider value={{
      selectedRestaurantId,
      setSelectedRestaurantId,
      userRestaurants,
      setUserRestaurants
    }}>
      {children}
    </RestaurantSelectionContext.Provider>
  );
}
```

### 3.2 New Page: RestaurantSelector
```jsx
// Client/src/pages/restaurants/RestaurantSelector.jsx
export default function RestaurantSelector() {
  const { userRestaurants, setSelectedRestaurantId } = useRestaurantSelection();
  const navigate = useNavigate();

  const handleSelectRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Select Restaurant</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(userRestaurants).map(([id, restaurant]) => (
            <div key={id} 
                 onClick={() => handleSelectRestaurant(id)}
                 className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer">
              <h3 className="text-xl font-bold">{restaurant.name}</h3>
              <p className="text-gray-600">{restaurant.role}</p>
            </div>
          ))}
          
          <button className="bg-red-600 text-white p-6 rounded-xl">
            + Create New Restaurant
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.3 Update Routes
```jsx
// Client/src/routes.jsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/restaurants" replace /> },
      { path: "restaurants", element: <RestaurantSelector /> },
      { path: "dashboard", element: <Dashboard /> },
      // ... other routes
    ]
  }
]);
```

### 3.4 Update API Calls
**Example**: `Client/src/api/items.js`
```javascript
// OLD
export const getItems = async () => {
  return apiClient.get('/api/items');
};

// NEW  
export const getItems = async (restaurantId) => {
  return apiClient.get(`/api/restaurants/${restaurantId}/items`);
};
```

---

## Migration Steps

### Step 1: Backend Preparation
1. ✅ Create migration script to restructure existing data
2. ✅ Update auth controller to create default restaurant
3. ✅ Add restaurant ownership middleware
4. ✅ Update all controllers to use restaurantId param
5. ✅ Update all routes

### Step 2: Frontend Updates
1. ✅ Create RestaurantSelectionContext
2. ✅ Create RestaurantSelector page
3. ✅ Update all API calls to include restaurantId
4. ✅ Update RestaurantContext to use selected restaurant
5. ✅ Update routes and navigation

### Step 3: Testing
1. Test signup flow (auto-creates restaurant)
2. Test Google login (auto-creates restaurant)
3. Test switching between restaurants
4. Test all CRUD operations with new structure

### Step 4: Data Migration
1. Backup existing Firebase data
2. Run migration script
3. Verify data integrity
4. Update security rules

---

## Priority Order

1. **IMMEDIATE**: Fix Order Details Display (Task 1)
2. **HIGH**: Backend Multi-Restaurant (Task 2) - Required for frontend
3. **HIGH**: Frontend Multi-Restaurant UI (Task 3)

---

## Next Steps

Would you like me to:
1. Start with fixing the Order Details display issues?
2. Create the backend migration script first?
3. Something else?

Let me know which task to prioritize!
