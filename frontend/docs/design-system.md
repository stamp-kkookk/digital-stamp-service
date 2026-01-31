# KKOOKK Design System

> **Version**: 1.0.0
> **Last Updated**: 2026-01-27

A comprehensive design system for the KKOOKK digital stamp service, ensuring visual consistency across Customer, Owner, and Terminal interfaces.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Component Variants](#component-variants)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Best Practices](#best-practices)

---

## Color Palette

### Primary - Orange Scale (Brand)

The orange color represents the KKOOKK brand and is used for primary actions, highlights, and brand elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `kkookk-orange-50` | `#fff7ed` | Light backgrounds, hover states |
| `kkookk-orange-100` | `#ffedd5` | Subtle backgrounds |
| `kkookk-orange-200` | `#fed7aa` | Borders, dividers |
| `kkookk-orange-300` | `#fdba74` | Disabled states |
| `kkookk-orange-400` | `#fb923c` | Hover states |
| `kkookk-orange-500` | `#ff4d00` | **Primary actions, main brand color** |
| `kkookk-orange-600` | `#ea580c` | Active states, focus rings |
| `kkookk-orange-700` | `#c2410c` | Pressed states |
| `kkookk-orange-800` | `#9a3412` | Dark text on light backgrounds |
| `kkookk-orange-900` | `#7c2d12` | Very dark accents |

**Usage Examples**:
```tsx
// Primary button
<button className="bg-kkookk-orange-500 hover:bg-kkookk-orange-600 active:bg-kkookk-orange-700">

// Focus ring
<input className="focus:ring-2 focus:ring-kkookk-orange-500/30">

// Light background
<div className="bg-kkookk-orange-50">
```

### Secondary - Indigo Scale (Owner Persona)

Indigo represents the Owner/Backoffice persona and professional business tools.

| Token | Hex | Usage |
|-------|-----|-------|
| `kkookk-indigo-50` | `#eef2ff` | Light backgrounds |
| `kkookk-indigo-100` | `#e0e7ff` | Subtle backgrounds |
| `kkookk-indigo-200` | `#c7d2fe` | Borders |
| `kkookk-indigo-500` | `#2e58ff` | **Owner primary actions** |
| `kkookk-indigo-600` | `#4f46e5` | Hover states |
| `kkookk-indigo-700` | `#4338ca` | Active states |
| `kkookk-indigo` | `#2e58ff` | Alias for 500 |

**Usage Examples**:
```tsx
// Owner primary button
<button className="bg-kkookk-indigo hover:bg-kkookk-indigo-600">

// Owner card background
<div className="bg-kkookk-indigo-50 border border-kkookk-indigo-200">
```

### Neutral - Navy Scale (Text/Backgrounds)

Navy is used for primary text and dark UI elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `kkookk-navy-50` | `#f8fafc` | Very light backgrounds |
| `kkookk-navy-100` | `#f1f5f9` | Light backgrounds |
| `kkookk-navy-900` | `#1a1c1e` | **Primary text, dark backgrounds** |
| `kkookk-navy` | `#1a1c1e` | Alias for 900 |

### Neutral - Steel Scale (Secondary Text/Borders)

Steel is used for secondary text, subtle borders, and muted UI elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `kkookk-steel-100` | `#cbd5e1` | Light borders |
| `kkookk-steel-200` | `#94a3b8` | Subtle borders |
| `kkookk-steel-300` | `#64748b` | **Secondary text, icons** |
| `kkookk-steel-400` | `#475569` | Tertiary text |
| `kkookk-steel` | `#64748b` | Alias for 300 |

**Usage Examples**:
```tsx
// Secondary text
<p className="text-kkookk-steel">Description text</p>

// Light border
<div className="border border-kkookk-steel-100">
```

### Status Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `kkookk-green-50` | `#f0fdf4` | Success background |
| `kkookk-green-500` | `#16a34a` | **Success text, icons, badges** |
| `kkookk-red-50` | `#fef2f2` | Error background |
| `kkookk-red-500` | `#dc2626` | **Error text, icons, badges** |
| `kkookk-amber-50` | `#fffbeb` | Warning background |
| `kkookk-amber-500` | `#f59e0b` | **Warning text, icons, badges** |

**Usage Examples**:
```tsx
// Success badge
<span className="bg-kkookk-green-50 text-kkookk-green-500">Active</span>

// Error message
<p className="text-kkookk-red-500">Error: Invalid input</p>

// Warning banner
<div className="bg-kkookk-amber-50 border-l-4 border-kkookk-amber-500">
```

### Customer Persona Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `kkookk-sand` | `#f5f5f0` | Customer light backgrounds |
| `kkookk-yellow` | `#ffd600` | Customer accents, highlights |

### Global Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `kkookk-paper` | `#faf9f6` | **Default page background** |

---

## Typography

### Font Family

**Pretendard Variable** is the primary font family for all text.

```tsx
// Applied by default via body
font-family: var(--font-family-pretendard)

// Explicit usage
<p className="font-pretendard">
```

### Font Size Scale

| Token | Size | Usage |
|-------|------|-------|
| `kkookk-xs` | `12px` (0.75rem) | Small labels, captions |
| `kkookk-sm` | `14px` (0.875rem) | Secondary text, descriptions |
| `kkookk-base` | `16px` (1rem) | **Body text (default)** |
| `kkookk-lg` | `18px` (1.125rem) | Emphasized text |
| `kkookk-xl` | `20px` (1.25rem) | Sub-headings |
| `kkookk-2xl` | `24px` (1.5rem) | Section headings |
| `kkookk-3xl` | `30px` (1.875rem) | Page titles |

**Usage Examples**:
```tsx
// Page title
<h1 className="text-kkookk-3xl font-bold text-kkookk-navy">

// Section heading
<h2 className="text-kkookk-2xl font-semibold">

// Body text (default, no class needed)
<p>This is body text</p>

// Small caption
<span className="text-kkookk-xs text-kkookk-steel">Updated 2 hours ago</span>
```

### Font Weight

Use Tailwind's default font weight utilities:
- `font-normal` (400): Body text
- `font-medium` (500): Emphasized text
- `font-semibold` (600): Headings, buttons
- `font-bold` (700): Strong emphasis

---

## Spacing System

Consistent spacing ensures visual rhythm and hierarchy.

| Token | Size | Usage |
|-------|------|-------|
| `kkookk-xs` | `4px` (0.25rem) | Tight spacing |
| `kkookk-sm` | `8px` (0.5rem) | Small gaps |
| `kkookk-md` | `16px` (1rem) | **Default spacing** |
| `kkookk-lg` | `24px` (1.5rem) | Medium gaps |
| `kkookk-xl` | `32px` (2rem) | Large gaps |
| `kkookk-2xl` | `48px` (3rem) | Section gaps |

**Usage Examples**:
```tsx
// Stack with medium gap
<div className="space-y-kkookk-md">

// Padding
<div className="p-kkookk-lg">

// Margin
<div className="mb-kkookk-xl">
```

**Note**: You can also use Tailwind's default spacing scale (`p-4`, `gap-6`, etc.). Custom tokens are provided for semantic consistency.

---

## Border Radius

Consistent border radius creates a cohesive, friendly interface.

| Token | Size | Usage |
|-------|------|-------|
| `kkookk-sm` | `8px` (0.5rem) | Small elements (badges, tags) |
| `kkookk-md` | `12px` (0.75rem) | Inputs, cards |
| `kkookk-lg` | `16px` (1rem) | Larger cards, modals |
| `kkookk-xl` | `24px` (1.5rem) | **Buttons, hero elements** |

**Usage Examples**:
```tsx
// Button (large radius)
<button className="rounded-kkookk-xl">

// Card (medium radius)
<div className="rounded-kkookk-md">

// Badge (small radius)
<span className="rounded-kkookk-sm">
```

**Standard Practice**:
- Buttons: Use `rounded-2xl` (16px) or `rounded-kkookk-xl` (24px)
- Cards: Use `rounded-2xl` (16px) or `rounded-kkookk-lg` (16px)
- Inputs: Use `rounded-2xl` (16px)
- Badges: Use `rounded-full` or `rounded-kkookk-sm` (8px)

---

## Shadows

Shadows provide depth and hierarchy.

| Token | Value | Usage |
|-------|-------|-------|
| `kkookk-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| `kkookk-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | **Default cards** |
| `kkookk-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modals, elevated cards |

**Usage Examples**:
```tsx
// Default card
<div className="shadow-kkookk-md">

// Modal
<div className="shadow-kkookk-lg">

// Subtle button
<button className="shadow-kkookk-sm hover:shadow-kkookk-md">
```

---

## Component Variants

### Button Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `primary` | Orange background, white text | Main actions (Submit, Confirm, Save) |
| `secondary` | Indigo background, white text | Owner persona actions |
| `outline` | Orange border, orange text | Secondary actions (Cancel, Back) |
| `ghost` | Transparent, orange text | Tertiary actions (Show more, Details) |
| `danger` | Red background, white text | Destructive actions (Delete, Reject) |

**Visual Examples**:
```tsx
// Primary (Orange)
<button className="bg-kkookk-orange-500 text-white">

// Secondary (Indigo)
<button className="bg-kkookk-indigo text-white">

// Outline
<button className="border-2 border-kkookk-orange-500 text-kkookk-orange-600">

// Ghost
<button className="text-kkookk-orange-600 hover:bg-kkookk-orange-50">

// Danger
<button className="bg-kkookk-red text-white">
```

### Button Sizes

| Size | Height | Padding | Use Case |
|------|--------|---------|----------|
| `sm` | `40px` (h-10) | `px-4` | Small actions, table rows |
| `md` | **`56px` (h-14)** | `px-6` | **Default buttons** |
| `lg` | `64px` (h-16) | `px-8` | Hero CTAs, primary pages |

### Badge Variants

| Variant | Background | Text | Use Case |
|---------|------------|------|----------|
| `default` | Steel-100 | Steel-400 | Neutral status |
| `success` | Green-50 | Green-500 | Active, Approved, Success |
| `warning` | Amber-50 | Amber-500 | Pending, In Progress |
| `danger` | Red-50 | Red-500 | Rejected, Error, Expired |
| `info` | Indigo-50 | Indigo-500 | Information |

---

## Accessibility Guidelines

### Color Contrast

All color combinations meet **WCAG 2.1 AA** standards:

✅ **Pass (AA)**:
- `text-kkookk-navy` on `bg-white`
- `text-white` on `bg-kkookk-orange-500`
- `text-kkookk-steel` on `bg-white`
- `text-kkookk-green-500` on `bg-kkookk-green-50`

❌ **Avoid**:
- Light text on light backgrounds
- Low contrast combinations (e.g., `text-kkookk-orange-300` on `bg-kkookk-orange-50`)

**Testing**: Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or browser DevTools.

### Focus Indicators

All interactive elements MUST have visible focus indicators:

```tsx
// Good: Visible focus ring
<button className="focus:outline-none focus:ring-2 focus:ring-kkookk-orange-500/30 focus:ring-offset-2">

// Good: Input focus
<input className="focus:border-kkookk-orange-500 focus:ring-2 focus:ring-kkookk-orange-500/30">
```

**Standard Focus Ring**:
- Ring color: `focus:ring-kkookk-orange-500/30` (30% opacity)
- Ring width: `focus:ring-2`
- Ring offset: `focus:ring-offset-2`

### Keyboard Navigation

- All interactive elements must be reachable via keyboard (`Tab`, `Shift+Tab`)
- Buttons and links must be activatable with `Enter` or `Space`
- Modals should trap focus and close on `Escape`

### ARIA Labels

Use semantic HTML and ARIA attributes:

```tsx
// Good: Semantic button
<button type="button" aria-label="Close modal">

// Good: Form label
<label htmlFor="phone">Phone Number</label>
<input id="phone" type="tel" aria-describedby="phone-help">
<span id="phone-help">Format: 010-0000-0000</span>

// Good: Status
<span role="status" aria-live="polite">Loading...</span>
```

---

## Best Practices

### ✅ Do

**Use Design Tokens**:
```tsx
// Good
<div className="bg-kkookk-orange-500 text-kkookk-navy">

// Bad
<div className="bg-orange-500 text-gray-900">
```

**Consistent Spacing**:
```tsx
// Good: Use spacing scale
<div className="space-y-4 p-6">

// Good: Use custom tokens
<div className="space-y-kkookk-md p-kkookk-lg">
```

**Semantic Color Usage**:
```tsx
// Good: Use status colors for status
<span className="text-kkookk-green-500">Active</span>

// Bad: Use primary colors for status
<span className="text-kkookk-orange-500">Active</span>
```

**Consistent Border Radius**:
```tsx
// Good: Buttons use large radius
<button className="rounded-2xl">

// Good: Cards use medium radius
<div className="rounded-2xl">

// Bad: Inconsistent radius
<button className="rounded-md">
```

### ❌ Don't

**Avoid Hardcoded Colors**:
```tsx
// Bad
<div className="bg-[#ff4d00]">

// Bad
<div style={{ backgroundColor: '#ff4d00' }}>

// Good
<div className="bg-kkookk-orange-500">
```

**Avoid Mixing Design Systems**:
```tsx
// Bad: Mixing Tailwind default colors with KKOOKK tokens
<div className="bg-blue-500 text-kkookk-navy">

// Good: Use KKOOKK tokens consistently
<div className="bg-kkookk-indigo text-kkookk-navy">
```

**Avoid Over-Customization**:
```tsx
// Bad: Too many custom styles
<button className="h-[52px] rounded-[18px] bg-[#ff4d00]">

// Good: Use standard sizes and tokens
<button className="h-14 rounded-2xl bg-kkookk-orange-500">
```

### Component Reusability

**Always prefer common components** over inline styles:

```tsx
// Bad: Inline button styles
<button className="h-14 px-6 rounded-2xl bg-kkookk-orange-500 text-white font-semibold">
  Submit
</button>

// Good: Use common Button component (Phase 2)
<Button variant="primary" size="md">Submit</Button>
```

---

## Migration Guide

### From Legacy Colors to Design Tokens

| Old (Tailwind Default) | New (KKOOKK Token) |
|-------------------------|---------------------|
| `gray-900` | `kkookk-navy` |
| `gray-700` | `kkookk-navy` |
| `gray-600` | `kkookk-steel` |
| `gray-500` | `kkookk-steel` |
| `gray-300` | `kkookk-steel-100` or `border-black/5` |
| `gray-50` | `kkookk-paper` or `kkookk-navy-50` |
| `blue-600` | `kkookk-indigo` |
| `blue-500` | `kkookk-indigo` |
| `orange-500` | `kkookk-orange-500` |

### Example Migration

**Before**:
```tsx
<button className="bg-gray-900 text-white border-gray-300 rounded-xl">
  Click me
</button>
```

**After**:
```tsx
<button className="bg-kkookk-navy text-white border-kkookk-steel-100 rounded-2xl">
  Click me
</button>
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

## Changelog

### Version 1.0.0 (2026-01-27)
- Initial design system definition
- Complete color palette with Orange, Indigo, Navy, Steel scales
- Status colors (Green, Red, Amber)
- Spacing, border radius, shadow, and typography scales
- Accessibility guidelines
- Best practices and migration guide
