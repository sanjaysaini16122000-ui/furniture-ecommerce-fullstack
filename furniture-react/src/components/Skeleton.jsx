/**
 * Skeleton loading placeholders.
 * Provides visual feedback while content loads from Firebase.
 */

export function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton-image" />
            <div className="skeleton-content">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text skeleton-text-short" />
            </div>
        </div>
    );
}

export function SkeletonGrid({ count = 6 }) {
    return (
        <div className="cards-grid">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonHero() {
    return (
        <div className="skeleton-hero">
            <div className="skeleton skeleton-hero-text" style={{ width: '60%', height: '2.5rem', marginBottom: '1rem' }} />
            <div className="skeleton skeleton-hero-text" style={{ width: '80%', height: '1.2rem', marginBottom: '0.5rem' }} />
            <div className="skeleton skeleton-hero-text" style={{ width: '50%', height: '1.2rem', marginBottom: '2rem' }} />
            <div className="skeleton" style={{ width: '200px', height: '48px', borderRadius: '12px' }} />
        </div>
    );
}
