// Django Backend API Client
// Axios-based HTTP client with JWT token management

import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
export const MEDIA_URL = API_BASE_URL.replace('/api', '') + '/media';

// ============ TOKEN MANAGEMENT ============

const TOKEN_KEYS = {
    ACCESS: 'access_token',
    REFRESH: 'refresh_token',
    USER: 'user_data',
};

export function getTokens() {
    return {
        access: localStorage.getItem(TOKEN_KEYS.ACCESS),
        refresh: localStorage.getItem(TOKEN_KEYS.REFRESH),
    };
}

export function setTokens(access, refresh) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, access);
    localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
}

export function clearTokens() {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.USER);
}

export function getStoredUser() {
    const data = localStorage.getItem(TOKEN_KEYS.USER);
    return data ? JSON.parse(data) : null;
}

export function setStoredUser(user) {
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
}

// ============ AXIOS INSTANCE ============

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT access token
api.interceptors.request.use(
    (config) => {
        const { access } = getTokens();
        if (access) {
            config.headers.Authorization = `Bearer ${access}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 by refreshing token
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request until refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const { refresh } = getTokens();
            if (!refresh) {
                clearTokens();
                isRefreshing = false;
                return Promise.reject(error);
            }

            try {
                // Use plain axios to avoid interceptor loop
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/auth/token/refresh/`,
                    { refresh }
                );

                const newAccess = refreshResponse.data.access;
                const { refresh: currentRefresh } = getTokens();
                setTokens(newAccess, refreshResponse.data.refresh || currentRefresh);

                processQueue(null, newAccess);
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ============ AUTH API ============

export const authAPI = {
    login: async (email, password) => {
        const response = await api.post('/auth/login/', { email, password });
        return response.data; // { access, refresh }
    },

    register: async (email, firstName, lastName, password) => {
        const response = await api.post('/auth/register/', {
            email,
            first_name: firstName,
            last_name: lastName,
            password,
        });
        return response.data; // { message }
    },

    logout: async (refreshToken) => {
        try {
            await api.post('/auth/logout/', { refresh: refreshToken });
        } catch (error) {
            console.error('[API] Logout error:', error);
        }
        clearTokens();
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile/');
        return response.data; // { id, email, first_name, last_name, phone, avatar }
    },

    updateProfile: async (data, isFormData = false) => {
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await api.put('/auth/profile/', data, config);
        return response.data;
    },

    resetPassword: async (email) => {
        const response = await api.post('/auth/password-reset/', { email });
        return response.data; // { message }
    },

    changePassword: async (oldPassword, newPassword) => {
        const response = await api.post('/auth/change-password/', {
            old_password: oldPassword,
            new_password: newPassword,
        });
        return response.data;
    },
};

// ============ PRODUCTS API ============

export const productsAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/products/', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}/`);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/products/categories/');
        return response.data;
    },

    getFeatured: async () => {
        const response = await api.get('/products/featured/');
        return response.data;
    },
};

// ============ CART API ============

export const cartAPI = {
    get: async () => {
        const response = await api.get('/cart/');
        return response.data;
    },

    addItem: async (productId, quantity = 1) => {
        const response = await api.post('/cart/', { product: productId, quantity });
        return response.data;
    },

    updateItem: async (id, quantity) => {
        const response = await api.patch(`/cart/${id}/`, { quantity });
        return response.data;
    },

    removeItem: async (id) => {
        await api.delete(`/cart/${id}/`);
    },
};

// ============ WISHLIST API ============

export const wishlistAPI = {
    get: async () => {
        const response = await api.get('/wishlist/');
        return response.data;
    },

    add: async (productId) => {
        const response = await api.post('/wishlist/', { product: productId });
        return response.data;
    },

    remove: async (id) => {
        await api.delete(`/wishlist/${id}/`);
    },
};

// ============ ORDERS API ============

export const ordersAPI = {
    getAll: async () => {
        const response = await api.get('/orders/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/orders/${id}/`);
        return response.data;
    },

    create: async (orderData) => {
        const response = await api.post('/orders/', orderData);
        return response.data;
    },
};

// ============ PAYMENTS API ============

export const paymentsAPI = {
    createIntent: async (orderId) => {
        const response = await api.post('/payments/create-intent/', { 
            order_id: orderId,
            payment_method: 'stripe'
        });
        return response.data; // { checkout_url: "..." }
    },

    verifyPayment: async (paymentData) => {
        const response = await api.post('/payments/verify-intent/', paymentData);
        return response.data;
    },
};


export const visualizerAPI = {
    list: async () => {
        const response = await api.get('/visualizer/');
        return response.data;
    },
    save: async (data) => {
        // data should be FormData since it contains an image
        const response = await api.post('/visualizer/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/visualizer/${id}/`);
        return response.data;
    },
    removeBackground: async (productId) => {
        const response = await api.post('/visualizer/remove-bg/', { product_id: productId });
        return response.data;
    }
};

export default api;
