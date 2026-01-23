import React from 'react';

const LoadingSkeletonView = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-8"></div>
      <div className="w-full bg-gray-200 rounded-lg aspect-[4/3] mb-8"></div>
      <div className="w-full h-14 bg-gray-200 rounded-lg"></div>
    </div>
  );
};

export default LoadingSkeletonView;
