import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { usePayment } from '../context/PaymentContext';
import ScrollReveal from '../components/ScrollReveal';

export default function Checkout() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { placeOrder, loading: orderLoading } = useOrders();
    const { initiatePayment, loading: paymentLoading } = usePayment();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        notes: '',
        paymentMethod: 'online' // default to online
    });

    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=checkout');
        }
        if (cartItems.length === 0) {
            navigate('/cart');
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [isAuthenticated, cartItems.length, user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const orderData = {
            shipping_address: `${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.zipCode.trim()}`,
            phone_number: formData.phone.trim() || '',
            email: formData.email.trim() || '',
            customer_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
            notes: formData.notes.trim() || '',
            items: cartItems.map(item => ({
                product: item.product.id,
                quantity: item.quantity
            })),
            total_amount: Number(cartTotal),
            payment_method: formData.paymentMethod.toUpperCase()
        };

        console.log('[Checkout] Submitting order data:', JSON.stringify(orderData, null, 2));

        const result = await placeOrder(orderData);
        if (result.success) {
            const orderId = result.order.id;

            if (formData.paymentMethod === 'online') {
                setStatus({ type: 'info', message: 'Initiating secure payment...' });
                const paymentResult = await initiatePayment(orderId);

                if (paymentResult.success) {
                    // Redirect to payment gateway or handle internal checkout
                    if (paymentResult.data.checkout_url) {
                        window.location.href = paymentResult.data.checkout_url;
                        return;
                    }
                } else {
                    setStatus({ type: 'error', message: 'Order placed, but payment initiation failed. You can pay from your orders page.' });
                }
            } else {
                setStatus({ type: 'success', message: 'Order placed successfully!' });
            }

            clearCart();
            setTimeout(() => {
                navigate(`/account/orders/${orderId || ''}`);
            }, 2000);
        } else {
            setStatus({ type: 'error', message: result.error || 'Failed to place order' });
        }
    };

    const formatPrice = (price) => {
        return '₹' + Number(price).toLocaleString('en-IN');
    };

    return (
        <div className="section">
            <div className="container">
                <div className="section-header" style={{ textAlign: 'left', marginBottom: '3rem' }}>
                    <h1>Checkout</h1>
                    <p>Complete your order and transform your space</p>
                </div>

                {status.message && (
                    <div className={`alert alert-${status.type}`} style={{ marginBottom: '2rem' }}>
                        {status.message}
                    </div>
                )}

                <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
                    {/* Shipping Info Form */}
                    <div className="checkout-form-container">
                        <ScrollReveal animation="fade-up">
                            <form onSubmit={handleSubmit} className="checkout-form">
                                <div className="form-section">
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Shipping Information</h2>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input name="firstName" value={formData.firstName} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input name="lastName" value={formData.lastName} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>Address</label>
                                        <input name="address" value={formData.address} onChange={handleChange} required />
                                    </div>
                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div className="form-group">
                                            <label>City</label>
                                            <input name="city" value={formData.city} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>State</label>
                                            <input name="state" value={formData.state} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>ZIP Code</label>
                                            <input name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section" style={{ marginTop: '2.5rem' }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Payment Method</h2>
                                    <div className="payment-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div
                                            className={`payment-option ${formData.paymentMethod === 'online' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, paymentMethod: 'online' })}
                                            style={{ padding: '1.5rem', border: '2px solid var(--color-gray-200)', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                                        >
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                                            <div style={{ fontWeight: '700' }}>Online Payment</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Credit/Debit Card, UPI</div>
                                        </div>
                                        <div
                                            className={`payment-option ${formData.paymentMethod === 'cod' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                                            style={{ padding: '1.5rem', border: '2px solid var(--color-gray-200)', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                                        >
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💵</div>
                                            <div style={{ fontWeight: '700' }}>Cash on Delivery</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Pay when you receive</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section" style={{ marginTop: '2.5rem' }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Additional Notes</h2>
                                    <div className="form-group">
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Special instructions for delivery (optional)"
                                            rows="4"
                                        />
                                    </div>
                                </div>

                                <div className="checkout-actions" style={{ marginTop: '3rem' }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}
                                        disabled={orderLoading || paymentLoading}
                                    >
                                        {(orderLoading || paymentLoading) ? 'Processing...' : formData.paymentMethod === 'online' ? 'Proceed to Pay' : 'Place Order'}
                                    </button>
                                </div>
                            </form>
                        </ScrollReveal>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="checkout-summary-container">
                        <ScrollReveal animation="fade-up" delay={200}>
                            <div className="checkout-summary" style={{ background: 'var(--color-gray-50)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--color-gray-200)', position: 'sticky', top: '100px' }}>
                                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Items</h2>
                                <div className="checkout-items-list" style={{ marginBottom: '2rem' }}>
                                    {cartItems.map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', background: 'var(--color-gray-200)', flexShrink: 0 }}>
                                                    {item.product.image && <img src={item.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px' }}>{item.product.name}</p>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{formatPrice(item.product.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-totals" style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ color: 'var(--color-gray-600)' }}>Subtotal</span>
                                        <span style={{ fontWeight: '600' }}>{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <span style={{ color: 'var(--color-gray-600)' }}>Shipping</span>
                                        <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>Free</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-gray-200)', paddingTop: '1.5rem' }}>
                                        <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>Total</span>
                                        <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--color-primary)' }}>{formatPrice(cartTotal)}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px dashed var(--color-gray-300)', fontSize: '0.85rem' }}>
                                    <p style={{ color: 'var(--color-gray-600)', textAlign: 'center' }}>
                                        🛡️ Your order is secured with our satisfaction guarantee.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .checkout-form .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--color-gray-700);
                    font-size: 0.9rem;
                }
                .checkout-form input, .checkout-form textarea, .checkout-form select {
                    width: 100%;
                    padding: 0.85rem;
                    border: 1px solid var(--color-gray-200);
                    border-radius: 8px;
                    background: white;
                    color: var(--color-gray-800);
                    transition: all 0.2s ease;
                }
                .checkout-form input:focus {
                    border-color: var(--color-primary);
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
                }
                .payment-option:hover {
                    border-color: var(--color-primary) !important;
                    transform: translateY(-2px);
                }
                .payment-option.active {
                    border-color: var(--color-primary) !important;
                    background: rgba(var(--color-primary-rgb), 0.05);
                    box-shadow: 0 10px 20px rgba(var(--color-primary-rgb), 0.1);
                }
                .payment-option {
                    position: relative;
                    overflow: hidden;
                }
                .payment-option.active::after {
                    content: '✓';
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--color-primary);
                    color: white;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @media (max-width: 992px) {
                    .checkout-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .checkout-summary-container {
                        order: -1;
                    }
                }
            `}} />
        </div>
    );
}
