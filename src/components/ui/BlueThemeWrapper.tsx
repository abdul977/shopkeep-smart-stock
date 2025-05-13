import React from 'react';
import useBlueTheme from '@/hooks/useBlueTheme';
import { blueThemeColors } from '@/lib/themeUtils';

interface BlueThemeWrapperProps {
  children: React.ReactNode;
  className?: string;
  selector?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  excludeReceipts?: boolean;
}

/**
 * BlueThemeWrapper component
 * 
 * Wraps content in a div and applies blue theme to it and its children
 * Useful for applying the blue theme to specific sections of the application
 */
const BlueThemeWrapper: React.FC<BlueThemeWrapperProps> = ({
  children,
  className = '',
  selector = '*',
  backgroundColor = blueThemeColors.background.medium,
  textColor = blueThemeColors.text.primary,
  borderColor = blueThemeColors.border.medium,
  excludeReceipts = true,
}) => {
  const ref = useBlueTheme<HTMLDivElement>(selector, {
    backgroundColor,
    textColor,
    borderColor,
    excludeReceipts,
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default BlueThemeWrapper;
