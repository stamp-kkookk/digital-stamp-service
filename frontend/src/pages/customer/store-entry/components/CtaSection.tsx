import React from 'react';
import type { UserStatus } from '../types';

// Heroicon: arrow-right
const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

interface CtaSectionProps {
  userStatus: UserStatus;
}

const CtaSection: React.FC<CtaSectionProps> = ({ userStatus }) => {
  const getCtaContent = () => {
    switch (userStatus) {
      case 'GUEST':
        return {
          text: '로그인하고 적립 시작하기',
          action: () => {
            console.log('TODO: 로그인 페이지로 이동');
          },
        };
      case 'LOGGED_IN_NO_WALLET':
        return {
          text: '스탬프 지갑 만들고 적립 시작',
          action: () => {
            console.log('TODO: 지갑 생성 API 호출');
          },
        };
      case 'LOGGED_IN_WITH_WALLET':
        return {
          text: '내 스탬프 현황 보기',
          action: () => {
            console.log('TODO: 내 스탬프 현황 페이지로 이동');
          },
        };
      default:
        return { text: '', action: () => {} };
    }
  };

  const { text, action } = getCtaContent();

  return (
    <section className="w-full">
      <button
        onClick={action}
        className="group w-full flex items-center justify-center bg-black text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:bg-gray-900 transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
      >
        {text}
        <ArrowRightIcon />
      </button>
    </section>
  );
};

export default CtaSection;
