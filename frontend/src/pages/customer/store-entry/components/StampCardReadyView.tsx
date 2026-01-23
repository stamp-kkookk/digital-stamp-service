import React from 'react';
import { ActiveStampCardSummary, UserStatus } from '../types';
// import StoreInfoHeader from './StoreInfoHeader';
// import StampCardSummaryCard from './StampCardSummaryCard';
// import CtaSection from './CtaSection';

interface StampCardReadyViewProps {
  data: ActiveStampCardSummary;
  userStatus: UserStatus;
}

const StampCardReadyView: React.FC<StampCardReadyViewProps> = ({ data, userStatus }) => {
  return (
    <div className="m-4 bg-purple-200 p-8 text-black">
      <h1 className="text-2xl font-bold">StampCardReadyView 디버깅</h1>
      <p>Store Name from props: {data.storeInfo.storeName}</p>
      <p className="mt-2">이 보라색 박스가 보인다면, `StampCardReadyView`까지는 렌더링 된 것입니다.</p>
    </div>
  );
};

export default StampCardReadyView;
