import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import ScrollReveal from '../components/ScrollReveal';

export default function Wishlist() {
    const { wishlistItems, loading } = useWishlist();

    const wishlistProducts = wishlistItems.map(item => item.product);

    if (loading && wishlistItems.length === 0) {
        return (
            <div className="section" style={{ textAlign: 'center', padding: '100px 0' }}>
                <div className="loader"></div>
                <p>Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span>Wishlist</span>
                    </div>
                    <h1 className="gradient-text">❤️ My Wishlist</h1>
                    <p>
                        {wishlistProducts.length > 0
                            ? `You have ${wishlistProducts.length} saved item${wishlistProducts.length !== 1 ? 's' : ''}`
                            : 'Your wishlist is empty'}
                    </p>
                </div>
            </section>

            {/* Wishlist Products */}
            <section className="section section-light">
                <div className="container">
                    {wishlistProducts.length > 0 ? (
                        <div className="cards-grid">
                            {wishlistProducts.map((item, index) => (
                                <ScrollReveal key={item.id} animation="fade-up" delay={index * 100}>
                                    <ProductCard item={item} />
                                </ScrollReveal>
                            ))}
                        </div>
                    ) : (
                        <ScrollReveal animation="zoom-in">
                            <div className="wishlist-empty">
                                <span className="wishlist-empty-icon">💔</span>
                                <h3>No saved items yet</h3>
                                <p>Tap the ❤️ heart icon on any product to save it here</p>
                                <Link to="/furniture" className="btn btn-primary btn-glow" style={{ marginTop: '1.5rem' }}>
                                    Browse Furniture
                                </Link>
                            </div>
                        </ScrollReveal>
                    )}
                </div>
            </section>
        </>
    );
}
