# Design System Skill

> Load for UI/UX work, styling, and accessibility

---

## Tailwind CSS Rules

### Mobile-First
- Start with mobile styles
- Use responsive prefixes (`md:`, `lg:`) for larger screens

### Spacing Scale
- Use scale: `p-2`, `p-4`, `gap-2`, etc.
- Avoid inline `style={}`

### Class Organization Order
1. Layout (flex/grid, position)
2. Spacing (p/m/gap)
3. Size (w/h)
4. Typography
5. Colors
6. Effects (shadow, rounded)
7. States (hover, focus)

### Conditional Classes
Use `clsx` or `tailwind-merge`:

```tsx
<div className={twMerge(
    "flex items-center justify-center p-4 text-white",
    isActive ? "bg-blue-500" : "bg-gray-500"
)}>
```

### Pattern Extraction
- If 3+ occurrences, extract into a component or utility

---

## Accessibility (A11y)

### Minimum Requirements

| Requirement | Implementation |
|-------------|---------------|
| Labels | `<label>` + `htmlFor` |
| Focus visibility | `focus:ring` |
| ARIA attributes | `aria-*` for dialogs, alerts |

### Keyboard Navigation
- All interactive elements must be focusable
- Tab order must be logical
- Escape closes modals

### Focus States
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
    Click me
</button>
```

### Dialog Example
```tsx
<dialog
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
>
    <h2 id="dialog-title">Confirm Action</h2>
</dialog>
```

---

## Color Contrast

- Ensure sufficient contrast ratio (WCAG AA: 4.5:1 for text)
- Test with accessibility tools
