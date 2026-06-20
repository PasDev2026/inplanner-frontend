import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { useAuth } from './useAuth';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe('useAuth', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return user profile on success', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.idUser).toBe(1);
    expect(result.current.data?.username).toBe('admin');
    expect(result.current.isError).toBe(false);
  });

  it('should return error state on API failure', async () => {
    server.use(
      http.get('*/api/v1/auth/me', () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
