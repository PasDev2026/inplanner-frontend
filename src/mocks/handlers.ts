import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:3000/api/v1';

export const mockUser = {
  idUser: 1,
  username: 'admin',
  email: 'admin@test.com',
  name: 'Admin',
  apellido_paterno: 'User',
  fullName: 'Admin User',
  roles: ['ROLE_Super_Administrador'],
};

export const handlers = [
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({
      user: mockUser,
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
    });
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({ user: mockUser });
  }),
];
