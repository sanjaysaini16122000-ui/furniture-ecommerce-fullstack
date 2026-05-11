import { useState, useEffect, useCallback } from 'react';
import { adminOrdersAPI } from '../services/adminAPI';

const ORDER_STATUSES = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
];

export default function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminOrdersAPI.getAll();
            const list = data.results || data || [];
            setOrders(list);
        } catch (err) {
            console.error('[ManageOrders] Failed to load orders:', err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await adminOrdersAPI.updateStatus(orderId, newStatus);
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            console.error('[ManageOrders] Failed to update status:', err);
            alert('Failed to update order status. Please try again.');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatPrice = (price) => {
        if (!price || price === 0) return '₹0';
        return '₹' + Number(price).toLocaleString('en-IN');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Filter and search
    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || (order.status || 'pending').toLowerCase() === filter;
        const matchesSearch = !searchTerm ||
            (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.email || order.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.first_name || order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(order.id).includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    // Status counts
    const statusCounts = orders.reduce((acc, o) => {
        const s = (o.status || 'pending').toLowerCase();
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    return (
        <>
            <div className="admin-header">
                <h1>📦 Manage Orders</h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="admin-search">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary" onClick={loadOrders} disabled={loading}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Status Filters */}
            <div className="orders-filters">
                {ORDER_STATUSES.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`filter-btn ${filter === key ? 'active' : ''}`}
                        onClick={() => setFilter(key)}
                    >
                        {label}
                        {key === 'all' ? (
                            <span className="count">{orders.length}</span>
                        ) : statusCounts[key] ? (
                            <span className="count">{statusCounts[key]}</span>
                        ) : null}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-spinner"></div>
                    <p>Loading orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="admin-card empty-state">
                    <span className="empty-icon">📦</span>
                    <p>{filter !== 'all' ? `No ${filter} orders found` : 'No orders yet'}</p>
                    <small>Customer orders will appear here</small>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}>
                                    <td style={{ fontWeight: 600, color: 'var(--admin-accent)' }}>
                                        #{order.order_number || order.id}
                                    </td>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {(order.user?.first_name || order.customer_name || 'G')[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="user-name">
                                                    {order.user?.first_name
                                                        ? `${order.user.first_name} ${order.user.last_name || ''}`
                                                        : order.customer_name || 'Guest'}
                                                </div>
                                                <div className="user-email">
                                                    {order.user?.email || order.customer_email || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{order.items?.length || order.order_items?.length || '—'}</td>
                                    <td style={{ fontWeight: 600 }}>{formatPrice(order.total)}</td>
                                    <td>
                                        <span className={`status-badge ${(order.status || 'pending').toLowerCase()}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="table-actions" onClick={e => e.stopPropagation()}>
                                        <select
                                            value={order.status || 'pending'}
                                            onChange={e => handleStatusUpdate(order.id, e.target.value)}
                                            disabled={updatingId === order.id}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '0.78rem',
                                                background: 'var(--admin-bg)',
                                                border: '1px solid var(--admin-border-light)',
                                                borderRadius: '6px',
                                                color: 'var(--admin-text)',
                                                cursor: 'pointer',
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Detail Panel */}
            {selectedOrder && (
                <div className="order-detail-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                            Order #{selectedOrder.order_number || selectedOrder.id} Details
                        </h3>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedOrder(null)}
                        >
                            ✕ Close
                        </button>
                    </div>

                    <div className="order-detail-grid">
                        <div className="order-info-card">
                            <h4>👤 Customer</h4>
                            <p><strong>{selectedOrder.user?.first_name
                                ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name || ''}`
                                : selectedOrder.customer_name || 'Guest'}</strong></p>
                            <p>{selectedOrder.user?.email || selectedOrder.customer_email || '—'}</p>
                            <p>{selectedOrder.user?.phone || selectedOrder.customer_phone || '—'}</p>
                        </div>

                        <div className="order-info-card">
                            <h4>💰 Payment</h4>
                            <p className="order-total">{formatPrice(selectedOrder.total)}</p>
                            <p>Subtotal: {formatPrice(selectedOrder.subtotal)}</p>
                            {selectedOrder.shipping_cost > 0 && (
                                <p>Shipping: {formatPrice(selectedOrder.shipping_cost)}</p>
                            )}
                        </div>

                        <div className="order-info-card">
                            <h4>📍 Shipping Address</h4>
                            {selectedOrder.shipping_address ? (
                                <>
                                    <p>{selectedOrder.shipping_address.street}</p>
                                    <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                                    <p>{selectedOrder.shipping_address.pincode}</p>
                                </>
                            ) : selectedOrder.address ? (
                                <p>{typeof selectedOrder.address === 'string'
                                    ? selectedOrder.address
                                    : `${selectedOrder.address.street || ''}, ${selectedOrder.address.city || ''}`}</p>
                            ) : (
                                <p style={{ color: 'var(--admin-text-muted)' }}>No address provided</p>
                            )}
                        </div>

                        <div className="order-info-card">
                            <h4>🚚 Tracking</h4>
                            <p><strong>Status:</strong>{' '}
                                <span className={`status-badge ${(selectedOrder.status || 'pending').toLowerCase()}`}>
                                    {selectedOrder.status || 'Pending'}
                                </span>
                            </p>
                            <p><strong>Tracking #:</strong> {selectedOrder.tracking_number || '—'}</p>
                            <p><strong>Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    {(selectedOrder.items || selectedOrder.order_items || []).length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--admin-text-secondary)' }}>
                                🛒 Order Items
                            </h4>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedOrder.items || selectedOrder.order_items || []).map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.product_name || item.product?.name || `Product #${item.product}`}</td>
                                                <td>{item.quantity}</td>
                                                <td>{formatPrice(item.unit_price || item.price)}</td>
                                                <td style={{ fontWeight: 600 }}>
                                                    {formatPrice((item.unit_price || item.price || 0) * (item.quantity || 1))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
