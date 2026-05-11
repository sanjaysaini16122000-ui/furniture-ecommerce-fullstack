import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import logo from '../assets/logo-new.png';

export default function AdminLayout() {
    const { logout } = useAuth();
    const { settings, toggleTheme, getUnreadCount } = useData();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const isLightMode = settings?.theme === 'light';
    const unreadCount = getUnreadCount();

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className={`admin-layout ${isLightMode ? 'light-mode' : ''}`}>
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <img src={logo} alt="The Urban Karigar" className="logo-image" />
                        <div>
                            <h2>The Urban Karigar</h2>
                            <span className="logo-tagline">Admin Panel</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={closeSidebar}>
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                        <span className="nav-icon">📦</span>
                        Orders
                    </NavLink>
                    <NavLink to="/admin/furniture" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                        <span className="nav-icon">🛋️</span>
                        Furniture
                    </NavLink>
                    <NavLink to="/admin/dashboard-images" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                        <span className="nav-icon">🖼️</span>
                        Hero Images
                    </NavLink>
                    <NavLink to="/admin/kitchens" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                        <span className="nav-icon">🍳</span>
                        Kitchens
                    </NavLink>
                    <NavLink to="/admin/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                        <span className="nav-icon">📁</span>
                        Projects
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                        <span className="nav-icon">👥</span>
                        Users
                    </NavLink>
                    <NavLink to="/admin/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                        <span className="nav-icon">📬</span>
                        Messages
                        {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
                    </NavLink>
                    <NavLink to="/admin/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                        <span className="nav-icon">⚙️</span>
                        Settings
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={toggleTheme} className="view-site-btn">
                        <span>{isLightMode ? '🌙' : '☀️'}</span>
                        {isLightMode ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <a href="/" className="view-site-btn">
                        <span>🌐</span>
                        View Live Site
                    </a>
                    <button onClick={handleLogout} className="logout-btn">
                        <span>🚪</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile menu toggle */}
            <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
            >
                {sidebarOpen ? '✕' : '☰'}
            </button>

            {/* Sidebar overlay on mobile */}
            {sidebarOpen && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 99
                    }}
                    onClick={closeSidebar}
                />
            )}

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
