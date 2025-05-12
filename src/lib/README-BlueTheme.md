# Blue Theme Utility

This utility provides a consistent blue color scheme across the entire SmartStock application, replacing white backgrounds with the application's standard blue background color.

## Features

- Automatically identifies and changes white backgrounds to blue
- Maintains proper contrast for text and other UI elements
- Can be applied globally or to specific components
- Preserves special cases like receipts and PDFs that should remain white

## Components

### BlueThemeProvider

The `BlueThemeProvider` component applies the blue theme globally to the entire application. It should be placed near the root of the application.

```tsx
import BlueThemeProvider from '@/components/ui/BlueThemeProvider';

// In your App component
return (
  <BlueThemeProvider>
    {/* Your app content */}
  </BlueThemeProvider>
);
```

### BlueThemeWrapper

The `BlueThemeWrapper` component can be used to apply the blue theme to specific sections of the application.

```tsx
import BlueThemeWrapper from '@/components/ui/BlueThemeWrapper';

// In your component
return (
  <BlueThemeWrapper>
    {/* Content that should have blue background */}
  </BlueThemeWrapper>
);
```

## Utility Functions

### applyBlueTheme

The `applyBlueTheme` function applies the blue theme to the entire application. It can be called directly if needed.

```tsx
import { applyBlueTheme } from '@/lib/themeUtils';

// Apply blue theme
applyBlueTheme();
```

### useBlueTheme

The `useBlueTheme` hook can be used to apply the blue theme to a specific component.

```tsx
import { useBlueTheme } from '@/hooks/useBlueTheme';

// In your component
const MyComponent = () => {
  const ref = useBlueTheme<HTMLDivElement>('.bg-white');
  
  return (
    <div ref={ref}>
      {/* Content that should have blue background */}
    </div>
  );
};
```

## Color Values

The blue theme uses the following color values:

```ts
export const blueThemeColors = {
  // Background colors
  background: {
    dark: '#0f0a1e', // Dark blue background
    medium: '#1a1a2e', // Medium blue background
    light: '#2a2a4e', // Lighter blue background
    gradient: 'linear-gradient(to bottom right, #1a1a2e, #0f0a1e)', // Gradient background
  },
  
  // Card and container backgrounds
  card: {
    dark: 'rgba(26, 26, 46, 0.8)', // Dark blue card background with transparency
    medium: 'rgba(42, 42, 78, 0.6)', // Medium blue card background with transparency
    light: 'rgba(59, 130, 246, 0.1)', // Light blue card background with transparency
    gradient: 'linear-gradient(to bottom right, rgba(26, 26, 46, 0.6), rgba(15, 10, 30, 0.4))', // Gradient card background
  },
  
  // Border colors
  border: {
    dark: 'rgba(30, 58, 138, 0.5)', // Dark blue border
    medium: 'rgba(59, 130, 246, 0.3)', // Medium blue border
    light: 'rgba(96, 165, 250, 0.2)', // Light blue border
  },
  
  // Text colors for proper contrast
  text: {
    primary: '#ffffff', // White text for dark backgrounds
    secondary: 'rgba(219, 234, 254, 0.8)', // Light blue text with slight transparency
    muted: 'rgba(186, 230, 253, 0.6)', // Muted light blue text
  }
};
```

## Special Cases

The blue theme utility automatically excludes certain elements from being styled with blue backgrounds:

- Receipt content (elements with the `.receipt-content` class)
- PDF content (elements with the `[data-pdf-content]` attribute)

This ensures that receipts and PDFs maintain their white background for proper printing and readability.
