import { useState, useEffect } from 'react';

export default function ImageGallery({ images, isOpen, onClose, initialIndex = 0 }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    if (!isOpen || !images || images.length === 0) return null;

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-label="Image gallery">
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <button className="lightbox-close" onClick={onClose} aria-label="Close gallery">×</button>

                <div className="lightbox-main">
                    {images.length > 1 && (
                        <button className="lightbox-nav lightbox-prev" onClick={goToPrev} aria-label="Previous image">‹</button>
                    )}

                    <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} />

                    {images.length > 1 && (
                        <button className="lightbox-nav lightbox-next" onClick={goToNext} aria-label="Next image">›</button>
                    )}
                </div>

                {images.length > 1 && (
                    <div className="lightbox-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}

                {images.length > 1 && (
                    <div className="lightbox-thumbnails">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className={`lightbox-thumb ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            >
                                <img src={img} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
