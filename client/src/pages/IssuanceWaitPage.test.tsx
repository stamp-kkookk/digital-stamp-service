import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import IssuanceWaitPage from './IssuanceWaitPage';
import * as issuanceApi from '../api/issuance';

// Mock API
vi.mock('../api/issuance', () => ({
  issuanceApi: {
    getRequest: vi.fn(),
  },
}));

// Mock ToastContext
vi.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

const mockPendingRequest = {
  id: 1,
  walletId: 1,
  storeId: 1,
  storeName: 'Test Cafe',
  stampCardId: 1,
  stampCardTitle: 'Coffee Card',
  status: 'PENDING',
  expiresAt: new Date(Date.now() + 60000).toISOString(), // 60초 후
  createdAt: new Date().toISOString(),
};

const mockApprovedRequest = {
  ...mockPendingRequest,
  status: 'APPROVED',
  processedAt: new Date().toISOString(),
};

describe('IssuanceWaitPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should display pending status with timer and poll for updates', async () => {
    // Mock API response
    vi.mocked(issuanceApi.issuanceApi.getRequest).mockResolvedValue(mockPendingRequest);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/issuance/:requestId/wait" element={<IssuanceWaitPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Verify loading state initially
    await waitFor(() => {
      expect(screen.getByText('승인 대기 중')).toBeInTheDocument();
    });

    // Verify timer countdown is displayed
    expect(screen.getByText(/초/)).toBeInTheDocument();

    // Verify polling message
    expect(screen.getByText('매장 직원에게 화면을 보여주세요')).toBeInTheDocument();
  });

  it('should display approved status when request is approved', async () => {
    // Mock API to return approved request
    vi.mocked(issuanceApi.issuanceApi.getRequest).mockResolvedValue(mockApprovedRequest);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/issuance/:requestId/wait" element={<IssuanceWaitPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Wait for approved status to render
    await waitFor(() => {
      expect(screen.getByText('✓ 적립 완료!')).toBeInTheDocument();
    });

    // Verify store and card information is displayed
    expect(screen.getByText('Test Cafe')).toBeInTheDocument();
    expect(screen.getByText('Coffee Card')).toBeInTheDocument();

    // Verify navigation button
    expect(screen.getByText('내 지갑 보기')).toBeInTheDocument();
  });
});
