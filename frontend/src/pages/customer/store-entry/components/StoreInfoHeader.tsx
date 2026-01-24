import React from 'react';

// Coffee icon component
const CoffeeIcon = () => (
  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-orange-600"
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
  </div>
);

// User icon component
const UserIcon = () => (
  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  </button>
);

interface StoreInfoHeaderProps {
  storeName: string;
}

const StoreInfoHeader: React.FC<StoreInfoHeaderProps> = ({ storeName }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
      <div className="flex items-center gap-4">
        <CoffeeIcon />
        <div>
          <h1 className="text-lg font-bold text-gray-800">{storeName}</h1>
          <p className="text-xs text-gray-500">Scan to Stamp v1.0</p>
        </div>
      </div>
      <UserIcon />
    </header>
  );
};

export default StoreInfoHeader;
