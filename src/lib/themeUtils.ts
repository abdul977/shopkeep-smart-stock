/**
 * Theme utility functions for SmartStock application
 * Provides functions to apply blue color scheme consistently across the application
 */

/**
 * Blue theme color values
 * These match the existing blue theme used in the application
 */
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

/**
 * CSS variables to override in :root to apply blue theme
 * @returns CSS string to inject into document
 */
export function generateBlueThemeCSS(): string {
  return `
    :root {
      /* Base backgrounds */
      --background: 222 80% 5%;
      --foreground: 210 40% 98%;
      
      /* Card backgrounds */
      --card: 222 80% 5%;
      --card-foreground: 210 40% 98%;
      
      /* Popover backgrounds */
      --popover: 222 80% 5%;
      --popover-foreground: 210 40% 98%;
      
      /* Accent colors */
      --accent: 217.2 32.6% 17.5%;
      --accent-foreground: 210 40% 98%;
      
      /* Muted colors */
      --muted: 217.2 32.6% 17.5%;
      --muted-foreground: 215 20.2% 65.1%;
      
      /* Border colors */
      --border: 217.2 32.6% 17.5%;
      --input: 217.2 32.6% 17.5%;
    }
  `;
}

/**
 * CSS class overrides for specific elements
 * @returns CSS string to inject into document
 */
export function generateBlueThemeOverrides(): string {
  return `
    /* Page backgrounds */
    .bg-white {
      background-color: ${blueThemeColors.background.dark} !important;
      color: ${blueThemeColors.text.primary} !important;
    }
    
    /* Card backgrounds */
    .bg-card {
      background-color: ${blueThemeColors.card.dark} !important;
      border-color: ${blueThemeColors.border.medium} !important;
    }
    
    /* Table backgrounds */
    table, .bg-white {
      background-color: ${blueThemeColors.background.medium} !important;
    }
    
    /* Table rows */
    tr {
      border-color: ${blueThemeColors.border.dark} !important;
    }
    
    tr:hover {
      background-color: ${blueThemeColors.background.light} !important;
    }
    
    /* Table cells */
    th, td {
      color: ${blueThemeColors.text.primary} !important;
    }
    
    /* Form backgrounds */
    input, select, textarea {
      background-color: ${blueThemeColors.card.dark} !important;
      border-color: ${blueThemeColors.border.medium} !important;
      color: ${blueThemeColors.text.primary} !important;
    }
    
    /* Dialog/modal backgrounds */
    [role="dialog"] {
      background-color: ${blueThemeColors.background.medium} !important;
    }
    
    /* Receipt background (special case) */
    .receipt-content {
      background-color: white !important;
      color: black !important;
    }
  `;
}

/**
 * Apply blue theme to the application
 * This function:
 * 1. Overrides CSS variables in :root
 * 2. Adds specific class overrides
 * 3. Applies blue backgrounds to elements with white backgrounds
 */
export function applyBlueTheme(): void {
  // Create or get the theme style element
  let styleElement = document.getElementById('blue-theme-styles');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'blue-theme-styles';
    document.head.appendChild(styleElement);
  }

  // Combine all CSS
  const css = `
    ${generateBlueThemeCSS()}
    ${generateBlueThemeOverrides()}
  `;

  // Apply the CSS
  styleElement.textContent = css;

  // Add a class to the body to indicate blue theme is active
  document.body.classList.add('blue-theme');

  // Force the PageBackground component to use darkMode
  const pageBackgrounds = document.querySelectorAll('.relative.overflow-hidden');
  pageBackgrounds.forEach(element => {
    if (element.classList.contains('bg-white')) {
      element.classList.remove('bg-white', 'text-gray-900');
      element.classList.add('bg-[#0f0a1e]', 'text-white');
    }
  });

  // Apply blue background to specific elements that might have white backgrounds
  applyBlueBackgroundToElements();

  console.log('Blue theme applied successfully');
}

/**
 * Apply blue backgrounds to specific elements that might have white backgrounds
 */
function applyBlueBackgroundToElements(): void {
  // Common selectors for elements that typically have white backgrounds
  const selectors = [
    '.bg-white',
    '.bg-background',
    '.bg-card',
    'table',
    '.card',
    'form',
    'dialog',
    '.dialog',
    '.modal',
    '.popover',
    '.dropdown',
    '.menu',
    '.panel',
    '.sidebar',
    '.content',
    '.container',
    '.section',
    '.bg-gray-50',
    '.bg-gray-100',
  ];

  // Apply blue background to all matching elements
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Skip elements that are part of receipts or PDFs
      if (
        element.closest('.receipt-content') ||
        element.closest('[data-pdf-content]')
      ) {
        return;
      }

      // Apply blue background
      (element as HTMLElement).style.backgroundColor = blueThemeColors.background.medium;
      (element as HTMLElement).style.color = blueThemeColors.text.primary;
      (element as HTMLElement).style.borderColor = blueThemeColors.border.medium;
    });
  });
}

/**
 * Remove blue theme from the application
 */
export function removeBlueTheme(): void {
  // Remove the style element
  const styleElement = document.getElementById('blue-theme-styles');
  if (styleElement) {
    styleElement.remove();
  }

  // Remove the body class
  document.body.classList.remove('blue-theme');

  console.log('Blue theme removed');
}
