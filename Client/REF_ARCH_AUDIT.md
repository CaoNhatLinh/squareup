# Comprehensive Audit, Cleanup, and Refactor Plan

## 1. Project Structure & Hygiene Audit

### Current State Analysis
- **Folder Structure**: The `Client/src/components/builder` folder is currently a mix of high-level blocks, low-level controls, and utilities. `Client/src/components/ui` is well-separated for atomic UI components.
- **File Naming**: Generally consistent (PascalCase for components), but some inconsistencies in folder organization.
- **Architecture**: The current "Flat List" layout in `WebsiteBuilder.jsx` limits the ability to create true nested layouts (Rows -> Columns -> Elements).

### Proposed Directory Structure (Atomic/Nested)
We will reorganize `Client/src/components/builder` to follow Atomic Design principles more closely.

```text
Client/src/components/
├── ui/                     # [ATOMS] Generic UI components (Button, Input, Modal) - KEEP
├── builder/
│   ├── core/               # Core builder logic (Canvas, Renderer, DndContext)
│   │   ├── BlockRenderer.jsx
│   │   ├── Canvas.jsx
│   │   └── ...
│   ├── controls/           # [MOLECULES] Editor controls (ColorPicker, ImageUploader)
│   ├── blocks/             # [ORGANISMS] High-level Blocks
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Hero/
│   │   └── MenuSection/    # NEW: Refactored from MenuGridBlock
│   │       ├── index.jsx   # Main Container
│   │       ├── CategoryNav.jsx
│   │       ├── ProductGrid.jsx
│   │       └── ProductCard.jsx
│   └── templates/          # Pre-defined block combinations
```

### Cleanup Report (Action Items)

| Action | File/Folder | Reason |
| :--- | :--- | :--- |
| **RENAME** | `blocks/MenuGridBlock.jsx` -> `blocks/MenuSection/index.jsx` | Rename to `MenuSection` to reflect its role as a container. |
| **MOVE** | `blocks/CategoryNavBlock.jsx` -> `blocks/MenuSection/CategoryNav.jsx` | Convert from standalone Block to an Element within MenuSection. |
| **DELETE** | `blocks/PromoGridBlock.jsx` | *Review*: If this is just a grid of items, it can be a variant of `ProductGrid` or a generic `CardGrid`. |
| **DELETE** | `blocks/AlertNoticeBlock.jsx` | *Review*: Can be replaced by a generic `Banner` block. |
`. |

## 2. Data Structure & Logic Audit

### Current Limitations
- **Flat List**: `layout` is `[{ id: 1, type: 'HEADER' }, { id: 2, type: 'HERO' }]`. This prevents putting a "Button" inside a "Hero".
- **Selection**: `selectedBlockId` only selects the top-level block. `activeControl` attempts to focus on fields but isn't a true "Element Selection".

### Refactoring Plan: Tree Structure
To support "Level 2 (Blocks) -> Level 3 (Elements)", we must move to a recursive data structure.

**New Data Schema:**
```json
{
  "id": "block_123",
  "type": "MENU_SECTION",
  "props": { ... },
  "children": [
    {
      "id": "el_456",
      "type": "CATEGORY_NAV",
      "props": { "style": "tabs" }
    },
    {
      "id": "el_789",
      "type": "PRODUCT_GRID",
      "props": { "columns": 3 }
    }
  ]
}
```

**Transition Steps:**
1.  **Phase 1 (Immediate)**: Refactor `MenuSection` to be a "Smart Block" that internally manages its sub-elements (`CategoryNav`, `ProductGrid`) using a structured `props` object, simulating nesting without changing the global `layout` state structure yet.
2.  **Phase 2**: Update `WebsiteBuilder.jsx` to support recursive rendering in `BlockRenderer`.
3.  **Phase 3**: Implement "Click-to-Select" for internal elements. When clicking `CategoryNav` inside `MenuSection`, set `selectedBlockId` to the parent but `selectedElementId` to the child.

## 3. Theme & Clean Code Integration

- **Global Styles**: Ensure `MenuSection` and its children consume `globalStyles` for fonts and colors.
- **DRY**: Extract common styles (e.g., "Section Padding", "Container Width") into a `useBlockStyles` hook.

---

## 4. Implementation Plan (Immediate Task)

I will now proceed to:
1.  Create the `MenuSection` folder structure.
2.  Implement `CategoryNav`, `ProductGrid`, and `ProductCardTemplate` as "Elements".
3.  Implement `MenuSection` as the "Container Block".
4.  Update `blockTypes.js` to register the new `MENU_SECTION` and its comprehensive schema.
