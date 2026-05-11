import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { initialData } from '../data/initialData';
import { productsAPI, MEDIA_URL } from '../services/api';

const DataContext = createContext();

export function useData() {
    return useContext(DataContext);
}

// Helper to normalize image URLs
export const normalizeImage = (img) => {
    if (!img) return '';
    const url = typeof img === 'string' ? img : (img.image || img.url || '');
    if (!url) return '';

    // If it's already a full URL or data URI, return as is
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    const base = MEDIA_URL.replace('/media', '').replace(/\/$/, '');

    // IMPORTANT: Check if the path starts with /media/ or media/
    // This is a more robust check than .includes('/media/')
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;

    if (normalizedPath.startsWith('/media/')) {
        return `${base}${normalizedPath}`;
    }

    // Otherwise prepend the full MEDIA_URL
    const mediaBase = MEDIA_URL.replace(/\/$/, '');
    return `${mediaBase}${normalizedPath}`;
};

// Helper to map backend product to frontend shape
export const mapBackendProduct = (p, categories = []) => {
    if (!p) return null;

    // Backend may return images list (detail) or primary_image (list)
    const sourceImages = Array.isArray(p.images) ? p.images :
        (p.primary_image ? [p.primary_image] :
            (p.image ? [p.image] : []));

    const productImages = sourceImages.map(normalizeImage).filter(Boolean);
    const itemCategoryRaw = typeof p.category === 'string' ? p.category : (p.category?.name || p.category_name || '');
    const itemCategory = categories.find(c => (c || '').toLowerCase().trim() === itemCategoryRaw.toLowerCase().trim()) || itemCategoryRaw;

    return {
        ...p, // Spread first to allow overwriting
        id: p.id,
        name: p.name || p.title,
        description: p.description,
        price: Number(p.price || 0),
        originalPrice: Number(p.original_price || p.compare_at_price || 0),
        category: itemCategory,
        images: productImages,
        image: productImages[0] || '',
        material: p.material || '',
        dimensions: p.dimensions || '',
        inStock: p.in_stock !== undefined ? p.in_stock : true,
        featured: p.is_featured || p.featured || false,
    };
};

export function DataProvider({ children }) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from Django backend
    const loadDataFromBackend = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch products from Django backend
            let products = [];
            try {
                const response = await productsAPI.getAll();
                // Handle paginated response
                products = response.results || response || [];
                console.log('[DataContext] Loaded products from backend:', products.length);
            } catch (err) {
                console.warn('[DataContext] Could not fetch products from backend:', err.message);
            }

            // Fetch categories from Django backend
            let categories = initialData.categories || [];
            try {
                const catResponse = await productsAPI.getCategories();
                const backendCategories = catResponse.results || catResponse || [];
                console.log('[DataContext] Loaded categories from backend:', backendCategories.length);
                if (backendCategories.length > 0) {
                    categories = backendCategories.map(c => typeof c === 'string' ? c : (c.name || c.title || c));
                }
            } catch (err) {
                console.warn('[DataContext] Could not fetch categories from backend:', err.message);
            }

            // Map backend products to frontend shape if needed
            const furniture = products.map(p => mapBackendProduct(p, categories));

            console.log('[DataContext] Final furniture count:', furniture.length);
            const categoryCounts = {};
            furniture.forEach(item => {
                categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            });
            console.log('[DataContext] Category distribution in products:', categoryCounts);
            console.log('[DataContext] Final categories list:', categories);

            setData(prev => ({
                ...prev,
                furniture: furniture.length > 0 ? furniture : prev.furniture,
                categories: categories.length > 0 ? categories : prev.categories,
                // Keep other data from initialData for now (kitchens, projects, etc.)
                // These will be migrated when backend APIs are ready
            }));
        } catch (err) {
            console.error('[DataContext] Backend error:', err);
            setError(err.message);
            // Fallback to localStorage
            const stored = localStorage.getItem('saini_furniture_data');
            if (stored) {
                setData(JSON.parse(stored));
            }
        } finally {
            setLoading(false);
        }
    }, [mapBackendProduct, setData, setLoading, setError]);

    // Load data from Django backend on mount
    useEffect(() => {
        loadDataFromBackend();
    }, [loadDataFromBackend]);

    // Upload image — placeholder until backend supports file uploads
    const uploadImage = useCallback(async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }, []);

    const uploadImages = useCallback(async (files) => {
        const urls = await Promise.all(
            Array.from(files).map(file => uploadImage(file))
        );
        return urls;
    }, [uploadImage]);

    // Settings (local for now)
    const updateSettings = useCallback(async (newSettings) => {
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));
    }, []);

    // Categories (local for now)
    const addCategory = useCallback(async (category) => {
        setData(prev => {
            if (!prev.categories.includes(category)) {
                return { ...prev, categories: [...prev.categories, category] };
            }
            return prev;
        });
    }, []);

    const deleteCategory = useCallback(async (category) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c !== category)
        }));
    }, []);

    // Fetch full product detail from backend
    const fetchProductDetail = useCallback(async (id) => {
        try {
            const product = await productsAPI.getById(id);
            const detailedProduct = mapBackendProduct(product, data.categories);

            setData(prev => ({
                ...prev,
                furniture: prev.furniture.map(f => String(f.id) === String(id) ? detailedProduct : f)
            }));

            return detailedProduct;
        } catch (err) {
            console.error('[DataContext] Error fetching product detail:', err);
            return null;
        }
    }, [mapBackendProduct, data.categories, setData]);

    // Furniture CRUD
    const addFurniture = useCallback(async (item) => {
        const normalized = mapBackendProduct(item, data.categories);
        const newItem = { ...normalized, id: Date.now().toString(), createdAt: new Date().toISOString() };
        setData(prev => ({ ...prev, furniture: [newItem, ...prev.furniture] }));
    }, [data.categories]);

    const updateFurniture = useCallback(async (id, updates) => {
        const normalized = mapBackendProduct(updates, data.categories);
        setData(prev => ({
            ...prev,
            furniture: prev.furniture.map(item =>
                item.id === id ? { ...item, ...normalized } : item
            )
        }));
    }, [data.categories]);

    const deleteFurniture = useCallback(async (id) => {
        setData(prev => ({ ...prev, furniture: prev.furniture.filter(item => item.id !== id) }));
    }, []);

    // Kitchen CRUD (local)
    const addKitchen = useCallback(async (item) => {
        const images = (item.images || (item.image ? [item.image] : [])).map(normalizeImage).filter(Boolean);
        const newItem = { ...item, id: Date.now().toString(), images, image: images[0] || '' };
        setData(prev => ({ ...prev, kitchens: [newItem, ...prev.kitchens] }));
    }, []);

    const updateKitchen = useCallback(async (id, updates) => {
        const images = (updates.images || (updates.image ? [updates.image] : [])).map(normalizeImage).filter(Boolean);
        setData(prev => ({
            ...prev,
            kitchens: prev.kitchens.map(item =>
                item.id === id ? { ...item, ...updates, images, image: images[0] || (updates.image || item.image || '') } : item
            )
        }));
    }, []);

    const deleteKitchen = useCallback(async (id) => {
        setData(prev => ({ ...prev, kitchens: prev.kitchens.filter(item => item.id !== id) }));
    }, []);

    // Projects CRUD (local)
    const addProject = useCallback(async (item) => {
        const images = (item.images || (item.image ? [item.image] : [])).map(normalizeImage).filter(Boolean);
        const newItem = { ...item, id: Date.now().toString(), images, image: images[0] || '' };
        setData(prev => ({ ...prev, projects: [newItem, ...prev.projects] }));
    }, []);

    const updateProject = useCallback(async (id, updates) => {
        const images = (updates.images || (updates.image ? [updates.image] : [])).map(normalizeImage).filter(Boolean);
        setData(prev => ({
            ...prev,
            projects: prev.projects.map(item =>
                item.id === id ? { ...item, ...updates, images, image: images[0] || (updates.image || item.image || '') } : item
            )
        }));
    }, []);

    const deleteProject = useCallback(async (id) => {
        setData(prev => ({ ...prev, projects: prev.projects.filter(item => item.id !== id) }));
    }, []);

    // Project Categories CRUD (local)
    const addProjectCategory = useCallback(async (category) => {
        setData(prev => {
            const currentCategories = prev.projectCategories || [];
            if (!currentCategories.includes(category)) {
                return { ...prev, projectCategories: [...currentCategories, category] };
            }
            return prev;
        });
    }, []);

    const deleteProjectCategory = useCallback(async (category) => {
        setData(prev => ({
            ...prev,
            projectCategories: (prev.projectCategories || []).filter(c => c !== category)
        }));
    }, []);

    // Dashboard Images CRUD (local)
    const addDashboardImage = useCallback(async (item) => {
        const image = normalizeImage(item.image);
        const newItem = { ...item, id: Date.now().toString(), image };
        setData(prev => ({
            ...prev,
            dashboardImages: [...(prev.dashboardImages || []), newItem]
        }));
    }, []);

    const updateDashboardImage = useCallback(async (id, updates) => {
        const image = updates.image ? normalizeImage(updates.image) : undefined;
        setData(prev => ({
            ...prev,
            dashboardImages: (prev.dashboardImages || []).map(item =>
                item.id === id ? { ...item, ...updates, ...(image ? { image } : {}) } : item
            )
        }));
    }, []);

    const deleteDashboardImage = useCallback(async (id) => {
        setData(prev => ({
            ...prev,
            dashboardImages: (prev.dashboardImages || []).filter(item => item.id !== id)
        }));
    }, []);

    const updateCarouselSettings = useCallback(async (newSettings) => {
        setData(prev => ({
            ...prev,
            carouselSettings: { ...(prev.carouselSettings || {}), ...newSettings }
        }));
    }, []);

    // Messages (local)
    const addMessage = useCallback(async (message) => {
        const newMessage = { id: Date.now().toString(), ...message, timestamp: new Date().toISOString(), read: false };
        setData(prev => ({
            ...prev,
            messages: [newMessage, ...(prev.messages || [])]
        }));
    }, []);

    const markMessageRead = useCallback(async (id) => {
        setData(prev => ({
            ...prev,
            messages: (prev.messages || []).map(msg =>
                msg.id === id ? { ...msg, read: true } : msg
            )
        }));
    }, []);

    const deleteMessage = useCallback(async (id) => {
        setData(prev => ({
            ...prev,
            messages: (prev.messages || []).filter(msg => msg.id !== id)
        }));
    }, []);

    const getUnreadCount = useCallback(() => {
        return (data.messages || []).filter(msg => !msg.read).length;
    }, [data.messages]);

    const toggleTheme = useCallback(() => {
        setData(prev => {
            const newTheme = prev.settings?.theme === 'light' ? 'dark' : 'light';
            return {
                ...prev,
                settings: { ...prev.settings, theme: newTheme }
            };
        });
    }, []);

    // Reset to defaults
    const resetData = useCallback(async () => {
        setData(initialData);
    }, []);

    const value = useMemo(() => ({
        ...data,
        loading,
        error,
        useBackend: true,
        uploadImage,
        uploadImages,
        updateSettings,
        addCategory,
        deleteCategory,
        fetchProductDetail,
        addFurniture,
        updateFurniture,
        deleteFurniture,
        addKitchen,
        updateKitchen,
        deleteKitchen,
        addProject,
        updateProject,
        deleteProject,
        addProjectCategory,
        deleteProjectCategory,
        addDashboardImage,
        updateDashboardImage,
        deleteDashboardImage,
        updateCarouselSettings,
        addMessage,
        markMessageRead,
        deleteMessage,
        getUnreadCount,
        toggleTheme,
        resetData,
        refreshData: loadDataFromBackend
    }), [
        data, loading, error, uploadImage, uploadImages, updateSettings,
        addCategory, deleteCategory, fetchProductDetail, addFurniture,
        updateFurniture, deleteFurniture, addKitchen, updateKitchen,
        deleteKitchen, addProject, updateProject, deleteProject,
        addProjectCategory, deleteProjectCategory, addDashboardImage,
        updateDashboardImage, deleteDashboardImage, updateCarouselSettings,
        addMessage, markMessageRead, deleteMessage, getUnreadCount,
        toggleTheme, resetData, loadDataFromBackend
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
