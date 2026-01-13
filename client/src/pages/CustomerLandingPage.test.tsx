import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { CustomerLandingPage } from './CustomerLandingPage';
import * as publicApi from '../api/public';

// Mock API
vi.mock('../api/public', () => ({
  publicApi: {
    getStore: vi.fn(),
    getActiveStampCard: vi.fn(),
  },
}));

const mockStore = {
  id: 1,
  name: 'Test Cafe',
  description: 'A cozy cafe',
  address: '123 Test St',
  phoneNumber: '010-1234-5678',
};

const mockStampCard = {
  id: 1,
  title: 'Coffee Stamp Card',
  description: 'Get 10 stamps for a free coffee',
  stampGoal: 10,
  rewardName: 'Free Coffee',
  rewardExpiresInDays: 30,
  themeColor: '#667eea',
  status: 'ACTIVE',
};

describe('CustomerLandingPage', () => {
  it('should render store and stamp card information', async () => {
    // Mock API responses
    vi.mocked(publicApi.publicApi.getStore).mockResolvedValue(mockStore);
    vi.mocked(publicApi.publicApi.getActiveStampCard).mockResolvedValue(mockStampCard);

    // Create a test query client
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Render component
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CustomerLandingPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Cafe')).toBeInTheDocument();
    });

    // Verify store information is displayed
    expect(screen.getByText('A cozy cafe')).toBeInTheDocument();
    expect(screen.getByText('📍 123 Test St')).toBeInTheDocument();

    // Verify stamp card information is displayed
    expect(screen.getByText('Coffee Stamp Card')).toBeInTheDocument();
    expect(screen.getByText('Get 10 stamps for a free coffee')).toBeInTheDocument();
    expect(screen.getByText('10개')).toBeInTheDocument();
    expect(screen.getByText('🎁 Free Coffee')).toBeInTheDocument();

    // Verify action buttons are present
    expect(screen.getByText('스탬프 적립하기')).toBeInTheDocument();
    expect(screen.getByText('내 스탬프 확인하기')).toBeInTheDocument();
    expect(screen.getByText('종이 스탬프 이전하기')).toBeInTheDocument();
  });
});
