# Tailwind Style Rules

- Mobile-first by default.
- Prefer spacing scale (`p-2`, `p-4`, `gap-2`, etc.).
- Avoid inline `style={}` unless strictly needed.

## Class organization

Order classes roughly as:
1. layout (flex/grid)
2. spacing (p/m/gap)
3. size (w/h)
4. typography
5. colors
6. effects (shadow, rounded)
7. states (hover, focus)

## Extract repeated patterns

- If 3+ occurrences, extract into a component or a utility.
