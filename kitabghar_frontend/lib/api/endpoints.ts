const BASE = "/api/v1";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    REGISTER: `${BASE}/auth/register`,
    LOGOUT: `${BASE}/auth/logout`,
    WHOAMI: `${BASE}/auth/whoami`,
    UPDATE: `${BASE}/auth/update`,
  },
  BOOKS: {
    LIST: `${BASE}/books`,
    CREATE: `${BASE}/books`,
    DETAIL: (id: string) => `${BASE}/books/${id}`,
    UPDATE: (id: string) => `${BASE}/books/${id}`,
    DELETE: (id: string) => `${BASE}/books/${id}`,
  },
};