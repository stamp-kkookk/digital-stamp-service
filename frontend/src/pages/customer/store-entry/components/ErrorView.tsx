import React from 'react';

interface ErrorViewProps {
  onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-64">
      <p className="text-lg text-red-500">정보를 불러오는 데 실패했습니다.</p>
      <button
        onClick={onRetry}
        className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      >
        다시 시도
      </button>
    </div>
  );
};

export default ErrorView;
