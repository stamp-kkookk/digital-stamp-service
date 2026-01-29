import React from 'react';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: number | string;
  children: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 4,
  className = '',
  children,
  ...props
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap;

  return (
    <div
      className={`grid ${colsClasses[cols]} ${gapClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
