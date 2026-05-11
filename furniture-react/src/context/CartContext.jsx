import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { mapBackendProduct } from './DataContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch cart from backend if authenticated
    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const data = await cartAPI.get();
            // Assuming backend returns { items: [...] } or just an array
            const rawItems = data.items || data || [];

            // Map the product inside each cart item to the frontend shape
            const items = rawItems.map(item => ({
                ...item,
                product: mapBackendProduct(item.product)
            }));

            setCartItems(items);
            setError(null);
        } catch (err) {
            console.error('[CartContext] Error fetching cart:', err);
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Load cart on auth change
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            // Clear cart or load from localStorage if we want guest cart
            const savedCart = localStorage.getItem('guest_cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            } else {
                setCartItems([]);
            }
        }
    }, [isAuthenticated, fetchCart]);

    // Save guest cart to localStorage
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('guest_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isAuthenticated]);

    const addToCart = useCallback(async (product, quantity = 1) => {
        try {
            if (isAuthenticated) {
                const response = await cartAPI.addItem(product.id, quantity);
                // Refresh cart from backend to be sure
                await fetchCart();
            } else {
                setCartItems(prev => {
                    const existing = prev.find(item => String(item.product.id) === String(product.id));
                    if (existing) {
                        return prev.map(item =>
                            String(item.product.id) === String(product.id)
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    }
                    return [...prev, { product, quantity, id: Date.now() }];
                });
            }
            return { success: true };
        } catch (err) {
            console.error('[CartContext] Error adding to cart:', err);
            return { success: false, error: 'Failed to add item to cart' };
        }
    }, [isAuthenticated, fetchCart]);

    const updateQuantity = useCallback(async (itemId, quantity) => {
        try {
            if (isAuthenticated) {
                await cartAPI.updateItem(itemId, quantity);
                await fetchCart();
            } else {
                setCartItems(prev =>
                    prev.map(item =>
                        item.id === itemId ? { ...item, quantity } : item
                    )
                );
            }
            return { success: true };
        } catch (err) {
            console.error('[CartContext] Error updating quantity:', err);
            return { success: false, error: 'Failed to update quantity' };
        }
    }, [isAuthenticated, fetchCart]);

    const removeFromCart = useCallback(async (itemId) => {
        try {
            if (isAuthenticated) {
                await cartAPI.removeItem(itemId);
                await fetchCart();
            } else {
                setCartItems(prev => prev.filter(item => item.id !== itemId));
            }
            return { success: true };
        } catch (err) {
            console.error('[CartContext] Error removing from cart:', err);
            return { success: false, error: 'Failed to remove item' };
        }
    }, [isAuthenticated, fetchCart]);

    const clearCart = useCallback(async () => {
        // Simple local clear for now
        setCartItems([]);
        if (!isAuthenticated) {
            localStorage.removeItem('guest_cart');
        }
    }, [isAuthenticated]);

    const cartCount = useMemo(() =>
        cartItems.reduce((total, item) => total + (item.quantity || 0), 0)
        , [cartItems]);

    const cartTotal = useMemo(() =>
        cartItems.reduce((total, item) => {
            const price = item.product?.price || 0;
            return total + (price * (item.quantity || 0));
        }, 0)
        , [cartItems]);

    const value = useMemo(() => ({
        cartItems,
        cartCount,
        cartTotal,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
    }), [cartItems, cartCount, cartTotal, loading, error, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
