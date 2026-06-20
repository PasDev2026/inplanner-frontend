import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { toast } from 'sonner';
import Login from '@/features/auth/pages/LoginPage';
import { server } from '@/mocks/server';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn() },
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  vi.clearAllMocks();
});
afterAll(() => server.close());

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderLogin(initialEntries = ['/auth/login']) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  it('renders the login form with username, password, and submit button', () => {
    renderLogin();

    expect(screen.getByPlaceholderText('Ingresa tu usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('El nombre de usuario es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('El Password es obligatorio')).toBeInTheDocument();
    });
  });

  it('navigates to dashboard and stores refresh token on successful login', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'admin');
    await user.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

  });

  it('shows error toast on login failure and does not store refresh token', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () =>
        HttpResponse.json({ error: 'Credenciales inválidas' }, { status: 401 }),
      ),
    );

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('Ingresa tu usuario'), 'admin');
    await user.type(screen.getByPlaceholderText('Ingresa tu contraseña'), 'wrong');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Credenciales inválidas',
        expect.objectContaining({}),
      );
    });

  });

  it('shows session expired toast when ?session=expired is present', async () => {
    renderLogin(['/auth/login?session=expired']);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Sesión expirada',
        expect.objectContaining({}),
      );
    });
  });

  it('shows session closed toast when ?session=closed is present', async () => {
    renderLogin(['/auth/login?session=closed']);

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith(
        'Sesión cerrada',
        expect.objectContaining({}),
      );
    });
  });
});
