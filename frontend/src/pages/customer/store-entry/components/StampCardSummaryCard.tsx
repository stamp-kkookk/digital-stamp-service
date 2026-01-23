import React from 'react';
import { ActiveStampCardSummary } from '../types';

// Heroicon: gift
const GiftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 19.5v-8.25a1.5 1.5 0 011.5-1.5h15a1.5 1.5 0 011.5 1.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75a1.5 1.5 0 011.5-1.5h.01a1.5 1.5 0 011.5 1.5v.01a1.5 1.5 0 01-1.5 1.5h-.01a1.5 1.5 0 01-1.5-1.5v-.01zM8.25 9.75a1.5 1.5 0 011.5-1.5h.01a1.5 1.5 0 011.5 1.5v.01a1.5 1.5 0 01-1.5 1.5h-.01a1.5 1.5 0 01-1.5-1.5v-.01zM12 4.5c.621 0 1.125.504 1.125 1.125V9.75c0 .621-.504 1.125-1.125 1.125S10.875 10.371 10.875 9.75V5.625c0-.621.504-1.125 1.125-1.125z" />
  </svg>
);

interface StampCardSummaryCardProps {
  stampCardInfo: ActiveStampCardSummary['stampCardInfo'];
}

const StampCardSummaryCard: React.FC<StampCardSummaryCardProps> = ({ stampCardInfo }) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6">
            <div className="text-center mb-6">
                <p className="text-base text-gray-500 font-medium">모두 모으면</p>
                <p className="text-2xl font-bold text-indigo-600 flex items-center justify-center mt-1">
                    <GiftIcon />
                    {stampCardInfo.reward}
                </p>
            </div>
            <div className="grid grid-cols-5 gap-3 p-2 bg-slate-100/50 rounded-xl">
                {Array.from({ length: stampCardInfo.totalStampCount }).map((_, index) => (
                <div key={index} className="aspect-square flex items-center justify-center bg-white rounded-lg p-1 shadow-sm">
                    {/* Assuming stampImageUrl is valid. Add a placeholder if it can be empty. */}
                    <img src={stampCardInfo.stampImageUrl} alt={`Stamp ${index + 1}`} className="w-full h-full object-contain" />
                </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default StampCardSummaryCard;
