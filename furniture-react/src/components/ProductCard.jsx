import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { WhatsAppLink } from './WhatsAppButton';
import ImageGallery from './ImageGallery';
import ShareButton from './ShareButton';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { addToRecentlyViewed } from '../utils/storage';
import '../styles/product-card.css';

const MAX_RETRIES = 2;

export default function ProductCard({ item, category = 'Furniture', variant = 'grid' }) {
    const emoji = getEmoji(item.category || category);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [wishlistAnim, setWishlistAnim] = useState(false);
    const [imgSrc, setImgSrc] = useState(null);
    const retryCount = useRef(0);
    const failedUrls = useRef(new Set());
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [addStatus, setAddStatus] = useState(null);

    let images = item.images || (item.image ? [item.image] : []);
    images = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    const mainImage = images.length > 0 ? images[currentImageIndex] : null;

    useEffect(() => {
        retryCount.current = 0;
        setImageError(false);
        setImgSrc(mainImage);
    }, [mainImage]);

    useEffect(() => {
        setWishlisted(isInWishlist(item.id));
    }, [item.id, isInWishlist]);

    useEffect(() => {
        if (item.id) addToRecentlyViewed(item.id);
    }, [item.id]);

    useEffect(() => {
        if (images.length > 1) {
            images.forEach((src) => {
                const img = new Image();
                img.src = src;
            });
        }
    }, [images.length]);

    const formatPrice = (price) => {
        if (!price || price === 0) return null;
        return '₹' + Number(price).toLocaleString('en-IN');
    };

    const handleImageClick = () => {
        if (images.length > 0 && !imageError) setGalleryOpen(true);
    };

    const handleImageError = () => {
        if (retryCount.current < MAX_RETRIES && mainImage) {
            retryCount.current += 1;
            const separator = mainImage.includes('?') ? '&' : '?';
            setImgSrc(`${mainImage}${separator}_retry=${retryCount.current}&t=${Date.now()}`);
            return;
        }

        if (mainImage) failedUrls.current.add(mainImage);

        const nextGoodIndex = images.findIndex(
            (url, idx) => idx !== currentImageIndex && !failedUrls.current.has(url)
        );

        if (nextGoodIndex !== -1) {
            retryCount.current = 0;
            setCurrentImageIndex(nextGoodIndex);
        } else {
            console.warn('[ProductCard] All images failed for:', item.name);
            setImageError(true);
        }
    };

    const handleImageLoad = (e) => {
        if (e.target.naturalWidth === 0) {
            console.warn('[ProductCard] Image loaded with 0 width:', mainImage?.substring(0, 80));
            handleImageError();
        }
    };

    const goToPrev = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToNext = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handleWishlistToggle = async (e) => {
        e.stopPropagation();
        e.preventDefault();
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

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = await addToCart(item, 1);
        if (result.success) {
            setAddStatus('success');
            setTimeout(() => setAddStatus(null), 2000);
        }
    };

    const hasDiscount = !!(item.originalPrice && item.price && item.originalPrice > item.price);
    const discountPercent = hasDiscount
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

    const rating = item.rating || 0;
    const renderStars = (r) => {
        const full = Math.floor(r);
        const half = r % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return (
            <span className="card-stars">
                {'★'.repeat(full)}
                {half ? '⯨' : ''}
                {'☆'.repeat(empty)}
            </span>
        );
    };

    const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/furniture/${item.id}` : '';

    return (
        <>
            <div className={`card ${variant === 'list' ? 'card-list' : ''}`}>
                <div className="card-image" onClick={handleImageClick}>
                    {imgSrc && !imageError ? (
                        <img
                            src={imgSrc}
                            alt={item.name}
                            width="400"
                            height="250"
                            loading="lazy"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                        />
                    ) : (
                        <div className="card-image-placeholder">
                            <span className="card-image-placeholder-icon">{emoji}</span>
                            <span className="card-image-placeholder-text">Image unavailable</span>
                        </div>
                    )}

                    {hasDiscount && (
                        <span className="card-discount-badge">-{discountPercent}%</span>
                    )}

                    <button
                        className={`card-wishlist ${wishlisted ? 'active' : ''} ${wishlistAnim ? 'pop' : ''}`}
                        onClick={handleWishlistToggle}
                    >
                        {wishlisted ? '❤️' : '🤍'}
                    </button>

                    {images.length > 0 && !imageError && (
                        <span className="card-zoom-icon" onClick={handleImageClick}>⛶</span>
                    )}

                    {images.length > 1 && (
                        <>
                            <button className="card-nav card-nav-prev" onClick={goToPrev}>‹</button>
                            <button className="card-nav card-nav-next" onClick={goToNext}>›</button>
                            <div className="card-image-dots">
                                {images.map((_, index) => (
                                    <span
                                        key={index}
                                        className={`card-dot ${index === currentImageIndex ? 'active' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="card-content">
                    <div className="card-content-header">
                        {item.category && <span className="card-category">{item.category}</span>}
                        <ShareButton
                            productName={item.name}
                            productPrice={formatPrice(item.price)}
                            productImage={mainImage}
                            productDescription={item.description}
                            productCategory={item.category}
                            productId={item.id}
                        />
                    </div>

                    <h3><Link to={`/furniture/${item.id}`} className="card-title-link">{item.name}</Link></h3>

                    <div className="card-price-row">
                        {item.price && item.price > 0 ? (
                            <>
                                {hasDiscount && (
                                    <span className="card-price-original">{formatPrice(item.originalPrice)}</span>
                                )}
                                <span className="card-price-current">{formatPrice(item.price)}</span>
                            </>
                        ) : (
                            <span className="card-price-quote">Get Quote</span>
                        )}
                    </div>

                    {rating > 0 && (
                        <div className="card-rating">
                            {renderStars(rating)}
                            <span className="card-rating-text">{rating.toFixed(1)}</span>
                        </div>
                    )}

                    {item.description && (
                        <p className="card-desc">{item.description.length > 80 ? item.description.substring(0, 80) + '…' : item.description}</p>
                    )}

                    <div className="card-actions">
                        <Link to={`/furniture/${item.id}`} className="card-btn card-btn-view">
                            View Details
                        </Link>
                        <WhatsAppLink
                            message={`Hello, I am interested in ${item.name}${item.price && item.price > 0 ? ' (Price: ' + formatPrice(item.price) + ')' : ''}. Please share more details.`}
                            productUrl={productUrl}
                            className="card-btn card-btn-whatsapp"
                        >
                            💬 Enquire
                        </WhatsAppLink>
                    </div>
                </div>
            </div>

            <ImageGallery
                images={images}
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                initialIndex={currentImageIndex}
            />
        </>
    );
}

function getEmoji(category) {
    const emojis = {
        'Sofa Sets': '🛋️', 'Beds': '🛏️', 'Wardrobes': '👔', 'Dining': '🍽️',
        'TV Units': '📺', 'Center Tables': '🪑', 'Study Tables': '📚',
        'Dressing Tables': '🪞', 'Shoe Racks': '👟', 'Temple Units': '🛕',
        'Custom': '🎨', 'L-Shape': '🍳', 'U-Shape': '🍳', 'Parallel': '🍳',
        'Island': '🍳', 'Straight': '🍳', 'hotel': '🏨', 'home': '🏠', 'office': '🏢'
    };
    return emojis[category] || '🪑';
}
