import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { checkIsAdmin } from '../admin/ProtectedRoute';

import logo from '../assets/logo.png';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useData();
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart();

    const isAdmin = checkIsAdmin(user, isAuthenticated);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const leftLinks = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/furniture', label: 'Furniture', icon: '🛋️' },
        { path: '/kitchen', label: 'Kitchen', icon: '🍳' },
    ];

    const rightLinks = [
        { path: '/projects', label: 'Projects', icon: '📁' },
        { path: '/about', label: 'About', icon: '✨' },
    ];

    const allLinks = [
        ...leftLinks,
        ...rightLinks,
        { path: '/wishlist', label: 'Wishlist', icon: '❤️' },
        { path: '/cart', label: 'Cart', icon: '🛒' },
        { path: '/account/orders', label: 'Orders', icon: '📦' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <a href="#main-content" className="skip-to-content">Skip to content</a>

            {/* ── Top Bar ── */}
            <div className="nav-topbar">
                <div className="nav-topbar-inner">
                    <a href={`tel:${settings.phone || '+919999999999'}`} className="topbar-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                        <span>Call Us</span>
                    </a>
                    <span className="topbar-divider">|</span>
                    <a href={`mailto:${settings.email || 'info@theurbankarigar.com'}`} className="topbar-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                        <span>Email</span>
                    </a>
                    <span className="topbar-divider">|</span>
                    <a href={settings.instagramUrl || 'https://instagram.com'} className="topbar-item" target="_blank" rel="noopener noreferrer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        <span>Instagram</span>
                    </a>

                    {/* Right side: Login / Account */}
                    <div className="topbar-right">
                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <>
                                        <Link to="/admin" className="topbar-admin-badge" title="Access Admin Dashboard">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S6.5 8.38 6.5 7s1.12-2.5 2.5-2.5zM9 16c-2.33 0-4.39-1.39-5.33-3.41.02-.33.33-.59.66-.59h9.34c.33 0 .64.26.66.59C13.39 14.61 11.33 16 9 16z"/>
                                            </svg>
                                            <span>Admin</span>
                                        </Link>
                                    </>
                                )}
                                <Link to="/account" className="topbar-item topbar-account">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                    <span>My Account</span>
                                </Link>
                                <span className="topbar-divider">|</span>
                                <Link to="/account/orders" className="topbar-item topbar-orders">
                                    <span>My Orders</span>
                                </Link>
                                <button onClick={handleLogout} className="topbar-item topbar-logout" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 8 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8c-1.1 0-2 .9-2 2v4h2V5h8v14h-8v-4h-2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /></svg>
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="topbar-item topbar-login">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main Bar ── */}
            <div className="nav-main">
                <div className="nav-container">
                    <div
                        className={`nav-toggle ${isOpen ? 'active' : ''}`}
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isOpen}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    {/* Left nav links */}
                    <ul className="nav-links-left">
                        {leftLinks.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className={isActive(item.path)}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>

                    {/* Center logo — deer icon + text */}
                    <Link to="/" className="nav-logo">
                        <img src={logo} alt="The Urban Karigar" />
                        <div className="nav-logo-text">
                            <span className="nav-logo-tagline">Furniture & Interior</span>
                        </div>
                    </Link>

                    {/* Right nav links */}
                    <ul className="nav-links-right">
                        {rightLinks.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className={isActive(item.path)}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>

                    <Link to="/cart" className="nav-cart-btn" style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        margin: '0 1.25rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        transition: 'all 0.3s ease'
                    }}>
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ filter: 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.2))' }}
                        >
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-10px',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                color: 'white',
                                borderRadius: '50%',
                                minWidth: '18px',
                                height: '18px',
                                padding: '0 4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '800',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                border: '1.5px solid #1a1a1a'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <Link to="/contact" className="nav-cta">
                        Get Quote
                    </Link>

                    {/* Mobile overlay */}
                    <div
                        className={`nav-menu-overlay ${isOpen ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Mobile slide-out menu */}
                    <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
                        {/* Mobile menu header */}
                        <li className="mobile-menu-header">
                            <img src={logo} alt="The Urban Karigar" />
                            <button className="mobile-menu-close" onClick={() => setIsOpen(false)}>✕</button>
                        </li>

                        {allLinks.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className={isActive(item.path)} onClick={() => setIsOpen(false)}>
                                    <span className="menu-icon">{item.icon}</span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}

                        {/* Mobile login/logout link */}
                        <li>
                            {isAuthenticated ? (
                                <>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            className={`${isActive('/admin')} mobile-admin-link`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <span className="menu-icon">🛡️</span>
                                            Admin Panel (Management)
                                        </Link>
                                    )}
                                    <Link to="/account" className={isActive('/account')} onClick={() => setIsOpen(false)}>
                                        <span className="menu-icon">👤</span>
                                        My Account
                                    </Link>
                                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="menu-icon" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                        <span className="menu-icon">🚪</span>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className={isActive('/login')} onClick={() => setIsOpen(false)}>
                                    <span className="menu-icon">👤</span>
                                    Login / Register
                                </Link>
                            )}
                        </li>

                        {/* Mobile menu footer */}
                        <li className="mobile-menu-footer">
                            <p>Premium Furniture & Interior Design</p>
                            <div className="mobile-menu-social">
                                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
                                <a href={`tel:${settings.phone || '+919999999999'}`}>📱 Call Us</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
