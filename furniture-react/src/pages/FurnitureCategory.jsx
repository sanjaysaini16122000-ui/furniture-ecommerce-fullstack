import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ProductCard from '../components/ProductCard';
import FilterSidebar, { useAdvancedFilters } from '../components/FilterSidebar';
import { WhatsAppLink } from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';

// SVG grid icons for consistent rendering
const GridIcon = ({ cols }) => {
    const gap = 1;
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: cols }).map((_, i) => {
                const totalGaps = (cols - 1) * gap;
                const w = (16 - totalGaps) / cols;
                const x = i * (w + gap);
                return (
                    <g key={i}>
                        <rect x={x} y="0" width={w} height="3.2" rx="0.5" fill="currentColor" />
                        <rect x={x} y="4.3" width={w} height="3.2" rx="0.5" fill="currentColor" />
                        <rect x={x} y="8.6" width={w} height="3.2" rx="0.5" fill="currentColor" />
                        <rect x={x} y="12.8" width={w} height="3.2" rx="0.5" fill="currentColor" />
                    </g>
                );
            })}
        </svg>
    );
};

const GRID_OPTIONS = [
    { cols: 1, label: 'List' },
    { cols: 2, label: '2 Columns' },
    { cols: 3, label: '3 Columns' },
    { cols: 4, label: '4 Columns' },
    { cols: 5, label: '5 Columns' },
];

export default function FurnitureCategory() {
    const { categorySlug } = useParams();
    const { furniture, categories } = useData();
    const [gridCols, setGridCols] = useState(3);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const categoryName = categories.find(cat =>
        cat.toLowerCase().replace(/\s+/g, '-') === categorySlug
    ) || categorySlug;

    const categoryProducts = furniture.filter(item => {
        const itemCategorySlug = item.category?.toLowerCase().replace(/\s+/g, '-');
        return itemCategorySlug === categorySlug || item.category === categoryName;
    });

    const activeCategories = categories.filter(cat =>
        furniture.some(item => item.category === cat)
    );

    const {
        filtered: displayProducts,
        searchQuery,
        setSearchQuery,
        selectedCategories,
        setSelectedCategories,
        priceRange,
        setPriceRange,
        sortBy,
        setSortBy,
        productCountByCategory,
    } = useAdvancedFilters(categoryProducts, activeCategories);

    const activeFilterCount =
        selectedCategories.length +
        (priceRange !== 'all' ? 1 : 0) +
        (sortBy !== 'default' ? 1 : 0) +
        (searchQuery.trim() ? 1 : 0);

    const getCategoryEmoji = (category) => {
        const emojis = {
            'Sofa Sets': '🛋️', 'Beds': '🛏️', 'Wardrobes': '👔', 'Dining': '🍽️',
            'TV Units': '📺', 'Center Tables': '🪑', 'Study Tables': '📚',
            'Dressing Tables': '🪞', 'Shoe Racks': '👟', 'Temple Units': '🛕', 'Custom': '🎨'
        };
        return emojis[category] || '🪑';
    };

    return (
        <>
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <Link to="/furniture">Furniture</Link>
                        <span>/</span>
                        <span>{categoryName}</span>
                    </div>
                    <h1 className="gradient-text">{getCategoryEmoji(categoryName)} {categoryName}</h1>
                    <p>Browse our complete collection of {categoryName.toLowerCase()} ({categoryProducts.length} products)</p>
                </div>
            </section>

            {/* Filters + Products */}
            <section className="section section-light">
                <div className="container">
                    {/* Filter Sidebar (overlay panel) */}
                    <FilterSidebar
                        categories={activeCategories}
                        selectedCategories={selectedCategories}
                        onCategoryChange={setSelectedCategories}
                        priceRange={priceRange}
                        onPriceRangeChange={setPriceRange}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        productCountByCategory={productCountByCategory}
                        totalCount={categoryProducts.length}
                        filteredCount={displayProducts.length}
                        isOpen={filtersOpen}
                        onClose={() => setFiltersOpen(false)}
                    />

                    {/* Grid Toolbar */}
                    <div className="grid-toolbar">
                        <div className="grid-toolbar-left">
                            <button
                                className={`filter-toggle-btn ${filtersOpen ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
                                onClick={() => setFiltersOpen(!filtersOpen)}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M1 3h14v1.5H1V3zm2 4h10v1.5H3V7zm3 4h4v1.5H6V11z" />
                                </svg>
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="filter-toggle-badge">{activeFilterCount}</span>
                                )}
                            </button>
                            <span className="grid-toolbar-count">
                                Showing <strong>{displayProducts.length}</strong> of {categoryProducts.length} products
                            </span>
                        </div>
                        <div className="grid-toolbar-right">
                            <div className="grid-layout-icons">
                                {GRID_OPTIONS.map(opt => (
                                    <button
                                        key={opt.cols}
                                        className={`grid-icon-btn ${gridCols === opt.cols ? 'active' : ''}`}
                                        onClick={() => setGridCols(opt.cols)}
                                        title={opt.label}
                                    >
                                        <GridIcon cols={opt.cols} />
                                    </button>
                                ))}
                            </div>
                            <select
                                className="grid-sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="default">Sort: Default</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Alphabetically, A-Z</option>
                                <option value="name-desc">Alphabetically, Z-A</option>
                            </select>
                        </div>
                    </div>

                    {displayProducts.length > 0 ? (
                        <div
                            className={`cards-grid ${gridCols === 1 ? 'cards-grid-list' : ''}`}
                            style={gridCols > 1 ? { gridTemplateColumns: `repeat(${gridCols}, 1fr)` } : undefined}
                        >
                            {displayProducts.map((item, index) => (
                                <ScrollReveal key={item.id} animation="fade-up" delay={Math.min(index * 60, 400)}>
                                    <ProductCard item={item} variant={gridCols === 1 ? 'list' : 'grid'} />
                                </ScrollReveal>
                            ))}
                        </div>
                    ) : (
                        <ScrollReveal animation="zoom-in">
                            <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
                                <span style={{ fontSize: '3rem' }}>🔍</span>
                                <p>No products match your filters</p>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategories([]);
                                        setPriceRange('all');
                                        setSortBy('default');
                                    }}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </ScrollReveal>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="section section-cta-glow">
                <div className="container">
                    <ScrollReveal animation="zoom-in">
                        <div className="section-header">
                            <h2 className="gradient-text">Need Custom {categoryName}?</h2>
                            <p>Share your requirements and get a personalized quote</p>
                            <br />
                            <WhatsAppLink
                                message={`Hello, I need custom ${categoryName}. Please share more details.`}
                                productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                                className="btn-glow"
                            >
                                Get Custom Quote
                            </WhatsAppLink>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}
