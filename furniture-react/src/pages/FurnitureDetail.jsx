import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { WhatsAppLink } from '../components/WhatsAppButton';
import ImageGallery from '../components/ImageGallery';
import ShareButton from '../components/ShareButton';
import ScrollReveal from '../components/ScrollReveal';
import ProductCard from '../components/ProductCard';
import { addToRecentlyViewed } from '../utils/storage';
import '../styles/furniture-detail.css';

const DEFAULT_FINISHES = [
    { name: 'Teak Finish', color: '#8B4513' },
    { name: 'Walnut Finish', color: '#5D4037' },
    { name: 'Sheesham Finish', color: '#4E342E' },
    { name: 'Natural Finish', color: '#A1887F' }
];

const DEFAULT_FEATURES_BY_CATEGORY = {
    'Sofa Sets': ['Premium Upholstery', 'Kiln-dried Solid Wood', 'High-density Foam', 'Ergonomic Support', 'Stain Resistant', 'Hand-tufted Details'],
    'Beds': ['Solid Teak Wood', 'Hydraulic Storage', 'Premium Finish', 'Anti-termite Treated', 'Heavy-duty Slat System', 'Polished Edges'],
    'Dining': ['Solid Wood Table Top', 'High-back Chairs', 'Heat Resistant Finish', 'Smooth Polished Surface', 'Compact Design', 'Spacious Seating'],
    'default': ['Premium Quality', 'Handcrafted', 'Durable Construction', 'Elegant Design', 'Easy Maintenance', 'Sustainable Wood']
};

const TRUST_BADGES = [
    { icon: '🛡️', label: '5-Year Warranty' },
    { icon: '🚚', label: 'Free Delivery' },
    { icon: '🔧', label: 'Expert Assembly' },
    { icon: '🍃', label: 'Eco-Friendly' }
];

export default function FurnitureDetail() {
    const { id } = useParams();
    const { furniture, fetchProductDetail } = useData();
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistAnim, setWishlistAnim] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedFinish, setSelectedFinish] = useState(0);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);
    const [addStatus, setAddStatus] = useState(null); // 'success', 'error', null
    const [buyNowLoading, setBuyNowLoading] = useState(false);
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const item = furniture.find(f => String(f.id) === String(id));

    useEffect(() => {
        if (id) {
            setIsFetchingDetail(true);
            fetchProductDetail(id).finally(() => {
                setIsFetchingDetail(false);
            });
        }
    }, [id, fetchProductDetail]);

    useEffect(() => {
        if (item) {
            setWishlisted(isInWishlist(item.id));
            addToRecentlyViewed(item.id);
        }
    }, [item, isInWishlist]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setCurrentImageIndex(0);
    }, [id]);

    if (!item) {
        return (
            <div className="pd-not-found-page">
                <div className="container">
                    <div className="pd-breadcrumb-bar">
                        <div className="breadcrumb">
                            <Link to="/">Home</Link><span>/</span>
                            <Link to="/furniture">Furniture</Link><span>/</span>
                            <span>Not Found</span>
                        </div>
                    </div>
                    <div className="pd-not-found-content glass-card">
                        <div className="pd-no-image">🪑</div>
                        <h1>Product Not Found</h1>
                        <p>The product you're looking for doesn't exist or has been removed.</p>
                        <Link to="/furniture" className="pd-btn pd-btn-cart">Browse All Furniture</Link>
                    </div>
                </div>
            </div>
        );
    }

    let images = item.images || (item.image ? [item.image] : []);
    images = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    const mainImage = images.length > 0 ? images[currentImageIndex] : null;

    const formatPrice = (price) => {
        if (!price || price === 0) return null;
        return '₹' + Number(price).toLocaleString('en-IN');
    };

    const handleWishlistToggle = async () => {
        const result = await toggleWishlist(item);
        if (result.success) {
            const added = isInWishlist(item.id);
            setWishlisted(added);
            if (added) {
                setWishlistAnim(true);
                setTimeout(() => setWishlistAnim(false), 600);
            }
        }
    };

    const hasDiscount = !!(item.originalPrice && item.price && item.originalPrice > item.price);
    const discountPercent = hasDiscount
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

    const rating = item.rating || 4.8;
    const reviewCount = item.reviewCount || '1500+';

    const features = (item.features && item.features.length > 0)
        ? item.features
        : (DEFAULT_FEATURES_BY_CATEGORY[item.category] || DEFAULT_FEATURES_BY_CATEGORY['default']);

    const finishes = (item.finishes && item.finishes.length > 0)
        ? item.finishes
        : DEFAULT_FINISHES;

    const relatedProducts = furniture
        .filter(f => f.category === item.category && f.id !== item.id)
        .slice(0, 4);

    const productUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/furniture/${item.id}`
        : '';

    const getCategorySlug = (cat) => cat?.toLowerCase().replace(/\s+/g, '-');

    const renderStars = (r) => {
        const full = Math.floor(r);
        const half = r % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return (
            <span className="pd-stars">
                {'★'.repeat(full)}{half ? '⯨' : ''}{'☆'.repeat(empty)}
            </span>
        );
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            navigate(`/login?redirect=/furniture/${item.id}`);
            return;
        }

        setBuyNowLoading(true);
        try {
            const productForCart = {
                ...item,
                finish: selectedFinish !== null ? finishes[selectedFinish]?.name : null
            };
            const result = await addToCart(productForCart, quantity);
            if (result.success) {
                navigate('/checkout');
            } else {
                setAddStatus('error');
                setTimeout(() => setAddStatus(null), 3000);
            }
        } catch (err) {
            console.error('[FurnitureDetail] Buy now error:', err);
            setAddStatus('error');
            setTimeout(() => setAddStatus(null), 3000);
        } finally {
            setBuyNowLoading(false);
        }
    };

    const handleAddToCart = async () => {
        const productForCart = {
            ...item,
            finish: selectedFinish !== null ? finishes[selectedFinish]?.name : null
        };
        const result = await addToCart(productForCart, quantity);
        if (result.success) {
            setAddStatus('success');
            setTimeout(() => setAddStatus(null), 3000);
        } else {
            setAddStatus('error');
            setTimeout(() => setAddStatus(null), 3000);
        }
    };

    return (
        <div className="pd-page-wrapper">
            <div className="pd-breadcrumb-bar">
                <div className="container pd-breadcrumb-container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>›</span>
                        {item.category && (
                            <>
                                <Link to={`/furniture/category/${getCategorySlug(item.category)}`}>{item.category}</Link>
                                <span>›</span>
                            </>
                        )}
                        <span className="breadcrumb-current">{item.name}</span>
                    </div>
                </div>
            </div>

            <section className="section pd-section">
                <div className="container">
                    <div className="pd-grid">
                        <div className="pd-images">
                            <div
                                className="pd-main-image"
                                onClick={() => images.length > 0 && setGalleryOpen(true)}
                            >
                                {mainImage ? (
                                    <img src={mainImage} alt={item.name} />
                                ) : (
                                    <div className="pd-no-image">🪑</div>
                                )}

                                {hasDiscount && (
                                    <div className="pd-discount-badge">
                                        <span>SAVE {discountPercent}%</span>
                                    </div>
                                )}

                                <button
                                    className={`card-wishlist ${wishlisted ? 'active' : ''} ${wishlistAnim ? 'pop' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); handleWishlistToggle(); }}
                                >
                                    {wishlisted ? '❤️' : '🤍'}
                                </button>

                                <span className="pd-fullscreen-icon">⛶</span>
                            </div>

                            {images.length > 1 && (
                                <div className="pd-thumbnails">
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            className={`pd-thumb ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        >
                                            <img src={img} alt={`${item.name} ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pd-info">
                            <ScrollReveal animation="fade-up">
                                <div className="pd-rating-row">
                                    <div className="pd-rating-stars">
                                        {renderStars(rating)}
                                    </div>
                                    <span className="pd-rating-text">
                                        {rating} <span className="pd-rating-sep">|</span> {reviewCount} Verified Reviews
                                    </span>
                                </div>

                                <h1 className="pd-title">{item.name}</h1>

                                <div className="pd-price-row">
                                    {hasDiscount && (
                                        <span className="pd-price-original">Rs. {Number(item.originalPrice).toLocaleString('en-IN')}</span>
                                    )}
                                    {item.price && item.price > 0 ? (
                                        <span className="pd-price-sale">Rs. {Number(item.price).toLocaleString('en-IN')}</span>
                                    ) : (
                                        <span className="pd-price-quote">Get Quote on WhatsApp</span>
                                    )}
                                </div>

                                <div className="pd-features-box glass-card">
                                    {features.slice(0, 6).map((feature, i) => (
                                        <div key={i} className="pd-feature-item">
                                            <span className="pd-feature-check">✦</span>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pd-trust-badges">
                                    {TRUST_BADGES.map((badge, i) => (
                                        <div key={i} className="pd-trust-badge shadow-soft">
                                            <span className="pd-trust-icon">{badge.icon}</span>
                                            <span className="pd-trust-label">{badge.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {item.description && (
                                    <div className="pd-description">
                                        <p>{item.description}</p>
                                    </div>
                                )}

                                <div className="pd-finish-section">
                                    <h4 className="pd-section-label">Select Finish</h4>
                                    <div className="pd-finish-grid">
                                        {finishes.map((finish, i) => (
                                            <button
                                                key={i}
                                                className={`pd-finish-option ${i === selectedFinish ? 'active' : ''}`}
                                                onClick={() => setSelectedFinish(i)}
                                            >
                                                <span
                                                    className="pd-finish-swatch"
                                                    style={{ background: finish.color || '#8B6914' }}
                                                />
                                                <span className="pd-finish-name">{finish.name || finish}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pd-cart-row">
                                    <div className="pd-quantity shadow-soft">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity(q => q + 1)}>+</button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className={`pd-btn pd-btn-cart ${addStatus === 'success' ? 'success' : ''}`}
                                    >
                                        {addStatus === 'success' ? '✓ ADDED' : 'ADD TO CART'}
                                    </button>
                                </div>

                                {addStatus === 'error' && (
                                    <p className="pd-error-msg">Failed to add to cart. Please try again.</p>
                                )}

                                <button
                                    className="pd-btn pd-btn-buy"
                                    onClick={handleBuyNow}
                                    disabled={buyNowLoading}
                                >
                                    {buyNowLoading ? 'PROCESSING...' : 'BUY IT NOW'}
                                </button>

                                <button
                                    className="pd-btn pd-btn-visualize"
                                    onClick={() => navigate(`/visualizer?product_id=${item.id}`)}
                                >
                                    ✨ VISUALIZE IN YOUR ROOM
                                </button>

                                <div className="pd-secondary-actions">
                                    <WhatsAppLink
                                        message={`Hello, I am interested in ${item.name}${item.price && item.price > 0 ? ' (Price: ' + formatPrice(item.price) + ')' : ''}. Please share more details.`}
                                        productUrl={productUrl}
                                        className="pd-action-link"
                                    >
                                        💬 Enquire on WhatsApp
                                    </WhatsAppLink>

                                    <ShareButton
                                        productName={item.name}
                                        productPrice={formatPrice(item.price)}
                                        productImage={mainImage}
                                        productDescription={item.description}
                                        productCategory={item.category}
                                        productId={item.id}
                                    />
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </section>

            {relatedProducts.length > 0 && (
                <section className="section section-warm pd-related-section">
                    <div className="container">
                        <ScrollReveal animation="fade-up">
                            <div className="section-header">
                                <h2 className="gradient-text">You May Also Like</h2>
                                <p>Discover more premium furniture in {item.category}</p>
                            </div>
                        </ScrollReveal>
                        <div className="cards-grid">
                            {relatedProducts.map((related, index) => (
                                <ScrollReveal key={related.id} animation="fade-up" delay={index * 100}>
                                    <ProductCard item={related} />
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <ImageGallery
                images={images}
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                initialIndex={currentImageIndex}
            />
        </div>
    );
}
