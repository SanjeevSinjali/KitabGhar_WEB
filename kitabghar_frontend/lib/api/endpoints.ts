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
    MINE: `${BASE}/books/mine`,
    FEATURED: `${BASE}/books/featured`,
    DETAIL: (id: string) => `${BASE}/books/${id}`,
    UPDATE: (id: string) => `${BASE}/books/${id}`,
    DELETE: (id: string) => `${BASE}/books/${id}`,
  },
  WISHLIST: {
    LIST: `${BASE}/wishlist`,
    TOGGLE: `${BASE}/wishlist/toggle`,
    DELETE: (bookId: string) => `${BASE}/wishlist/${bookId}`,
  },
  PURCHASES: {
    LIST: `${BASE}/purchases`,
    CREATE: `${BASE}/purchases`,
  },
  ADMIN: {
    USERS: {
      LIST: `${BASE}/admin/users`,
      GET: (id: string) => `${BASE}/admin/users/${id}`,
      CREATE: `${BASE}/admin/users`,
      UPDATE: (id: string) => `${BASE}/admin/users/${id}`,
      DELETE: (id: string) => `${BASE}/admin/users/${id}`,
    },
    NOTIFICATIONS: {
      LIST: `${BASE}/admin/notifications`,
      MARK_READ: (id: string) => `${BASE}/admin/notifications/${id}/read`,
      MARK_ALL_READ: `${BASE}/admin/notifications/read-all`,
    },
    BOOKS: {
      LIST: `${BASE}/admin/books`,
      GET: (id: string) => `${BASE}/admin/books/${id}`,
      DELETE: (id: string) => `${BASE}/admin/books/${id}`,
    },
  },
};