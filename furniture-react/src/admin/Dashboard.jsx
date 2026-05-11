import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { adminDashboardAPI, adminOrdersAPI } from '../services/adminAPI';

export default function Dashboard() {
    const { furniture, kitchens, projects, settings, messages } = useData();
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Try to get stats from the backend
            const dashStats = await adminDashboardAPI.getStats();
            setStats(dashStats);

            // Get recent orders
            try {
                const ordersData = await adminOrdersAPI.getAll({ page_size: 5 });
                const orders = ordersData.results || ordersData || [];
                setRecentOrders(orders.slice(0, 5));
            } catch {
                setRecentOrders([]);
            }
        } catch {
            setStats(null);
        } finally {
            setLoading(false);
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
        });
    };

    const unreadMessages = (messages || []).filter(m => !m.read).length;

    return (
        <>
            <div className="admin-header">
                <h1>📊 Dashboard</h1>
                <Link to="/" className="btn btn-secondary">🌐 View Website →</Link>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card products">
                    <span className="stat-icon">🛋️</span>
                    <h3>{stats?.total_products ?? furniture.length}</h3>
                    <p>Furniture Products</p>
                </div>
                <div className="stat-card orders">
                    <span className="stat-icon">📦</span>
                    <h3>{stats?.total_orders ?? 0}</h3>
                    <p>Total Orders</p>
                </div>
                <div className="stat-card revenue">
                    <span className="stat-icon">💰</span>
                    <h3>{formatPrice(stats?.total_revenue ?? 0)}</h3>
                    <p>Total Revenue</p>
                </div>
                <div className="stat-card users">
                    <span className="stat-icon">👥</span>
                    <h3>{stats?.total_users ?? 0}</h3>
                    <p>Registered Users</p>
                </div>
                <div className="stat-card messages">
                    <span className="stat-icon">📬</span>
                    <h3>{unreadMessages}</h3>
                    <p>Unread Messages</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚡ Quick Actions
                </h2>
                <div className="quick-actions">
                    <Link to="/admin/furniture" className="quick-action-card">
                        <span className="quick-action-icon">🛋️</span>
                        Manage Furniture
                    </Link>
                    <Link to="/admin/orders" className="quick-action-card">
                        <span className="quick-action-icon">📦</span>
                        Manage Orders
                    </Link>
                    <Link to="/admin/kitchens" className="quick-action-card">
                        <span className="quick-action-icon">🍳</span>
                        Manage Kitchens
                    </Link>
                    <Link to="/admin/projects" className="quick-action-card">
                        <span className="quick-action-icon">📁</span>
                        Manage Projects
                    </Link>
                    <Link to="/admin/users" className="quick-action-card">
                        <span className="quick-action-icon">👤</span>
                        Manage Users
                    </Link>
                    <Link to="/admin/settings" className="quick-action-card">
                        <span className="quick-action-icon">⚙️</span>
                        Settings
                    </Link>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="recent-section">
                <h2>📦 Recent Orders</h2>
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-spinner"></div>
                        <p>Loading dashboard data...</p>
                    </div>
                ) : recentOrders.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--admin-accent)' }}>
                                            #{order.order_number || order.id}
                                        </td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {(order.user?.first_name || order.customer_name || 'U')[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="user-name">
                                                        {order.user?.first_name || order.customer_name || 'Guest'}
                                                    </div>
                                                    <div className="user-email">
                                                        {order.user?.email || order.customer_email || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{formatPrice(order.total)}</td>
                                        <td>
                                            <span className={`status-badge ${(order.status || 'pending').toLowerCase()}`}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--admin-text-muted)' }}>
                                            {formatDate(order.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="admin-card empty-state">
                        <span className="empty-icon">📦</span>
                        <p>No orders yet</p>
                        <small>Orders from customers will appear here</small>
                    </div>
                )}
                {recentOrders.length > 0 && (
                    <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                        <Link to="/admin/orders" className="btn btn-outline">View All Orders →</Link>
                    </div>
                )}
            </div>

            {/* Business Info */}
            <div className="admin-card" style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>🏢 Business Info</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem', fontSize: '0.875rem' }}>
                    <p><strong>Name:</strong> {settings.businessName}</p>
                    <p><strong>WhatsApp:</strong> {settings.whatsappNumber}</p>
                    <p><strong>Email:</strong> {settings.email}</p>
                    <p><strong>Address:</strong> {settings.address}</p>
                </div>
            </div>
        </>
    );
}
