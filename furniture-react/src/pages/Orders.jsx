import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import '../styles/orders.css';

export default function Orders() {
    const { orders, loading, fetchOrders } = useOrders();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, fetchOrders]);

    const formatPrice = (price) => {
        const val = Number(price);
        return '₹' + (isNaN(val) ? '0' : val.toLocaleString('en-IN'));
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return { color: '#16a34a', bg: '#dcfce7', icon: '✓', label: 'Delivered' };
            case 'shipped': return { color: '#2563eb', bg: '#dbeafe', icon: '🚚', label: 'Shipped' };
            case 'processing': return { color: '#d97706', bg: '#fef3c7', icon: '⚙️', label: 'Processing' };
            case 'confirmed': return { color: '#7c3aed', bg: '#ede9fe', icon: '✔', label: 'Confirmed' };
            case 'cancelled': return { color: '#dc2626', bg: '#fee2e2', icon: '✕', label: 'Cancelled' };
            case 'pending': default: return { color: '#ea580c', bg: '#fff7ed', icon: '⏳', label: 'Pending' };
        }
    };

    const getPaymentBadge = (method, paymentStatus) => {
        if (method === 'ONLINE' || method === 'online') {
            if (paymentStatus === 'paid') return { label: 'Paid Online', color: '#16a34a', bg: '#dcfce7', icon: '💳' };
            return { label: 'Online (Unpaid)', color: '#ea580c', bg: '#fff7ed', icon: '💳' };
        }
        return { label: 'Cash on Delivery', color: '#6b7280', bg: '#f3f4f6', icon: '💵' };
    };

    const countOrdersByStatus = (statuses) => {
        return orders.filter(o => statuses.includes(o.status?.toLowerCase())).length;
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status?.toLowerCase() === filter);

    const statusFilters = [
        { key: 'all', label: 'All Orders' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'shipped', label: 'Shipped' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'cancelled', label: 'Cancelled' },
    ];

    if (loading && orders.length === 0) {
        return (
            <div className="orders-page">
                <div className="container">
                    <div className="orders-loading">
                        <div className="orders-loading-spinner"></div>
                        <p>Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="container">
                <div className="orders-page-header">
                    <div className="orders-header-left">
                        <h1 className="orders-title">My Orders</h1>
                        <p className="orders-subtitle">Track and manage your purchases</p>
                    </div>
                    <div className="orders-header-right">
                        <Link to="/furniture" className="orders-shop-btn">
                            <span>Continue Shopping</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                    </div>
                </div>

                {!isAuthenticated ? (
                    <div className="orders-empty-state glass-card">
                        <div className="orders-empty-icon">🔐</div>
                        <h2>Please login to view your orders</h2>
                        <p>Sign in to track your purchases and manage your orders.</p>
                        <Link to="/login?redirect=/account/orders" className="btn btn-primary">Login Now</Link>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="orders-empty-state glass-card">
                        <div className="orders-empty-icon">📦</div>
                        <h2>No orders yet</h2>
                        <p>You haven't placed any orders yet. Explore our collection and find your perfect furniture.</p>
                        <Link to="/furniture" className="btn btn-primary">Start Shopping</Link>
                    </div>
                ) : (
                    <>
                        <div className="orders-stats">
                            <ScrollReveal animation="fade-up" delay={100}>
                                <div className="orders-stat-card total">
                                    <div className="stat-icon-wrapper">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="orders-stat-label">Total Orders</span>
                                        <span className="orders-stat-number">{orders.length}</span>
                                    </div>
                                </div>
                            </ScrollReveal>
                            <ScrollReveal animation="fade-up" delay={200}>
                                <div className="orders-stat-card delivered">
                                    <div className="stat-icon-wrapper">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 10-6-6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /><path d="M13 19h4" /></svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="orders-stat-label">Delivered</span>
                                        <span className="orders-stat-number">{orders.filter(o => o.status?.toLowerCase() === 'delivered').length}</span>
                                    </div>
                                </div>
                            </ScrollReveal>
                            <ScrollReveal animation="fade-up" delay={300}>
                                <div className="orders-stat-card processing">
                                    <div className="stat-icon-wrapper">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="orders-stat-label">In Progress</span>
                                        <span className="orders-stat-number">{countOrdersByStatus(['pending', 'processing', 'shipped', 'confirmed'])}</span>
                                    </div>
                                </div>
                            </ScrollReveal>
                            <ScrollReveal animation="fade-up" delay={400}>
                                <div className="orders-stat-card spent">
                                    <div className="stat-icon-wrapper">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                    </div>
                                    <div className="stat-info">
                                        <span className="orders-stat-label">Total Spent</span>
                                        <span className="orders-stat-number">
                                            {formatPrice(orders.reduce((sum, o) => sum + Number(o.total_amount || o.total || 0), 0))}
                                        </span>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>

                        <div className="orders-filter-container">
                            <div className="orders-filter-bar">
                                {statusFilters.map(f => (
                                    <button
                                        key={f.key}
                                        className={`orders-filter-tab ${filter === f.key ? 'active' : ''}`}
                                        onClick={() => setFilter(f.key)}
                                    >
                                        {f.label}
                                        {f.key === 'all' && <span className="orders-filter-count">{orders.length}</span>}
                                        {f.key !== 'all' && orders.filter(o => o.status?.toLowerCase() === f.key).length > 0 && (
                                            <span className="orders-filter-count">{orders.filter(o => o.status?.toLowerCase() === f.key).length}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="orders-list">
                            {filteredOrders.length === 0 ? (
                                <div className="orders-no-results glass-card">
                                    <p>No orders found with this filter.</p>
                                </div>
                            ) : (
                                filteredOrders.map((order, index) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    const paymentBadge = getPaymentBadge(order.payment_method, order.payment_status);

                                    return (
                                        <ScrollReveal key={order.id} animation="fade-up" delay={index * 80}>
                                            <div 
                                                className={`order-card shadow-soft status-${order.status?.toLowerCase() || 'pending'}`} 
                                                onClick={() => navigate(`/account/orders/${order.id}`)}
                                            >
                                                <div className="order-card-top">
                                                    <div className="order-card-meta">
                                                        <div className="order-card-id">
                                                            <span className="order-id-label">Order</span>
                                                            <span className="order-id-value">#{order.order_number || order.id}</span>
                                                        </div>
                                                        <span className="order-card-date">{formatDate(order.created_at)}</span>
                                                    </div>
                                                    <div className="order-card-badges">
                                                        <span
                                                            className="order-status-badge"
                                                            style={{ color: statusConfig.color, background: statusConfig.bg }}
                                                        >
                                                            <span className="order-status-dot" style={{ background: statusConfig.color }}></span>
                                                            {statusConfig.label}
                                                        </span>
                                                        <span
                                                            className="order-payment-badge"
                                                            style={{ color: paymentBadge.color, background: paymentBadge.bg }}
                                                        >
                                                            {paymentBadge.icon} {paymentBadge.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="order-card-items">
                                                    {(order.items || []).slice(0, 3).map(item => (
                                                        <div key={item.id} className="order-card-item">
                                                            <div className="order-item-img">
                                                                {item.product?.image ? (
                                                                    <img src={item.product.image} alt={item.product?.name || ''} />
                                                                ) : (
                                                                    <div className="order-item-placeholder">🪑</div>
                                                                )}
                                                            </div>
                                                            <div className="order-item-info">
                                                                <h4 className="order-item-name">{item.product?.name || 'Product'}</h4>
                                                                <span className="order-item-qty">Qty: {item.quantity}</span>
                                                            </div>
                                                            <div className="order-item-price">
                                                                {formatPrice((item.price || item.unit_price || item.product?.price || 0) * item.quantity)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(order.items?.length || 0) > 3 && (
                                                        <div className="order-card-more">+ {order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}</div>
                                                    )}
                                                </div>

                                                <div className="order-card-bottom">
                                                    <div className="order-card-total">
                                                        <span className="order-total-label">Total</span>
                                                        <span className="order-total-value">{formatPrice(order.total_amount || order.total || 0)}</span>
                                                    </div>
                                                    <div className="order-card-actions">
                                                        <Link
                                                            to={`/account/orders/${order.id}`}
                                                            className="order-view-btn"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            View Details
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </ScrollReveal>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
