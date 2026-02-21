/**
 * DesignElementRenderer
 * 텍스트/이미지/SVG경로/도형 등 범용 디자인 요소 SVG 렌더러
 */

import type { DesignElement } from '../types/designV2';

interface DesignElementRendererProps {
  element: DesignElement;
}

export function DesignElementRenderer({ element }: DesignElementRendererProps) {
  const { type, x, y, width, height, rotation = 0, content, style = {} } = element;

  const transform = `translate(${x}, ${y})${rotation ? ` rotate(${rotation})` : ''}`;

  switch (type) {
    case 'text':
      return (
        <text
          transform={transform}
          fontSize={style.fontSize || '4'}
          fontWeight={style.fontWeight || 'normal'}
          fill={style.fill || '#333'}
          textAnchor={(style.textAnchor as 'start' | 'middle' | 'end') || 'start'}
          dominantBaseline="central"
          fontFamily={style.fontFamily}
          textRendering="optimizeLegibility"
        >
          {content}
        </text>
      );

    case 'image':
      return (
        <image
          href={content}
          x={0}
          y={0}
          width={width || 20}
          height={height || 20}
          transform={transform}
          preserveAspectRatio="xMidYMid meet"
        />
      );

    case 'svg-path':
      return (
        <path
          d={content}
          transform={transform}
          fill={style.fill || 'none'}
          stroke={style.stroke || '#333'}
          strokeWidth={style.strokeWidth || '0.5'}
          opacity={style.opacity ? Number(style.opacity) : 1}
        />
      );

    case 'shape':
      return (
        <rect
          x={0}
          y={0}
          width={width || 10}
          height={height || 10}
          rx={style.borderRadius || '0'}
          transform={transform}
          fill={style.fill || '#eee'}
          stroke={style.stroke || 'none'}
          strokeWidth={style.strokeWidth || '0'}
          opacity={style.opacity ? Number(style.opacity) : 1}
        />
      );

    default:
      return null;
  }
}

export default DesignElementRenderer;
