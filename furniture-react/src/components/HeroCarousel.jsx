import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function HeroCarousel() {
    const { dashboardImages, carouselSettings, furniture, projects, settings } = useData();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const intervalRef = useRef(null);

    // Filter active images and sort by order
    const activeImages = (dashboardImages || [])
        .filter(img => img.active)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const interval = carouselSettings?.interval || 5000;
    const showIndicators = carouselSettings?.showIndicators !== false;
    const pauseOnHover = carouselSettings?.pauseOnHover !== false;

    // Get link URL based on linkType
    const getLinkUrl = (image) => {
        if (image.linkType === 'url' && image.linkUrl) {
            return image.linkUrl;
        }
        if (image.linkType === 'project' && image.linkId) {
            return `/projects`;
        }
        if (image.linkType === 'product' && image.linkId) {
            return `/furniture`;
        }
        return '/furniture';
    };

    // Handle slide click
    const handleSlideClick = (image) => {
        const url = getLinkUrl(image);
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        } else {
            navigate(url);
        }
    };

    // Auto-rotate slides
    useEffect(() => {
        if (activeImages.length <= 1 || isPaused) {
            return;
        }

        intervalRef.current = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % activeImages.length);
                setIsTransitioning(false);
            }, 500);
        }, interval);

        return () => clearInterval(intervalRef.current);
    }, [activeImages.length, interval, isPaused, currentIndex]);

    // Go to specific slide
    const goToSlide = (index) => {
        if (index === currentIndex) return;
        clearInterval(intervalRef.current);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 300);
    };

    // Navigation
    const goNext = () => {
        clearInterval(intervalRef.current);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % activeImages.length);
            setIsTransitioning(false);
        }, 300);
    };

    const goPrev = () => {
        clearInterval(intervalRef.current);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + activeImages.length) % activeImages.length);
            setIsTransitioning(false);
        }, 300);
    };

    // If no images, show fallback hero
    if (activeImages.length === 0) {
        return (
            <section className="hero">
                <div className="hero-content">
                    <span className="hero-badge">✨ {settings?.tagline || 'Where Dreams Meet Craftsmanship'}</span>
                    <h1>Transform Your Space Into a Masterpiece</h1>
                    <p>Premium furniture manufacturing and bespoke interior design solutions for homes, hotels, and commercial spaces.</p>
                    <div className="hero-buttons">
                        <Link to="/furniture" className="btn btn-primary">Explore Products</Link>
                        <Link to="/contact" className="btn btn-whatsapp">Contact Us</Link>
                    </div>
                </div>
                <div className="hero-image"></div>
            </section>
        );
    }

    const currentImage = activeImages[currentIndex];

    return (
        <section
            className="hero-carousel"
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        >
            {/* Background Image */}
            <div
                className={`carousel-slide ${isTransitioning ? 'transitioning' : ''}`}
                style={currentImage?.image ? { backgroundImage: `url(${currentImage.image})` } : { backgroundColor: 'var(--color-secondary)' }}
                onClick={() => handleSlideClick(currentImage)}
            >
                <div className="carousel-overlay"></div>
            </div>

            {/* Content */}
            <div className="carousel-content">
                <span className="hero-badge">✨ {settings?.tagline || 'Where Dreams Meet Craftsmanship'}</span>
                <h1 className={isTransitioning ? 'transitioning' : ''}>
                    {currentImage?.title || 'Transform Your Space'}
                </h1>
                <p className={isTransitioning ? 'transitioning' : ''}>
                    {currentImage?.subtitle || 'Premium furniture manufacturing and bespoke interior design solutions'}
                </p>
                <div className="hero-buttons">
                    <button
                        onClick={() => handleSlideClick(currentImage)}
                        className="btn btn-primary"
                    >
                        Explore Now
                    </button>
                    <Link to="/contact" className="btn btn-whatsapp">Chat on WhatsApp</Link>
                </div>
            </div>

            {/* Navigation Arrows */}
            {activeImages.length > 1 && (
                <>
                    <button className="carousel-nav carousel-prev" onClick={goPrev} aria-label="Previous slide">
                        ‹
                    </button>
                    <button className="carousel-nav carousel-next" onClick={goNext} aria-label="Next slide">
                        ›
                    </button>
                </>
            )}

            {/* Indicators */}
            {showIndicators && activeImages.length > 1 && (
                <div className="carousel-indicators">
                    {activeImages.map((_, index) => (
                        <button
                            key={index}
                            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Progress bar */}
            {activeImages.length > 1 && !isPaused && (
                <div className="carousel-progress">
                    <div
                        className="carousel-progress-bar"
                        style={{ animationDuration: `${interval}ms` }}
                        key={currentIndex}
                    />
                </div>
            )}
        </section>
    );
}
