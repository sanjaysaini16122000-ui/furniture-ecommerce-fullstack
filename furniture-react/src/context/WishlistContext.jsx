import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { mapBackendProduct } from './DataContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWishlist = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const data = await wishlistAPI.get();
            // Assuming backend returns an array of items, each having a 'product' field
            const rawItems = data.results || data || [];

            const items = rawItems.map(item => ({
                ...item,
                product: mapBackendProduct(item.product)
            }));

            setWishlistItems(items);
            setError(null);
        } catch (err) {
            console.error('[WishlistContext] Error fetching wishlist:', err);
            setError('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            // Check local storage for guest wishlist
            const saved = localStorage.getItem('guest_wishlist');
            if (saved) {
                setWishlistItems(JSON.parse(saved));
            } else {
                setWishlistItems([]);
            }
        }
    }, [isAuthenticated, fetchWishlist]);

    // Save guest wishlist
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('guest_wishlist', JSON.stringify(wishlistItems));
        }
    }, [wishlistItems, isAuthenticated]);

    const addToWishlist = useCallback(async (product) => {
        try {
            if (isAuthenticated) {
                await wishlistAPI.add(product.id);
                await fetchWishlist();
            } else {
                setWishlistItems(prev => {
                    if (prev.find(item => String(item.product.id) === String(product.id))) return prev;
                    return [...prev, { product, id: Date.now() }];
                });
            }
            return { success: true };
        } catch (err) {
            console.error('[WishlistContext] Error adding to wishlist:', err);
            return { success: false, error: 'Failed to add to wishlist' };
        }
    }, [isAuthenticated, fetchWishlist]);

    const removeFromWishlist = useCallback(async (itemId) => {
        try {
            if (isAuthenticated) {
                await wishlistAPI.remove(itemId);
                await fetchWishlist();
            } else {
                setWishlistItems(prev => prev.filter(item => item.id !== itemId));
            }
            return { success: true };
        } catch (err) {
            console.error('[WishlistContext] Error removing from wishlist:', err);
            return { success: false, error: 'Failed to remove from wishlist' };
        }
    }, [isAuthenticated, fetchWishlist]);

    const isInWishlist = useCallback((productId) => {
        return wishlistItems.some(item => String(item.product.id) === String(productId));
    }, [wishlistItems]);

    const toggleWishlist = useCallback(async (product) => {
        const existingItem = wishlistItems.find(item => String(item.product.id) === String(product.id));
        if (existingItem) {
            return await removeFromWishlist(existingItem.id);
        } else {
            return await addToWishlist(product);
        }
    }, [wishlistItems, addToWishlist, removeFromWishlist]);

    const value = useMemo(() => ({
        wishlistItems,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist
    }), [wishlistItems, loading, error, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, fetchWishlist]);

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
}
