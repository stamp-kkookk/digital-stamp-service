import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import type { UserStatus } from '../types';

// Heroicon: arrow-right
const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 transition-transform group-hover:translate-x-1"
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
  storeId: string;
}

const CtaSection: React.FC<CtaSectionProps> = ({ userStatus, storeId }) => {
  const navigate = useNavigate();
  const getCtaContent = () => {
    switch (userStatus) {
      case 'GUEST':
        return {
          text: '로그인하고 적립 시작하기',
          action: () => {
            navigate(`/customer/store/${storeId}/auth?type=register`);
          },
        };
      case 'LOGGED_IN_NO_WALLET':
        return {
          text: '스탬프 지갑 만들고 적립 시작',
          action: () => {
            navigate(`/customer/store/${storeId}/auth?type=register`);
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
      <Button
        onClick={action}
        variant="primary"
        size="lg"
        className="w-full group shadow-kkookk-lg hover:shadow-kkookk-lg hover:-translate-y-0.5"
        rightIcon={<ArrowRightIcon />}
      >
        {text}
      </Button>
    </section>
  );
};

export default CtaSection;
