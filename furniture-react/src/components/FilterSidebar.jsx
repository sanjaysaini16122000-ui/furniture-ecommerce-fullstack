import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Sidebar filter component.
 * Opens/closes via a button toggle from the parent.
 * On all screen sizes it slides in from the left as an overlay panel.
 */

const PRICE_RANGES = [
    { label: 'All Prices', min: 0, max: Infinity, key: 'all' },
    { label: 'Under ₹10K', min: 0, max: 10000, key: 'under10k' },
    { label: '₹10K – ₹25K', min: 10000, max: 25000, key: '10k-25k' },
    { label: '₹25K – ₹50K', min: 25000, max: 50000, key: '25k-50k' },
    { label: '₹50K – ₹1L', min: 50000, max: 100000, key: '50k-1l' },
    { label: '₹1L+', min: 100000, max: Infinity, key: 'above1l' },
];

const SORT_OPTIONS = [
    { label: 'Default', value: 'default', icon: '⚡' },
    { label: 'Price: Low → High', value: 'price-asc', icon: '↑' },
    { label: 'Price: High → Low', value: 'price-desc', icon: '↓' },
    { label: 'Name: A → Z', value: 'name-asc', icon: '🔤' },
    { label: 'Name: Z → A', value: 'name-desc', icon: '🔤' },
];

const CATEGORY_EMOJIS = {
    'Sofa Sets': '🛋️',
    'Beds': '🛏️',
    'Wardrobes': '👔',
    'Dining': '🍽️',
    'TV Units': '📺',
    'Center Tables': '🪑',
    'Study Tables': '📚',
    'Dressing Tables': '🪞',
    'Shoe Racks': '👟',
    'Temple Units': '🛕',
    'Custom': '🎨',
};

export default function FilterSidebar({
    categories = [],
    selectedCategories = [],
    onCategoryChange,
    priceRange = 'all',
    onPriceRangeChange,
    sortBy = 'default',
    onSortChange,
    searchQuery = '',
    onSearchChange,
    productCountByCategory = {},
    totalCount = 0,
    filteredCount = 0,
    isOpen = false,
    onClose,
}) {
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
        sort: false,
    });
    const sidebarRef = useRef(null);

    // Lock body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleCategoryToggle = (category) => {
        if (onCategoryChange) {
            const isSelected = selectedCategories.includes(category);
            if (isSelected) {
                onCategoryChange(selectedCategories.filter(c => c !== category));
            } else {
                onCategoryChange([...selectedCategories, category]);
            }
        }
    };

    const activeFilterCount =
        selectedCategories.length +
        (priceRange !== 'all' ? 1 : 0) +
        (sortBy !== 'default' ? 1 : 0) +
        (searchQuery.trim() ? 1 : 0);

    const handleClearAll = () => {
        onSearchChange?.('');
        onCategoryChange?.([]);
        onPriceRangeChange?.('all');
        onSortChange?.('default');
    };

    const removeFilter = (type, value) => {
        switch (type) {
            case 'category':
                onCategoryChange?.(selectedCategories.filter(c => c !== value));
                break;
            case 'price':
                onPriceRangeChange?.('all');
                break;
            case 'sort':
                onSortChange?.('default');
                break;
            case 'search':
                onSearchChange?.('');
                break;
        }
    };

    const handleClose = () => {
        onClose?.();
    };

    return createPortal(
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="filter-sidebar-overlay active"
                    onClick={handleClose}
                />
            )}

            {/* Sidebar Panel */}
            <aside
                ref={sidebarRef}
                className={`filter-sidebar-panel ${isOpen ? 'open' : ''}`}
            >
                <div className="filter-sidebar-inner">
                    {/* Header */}
                    <div className="filter-sidebar-header">
                        <h3>
                            <span className="filter-sidebar-icon">⚙️</span>
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="filter-header-badge">{activeFilterCount}</span>
                            )}
                        </h3>
                        <div className="filter-header-actions">
                            {activeFilterCount > 0 && (
                                <button className="filter-sidebar-clear" onClick={handleClearAll}>
                                    Clear All
                                </button>
                            )}
                            <button
                                className="filter-sidebar-close"
                                onClick={handleClose}
                                aria-label="Close filters"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="filter-sidebar-search">
                        <span className="filter-sidebar-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="filter-sidebar-search-input"
                            aria-label="Search products"
                        />
                        {searchQuery && (
                            <button
                                className="filter-sidebar-search-clear"
                                onClick={() => onSearchChange?.('')}
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Active Filters Pills */}
                    {activeFilterCount > 0 && (
                        <div className="filter-active-pills">
                            {searchQuery.trim() && (
                                <span className="filter-pill">
                                    🔍 "{searchQuery}"
                                    <button onClick={() => removeFilter('search')}>✕</button>
                                </span>
                            )}
                            {selectedCategories.map(cat => (
                                <span key={cat} className="filter-pill">
                                    {CATEGORY_EMOJIS[cat] || '🪑'} {cat}
                                    <button onClick={() => removeFilter('category', cat)}>✕</button>
                                </span>
                            ))}
                            {priceRange !== 'all' && (
                                <span className="filter-pill">
                                    💰 {PRICE_RANGES.find(r => r.key === priceRange)?.label}
                                    <button onClick={() => removeFilter('price')}>✕</button>
                                </span>
                            )}
                            {sortBy !== 'default' && (
                                <span className="filter-pill">
                                    🔄 {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                                    <button onClick={() => removeFilter('sort')}>✕</button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Results Count */}
                    <div className="filter-sidebar-results">
                        Showing <strong>{filteredCount}</strong> of {totalCount} products
                    </div>

                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className={`filter-section ${expandedSections.category ? 'expanded' : ''}`}>
                            <button
                                className="filter-section-title"
                                onClick={() => toggleSection('category')}
                                aria-expanded={expandedSections.category}
                            >
                                <span>📂 Category</span>
                                <span className="filter-section-arrow">
                                    {expandedSections.category ? '▾' : '▸'}
                                </span>
                            </button>
                            <div className="filter-section-content">
                                <div className="filter-category-list">
                                    {categories.map(cat => {
                                        const count = productCountByCategory[cat] || 0;
                                        const isSelected = selectedCategories.includes(cat);
                                        return (
                                            <label
                                                key={cat}
                                                className={`filter-category-item ${isSelected ? 'active' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleCategoryToggle(cat)}
                                                    className="filter-category-checkbox"
                                                />
                                                <span className="filter-category-emoji">
                                                    {CATEGORY_EMOJIS[cat] || '🪑'}
                                                </span>
                                                <span className="filter-category-name">{cat}</span>
                                                <span className="filter-category-count">({count})</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price Range Filter */}
                    <div className={`filter-section ${expandedSections.price ? 'expanded' : ''}`}>
                        <button
                            className="filter-section-title"
                            onClick={() => toggleSection('price')}
                            aria-expanded={expandedSections.price}
                        >
                            <span>💰 Price Range</span>
                            <span className="filter-section-arrow">
                                {expandedSections.price ? '▾' : '▸'}
                            </span>
                        </button>
                        <div className="filter-section-content">
                            <div className="filter-price-list">
                                {PRICE_RANGES.map(range => (
                                    <button
                                        key={range.key}
                                        className={`filter-price-item ${priceRange === range.key ? 'active' : ''}`}
                                        onClick={() => onPriceRangeChange?.(range.key)}
                                    >
                                        <span className="filter-price-radio">
                                            {priceRange === range.key ? '●' : '○'}
                                        </span>
                                        <span>{range.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className={`filter-section ${expandedSections.sort ? 'expanded' : ''}`}>
                        <button
                            className="filter-section-title"
                            onClick={() => toggleSection('sort')}
                            aria-expanded={expandedSections.sort}
                        >
                            <span>🔄 Sort By</span>
                            <span className="filter-section-arrow">
                                {expandedSections.sort ? '▾' : '▸'}
                            </span>
                        </button>
                        <div className="filter-section-content">
                            <div className="filter-sort-list">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`filter-sort-item ${sortBy === opt.value ? 'active' : ''}`}
                                        onClick={() => onSortChange?.(opt.value)}
                                    >
                                        <span className="filter-sort-radio">
                                            {sortBy === opt.value ? '●' : '○'}
                                        </span>
                                        <span>{opt.icon} {opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>,
        document.body
    );
}

/**
 * Hook to manage advanced filter state (categories + price + sort + search).
 */
export function useAdvancedFilters(products, allCategories = []) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    // Compute product counts per category (based on all products, not filtered)
    const productCountByCategory = {};
    allCategories.forEach(cat => {
        productCountByCategory[cat] = products.filter(
            item => item.category === cat
        ).length;
    });

    // Apply filters
    let filtered = [...products];

    // 1. Category filter
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(item =>
            selectedCategories.includes(item.category)
        );
    }

    // 2. Search filter
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(item =>
            item.name?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.category?.toLowerCase().includes(query)
        );
    }

    // 3. Price range filter
    if (priceRange !== 'all') {
        const range = PRICE_RANGES.find(r => r.key === priceRange);
        if (range) {
            filtered = filtered.filter(item => {
                const price = Number(item.price) || 0;
                if (price === 0) return true; // Keep "Get Quote" items visible
                return price >= range.min && price < range.max;
            });
        }
    }

    // 4. Sort
    switch (sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
            break;
        case 'price-desc':
            filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
            break;
        case 'name-asc':
            filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name-desc':
            filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
        default:
            break;
    }

    return {
        filtered,
        searchQuery,
        setSearchQuery,
        selectedCategories,
        setSelectedCategories,
        priceRange,
        setPriceRange,
        sortBy,
        setSortBy,
        productCountByCategory,
        isFiltering:
            searchQuery.trim() ||
            selectedCategories.length > 0 ||
            priceRange !== 'all' ||
            sortBy !== 'default',
    };
}
