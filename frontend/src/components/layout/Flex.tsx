import React from 'react';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: number | string;
  children: React.ReactNode;
}

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  justify = 'start',
  align = 'stretch',
  wrap = false,
  gap,
  className = '',
  children,
  ...props
}) => {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const gapClass = gap ? (typeof gap === 'number' ? `gap-${gap}` : gap) : '';

  return (
    <div
      className={`flex ${directionClass} ${justifyClasses[justify]} ${alignClasses[align]} ${
        wrap ? 'flex-wrap' : ''
      } ${gapClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
