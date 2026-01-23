import React from 'react';

interface StoreInfoHeaderProps {
  storeName: string;
  stampCardName: string;
}

const StoreInfoHeader: React.FC<StoreInfoHeaderProps> = ({ storeName, stampCardName }) => {
  return (
    <header className="text-center">
      <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{storeName}</h1>
      <p className="text-lg text-gray-500 mt-1">{stampCardName}</p>
    </header>
  );
};

export default StoreInfoHeader;
