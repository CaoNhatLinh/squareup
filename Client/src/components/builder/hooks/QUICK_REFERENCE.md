# 🚀 Quick Reference: useContainerQuery Hook

## TL;DR

```jsx
import { useContainerQuery } from '@/components/builder/hooks/useContainerQuery';

// ✅ TRONG BUILDER - Tự động responsive theo toggle
const { containerRef, isMobile, isTablet, isDesktop } = useContainerQuery();

// ✅ TRÊN PUBLIC SITE - Responsive theo màn hình thật
const { containerRef, isMobile, isTablet, isDesktop } = useContainerQuery({ 
  useWindowWidth: true 
});
```

## Breakpoints

| Variable        | Condition              | Width Range    |
|----------------|------------------------|----------------|
| `isMobile`     | `width < 768`          | 0 - 767px      |
| `isTablet`     | `768 <= width < 1024`  | 768 - 1023px   |
| `isDesktop`    | `width >= 1024`        | 1024px+        |
| `isLargeDesktop` | `width >= 1280`      | 1280px+        |

## Builder Viewport Widths

| Toggle  | Width  | Device      |
|---------|--------|-------------|
| 📱 Mobile  | 375px  | iPhone      |
| 📱 Tablet  | 768px  | iPad        |
| 💻 Desktop | 1280px | Desktop     |

## Common Patterns

### Grid Layout
```jsx
const { containerRef, isMobile, isTablet, isDesktop } = useContainerQuery();

<div ref={containerRef} className={`grid gap-4 ${
  isMobile ? 'grid-cols-1' : 
  isTablet ? 'grid-cols-2' : 
  'grid-cols-4'
}`}>
```

### Conditional Rendering
```jsx
{isMobile && <MobileNav />}
{isDesktop && <DesktopNav />}
```

### Font Sizes
```jsx
<h1 className={isDesktop ? 'text-6xl' : 'text-4xl'}>
```

### Spacing
```jsx
<div className={`p-${isMobile ? '4' : '8'}`}>
```

## ⚠️ Important Rules

1. **Always attach containerRef**: `<div ref={containerRef}>`
2. **Builder auto-detects**: No config needed in builder
3. **Public site needs flag**: Use `useWindowWidth: true`
4. **One ref per component**: Don't share refs between components

## 🎯 When to Use What

| Scenario | Solution |
|----------|----------|
| Builder component | `useContainerQuery()` |
| Public site component | `useContainerQuery({ useWindowWidth: true })` |
| Static content | Tailwind CSS classes (`md:`, `lg:`) |
| Complex responsive logic | `useContainerQuery()` |

## 📦 Return Values

```typescript
{
  containerRef: RefObject<HTMLElement>,  // Attach to root element
  width: number,                         // Current width in pixels
  isMobile: boolean,                     // < 768px
  isTablet: boolean,                     // 768-1023px
  isDesktop: boolean,                    // >= 1024px
  isLargeDesktop: boolean                // >= 1280px
}
```

## 🔍 Debugging

```jsx
const query = useContainerQuery();
console.log('Width:', query.width);
console.log('Breakpoints:', {
  mobile: query.isMobile,
  tablet: query.isTablet,
  desktop: query.isDesktop,
});
```

## 💡 Pro Tips

- Use `ResponsiveDemo` component to test your setup
- Combine with Tailwind for best results
- Builder toggle affects ALL components using the hook
- Public site uses real window width (like media queries)
- Hook automatically cleans up on unmount

## 🐛 Common Issues

**Issue**: Hook not responding to toggle
**Fix**: Make sure component is inside `BuilderViewportProvider`

**Issue**: Wrong breakpoints on public site
**Fix**: Add `useWindowWidth: true` option

**Issue**: Ref not working
**Fix**: Attach `containerRef` to a DOM element, not a component

## 📚 Related Files

- Hook: `src/components/builder/hooks/useContainerQuery.js`
- Context: `src/context/BuilderViewportContext.jsx`
- Demo: `src/components/builder/blocks/content/ResponsiveDemo.jsx`
- Docs: `src/components/builder/hooks/useContainerQuery.example.md`
