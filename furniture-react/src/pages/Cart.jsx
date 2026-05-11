import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { WhatsAppLink } from '../components/WhatsAppButton';
import ScrollReveal from '../components/ScrollReveal';
import '../styles/cart.css';

export default function Cart() {
    const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return '₹' + Number(price).toLocaleString('en-IN');
    };

    if (loading) {
        return (
            <div className="cart-page">
                <div className="container" style={{ textAlign: 'center' }}>
                    <div className="loader"></div>
                    <p>Fetching your luxury selections...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <ScrollReveal animation="zoom-in">
                        <div className="cart-empty">
                            <span className="empty-cart-icon">🛒</span>
                            <h2 className="gradient-text">Your cart is empty</h2>
                            <p>Discover our exquisite handcrafted collection and find your perfect piece.</p>
                            <Link to="/furniture" className="btn-luxury">
                                Start Shopping
                                <span className="btn-shine"></span>
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        );
    }

    const whatsappMessage = `Hello, I'd like to place an order for the following selections:\n\n${cartItems.map(item => `- ${item.product.name} (Qty: ${item.quantity}) - ${formatPrice(item.product.price * item.quantity)}`).join('\n')}\n\nTotal Investment: ${formatPrice(cartTotal)}\n\nPlease confirm availability for delivery.`;

    return (
        <div className="cart-page">
            <div className="container">
                <header className="cart-header">
                    <h1 className="gradient-text">Your Shopping Cart</h1>
                    <p>{cartItems.length} {cartItems.length === 1 ? 'masterpiece' : 'selections'} in your cart</p>
                </header>

                <div className="cart-grid">
                    {/* Items List */}
                    <div className="cart-main">
                        <div className="cart-table-header">
                            <span>Product Selection</span>
                            <span style={{ textAlign: 'center' }}>Quantity</span>
                            <span style={{ textAlign: 'right' }}>Investment</span>
                            <span></span>
                        </div>

                        <div className="cart-items-container">
                            {cartItems.map((item, index) => (
                                <ScrollReveal key={item.id} animation="fade-up" delay={index * 100}>
                                    <div className="cart-item-row">
                                        <div className="cart-item-info">
                                            <div className="cart-item-image">
                                                {(item.product.image || (item.product.images && item.product.images[0])) ? (
                                                    <img
                                                        src={item.product.image || item.product.images[0]}
                                                        alt={item.product.name}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🪑</div>
                                                )}
                                            </div>
                                            <div className="cart-item-details">
                                                <h3>
                                                    <Link to={`/furniture/${item.product.id}`} className="hover-link">{item.product.name}</Link>
                                                </h3>
                                                <p className="cart-item-price">{formatPrice(item.product.price)}</p>
                                            </div>
                                        </div>

                                        <div className="cart-qty-control">
                                            <button className="qty-btn" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>−</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                        </div>

                                        <div className="cart-item-total">
                                            {formatPrice(item.product.price * item.quantity)}
                                        </div>

                                        <button
                                            className="remove-item-btn"
                                            onClick={() => removeFromCart(item.id)}
                                            title="Remove masterpiece"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <Link to="/furniture" className="hover-link" style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-primary)' }}>
                                ← Continue Exploring Collection
                            </Link>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <aside className="cart-summary">
                        <div className="cart-summary-card glass-card">
                            <h2 className="summary-title">Order Summary</h2>

                            <div className="summary-row">
                                <span>Subtotal Selection</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Luxury Delivery</span>
                                <span style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.85rem' }}>Calculated at Checkout</span>
                            </div>

                            <div className="summary-row total">
                                <span className="total-label">Total Investment</span>
                                <span className="total-value">{formatPrice(cartTotal)}</span>
                            </div>

                            <div className="summary-actions">
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="btn-luxury"
                                    style={{ width: '100%' }}
                                >
                                    Proceed to Checkout
                                    <span className="btn-shine"></span>
                                </button>

                                <WhatsAppLink
                                    message={whatsappMessage}
                                    className="btn btn-outline"
                                    style={{ width: '100%', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', height: 'auto', padding: '1rem' }}
                                >
                                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>💬</span> Order via WhatsApp
                                </WhatsAppLink>
                            </div>

                            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-gray-400)', marginTop: '2rem', lineHeight: '1.4' }}>
                                Secure luxury checkout. Premium packaging and handling guaranteed.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
