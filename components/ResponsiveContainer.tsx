import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'full'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  return (
    <div className={`w-full mx-auto ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive wrapper for different device sizes
export const MobileContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`mobile-padding mobile-margin ${className}`}>
    {children}
  </div>
);

export const TabletContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`tablet-padding tablet-margin ${className}`}>
    {children}
  </div>
);

export const DesktopContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={`desktop-padding desktop-margin ${className}`}>
    {children}
  </div>
);

// Responsive grid components
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  cols?: { mobile?: number; tablet?: number; desktop?: number };
}> = ({ children, className = '', cols = { mobile: 1, tablet: 2, desktop: 3 } }) => {
  const gridClasses = `
    grid gap-4
    grid-cols-${cols.mobile || 1}
    md:grid-cols-${cols.tablet || 2}
    lg:grid-cols-${cols.desktop || 3}
    ${className}
  `;

  return <div className={gridClasses}>{children}</div>;
};

// Responsive text components
export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
}> = ({ children, className = '', size = 'base' }) => {
  const sizeClasses = {
    sm: 'mobile-text-sm tablet-text-sm',
    base: 'mobile-text-base tablet-text-base',
    lg: 'mobile-text-lg tablet-text-lg',
    xl: 'mobile-text-xl tablet-text-xl'
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};
