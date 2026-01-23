import React from 'react';

const EmptyView = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-64">
      <p className="text-lg text-gray-500">현재 진행 중인 스탬프 이벤트가 없습니다.</p>
      <p className="text-sm text-gray-400 mt-2">다음에 다시 방문해주세요!</p>
    </div>
  );
};

export default EmptyView;
