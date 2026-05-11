import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { usePayment } from '../context/PaymentContext';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import '../styles/orders.css';

export default function OrderDetail() {
    const { id } = useParams();
    const { getOrderDetail } = useOrders();
    const { initiatePayment, loading: paymentLoading } = usePayment();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/account/orders');
            return;
        }

        const fetchDetail = async () => {
            setLoading(true);
            const data = await getOrderDetail(id);
            setOrder(data);
            setLoading(false);
        };

        fetchDetail();
    }, [id, isAuthenticated, getOrderDetail, navigate]);

    const formatPrice = (price) => {
        const val = Number(price);
        return '₹' + (isNaN(val) ? '0' : val.toLocaleString('en-IN'));
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return { color: '#16a34a', bg: '#dcfce7', icon: '✓', label: 'Delivered', step: 4 };
            case 'shipped': return { color: '#2563eb', bg: '#dbeafe', icon: '🚚', label: 'Shipped', step: 3 };
            case 'processing': return { color: '#d97706', bg: '#fef3c7', icon: '⚙️', label: 'Processing', step: 2 };
            case 'confirmed': return { color: '#7c3aed', bg: '#ede9fe', icon: '✔', label: 'Confirmed', step: 1 };
            case 'cancelled': return { color: '#dc2626', bg: '#fee2e2', icon: '✕', label: 'Cancelled', step: -1 };
            case 'pending': default: return { color: '#ea580c', bg: '#fff7ed', icon: '⏳', label: 'Pending', step: 0 };
        }
    };

    const handlePayNow = async () => {
        setStatusMsg('Initiating secure payment...');
        const result = await initiatePayment(order.id);
        if (result.success && result.data.checkout_url) {
            window.location.href = result.data.checkout_url;
        } else {
            setStatusMsg(result.error || 'Failed to initiate payment. Please try again later.');
        }
    };

    if (loading) {
        return (
            <div className="od-page">
                <div className="container">
                    <div className="od-loading">
                        <div className="od-loading-spinner"></div>
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="od-page">
                <div className="container">
                    <div className="od-not-found glass-card">
                        <div className="od-not-found-icon">📦</div>
                        <h2>Order not found</h2>
                        <p>We couldn't find this order. It may have been removed.</p>
                        <Link to="/account/orders" className="btn btn-primary">Back to Orders</Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const isCancelled = order.status?.toLowerCase() === 'cancelled';
    const statusSteps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

    const addressObj = order.shipping_address;
    const addressStr = typeof addressObj === 'object' && addressObj !== null
        ? [addressObj.street, addressObj.city, addressObj.state, addressObj.pincode, addressObj.country].filter(Boolean).join(', ')
        : addressObj || 'Not provided';

    return (
        <div className="od-page">
            <div className="container">
                <Link to="/account/orders" className="od-back-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    <span>Back to My Orders</span>
                </Link>

                {statusMsg && (
                    <div className="od-alert glass-card">{statusMsg}</div>
                )}

                <ScrollReveal animation="fade-up">
                    <div className={`od-header-card status-${order.status?.toLowerCase() || 'pending'}`}>
                        <div className="od-header-top">
                            <div className="od-header-info">
                                <h1 className="od-order-title">
                                    Order <span>#{order.order_number || order.id}</span>
                                </h1>
                                <p className="od-order-date">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="od-header-actions">
                                <button className="od-action-btn" onClick={() => window.print()}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></svg>
                                    Invoice
                                </button>
                            </div>
                        </div>

                        {!isCancelled ? (
                            <div className="od-tracking-container">
                                <div className="od-status-track">
                                    {statusSteps.map((step, i) => (
                                        <div key={step} className={`od-status-step ${i <= statusConfig.step ? 'completed' : ''} ${i === statusConfig.step ? 'current' : ''}`}>
                                            <div className="od-step-icon">
                                                {i < statusConfig.step ? '✓' : i + 1}
                                            </div>
                                            <span className="od-step-label">{step}</span>
                                        </div>
                                    ))}
                                    <div className="od-status-line">
                                        <div 
                                            className="od-status-line-fill" 
                                            style={{ width: `${Math.max(0, (statusConfig.step / (statusSteps.length - 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="od-cancelled-alert">
                                <span className="od-cancelled-icon">✕</span>
                                <div className="od-cancelled-text">
                                    <h3>Order Cancelled</h3>
                                    <p>This order was cancelled and is no longer being processed.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollReveal>

                <div className="od-grid">
                    <div className="od-main">
                        <ScrollReveal animation="fade-up" delay={100}>
                            <div className="od-card">
                                <div className="od-card-header">
                                    <h3>Order Items</h3>
                                    <span className="od-items-count">{(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="od-items-list">
                                    {(order.items || []).map(item => (
                                        <div key={item.id} className="od-item">
                                            <div className="od-item-img shadow-soft">
                                                {item.product?.image ? (
                                                    <img src={item.product.image} alt={item.product?.name || ''} />
                                                ) : (
                                                    <div className="od-item-placeholder">🪑</div>
                                                )}
                                            </div>
                                            <div className="od-item-info">
                                                <h4>{item.product?.name || 'Product'}</h4>
                                                {item.product?.category && (
                                                    <span className="od-item-cat">{item.product.category}</span>
                                                )}
                                                <span className="od-item-qty">Qty: {item.quantity}</span>
                                            </div>
                                            <div className="od-item-pricing">
                                                <span className="od-item-total">{formatPrice((item.unit_price || item.price || item.product?.price || 0) * item.quantity)}</span>
                                                <span className="od-item-each">{formatPrice(item.unit_price || item.price || item.product?.price || 0)} each</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="od-price-summary">
                                    <div className="od-price-row">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(order.subtotal || order.total_amount || order.total || 0)}</span>
                                    </div>
                                    <div className="od-price-row">
                                        <span>Shipping</span>
                                        <span className="od-free">{Number(order.shipping_cost) > 0 ? formatPrice(order.shipping_cost) : 'Free'}</span>
                                    </div>
                                    {Number(order.discount_amount) > 0 && (
                                        <div className="od-price-row od-discount">
                                            <span>Discount</span>
                                            <span>-{formatPrice(order.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div className="od-price-row od-total-row">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total_amount || order.total || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    <div className="od-sidebar">
                        <ScrollReveal animation="fade-up" delay={200}>
                            <div className="od-card">
                                <div className="od-card-header">
                                    <h3>Payment</h3>
                                </div>
                                <div className="od-info-content">
                                    <div className="od-info-row">
                                        <span className="od-info-label">Method</span>
                                        <span className="od-info-value">
                                            {order.payment_method === 'ONLINE' ? '💳 Online Payment' : '💵 Cash on Delivery'}
                                        </span>
                                    </div>
                                    <div className="od-info-row">
                                        <span className="od-info-label">Status</span>
                                        <span className={`od-payment-status ${order.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                                            {order.payment_status === 'paid' ? '● Paid' : '○ Unpaid'}
                                        </span>
                                    </div>
                                </div>
                                {order.payment_status !== 'paid' && (order.payment_method === 'ONLINE' || order.payment_method === 'online') && (
                                    <button
                                        className="od-pay-btn"
                                        onClick={handlePayNow}
                                        disabled={paymentLoading}
                                    >
                                        {paymentLoading ? 'Processing...' : '💳 Pay Now'}
                                    </button>
                                )}
                            </div>
                        </ScrollReveal>

                        <ScrollReveal animation="fade-up" delay={300}>
                            <div className="od-card">
                                <div className="od-card-header">
                                    <h3>Shipping Address</h3>
                                </div>
                                <div className="od-info-content">
                                    {order.customer_name && (
                                        <p className="od-address-name">{order.customer_name}</p>
                                    )}
                                    <p className="od-address-text">{addressStr}</p>
                                    {order.phone_number && (
                                        <p className="od-address-phone">📞 {order.phone_number}</p>
                                    )}
                                    {order.email && (
                                        <p className="od-address-email">✉️ {order.email}</p>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal animation="fade-up" delay={400}>
                            <div className="od-card od-help-card shadow-soft">
                                <h3>Need Help?</h3>
                                <p>Having issues with your order? Our team is here to help.</p>
                                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="od-help-btn">
                                    💬 Contact Support
                                </a>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </div>
    );
}
