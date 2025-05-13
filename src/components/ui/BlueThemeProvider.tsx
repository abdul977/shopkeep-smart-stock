
import { useEffect } from 'react';
import { applyBlueTheme } from '@/lib/themeUtils';

/**
 * BlueThemeProvider component
 * 
 * This component applies the warm theme to the entire application
 * It should be placed near the root of the application
 */
const BlueThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Apply warm theme when the component mounts
    applyBlueTheme();

    // Re-apply theme on window resize to catch any dynamically created elements
    const handleResize = () => {
      applyBlueTheme();
    };

    window.addEventListener('resize', handleResize);

    // Set up a mutation observer to detect DOM changes and apply theme to new elements
    const observer = new MutationObserver((mutations) => {
      // Only re-apply theme if there are additions to the DOM
      const hasAddedNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
      if (hasAddedNodes) {
        applyBlueTheme();
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
};

export default BlueThemeProvider;
