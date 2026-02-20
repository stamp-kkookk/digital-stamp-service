/**
 * DEV ONLY: 디자이너 Smart Guides 테스트 페이지
 * 인증 없이 디자이너를 독립 렌더링
 */
import { useState } from 'react';
import { StampCardDesigner } from '@/features/store-management/components/designer/StampCardDesigner';
import type { DesignJsonV2 } from '@/features/wallet/types/designV2';
import { generateGridSlots } from '@/features/store-management/utils/layoutGenerators';

const testDesign: DesignJsonV2 = {
  version: 2,
  front: {
    background: { type: 'gradient', value: 'linear-gradient(160deg, #E8F5E9, #C8E6C9)' },
    elements: [
      { type: 'text', x: 12, y: 20, content: 'TEST', style: { fontSize: '10', fontWeight: 'bold', fill: '#2E7D32' } },
    ],
  },
  back: {
    background: { type: 'color', value: '#F1F8E9' },
    elements: [
      { type: 'text', x: 50, y: 5, content: 'Smart Guide Test', style: { fontSize: '3', fontWeight: 'bold', fill: '#333', textAnchor: 'middle' } },
    ],
    stampSlots: generateGridSlots(6, 7),
    stampStyle: {
      shape: 'circle',
      filledColor: '#4CAF50',
      emptyColor: '#999',
      emptyStyle: 'dashed',
      icon: null,
      customSvgPath: null,
      customIcon: null,
    },
  },
};

export default function DevDesignerTest() {
  const [design, setDesign] = useState<DesignJsonV2>(testDesign);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-xl font-bold mb-4">Designer Smart Guides Test</h1>
      <div className="max-w-4xl">
        <StampCardDesigner initialDesign={design} onDesignChange={setDesign} />
      </div>
      <pre className="mt-4 text-xs bg-white p-4 rounded-xl max-h-60 overflow-auto">
        {JSON.stringify(design.back.stampSlots, null, 2)}
      </pre>
    </div>
  );
}
