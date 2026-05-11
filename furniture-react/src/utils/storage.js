/**
 * Wishlist & Recently Viewed persistence using localStorage.
 * Provides hooks for managing saved products and tracking views.
 */

const WISHLIST_KEY = 'tuk_wishlist';
const RECENTLY_VIEWED_KEY = 'tuk_recently_viewed';
const MAX_RECENTLY_VIEWED = 10;

// ============ WISHLIST ============

export function getWishlist() {
    try {
        const data = localStorage.getItem(WISHLIST_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addToWishlist(productId) {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
    return wishlist;
}

export function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    return wishlist;
}

export function isInWishlist(productId) {
    return getWishlist().includes(productId);
}

export function toggleWishlist(productId) {
    if (isInWishlist(productId)) {
        return { wishlist: removeFromWishlist(productId), added: false };
    } else {
        return { wishlist: addToWishlist(productId), added: true };
    }
}

// ============ RECENTLY VIEWED ============

export function getRecentlyViewed() {
    try {
        const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addToRecentlyViewed(productId) {
    let recent = getRecentlyViewed();
    // Remove if already exists (so it moves to front)
    recent = recent.filter(id => id !== productId);
    // Add to front
    recent.unshift(productId);
    // Keep only last N
    recent = recent.slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recent));
    return recent;
}

export function clearRecentlyViewed() {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    return [];
}
