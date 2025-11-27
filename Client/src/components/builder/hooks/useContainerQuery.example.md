# useContainerQuery Hook - Hướng dẫn sử dụng

## Vấn đề
Trong web builder, container có thể bị nhỏ hơn so với màn hình thực tế do có sidebar, panels, etc. Điều này khiến responsive design dựa trên container width sẽ khác với màn hình thật.

## Giải pháp
Hook `useContainerQuery` tự động phát hiện và xử lý 3 trường hợp:

1. **Builder Mode** (tự động): Sử dụng viewport mode từ builder (Desktop/Tablet/Mobile toggle)
2. **Window Query Mode**: Theo dõi kích thước window/viewport (cho public site)
3. **Container Query Mode** (mặc định): Theo dõi kích thước container

## Cách hoạt động

### 🎯 Tự động trong Builder
Khi component được render trong builder, hook sẽ **tự động** sử dụng viewport mode từ toggle trên header:
- Desktop toggle → width = 1280px
- Tablet toggle → width = 768px  
- Mobile toggle → width = 375px

```jsx
import { useContainerQuery } from '@/components/builder/hooks/useContainerQuery';

function MyComponent() {
  // Tự động responsive theo toggle trong builder
  // Không cần truyền tham số gì!
  const { containerRef, isMobile, isTablet, isDesktop } = useContainerQuery();

  return (
    <div ref={containerRef}>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

### 🌐 Public Site - Window Width
Trên public site (không có builder context), sử dụng window width:

```jsx
import { useContainerQuery } from '@/components/builder/hooks/useContainerQuery';

function MyComponent() {
  // Sử dụng window width - responsive như media queries CSS
  const { containerRef, isMobile, isTablet, isDesktop } = useContainerQuery({ 
    useWindowWidth: true 
  });

  return (
    <div ref={containerRef}>
      {/* Layout responsive theo kích thước màn hình thật */}
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

### 📦 Container Query Mode
Nếu muốn responsive theo container (hiếm khi cần):

```jsx
const { containerRef, isMobile, isTablet, isDesktop } = useContainerQuery();
// Hoặc
const { containerRef, isMobile, isTablet, isDesktop } = useContainerQuery({ 
  useWindowWidth: false 
});
```

## Breakpoints
```javascript
isMobile: width < 768px
isTablet: width >= 768px && width < 1024px
isDesktop: width >= 1024px
isLargeDesktop: width >= 1280px
```

## Builder Viewport Widths
```javascript
Mobile:  375px  (iPhone size)
Tablet:  768px  (iPad portrait)
Desktop: 1280px (Standard desktop)
```

## API

### Parameters
```typescript
useContainerQuery(options?: {
  useWindowWidth?: boolean  // Default: false
                           // Chỉ áp dụng khi KHÔNG trong builder
                           // Trong builder luôn dùng viewport toggle
})
```

### Returns
```typescript
{
  containerRef: RefObject<HTMLElement>,  // Ref để gắn vào container element
  width: number,                         // Width hiện tại (px)
  isMobile: boolean,                     // width < 768
  isTablet: boolean,                     // 768 <= width < 1024
  isDesktop: boolean,                    // width >= 1024
  isLargeDesktop: boolean                // width >= 1280
}
```

## Ưu điểm của giải pháp này

✅ **Tự động**: Không cần config gì, hook tự biết đang ở builder hay public site
✅ **Chính xác**: Trong builder, responsive theo đúng viewport toggle
✅ **Linh hoạt**: Trên public site, có thể chọn window width hoặc container width
✅ **Đơn giản**: API giống nhau cho mọi trường hợp
✅ **Backward Compatible**: Code cũ vẫn hoạt động bình thường

## Ví dụ thực tế

### Component trong Builder
```jsx
import { useContainerQuery } from '@/components/builder/hooks/useContainerQuery';

export default function ProductGrid({ products }) {
  // Tự động responsive theo toggle Desktop/Tablet/Mobile
  const { containerRef, isMobile, isTablet, isDesktop } = useContainerQuery();

  return (
    <div ref={containerRef} className="grid gap-4">
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-1' : 
        isTablet ? 'grid-cols-2' : 
        'grid-cols-4'
      }`}>
        {products.map(product => <ProductCard key={product.id} {...product} />)}
      </div>
    </div>
  );
}
```

### Component trên Public Site
```jsx
import { useContainerQuery } from '@/components/builder/hooks/useContainerQuery';

export default function HeroBanner() {
  // Responsive theo kích thước màn hình thật
  const { containerRef, isMobile, isDesktop } = useContainerQuery({ 
    useWindowWidth: true 
  });

  return (
    <div ref={containerRef}>
      <h1 className={isDesktop ? 'text-6xl' : 'text-4xl'}>
        Welcome
      </h1>
    </div>
  );
}
```

## Lưu ý quan trọng

⚠️ **Luôn gắn containerRef**: Dù ở mode nào cũng cần gắn ref vào element gốc
⚠️ **Builder tự động**: Trong builder, option `useWindowWidth` bị bỏ qua
⚠️ **Public site**: Nên dùng `useWindowWidth: true` để responsive như Tailwind CSS

## Cách builder hoạt động

1. User click toggle Desktop/Tablet/Mobile trên header
2. `viewMode` state được update
3. `BuilderViewportProvider` truyền viewMode xuống tất cả components
4. `useContainerQuery` hook đọc viewMode từ context
5. Hook trả về breakpoints tương ứng với viewMode
6. Component tự động re-render với layout phù hợp

## So sánh với Tailwind CSS

```jsx
// Tailwind CSS (chỉ hoạt động trên public site)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// useContainerQuery (hoạt động cả builder và public site)
const { isMobile, isTablet, isDesktop } = useContainerQuery();
<div className={`grid ${
  isMobile ? 'grid-cols-1' : 
  isTablet ? 'grid-cols-2' : 
  'grid-cols-4'
}`}>
```

**Kết luận**: Sử dụng `useContainerQuery` cho components trong builder, sử dụng Tailwind CSS responsive classes cho các components khác.
