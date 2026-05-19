const API_BASE = import.meta.env.VITE_API_URL || '';

type RequestOptions = RequestInit & { auth?: boolean };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers: customHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // User Service
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) =>
    request<{ user: import('../types').User; token: string }>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

  login: (email: string, password: string) =>
    request<{ user: import('../types').User; token: string }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    }),

  getProfile: (userId: string) =>
    request<{ user: import('../types').User }>(`/api/users/profile/${userId}`),

  updateProfile: (
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string }
  ) =>
    request<{ user: import('../types').User }>(`/api/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Product Catalog
  getProducts: (params?: { search?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    const query = q.toString();
    return request<{ products: import('../types').Product[] }>(
      `/api/products${query ? `?${query}` : ''}`,
      { auth: false }
    );
  },

  getProduct: (id: string) =>
    request<{ product: import('../types').Product }>(`/api/products/${id}`, { auth: false }),

  getCategories: () =>
    request<{ categories: { id: string; name: string; description?: string }[] }>(
      '/api/products/categories/list',
      { auth: false }
    ),

  // Cart
  getCart: (userId: string) =>
    request<{ cart: import('../types').Cart }>(`/api/cart/${userId}`),

  addToCart: (
    userId: string,
    item: { productId: string; name: string; price: number; quantity?: number }
  ) =>
    request<{ cart: import('../types').Cart }>(`/api/cart/${userId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateCartItem: (userId: string, productId: string, quantity: number) =>
    request<{ cart: import('../types').Cart }>(`/api/cart/${userId}/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (userId: string, productId: string) =>
    request<{ cart: import('../types').Cart }>(`/api/cart/${userId}/items/${productId}`, {
      method: 'DELETE',
    }),

  clearCart: (userId: string) =>
    request<{ cart: import('../types').Cart }>(`/api/cart/${userId}`, { method: 'DELETE' }),

  // Orders
  createOrder: (data: {
    userId: string;
    email?: string;
    phone?: string;
    shippingAddress: import('../types').ShippingAddress;
  }) =>
    request<{ order: import('../types').Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrders: (userId: string) =>
    request<{ orders: import('../types').Order[] }>(`/api/orders/user/${userId}`),

  getOrder: (orderId: string) =>
    request<{ order: import('../types').Order }>(`/api/orders/${orderId}`),

  // Payment (checkout)
  processPayment: (data: {
    orderId: string;
    userId: string;
    amount: number;
    provider?: string;
  }) =>
    request<{ payment: { id: string; status: string; transactionId?: string } }>(
      '/api/payments/process',
      { method: 'POST', body: JSON.stringify({ ...data, provider: data.provider || 'stripe' }) }
    ),
};
