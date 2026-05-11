import { useState, useEffect, useCallback } from 'react';
import { adminUsersAPI } from '../services/adminAPI';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminUsersAPI.getAll();
            const list = data.results || data || [];
            setUsers(list);
        } catch (err) {
            console.error('[ManageUsers] Failed to load users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await adminUsersAPI.toggleActive(userId, !currentStatus);
            setUsers(prev =>
                prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u)
            );
        } catch (err) {
            console.error('[ManageUsers] Failed to toggle user:', err);
            alert('Failed to update user status.');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredUsers = users.filter(user => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (user.email || '').toLowerCase().includes(q) ||
            (user.first_name || '').toLowerCase().includes(q) ||
            (user.last_name || '').toLowerCase().includes(q) ||
            (user.phone || '').includes(q)
        );
    });

    const activeCount = users.filter(u => u.is_active !== false).length;
    const inactiveCount = users.filter(u => u.is_active === false).length;

    return (
        <>
            <div className="admin-header">
                <h1>👥 Manage Users</h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="admin-search">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary" onClick={loadUsers} disabled={loading}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <h3>{users.length}</h3>
                    <p>Total Users</p>
                </div>
                <div className="stat-card">
                    <h3>{activeCount}</h3>
                    <p>Active Users</p>
                </div>
                <div className="stat-card">
                    <h3>{inactiveCount}</h3>
                    <p>Inactive Users</p>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-spinner"></div>
                    <p>Loading users...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="admin-card empty-state">
                    <span className="empty-icon">👤</span>
                    <p>{searchTerm ? 'No users match your search' : 'No registered users yet'}</p>
                    <small>User registrations will appear here</small>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {(user.first_name || user.email || 'U')[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="user-name">
                                                    {user.first_name
                                                        ? `${user.first_name} ${user.last_name || ''}`
                                                        : 'No Name'}
                                                </div>
                                                <div className="user-email">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--admin-text-secondary)' }}>
                                        {user.phone || '—'}
                                    </td>
                                    <td>
                                        <span className={`user-status ${user.is_active !== false ? 'active' : 'inactive'}`}>
                                            {user.is_active !== false ? '● Active' : '● Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
                                        {formatDate(user.created_at || user.date_joined)}
                                    </td>
                                    <td className="table-actions">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                                        >
                                            👁️ View
                                        </button>
                                        <button
                                            className={`btn btn-sm ${user.is_active !== false ? 'btn-danger' : 'btn-success'}`}
                                            onClick={() => handleToggleActive(user.id, user.is_active !== false)}
                                        >
                                            {user.is_active !== false ? '🚫 Deactivate' : '✅ Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* User Detail Panel */}
            {selectedUser && (
                <div className="order-detail-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                            User Details
                        </h3>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedUser(null)}
                        >
                            ✕ Close
                        </button>
                    </div>

                    <div className="order-detail-grid">
                        <div className="order-info-card">
                            <h4>👤 Personal Info</h4>
                            <p><strong>Name:</strong> {selectedUser.first_name
                                ? `${selectedUser.first_name} ${selectedUser.last_name || ''}`
                                : 'Not provided'}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</p>
                        </div>

                        <div className="order-info-card">
                            <h4>📊 Account Info</h4>
                            <p><strong>Status:</strong>{' '}
                                <span className={`user-status ${selectedUser.is_active !== false ? 'active' : 'inactive'}`}>
                                    {selectedUser.is_active !== false ? '● Active' : '● Inactive'}
                                </span>
                            </p>
                            <p><strong>Joined:</strong> {formatDate(selectedUser.created_at || selectedUser.date_joined)}</p>
                            <p><strong>Last Login:</strong> {formatDate(selectedUser.last_login)}</p>
                            <p><strong>Staff:</strong> {selectedUser.is_staff ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
