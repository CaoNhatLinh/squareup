# Cấu trúc thư mục mới - Refactored Structure

## 📁 src/components/

### navigation/ - Components điều hướng
- **MenuItem.jsx** - Component đệ quy để render menu items với nhiều cấp
- **RestaurantDropdown.jsx** - Dropdown menu khi click vào tên nhà hàng

### settings/ - Components cho trang Settings
- **SettingsLayout.jsx** - Layout wrapper cho settings pages
- **SettingsSidebar.jsx** - Sidebar riêng cho Settings với cấu trúc menu khác

### Main components
- **MainSidebar.jsx** - Sidebar chính cho app (không bao gồm Settings)
- **Layout.jsx** - Layout chính, tự động ẩn MainSidebar khi vào Settings
- **Header.jsx** - Header component
- **RequireAuth.jsx** - Auth guard component

---

## 📁 src/pages/

### settings/ - Trang Settings và sub-pages
- **BusinessAbout.jsx** - /settings/business/about
- *(Có thể thêm các pages khác: BusinessSecurity.jsx, PersonalInformation.jsx, etc.)*

### Main pages
- **Settings.jsx** - Trang Settings chính (Account settings)
- **Dashboard.jsx**, **Home.jsx**, **SignIn.jsx**, etc.

---

## 📁 src/config/

- **menuConfig.js** - Cấu trúc menu chính (MainSidebar)
  - Dễ dàng thêm/sửa menu items
  - Hỗ trợ unlimited nesting levels
  
---

## 🎨 Giao diện

### 1. Dropdown khi click vào tên nhà hàng (MainSidebar)
```
┌──────────────────────┐
│  [Tên nhà hàng]  ▶   │
├──────────────────────┤
│ Owner: email         │
│ Account settings     │ → Link to /settings
│ Sign out             │
└──────────────────────┘
```

### 2. Settings page layout
```
┌────────────┬────────────────────────┐
│ [← Back]   │                        │
│ Settings   │                        │
│            │                        │
│ Account &  │   Main Content Area    │
│ Settings   │                        │
│  › Pers... │   (Form, inputs, etc.) │
│  › Sign... │                        │
│            │                        │
│ My Business│                        │
│  › About   │                        │
│  › Secur...│                        │
└────────────┴────────────────────────┘
```

---

## ✨ Tính năng

### MainSidebar
- ✅ Menu đa cấp không giới hạn
- ✅ Auto-expand khi route con active
- ✅ Dropdown tên nhà hàng với Account settings link
- ✅ Search bar
- ✅ Bottom action buttons

### SettingsSidebar
- ✅ Cấu trúc menu riêng cho Settings
- ✅ Luôn expanded by default
- ✅ Back button để quay lại
- ✅ Hierarchical menu structure (Account & Settings, My Business, etc.)

### Layout
- ✅ Tự động detect Settings pages
- ✅ Ẩn MainSidebar khi vào Settings
- ✅ Show SettingsSidebar trong Settings pages

---

## 🔧 Cách sử dụng

### Thêm menu item vào MainSidebar
Edit `src/config/menuConfig.js`:
```javascript
export const menuItems = [
  { to: '/dashboard', label: 'Home' },
  {
    label: 'Reports',
    children: [
      { to: '/reports/sales', label: 'Sales' },
      {
        label: 'Advanced',  // Nested level 2
        children: [
          { to: '/reports/advanced/analytics', label: 'Analytics' },
        ]
      },
    ]
  },
]
```

### Thêm menu item vào SettingsSidebar
Edit `src/components/settings/SettingsSidebar.jsx`:
```javascript
const settingsMenuItems = [
  {
    label: 'Account & Settings',
    children: [
      { to: '/settings/personal', label: 'Personal information' },
    ]
  },
]
```

### Tạo Settings sub-page mới
1. Create file: `src/pages/settings/NewPage.jsx`
2. Use SettingsLayout + SettingsSidebar
3. Add route in `routes.jsx`

---

## 📝 Notes

- Settings pages không dùng chung sidebar với main app
- MainSidebar tự động ẩn khi pathname starts with `/settings`
- Cả 2 sidebars đều support unlimited nesting
- MenuItem component được reuse giữa các sidebars
