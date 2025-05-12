import { useEffect, useRef } from 'react';
import { blueThemeColors } from '@/lib/themeUtils';

/**
 * Hook to apply blue theme to a specific component
 * 
 * @param selector CSS selector for the elements to apply the theme to
 * @param options Configuration options
 * @returns ref to attach to the component
 */
export function useBlueTheme<T extends HTMLElement>(
  selector: string = '*',
  options: {
    excludeReceipts?: boolean;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  } = {}
) {
  const {
    excludeReceipts = true,
    backgroundColor = blueThemeColors.background.medium,
    textColor = blueThemeColors.text.primary,
    borderColor = blueThemeColors.border.medium,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Apply theme to the component and its children
    const applyThemeToElement = (element: HTMLElement) => {
      // Skip receipts if excludeReceipts is true
      if (
        excludeReceipts &&
        (element.closest('.receipt-content') ||
          element.closest('[data-pdf-content]'))
      ) {
        return;
      }

      // Apply styles
      element.style.backgroundColor = backgroundColor;
      element.style.color = textColor;
      
      // Only apply border color if the element has a border
      const computedStyle = window.getComputedStyle(element);
      if (
        computedStyle.borderWidth !== '0px' &&
        computedStyle.borderStyle !== 'none'
      ) {
        element.style.borderColor = borderColor;
      }
    };

    // Apply theme to the component itself
    applyThemeToElement(ref.current);

    // Apply theme to matching children
    const children = ref.current.querySelectorAll<HTMLElement>(selector);
    children.forEach(applyThemeToElement);

    // Set up a mutation observer to detect DOM changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.matches(selector)) {
                applyThemeToElement(element);
              }
              
              // Apply to matching children of the added node
              const children = element.querySelectorAll<HTMLElement>(selector);
              children.forEach(applyThemeToElement);
            }
          });
        }
      });
    });

    // Start observing the component
    observer.observe(ref.current, {
      childList: true,
      subtree: true,
    });

    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [selector, excludeReceipts, backgroundColor, textColor, borderColor]);

  return ref;
}

export default useBlueTheme;
