const LoadingSkeletonView = () => {
  return (
    <div className="p-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-4">
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default LoadingSkeletonView;
