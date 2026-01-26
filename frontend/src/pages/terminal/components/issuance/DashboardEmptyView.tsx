const DashboardEmptyView = () => {
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow mt-4">
      <h3 className="text-lg font-semibold text-gray-800">모든 요청이 처리되었습니다.</h3>
      <p className="mt-2 text-sm text-gray-500">새로운 스탬프 발급 요청이 들어오면 여기에 표시됩니다.</p>
    </div>
  );
};

export default DashboardEmptyView;
