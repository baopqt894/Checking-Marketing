# Color System Guide

## Overview
This application uses a blue-based color system with semantic colors for different states. The color palette is designed to be accessible and consistent across light and dark modes.

## Color Palette

### Primary Colors (Blue)
- `--blue-50` to `--blue-900`: Light to dark blue shades
- Main theme color for primary actions, links, and highlights

### Semantic Colors
- **Success**: Green tones for positive states
- **Warning**: Amber tones for caution states  
- **Error**: Red tones for error states

### Neutral Colors
- `--gray-50` to `--gray-900`: Gray shades with subtle blue tint
- Used for text, backgrounds, and borders

## Usage Guidelines

### CSS Variables
```css
/* Use CSS variables for theme consistency */
background-color: var(--primary);
color: var(--primary-foreground);
border-color: var(--border);
```

### Utility Classes
```tsx
// Primary colors
<Button className="bg-primary text-primary-foreground">Primary Action</Button>

// Blue variants
<div className="bg-blue-50 text-blue-800 border-blue-200">Info Card</div>

// Semantic colors
<Alert className="bg-success-light text-success border-success">Success Message</Alert>
<Alert className="bg-warning-light text-warning border-warning">Warning Message</Alert>
<Alert className="bg-error-light text-error border-error">Error Message</Alert>
```

### JavaScript/TypeScript
```tsx
import { COLORS, getStatusColor } from '@/lib/colors'

// Use predefined color objects
const statusColor = getStatusColor('success')
<div className={statusColor.bg}>Success content</div>

// Or use the COLORS constant
<div className={COLORS.primary.bg}>Primary content</div>
```

## Components

### Loading Spinner
```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner'

<LoadingSpinner size="lg" />
<LoadingSpinner size="md" className="text-primary" />
```

## Dark Mode
All colors automatically adapt to dark mode using CSS custom properties. The dark mode uses:
- Darker backgrounds with subtle blue tints
- Light text colors for contrast
- Adjusted blue shades for better visibility

## Best Practices

1. **Use semantic colors** for status indicators (success, warning, error)
2. **Use primary colors** for interactive elements (buttons, links)
3. **Use neutral colors** for text and backgrounds
4. **Avoid hardcoded colors** - always use CSS variables or utility classes
5. **Test in both light and dark modes** to ensure proper contrast

## Accessibility
- All color combinations meet WCAG AA contrast requirements
- Colors are not the only way to convey information
- Focus states use high-contrast colors for visibility
