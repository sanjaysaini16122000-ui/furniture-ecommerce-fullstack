import { useState } from 'react';

/**
 * Reusable filter bar for product listing pages.
 * Provides search, price range presets, sort options, and result count.
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
    { label: 'Default', value: 'default' },
    { label: 'Price: Low → High', value: 'price-asc' },
    { label: 'Price: High → Low', value: 'price-desc' },
    { label: 'Name: A → Z', value: 'name-asc' },
    { label: 'Name: Z → A', value: 'name-desc' },
];

export default function FilterBar({
    totalCount,
    filteredCount,
    searchQuery,
    onSearchChange,
    priceRange,
    onPriceRangeChange,
    sortBy,
    onSortChange,
    showPriceFilter = true
}) {
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    const activeFilterCount =
        (searchQuery ? 1 : 0) +
        (priceRange !== 'all' ? 1 : 0) +
        (sortBy !== 'default' ? 1 : 0);

    const handleClearAll = () => {
        onSearchChange('');
        onPriceRangeChange('all');
        onSortChange('default');
    };

    return (
        <div className="filter-bar">
            {/* Top Row: Search + Sort + Mobile Toggle */}
            <div className="filter-bar-top">
                <div className="filter-search">
                    <span className="filter-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="filter-search-input"
                        aria-label="Search products"
                    />
                    {searchQuery && (
                        <button
                            className="filter-search-clear"
                            onClick={() => onSearchChange('')}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="filter-sort">
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="filter-sort-select"
                        aria-label="Sort products"
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <button
                    className={`filter-toggle-btn ${filtersExpanded ? 'active' : ''}`}
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    aria-expanded={filtersExpanded}
                    aria-label="Toggle filters"
                >
                    <span>⚙️ Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="filter-badge">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            {/* Expandable Filters Row */}
            <div className={`filter-bar-expanded ${filtersExpanded ? 'open' : ''}`}>
                {showPriceFilter && (
                    <div className="filter-group">
                        <label className="filter-group-label">Price Range</label>
                        <div className="filter-chips">
                            {PRICE_RANGES.map(range => (
                                <button
                                    key={range.key}
                                    className={`filter-chip ${priceRange === range.key ? 'active' : ''}`}
                                    onClick={() => onPriceRangeChange(range.key)}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeFilterCount > 0 && (
                    <button className="filter-clear-all" onClick={handleClearAll}>
                        ✕ Clear All Filters
                    </button>
                )}
            </div>

            {/* Results Count */}
            <div className="filter-results">
                <span>
                    Showing <strong>{filteredCount}</strong> of {totalCount} products
                </span>
            </div>
        </div>
    );
}

/**
 * Hook to manage filter state and apply filters to a product array.
 */
export function useProductFilters(products) {
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    // Apply filters
    let filtered = [...products];

    // 1. Search filter
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(item =>
            item.name?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.category?.toLowerCase().includes(query)
        );
    }

    // 2. Price range filter
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

    // 3. Sort
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
        priceRange,
        setPriceRange,
        sortBy,
        setSortBy,
        isFiltering: searchQuery.trim() || priceRange !== 'all' || sortBy !== 'default',
    };
}
