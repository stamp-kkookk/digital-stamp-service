import React from 'react';
import type { ActiveStampCardSummary } from '../types';

// White coffee icon for card
const CoffeeIconWhite = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-white opacity-90"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

interface StampCardSummaryCardProps {
  stampCardInfo: ActiveStampCardSummary['stampCardInfo'];
}

const StampCardSummaryCard: React.FC<StampCardSummaryCardProps> = ({ stampCardInfo }) => {
  return (
    <div className="relative w-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-3xl shadow-2xl p-6">
      {/* ACTIVE Badge */}
      <span className="absolute top-4 right-4 px-3 py-1 text-xs font-bold text-white bg-white/20 backdrop-blur-sm rounded-full">
        ACTIVE
      </span>

      {/* Coffee Icon */}
      <div className="mb-4">
        <CoffeeIconWhite />
      </div>

      {/* Reward Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{stampCardInfo.reward}</h2>
        <p className="text-sm text-white/90">스탬프 10개를 모으시면 무료로 발행됩니다.</p>
      </div>

      {/* Stamp Progress - Empty circles */}
      <div className="flex gap-2 mb-3">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="w-8 h-8 rounded-full border-2 border-white/60 bg-white/10"
          />
        ))}
      </div>

      {/* Counter */}
      <div className="text-right">
        <span className="text-sm font-bold text-white">0/10</span>
      </div>
    </div>
  );
};

export default StampCardSummaryCard;
