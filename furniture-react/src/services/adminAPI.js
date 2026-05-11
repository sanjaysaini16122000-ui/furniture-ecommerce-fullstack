// Admin API Client — connects to Django backend for admin operations
import api from './api';

// ============ ADMIN DASHBOARD ============
export const adminDashboardAPI = {
    getStats: async () => {
        try {
            const response = await api.get('/admin/dashboard/stats/');
            return response.data;
        } catch (err) {
            // Fallback: aggregate from individual endpoints
            const [products, orders, users] = await Promise.allSettled([
                api.get('/products/'),
                api.get('/orders/all/'),
                api.get('/admin/users/'),
            ]);
            return {
                total_products: products.status === 'fulfilled' ? (products.value.data.count || products.value.data.results?.length || 0) : 0,
                total_orders: orders.status === 'fulfilled' ? (orders.value.data.count || orders.value.data.results?.length || 0) : 0,
                total_users: users.status === 'fulfilled' ? (users.value.data.count || users.value.data.results?.length || 0) : 0,
                total_revenue: 0,
                recent_orders: orders.status === 'fulfilled' ? (orders.value.data.results || orders.value.data || []).slice(0, 5) : [],
            };
        }
    },
};

// ============ ADMIN PRODUCTS ============
export const adminProductsAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/products/', { params: { ...params, page_size: 100 } });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}/`);
        return response.data;
    },

    create: async (formData) => {
        const response = await api.post('/products/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id, formData) => {
        const response = await api.patch(`/products/${id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/products/${id}/`);
    },

    // Create with JSON (fallback)
    createJSON: async (data) => {
        const response = await api.post('/products/', data);
        return response.data;
    },

    updateJSON: async (id, data) => {
        const response = await api.patch(`/products/${id}/`, data);
        return response.data;
    },
};

// ============ ADMIN CATEGORIES ============
export const adminCategoriesAPI = {
    getAll: async () => {
        const response = await api.get('/products/categories/');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/products/categories/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.patch(`/products/categories/${id}/`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/products/categories/${id}/`);
    },
};

// ============ ADMIN ORDERS ============
export const adminOrdersAPI = {
    getAll: async (params = {}) => {
        try {
            // Try admin endpoint first
            const response = await api.get('/orders/all/', { params });
            return response.data;
        } catch {
            // Fallback to regular orders endpoint
            const response = await api.get('/orders/', { params });
            return response.data;
        }
    },

    getById: async (id) => {
        const response = await api.get(`/orders/${id}/`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/orders/${id}/`, { status });
        return response.data;
    },

    addTracking: async (id, trackingNumber) => {
        const response = await api.patch(`/orders/${id}/`, { tracking_number: trackingNumber });
        return response.data;
    },
};

// ============ ADMIN USERS ============
export const adminUsersAPI = {
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/admin/users/', { params });
            return response.data;
        } catch {
            // Fallback — return empty
            return { results: [], count: 0 };
        }
    },

    getById: async (id) => {
        const response = await api.get(`/admin/users/${id}/`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.patch(`/admin/users/${id}/`, data);
        return response.data;
    },

    toggleActive: async (id, isActive) => {
        const response = await api.patch(`/admin/users/${id}/`, { is_active: isActive });
        return response.data;
    },
};

// ============ ADMIN MESSAGES / CONTACT ============
export const adminMessagesAPI = {
    getAll: async () => {
        try {
            const response = await api.get('/contact/messages/');
            return response.data;
        } catch {
            return { results: [], count: 0 };
        }
    },

    markRead: async (id) => {
        try {
            const response = await api.patch(`/contact/messages/${id}/`, { read: true });
            return response.data;
        } catch {
            return null;
        }
    },

    delete: async (id) => {
        try {
            await api.delete(`/contact/messages/${id}/`);
        } catch {
            // silently fail
        }
    },
};

// ============ ADMIN IMAGE UPLOAD ============
export const adminUploadAPI = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await api.post('/upload/image/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.url || response.data.image;
        } catch {
            // Fallback to data URL
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }
    },

    uploadImages: async (files) => {
        const urls = await Promise.all(
            Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);
                try {
                    const response = await api.post('/upload/image/', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    return response.data.url || response.data.image;
                } catch {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                }
            })
        );
        return urls;
    },
};
