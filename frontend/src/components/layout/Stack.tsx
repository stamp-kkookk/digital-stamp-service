import React from 'react';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  children: React.ReactNode;
}

export const Stack: React.FC<StackProps> = ({
  spacing = 4,
  align = 'stretch',
  className = '',
  children,
  ...props
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const spacingClass = typeof spacing === 'number' ? `space-y-${spacing}` : spacing;

  return (
    <div
      className={`flex flex-col ${alignClasses[align]} ${spacingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
