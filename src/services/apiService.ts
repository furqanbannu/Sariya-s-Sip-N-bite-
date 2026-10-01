// Central API Client for Sariya's Sip N Bite Backend

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('sariya_admin_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('sariya_admin_token', token);
  } else {
    localStorage.removeItem('sariya_admin_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================
export const api = {
  // Auth
  async login(email: string, password: string) {
    const data = await request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  async getMe() {
    return request<any>('/auth/me');
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  async forgotPassword(email: string) {
    return request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email: string, newPassword: string, adminSecret?: string) {
    return request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword, adminSecret: adminSecret || 'Murree2026!' }),
    });
  },

  // ==========================================
  // PUBLIC WEBSITE APIs
  // ==========================================
  async getPublicContent() {
    return request<Record<string, string>>('/public/content');
  },

  async getPublicMenu() {
    return request<{ categories: any[]; items: any[] }>('/public/menu');
  },

  async getPublicOffers() {
    return request<any[]>('/public/offers');
  },

  async getPublicTables() {
    return request<any[]>('/public/tables');
  },

  async getPublicReviews() {
    return request<any[]>('/public/reviews');
  },

  async createPublicOrder(orderData: any) {
    return request<{ success: boolean; order: any }>('/public/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async createPublicReservation(resData: any) {
    return request<{ success: boolean; reservation: any }>('/public/reservations', {
      method: 'POST',
      body: JSON.stringify(resData),
    });
  },

  // ==========================================
  // ADMIN DASHBOARD & CONTROL CENTER APIs
  // ==========================================
  async getAdminAnalytics() {
    return request<any>('/admin/analytics');
  },

  // Orders
  async getAdminOrders(params: { status?: string; search?: string } = {}) {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    return request<any[]>(`/admin/orders?${q.toString()}`);
  },

  async updateOrderStatus(orderId: string, status: string) {
    return request<any>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteOrder(orderId: string) {
    return request<any>(`/admin/orders/${orderId}`, {
      method: 'DELETE',
    });
  },

  // Reservations
  async getAdminReservations(params: { date?: string; status?: string; search?: string } = {}) {
    const q = new URLSearchParams();
    if (params.date) q.set('date', params.date);
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    return request<any[]>(`/admin/reservations?${q.toString()}`);
  },

  async createAdminReservation(data: any) {
    return request<any>('/admin/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateReservationStatus(resId: string, status: string, tableId?: string, tableName?: string) {
    return request<any>(`/admin/reservations/${resId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, tableId, tableName }),
    });
  },

  async deleteReservation(resId: string) {
    return request<any>(`/admin/reservations/${resId}`, {
      method: 'DELETE',
    });
  },

  // Menu Management
  async getAdminMenu() {
    return request<any[]>('/admin/menu');
  },

  async createMenuItem(data: any) {
    return request<any>('/admin/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMenuItem(id: string, data: any) {
    return request<any>(`/admin/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMenuItem(id: string) {
    return request<any>(`/admin/menu/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  async getAdminCategories() {
    return request<any[]>('/admin/categories');
  },

  async createCategory(data: any) {
    return request<any>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: any) {
    return request<any>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string) {
    return request<any>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Tables
  async getAdminTables() {
    return request<any[]>('/admin/tables');
  },

  async createTable(data: any) {
    return request<any>('/admin/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTable(id: string, data: any) {
    return request<any>(`/admin/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTable(id: string) {
    return request<any>(`/admin/tables/${id}`, {
      method: 'DELETE',
    });
  },

  // Offers
  async getAdminOffers() {
    return request<any[]>('/admin/offers');
  },

  async createOffer(data: any) {
    return request<any>('/admin/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOffer(id: string, data: any) {
    return request<any>(`/admin/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteOffer(id: string) {
    return request<any>(`/admin/offers/${id}`, {
      method: 'DELETE',
    });
  },

  // Customers
  async getAdminCustomers(search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<any[]>(`/admin/customers${q}`);
  },

  // Staff (Owner only)
  async getAdminStaff() {
    return request<any[]>('/admin/staff');
  },

  async createStaff(data: any) {
    return request<any>('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStaff(id: string, data: any) {
    return request<any>(`/admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async resetStaffPassword(id: string, newPassword: string) {
    return request<any>(`/admin/staff/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },

  async deleteStaff(id: string) {
    return request<any>(`/admin/staff/${id}`, {
      method: 'DELETE',
    });
  },

  // Website Settings
  async getAdminSettings() {
    return request<Array<{ key: string; value: string; description?: string }>>('/admin/settings');
  },

  async updateAdminSettings(settings: Record<string, string>) {
    return request<any>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  },

  // Reviews
  async getAdminReviews() {
    return request<any[]>('/admin/reviews');
  },

  async updateReviewStatus(id: string, status: string, isFeatured?: boolean) {
    return request<any>(`/admin/reviews/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, isFeatured }),
    });
  },

  async deleteReview(id: string) {
    return request<any>(`/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  async getAdminNotifications() {
    return request<{ notifications: any[]; unreadCount: number }>('/admin/notifications');
  },

  async markNotificationRead(id: string) {
    return request<any>(`/admin/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead() {
    return request<any>('/admin/notifications/read-all', {
      method: 'POST',
    });
  },

  // Activity Logs
  async getAdminActivityLogs(section?: string) {
    const q = section && section !== 'all' ? `?section=${encodeURIComponent(section)}` : '';
    return request<any[]>(`/admin/activity-logs${q}`);
  },
};
