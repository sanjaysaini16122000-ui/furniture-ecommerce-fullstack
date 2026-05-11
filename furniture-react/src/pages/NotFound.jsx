import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <section className="section section-light" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <div className="not-found-icon">🏠</div>
                <h1 className="not-found-title">404</h1>
                <h2 style={{ marginBottom: '1rem', color: 'var(--color-gray-700)' }}>
                    Page Not Found
                </h2>
                <p style={{ maxWidth: '500px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
                    Sorry, the page you're looking for doesn't exist or has been moved.
                    Let us help you find what you need.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/" className="btn btn-primary">Back to Home</Link>
                    <Link to="/furniture" className="btn btn-outline">Browse Furniture</Link>
                    <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
                </div>
            </div>
        </section>
    );
}
