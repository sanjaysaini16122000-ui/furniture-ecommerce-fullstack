import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ordersAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { mapBackendProduct } from './DataContext';

const OrderContext = createContext();

export function OrderProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mapOrder = useCallback((order) => {
        if (!order) return null;
        return {
            ...order,
            total_amount: Number(order.total_amount || order.total || order.total_price || 0),
            items: (order.items || []).map(item => ({
                ...item,
                price: Number(item.price || item.product?.price || 0),
                product: mapBackendProduct(item.product)
            }))
        };
    }, []);

    const fetchOrders = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const data = await ordersAPI.getAll();
            const rawOrders = data.results || data || [];
            setOrders(rawOrders.map(mapOrder));
            setError(null);
        } catch (err) {
            console.error('[OrderContext] Error fetching orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, mapOrder]);

    const placeOrder = useCallback(async (orderData) => {
        try {
            setLoading(true);
            const response = await ordersAPI.create(orderData);
            const normalized = mapOrder(response);
            setOrders(prev => [normalized, ...prev]);
            setError(null);
            return { success: true, order: normalized };
        } catch (err) {
            console.error('[OrderContext] Error placing order:', err);
            if (err.response?.data) {
                console.error('[OrderContext] Error details:', err.response.data);
            }
            const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to place order';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [mapOrder]);

    const getOrderDetail = useCallback(async (id) => {
        try {
            setLoading(true);
            const data = await ordersAPI.getById(id);
            return mapOrder(data);
        } catch (err) {
            console.error('[OrderContext] Error fetching order detail:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [mapOrder]);

    const value = useMemo(() => ({
        orders,
        loading,
        error,
        fetchOrders,
        placeOrder,
        getOrderDetail
    }), [orders, loading, error, fetchOrders, placeOrder, getOrderDetail]);

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) throw new Error('useOrders must be used within OrderProvider');
    return context;
}
