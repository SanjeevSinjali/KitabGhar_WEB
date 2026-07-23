const BASE = "/api/v1";
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    REGISTER: `${BASE}/auth/register`,
    LOGOUT: `${BASE}/auth/logout`,
    WHOAMI: `${BASE}/auth/whoami`,
    UPDATE: `${BASE}/auth/update`,
    REQUEST_PASSWORD_CHANGE: `${BASE}/auth/change-password/request-code`,
    CONFIRM_PASSWORD_CHANGE: `${BASE}/auth/change-password/confirm`,
    FORGOT_PASSWORD: `${BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE}/auth/reset-password`,
  },

  BOOKS: {
    LIST: `${BASE}/books`,
    CREATE: `${BASE}/books`,
    MINE: `${BASE}/books/mine`,
    FEATURED: `${BASE}/books/featured`,
    SEARCH: `${BASE}/books/search`,
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
    KHALTI_INITIATE: `${BASE}/purchases/khalti/initiate`,
    KHALTI_VERIFY: `${BASE}/purchases/khalti/verify`,
  },

  NOTIFICATIONS: {
    LIST: `${BASE}/notifications`,
    MARK_READ: (id: string) => `${BASE}/notifications/${id}/read`,
    MARK_ALL_READ: `${BASE}/notifications/read-all`,
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
      UPDATE_STATUS: (id: string) => `${BASE}/admin/books/${id}/status`,
    },
  },
};