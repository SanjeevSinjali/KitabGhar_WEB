const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/api/auth/login`,
    REGISTER: `${BASE_URL}/api/auth/register`,
    LOGOUT: `${BASE_URL}/api/auth/logout`,
    ME: `${BASE_URL}/api/auth/me`,
  },
  BOOKS: {
    LIST: `${BASE_URL}/api/books`,
    CREATE: `${BASE_URL}/api/books`,
    DETAIL: (id: string) => `${BASE_URL}/api/books/${id}`,
    UPDATE: (id: string) => `${BASE_URL}/api/books/${id}`,
    DELETE: (id: string) => `${BASE_URL}/api/books/${id}`,
  },
  USER: {
    PROFILE: `${BASE_URL}/api/users/profile`,
    UPDATE_PROFILE: `${BASE_URL}/api/users/profile`,
  },
};