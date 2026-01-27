import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StoreSummary from './StoreSummary';
import type { StampCardInfo } from '@/types/store';

// Mock CtaButton to isolate StoreSummary component
vi.mock('./CtaButton', () => ({
  default: ({ isAuthenticated, hasWallet }: { isAuthenticated: boolean; hasWallet: boolean }) => (
    <button data-testid="cta-button">
      {isAuthenticated && hasWallet
        ? '내 스탬프 현황 보기'
        : isAuthenticated
          ? '내 스탬프 카드 만들기'
          : '로그인하고 스탬프 시작하기'}
    </button>
  ),
}));

describe('StoreSummary', () => {
  const mockStampCard: StampCardInfo = {
    stampCardId: 1,
    name: '멋진 스탬프 카드',
    reward: '무료 커피 1잔',
    stampBenefit: '방문 시 스탬프 1개 적립',
    imageUrl: 'http://example.com/stamp-image.png',
  };

  it('renders store name and stamp card details correctly', () => {
    const storeName = '테스트 카페';
    render(<StoreSummary storeName={storeName} stampCard={mockStampCard} />);

    expect(screen.getByRole('heading', { name: storeName })).toBeInTheDocument();
    expect(screen.getByText('스탬프 적립 카드')).toBeInTheDocument();
    expect(screen.getByAltText(mockStampCard.name)).toHaveAttribute('src', mockStampCard.imageUrl);
    expect(screen.getByRole('heading', { name: '🎁 리워드' })).toBeInTheDocument();
    expect(screen.getByText(mockStampCard.reward)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '✍️ 적립 혜택' })).toBeInTheDocument();
    expect(screen.getByText(mockStampCard.stampBenefit)).toBeInTheDocument();
  });

  it('renders "이미지 없음" when imageUrl is null', () => {
    const storeName = '이미지 없는 매장';
    const stampCardWithoutImage = { ...mockStampCard, imageUrl: null };
    render(<StoreSummary storeName={storeName} stampCard={stampCardWithoutImage} />);

    expect(screen.getByText('이미지 없음')).toBeInTheDocument();
    expect(screen.queryByAltText(stampCardWithoutImage.name)).not.toBeInTheDocument();
  });

  it('renders CtaButton component', () => {
    const storeName = '테스트 카페';
    render(<StoreSummary storeName={storeName} stampCard={mockStampCard} />);

    expect(screen.getByTestId('cta-button')).toBeInTheDocument();
  });
});
