# Website Builder & Custom Slug Routing - Implementation Guide

## 📋 Overview

This implementation adds a complete **SaaS Website Builder** feature to the Multi-Restaurant platform, allowing restaurant owners to:
- Create custom landing pages using drag-and-drop blocks
- Access their storefront via a unique custom slug (e.g., `/my-restaurant-name`)
- Customize theme colors and layout
- Automatically integrate with existing menu data

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React (Vite), React Router v6, TailwindCSS
- **Database**: Firebase Realtime Database (RTDB)
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable

### Database Schema

```json
{
  "restaurants": {
    "{restaurantId}": {
      "name": "Restaurant Name",
      "slug": "my-restaurant-name",  // NEW: Unique URL slug
      "siteConfig": {                 // NEW: Site configuration
        "themeColor": "#F97316",
        "layout": [
          {
            "id": "uuid-1",
            "type": "HERO_BANNER",
            "props": {
              "title": "Welcome to Our Restaurant",
              "subtitle": "Delicious food, great atmosphere",
              "imageURL": "https://..."
            }
          },
          {
            "id": "uuid-2",
            "type": "MENU_SECTION",
            "props": {
              "title": "Our Menu",
              "columns": 3
            }
          }
        ]
      }
    }
  }
}
```

## 📁 File Structure

```
Client/src/
├── components/builder/
│   ├── BlockRenderer.jsx          # Core rendering engine
│   ├── blockTypes.js              # Block type definitions
│   └── blocks/
│       ├── HeroBannerBlock.jsx    # Hero banner component
│       ├── MenuGridBlock.jsx      # Menu display (uses useShop)
│       ├── TextBlock.jsx          # Rich text content
│       └── FooterBlock.jsx        # Footer with contact info
├── pages/
│   ├── public/
│   │   └── PublicStorefront.jsx   # Public slug resolver & renderer
│   └── settings/
│       └── WebsiteBuilder.jsx     # Admin builder UI
├── utils/
│   └── siteConfigUtils.js         # RTDB query utilities
└── routes.jsx                     # Updated with /:slug route
```

## 🔧 Key Components

### 1. Database Utilities (`siteConfigUtils.js`)

```javascript
// Find restaurant by slug
const result = await findRestaurantBySlug('my-restaurant');
// Returns: { restaurantId: 'xyz', data: {...} }

// Check slug availability
const available = await isSlugAvailable('my-restaurant', currentRestaurantId);

// Update site config
await updateRestaurantSiteConfig(restaurantId, {
  slug: 'new-slug',
  siteConfig: { themeColor: '#F97316', layout: [...] }
});

// Generate URL-friendly slug
const slug = generateSlug('Bếp Bà Nga'); // => 'bep-ba-nga'
```

### 2. Block Components

#### HeroBannerBlock
- Large banner with title, subtitle, and background image
- Props: `title`, `subtitle`, `imageURL`, `themeColor`

#### MenuGridBlock
- Displays restaurant menu items from existing data
- **Uses `useShop()` context** - no separate data fetching needed
- Props: `title`, `columns` (1-4)
- Automatically filters active items and categories

#### TextBlock
- Rich text content with HTML support
- Props: `content`, `alignment` (left/center/right), `backgroundColor`

#### FooterBlock
- Contact information and social links
- Props: `companyName`, `address`, `phone`, `email`, `socialLinks`, `backgroundColor`

### 3. BlockRenderer

Maps JSON config to React components:

```javascript
<BlockList layout={layout} themeColor={themeColor} />
```

Handles unknown block types gracefully with fallback UI.

### 4. PublicStorefront Component

**Flow:**
1. Extract slug from URL params (`useParams()`)
2. Query Firebase RTDB using `findRestaurantBySlug(slug)`
3. If found: Set restaurantId in global store
4. Fetch full restaurant data via `fetchRestaurantForShop()`
5. Wrap in `<ShopProvider>` to provide menu context
6. Render blocks using `<BlockList>`

**States:**
- Loading: Shows spinner
- Error/404: Shows friendly error page
- Success: Renders custom layout with navigation bar

### 5. WebsiteBuilder Admin UI

**Three-column layout:**

**Left Sidebar:**
- General Settings (slug input with auto-generate, theme color picker)
- Block Library (Hero Banner, Menu Grid, Text, Footer)
- Save & Publish button

**Center Canvas:**
- Drag-and-drop area using @dnd-kit
- Visual preview of blocks
- Click to select, drag to reorder
- Remove button on each block

**Right Sidebar:**
- Properties panel for selected block
- Dynamic form fields based on block type
- Real-time preview updates

**Features:**
- Slug validation (checks uniqueness)
- Auto-generate slug from restaurant name
- Drag-and-drop reordering
- Block duplication prevention
- Save to Firebase RTDB

## 🚀 Usage Guide

### For Restaurant Owners

1. **Access Builder:**
   - Navigate to Settings → My Business → Website Builder
   - Or directly: `/restaurant/settings/website-builder`

2. **Set Custom Slug:**
   - Enter desired slug (e.g., `my-restaurant`)
   - Click ⚡ to auto-generate from restaurant name
   - System validates uniqueness
   - Your public URL: `yourdomain.com/my-restaurant`

3. **Customize Theme:**
   - Pick theme color using color picker
   - Applies to hero banner and accents

4. **Add Blocks:**
   - Click block type from sidebar
   - Block appears in canvas
   - Drag to reorder
   - Click to select and edit properties

5. **Edit Block Properties:**
   - Select block in canvas
   - Edit fields in right panel
   - Changes reflect immediately

6. **Save & Publish:**
   - Click "Save & Publish" button
   - Configuration saved to Firebase
   - Public site instantly updated

### For Developers

**Add New Block Type:**

1. Create component in `components/builder/blocks/`:
```jsx
export default function MyBlock({ myProp, themeColor }) {
  return <div>My custom block</div>;
}
```

2. Register in `blockTypes.js`:
```javascript
{
  type: 'MY_BLOCK',
  label: 'My Block',
  icon: '🎨',
  description: 'My custom block',
  defaultProps: { myProp: 'default value' }
}
```

3. Add to renderer in `BlockRenderer.jsx`:
```javascript
import MyBlock from './blocks/MyBlock';

const BLOCK_COMPONENTS = {
  // ...existing blocks
  MY_BLOCK: MyBlock,
};
```

4. Add properties form in `WebsiteBuilder.jsx`:
```javascript
{selectedBlock.type === 'MY_BLOCK' && (
  <div>
    <label>My Prop</label>
    <input
      value={selectedBlock.props.myProp}
      onChange={(e) => handleChange('myProp', e.target.value)}
    />
  </div>
)}
```

## 🔀 Routing Configuration

The catch-all route **must be second-to-last** (before 404):

```javascript
{
  // ... other routes ...
  
  // Custom slug route - resolves dynamic restaurant pages
  { path: "/:slug", element: <PublicStorefront /> },
  
  // 404 must be last
  { path: "*", element: <NotFound /> }
}
```

**Route Priority:**
1. Static routes (`/shop`, `/restaurant/*`, `/admin`)
2. Dynamic slug route (`/:slug`)
3. 404 catch-all (`*`)

## 🔐 Security & Validation

### Slug Validation
- Must be unique across all restaurants
- Auto-sanitized: lowercase, alphanumeric + hyphens only
- Diacritics removed for URL safety
- Real-time availability checking

### Firebase Rules (Required)

```json
{
  "rules": {
    "restaurants": {
      "$restaurantId": {
        ".read": true,
        ".write": "auth != null && (root.child('users').child(auth.uid).child('restaurants').child($restaurantId).exists() || root.child('users').child(auth.uid).child('isAdmin').val() === true)",
        "slug": {
          ".validate": "newData.isString() && newData.val().matches(/^[a-z0-9-]+$/)"
        },
        "siteConfig": {
          ".validate": "newData.hasChildren(['themeColor', 'layout'])"
        }
      }
    }
  }
}
```

## 🎨 Styling

All components use **TailwindCSS** with:
- Responsive breakpoints (`md:`, `lg:`)
- Orange accent color (`#F97316`) as default
- Theme color support for customization
- Consistent spacing and shadows

## 📊 Data Flow

```
User visits /:slug
    ↓
PublicStorefront resolves slug → restaurantId
    ↓
Fetch restaurant data (name, siteConfig, menu)
    ↓
Set restaurantId in global store
    ↓
ShopProvider wraps content
    ↓
BlockList renders layout from siteConfig
    ↓
MenuGridBlock uses useShop() for menu data
```

## 🧪 Testing Checklist

- [ ] Slug uniqueness validation works
- [ ] Auto-generate slug from restaurant name
- [ ] Drag-and-drop reordering persists
- [ ] Block properties update in real-time
- [ ] MenuGridBlock displays correct items
- [ ] Theme color applies to all blocks
- [ ] Public storefront loads from slug
- [ ] 404 shows for invalid slugs
- [ ] Save button handles errors gracefully
- [ ] Mobile responsive layout

## 🚨 Known Limitations

1. **Slug Changes:** No automatic redirects from old slugs
2. **Image Upload:** Currently requires external image URLs
3. **SEO:** No meta tags customization yet
4. **Analytics:** No built-in analytics tracking
5. **Versioning:** No draft/publish workflow

## 🔄 Future Enhancements

- [ ] Image upload integration
- [ ] Custom domain mapping
- [ ] SEO meta tags editor
- [ ] Analytics integration
- [ ] A/B testing support
- [ ] Multi-language support
- [ ] Custom CSS editor
- [ ] Template library
- [ ] Preview before publish
- [ ] Version history

## 📞 Support

For issues or questions:
1. Check Firebase console for data structure
2. Verify slug uniqueness in database
3. Check browser console for errors
4. Ensure @dnd-kit packages are installed:
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

## 📝 License

Part of the Multi-Restaurant SaaS Platform
