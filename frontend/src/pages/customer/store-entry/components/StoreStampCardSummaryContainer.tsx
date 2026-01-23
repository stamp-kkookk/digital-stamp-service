import React from 'react';
import { ActiveStampCardSummary, UserStatus } from '../types';
// import StampCardReadyView from './StampCardReadyView';

// DEBUG: 컴포넌트를 외부 파일에서 import 하지 않고, 파일 내부에 직접 정의합니다.
const LocalStampCardReadyView: React.FC<{data: ActiveStampCardSummary, userStatus: UserStatus}> = ({ data, userStatus }) => {
  return (
    <div className="m-4 bg-purple-200 p-8 text-black">
      <h1 className="text-2xl font-bold">로컬 컴포넌트 디버깅</h1>
      <p>Store Name: {data.storeInfo.storeName}</p>
      <p>User Status: {userStatus}</p>
      <p className="mt-2">이 보라색 박스가 보인다면, 파일 내부의 컴포넌트 렌더링은 성공입니다.</p>
    </div>
  );
};

interface StoreStampCardSummaryContainerProps {
  storeId: string;
}

// MVP 임시 함수: 실제로는 인증 컨텍스트나 전역 상태에서 가져와야 함
const checkUserStatus = (): UserStatus => {
    const token = localStorage.getItem('authToken');
    if (!token) return 'GUEST';
    const hasWallet = false; 
    return hasWallet ? 'LOGGED_IN_WITH_WALLET' : 'LOGGED_IN_NO_WALLET';
}

// DEBUG: 하드코딩된 목 데이터
const MOCK_DATA: ActiveStampCardSummary = {
    storeInfo: {
      storeId: 1,
      storeName: '꾸욱카페 (Hardcoded)',
    },
    stampCardInfo: {
      stampCardId: 1,
      name: '하드코딩된 스페셜 원두',
      reward: '아메리카노 1잔',
      totalStampCount: 10,
      stampImageUrl: '/vite.svg',
    },
};

const StoreStampCardSummaryContainer: React.FC<StoreStampCardSummaryContainerProps> = ({ storeId }) => {
  const userStatus = checkUserStatus();

  // DEBUG: 외부에서 import한 컴포넌트 대신, 파일 내부에 직접 정의한 로컬 컴포넌트를 렌더링합니다.
  return <LocalStampCardReadyView data={MOCK_DATA} userStatus={userStatus} />;
};

export default StoreStampCardSummaryContainer;
