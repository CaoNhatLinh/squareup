# Refactoring Plan

## 1. Codebase Cleanup & Standardization

### A. Import Aliases
**Current State:**
Many files use deep relative imports, e.g., `../../../../utils/colorUtils`.
**Goal:**
Standardize all imports to use the `@/` alias defined in Vite config.
**Action Items:**
- [ ] Replace `../../utils/` with `@/utils/`
- [ ] Replace `../../components/` with `@/components/`
- [ ] Replace `../../context/` with `@/context/`

### B. Prop Drilling
**Current State:**
`blockId` and `globalStyles` are passed down through multiple layers of components (e.g., Footer -> SocialIcon).
**Goal:**
Use React Context to provide builder state to all blocks.
**Action Items:**
- [ ] Create `BuilderContext` to hold `globalStyles`, `mode` (preview/edit), and potentially `blockId` context.
- [ ] Wrap builder blocks in a provider.

## 2. Component Architecture

### A. Block Structure
**Current State:**
Blocks like `ProductCardTemplate` contain mixed logic for different presets (classic, compact, cover) in one file.
**Goal:**
Split complex blocks into smaller sub-components.
**Action Items:**
- [ ] Extract `ProductCardClassic`, `ProductCardCompact`, `ProductCardCover` into separate files.
- [ ] Create a factory/registry for card presets.

### B. Button Standardization
**Current State:**
Button logic is repeated across `HeroBanner`, `Header`, and `ProductCard`.
**Goal:**
Create a robust `BuilderButton` component that handles all builder-specific props (color resolution, text styling, builder events).
**Action Items:**
- [ ] Enhance `StyledButton` or create `BuilderButton` to accept `config` objects directly.

## 3. Utility Functions

### A. Color Resolution
**Current State:**
`resolveColor` is imported and called manually in every component.
**Goal:**
Create a custom hook `useBuilderColor` or a higher-order component.
**Action Items:**
- [ ] Create `useBuilderStyles` hook that returns resolved colors and typography.

## 4. Performance & Best Practices

### A. Memoization
**Current State:**
Large configuration objects are passed as props, potentially causing re-renders.
**Goal:**
Memoize derived styles and configs.
**Action Items:**
- [ ] Use `useMemo` for expensive style calculations in blocks.

### B. Error Boundaries
**Current State:**
A crash in one block (like `SocialIcon`) can crash the entire builder.
**Goal:**
Isolate block errors.
**Action Items:**
- [ ] Wrap each Block Renderer in an Error Boundary.

## 5. Specific Component Fixes

- [ ] **Header**: Investigate persistence of `ctaButton` visibility. Ensure default props don't override saved state.
- [ ] **MenuSection**: Consolidate grid and card logic.
- [ ] **Footer**: Standardize social icon rendering.
