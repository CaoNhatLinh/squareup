# URL-Based Routing Migration Guide

## Overview
Đang chuyển đổi từ localStorage-based restaurantId sang URL parameter-based routing để code clean hơn và dễ maintain.

## Router Structure
```
/restaurants → RestaurantSelector (chọn nhà hàng)
/:restaurantId/dashboard → Dashboard
/:restaurantId/items → ItemLibrary
/:restaurantId/categories → Categories
... (tất cả routes khác)
```

## Migration Checklist

### ✅ Completed
- [x] routes.jsx - Đã thêm `:restaurantId` vào tất cả protected routes
- [x] routes.jsx - Đã tạo loaders (dashboardLoader, itemsLoader, etc.)
- [x] menuConfig.js - Chuyển sang `getMenuItems(restaurantId)` function
- [x] MainSidebar.jsx - Lấy restaurantId từ `useParams()`
- [x] RestaurantSelector.jsx - Navigate tới `/${restaurantId}/dashboard`
- [x] Dashboard.jsx - Đang dùng `useLoaderData()` (correct)

### 🔄 In Progress - Pages cần update

#### Categories
- [ ] Categories.jsx
  - Thay `const { user } = useAuth()` bằng `const { restaurantId } = useParams()`
  - Thay `fetchCategories(user.uid)` → `fetchCategories(restaurantId)`
  - Thay `deleteCategory(user.uid, ...)` → `deleteCategory(restaurantId, ...)`
  - Update navigation links: `/categories/new` → `/${restaurantId}/categories/new`
  
- [ ] CreateCategory.jsx
  - Thay `user.uid` bằng `restaurantId` từ `useParams()`
  - Update `fetchCategories(user.uid)` và `fetchItems(user.uid)`
  - Update `createCategory(user.uid, ...)`
  - Update navigation: `/categories` → `/${restaurantId}/categories`

- [ ] EditCategory.jsx
  - Similar changes như CreateCategory

#### Items
- [ ] ItemLibrary.jsx
  - Use `useLoaderData()` nếu đã có loader
  - Thay `user.uid` → `restaurantId` trong API calls
  - Update navigation links

- [ ] CreateItem.jsx, EditItem.jsx
  - Thay `user.uid` → `restaurantId` 
  - Update API calls và navigation

#### Modifiers
- [ ] Modifiers.jsx
  - Use `useLoaderData()` nếu đã có loader
  - Update API calls với restaurantId

- [ ] CreateModifier.jsx, EditModifier.jsx
  - Similar pattern

#### Discounts  
- [ ] Discounts.jsx
  - Thay `user.uid` → `restaurantId`
  
- [ ] CreateDiscount.jsx
  - **CRITICAL**: File này rất lớn (code phức tạp)
  - Thay `user.uid` → `restaurantId` ở:
    - `fetchCategories(user.uid)` → `fetchCategories(restaurantId)`
    - `fetchItems(user.uid)` → `fetchItems(restaurantId)`
    - `createDiscount(user.uid, formData)` → `createDiscount(restaurantId, formData)`
  - Update navigation: `/discounts` → `/${restaurantId}/discounts`

- [ ] EditDiscount.jsx
  - Similar changes

#### Orders
- [ ] Orders.jsx
  - Use `useLoaderData()` từ ordersLoader
  - Update navigation links

- [ ] OrderDetails.jsx
  - Lấy restaurantId từ params hoặc loader data

#### Settings Pages
- [ ] BusinessAbout.jsx, BusinessHours.jsx, SpecialClosures.jsx, DeveloperTools.jsx
  - Thay `user.uid` → `restaurantId`
  - Update API calls

## Code Pattern

### BEFORE (Old)
```jsx
import { useAuth } from '../../hooks/useAuth';

export default function MyPage() {
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchItems(user.uid); // ❌ BAD
    };
    fetchData();
  }, [user.uid]);
  
  return <Link to="/items/new">Create</Link> // ❌ BAD
}
```

### AFTER (New)
```jsx
import { useParams } from 'react-router-dom';

export default function MyPage() {
  const { restaurantId } = useParams();
  
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchItems(restaurantId); // ✅ GOOD
    };
    fetchData();
  }, [restaurantId]);
  
  return <Link to={`/${restaurantId}/items/new`}>Create</Link> // ✅ GOOD
}
```

### With Loader (Even Better)
```jsx
import { useParams, useLoaderData } from 'react-router-dom';

export function itemsLoader({ params }) {
  return fetchItems(params.restaurantId);
}

export default function MyPage() {
  const { restaurantId } = useParams();
  const items = useLoaderData(); // ✅ Data already loaded
  
  return <Link to={`/${restaurantId}/items/new`}>Create</Link>
}
```

## API Files Status
✅ All API files already accept `restaurantId` parameter:
- `categories.js` - fetchCategories(restaurantId)
- `items.js` - fetchItems(restaurantId)
- `modifiers.js` - fetchModifiers(restaurantId)
- `discounts.js` - fetchDiscounts(restaurantId)
- `orders.js` - getRestaurantOrders(restaurantId)
- `specialClosures.js` - fetchSpecialClosures(restaurantId)

## Testing Plan
1. Login → Should redirect to `/restaurants`
2. Select restaurant → Should navigate to `/:restaurantId/dashboard`
3. Navigate between pages → URL should always include restaurantId
4. Refresh page → Should still work (restaurantId in URL)
5. Direct URL access → `/:restaurantId/items` should work
6. All CRUD operations → Should use restaurantId from URL

## Notes
- RestaurantSelectionContext vẫn có thể giữ để sync với localStorage (backup)
- RestaurantProvider vẫn cần để provide restaurant data
- Không cần remove useAuth hook, nhưng không dùng user.uid cho API calls nữa
