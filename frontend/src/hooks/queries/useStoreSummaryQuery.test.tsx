import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStoreSummaryQuery } from './useStoreSummaryQuery';
import * as storeApi from '../../lib/api/store'; // Mocking the API functions

describe('useStoreSummaryQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should return store summary data on success', async () => {
    const mockStoreId = '1';
    const mockData = {
      storeName: 'Test Store',
      stampCard: {
        stampCardId: 1,
        name: 'Test Stamp Card',
        reward: 'Coffee',
        stampBenefit: '1 per visit',
        imageUrl: null,
      },
    };

    // Mock the API call
    vi.spyOn(storeApi, 'getStoreSummary').mockResolvedValue(mockData);

    const { result } = renderHook(() => useStoreSummaryQuery(mockStoreId), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(storeApi.getStoreSummary).toHaveBeenCalledWith(mockStoreId);
  });

  it('should return empty stamp card data on success if no active card', async () => {
    const mockStoreId = '2';
    const mockData = {
      storeName: 'Empty Store',
      stampCard: null,
    };

    vi.spyOn(storeApi, 'getStoreSummary').mockResolvedValue(mockData);

    const { result } = renderHook(() => useStoreSummaryQuery(mockStoreId), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.data?.stampCard).toBeNull();
    expect(storeApi.getStoreSummary).toHaveBeenCalledWith(mockStoreId);
  });

  it('should handle API error', async () => {
    const mockStoreId = '3';
    const mockError = new Error('Network error');

    vi.spyOn(storeApi, 'getStoreSummary').mockRejectedValue(mockError);

    const { result } = renderHook(() => useStoreSummaryQuery(mockStoreId), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
    expect(storeApi.getStoreSummary).toHaveBeenCalledWith(mockStoreId);
  });

  it('should not fetch if storeId is not provided', () => {
    const mockStoreId = ''; // No storeId
    vi.spyOn(storeApi, 'getStoreSummary'); // Spy without mocking return value

    const { result } = renderHook(() => useStoreSummaryQuery(mockStoreId), { wrapper });

    expect(result.current.isLoading).toBe(false); // Because it's not fetching
    expect(result.current.data).toBeUndefined();
    expect(storeApi.getStoreSummary).not.toHaveBeenCalled();
  });
});
