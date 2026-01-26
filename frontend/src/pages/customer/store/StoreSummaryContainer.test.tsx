import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StoreSummaryContainer from './StoreSummaryContainer';
import * as useStoreSummaryQueryModule from '../../../hooks/queries/useStoreSummaryQuery'; // Import module to mock
import type { StoreStampCardSummaryResponse } from 'store-types';

// Mock child components to simplify testing StoreSummaryContainer's conditional rendering
vi.mock('../../../components/common/Loading', () => ({
  default: () => <div data-testid="loading-component">Loading...</div>,
}));
vi.mock('../../../components/common/Error', () => ({
  default: ({ message }: { message: string }) => <div data-testid="error-component">{message}</div>,
}));
vi.mock('../../../components/common/Empty', () => ({
  default: ({ message }: { message: string }) => <div data-testid="empty-component">{message}</div>,
}));
vi.mock('./components/StoreSummary', () => ({
  default: ({ storeName, stampCard }: { storeName: string; stampCard: any }) => (
    <div data-testid="store-summary-component">
      {storeName} - {stampCard?.name || 'No Card'}
    </div>
  ),
}));

describe('StoreSummaryContainer', () => {
  const mockStoreId = '123';

  // Helper to mock useStoreSummaryQuery's return value
  const mockUseStoreSummaryQuery = (
    data: StoreStampCardSummaryResponse | undefined,
    isLoading: boolean,
    isError: boolean,
    error?: any // Change type to any for flexible error mocking
  ) => {
    return vi.spyOn(useStoreSummaryQueryModule, 'useStoreSummaryQuery').mockReturnValue({
      data,
      isLoading,
      isError,
      error,
      isSuccess: !isLoading && !isError && !!data,
      isIdle: false, // For simplicity in tests
      isFetched: !isLoading, // For simplicity in tests
      status: isLoading ? 'pending' : isError ? 'error' : 'success', // For simplicity in tests
    } as any); // Type assertion for partial mock
  };

  it('renders Loading component when data is loading', () => {
    mockUseStoreSummaryQuery(undefined, true, false);
    render(<StoreSummaryContainer storeId={mockStoreId} />);
    expect(screen.getByTestId('loading-component')).toBeInTheDocument();
  });

  it('renders Error component with custom message when error.response.data.message exists', () => {
    const customErrorMessage = 'Custom error message from API';
    const errorResponse = {
      response: { data: { message: customErrorMessage } },
    };
    mockUseStoreSummaryQuery(undefined, false, true, errorResponse);
    render(<StoreSummaryContainer storeId={mockStoreId} />);
    expect(screen.getByTestId('error-component')).toHaveTextContent(customErrorMessage);
  });
  
  it('renders default Error component message when error has no specific message', () => {
    // Simulate a generic network error or error without a specific message from API
    mockUseStoreSummaryQuery(undefined, false, true, new Error('Network Error'));
    render(<StoreSummaryContainer storeId={mockStoreId} />);
    expect(screen.getByTestId('error-component')).toHaveTextContent(
      '매장 정보를 불러오는데 실패했습니다.'
    );
  });

  it('renders Empty component when data is present but stampCard is null', () => {
    const mockData: StoreStampCardSummaryResponse = { storeName: 'Test Store', stampCard: null };
    mockUseStoreSummaryQuery(mockData, false, false);
    render(<StoreSummaryContainer storeId={mockStoreId} />);
    expect(screen.getByTestId('empty-component')).toHaveTextContent(
      '현재 진행 중인 스탬프 이벤트가 없습니다.'
    );
  });

  it('renders Empty component when data is null (meaning store not found)', () => {
    mockUseStoreSummaryQuery(undefined, false, false);
    render(<StoreSummaryContainer storeId={mockStoreId} />);
    expect(screen.getByTestId('empty-component')).toHaveTextContent('매장 정보를 찾을 수 없습니다.');
  });

  it('renders StoreSummary component when data and stampCard are present', () => {
    const mockData: StoreStampCardSummaryResponse = {
      storeName: 'Test Store',
      stampCard: {
        stampCardId: 1,
        name: 'Test Stamp Card',
        reward: 'Coffee',
        stampBenefit: '1 per visit',
        imageUrl: null,
      },
    };
    mockUseStoreSummaryQuery(mockData, false, false);
    render(<StoreSummaryContainer storeId={mockStoreId} />);
    expect(screen.getByTestId('store-summary-component')).toHaveTextContent('Test Store - Test Stamp Card');
  });
});
