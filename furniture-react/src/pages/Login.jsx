import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, register, resetPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect URL from query params (e.g. ?redirect=/checkout)
    const searchParams = new URLSearchParams(location.search);
    const redirectTo = searchParams.get('redirect') || '/';

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(form.email, form.password);
        if (result.success) {
            navigate(redirectTo);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await register(form.email, form.password, form.name);
        if (result.success) {
            navigate(redirectTo);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const result = await resetPassword(form.email);
        if (result.success) {
            setSuccess('Password reset email sent! Check your inbox.');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };



    return (
        <div className="login-page">
            {/* Decorative background */}
            <div className="login-bg-pattern"></div>

            <div className="login-container">
                {/* Left decorative panel */}
                <div className="login-hero">
                    <div className="login-hero-content">
                        <div className="login-hero-icon">✦</div>
                        <h2>Welcome to<br /><span>The Urban Karigar</span></h2>
                        <p>Premium furniture & interiors crafted with passion. Sign in to access your wishlist, track orders, and get exclusive offers.</p>
                        <div className="login-features">
                            <div className="login-feature">
                                <span className="login-feature-icon">🛋️</span>
                                <span>Curated Collections</span>
                            </div>
                            <div className="login-feature">
                                <span className="login-feature-icon">❤️</span>
                                <span>Save Wishlist</span>
                            </div>
                            <div className="login-feature">
                                <span className="login-feature-icon">🎯</span>
                                <span>Exclusive Deals</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right form panel */}
                <div className="login-form-panel">
                    <div className="login-form-wrapper">
                        {/* Tab switcher */}
                        <div className="login-tabs">
                            <button
                                className={`login-tab ${mode === 'login' ? 'active' : ''}`}
                                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                            >
                                Sign In
                            </button>
                            <button
                                className={`login-tab ${mode === 'register' ? 'active' : ''}`}
                                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                            >
                                Register
                            </button>
                        </div>

                        <h3 className="login-title">
                            {mode === 'login' && 'Welcome Back'}
                            {mode === 'register' && 'Create Account'}
                            {mode === 'reset' && 'Reset Password'}
                        </h3>
                        <p className="login-subtitle">
                            {mode === 'login' && 'Sign in to your account to continue'}
                            {mode === 'register' && 'Join us for a premium experience'}
                            {mode === 'reset' && 'Enter your email to receive a reset link'}
                        </p>

                        {/* Error / Success messages */}
                        {error && (
                            <div className="login-alert login-alert-error">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="login-alert login-alert-success">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                {success}
                            </div>
                        )}



                        {/* Login Form */}
                        {mode === 'login' && (
                            <form onSubmit={handleLogin} className="login-form">
                                <div className="login-field">
                                    <label>Email Address</label>
                                    <div className="login-input-wrap">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="login-input-icon"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>
                                <div className="login-field">
                                    <label>Password</label>
                                    <div className="login-input-wrap">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="login-input-icon"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Enter password"
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button type="button" className="login-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                                <div className="login-options">
                                    <label className="login-remember">
                                        <input type="checkbox" /> Remember me
                                    </label>
                                    <button type="button" className="login-forgot" onClick={() => { setMode('reset'); setError(''); }}>
                                        Forgot Password?
                                    </button>
                                </div>
                                <button type="submit" className="login-submit" disabled={loading}>
                                    {loading ? (
                                        <span className="login-spinner"></span>
                                    ) : (
                                        <>Sign In</>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Register Form */}
                        {mode === 'register' && (
                            <form onSubmit={handleRegister} className="login-form">
                                <div className="login-field">
                                    <label>Full Name</label>
                                    <div className="login-input-wrap">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="login-input-icon"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                            autoComplete="name"
                                        />
                                    </div>
                                </div>
                                <div className="login-field">
                                    <label>Email Address</label>
                                    <div className="login-input-wrap">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="login-input-icon"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>
                                <div className="login-field">
                                    <label>Password</label>
                                    <div className="login-input-wrap">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="login-input-icon"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Min 6 characters"
                                            required
                                            autoComplete="new-password"
                                        />
                                        <button type="button" className="login-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                                <div className="login-field">
                                    <label>Confirm Password</label>
                                    <div className="login-input-wrap">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="login-input-icon"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Re-enter password"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="login-submit" disabled={loading}>
                                    {loading ? (
                                        <span className="login-spinner"></span>
                                    ) : (
                                        <>Create Account</>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Reset Password Form */}
                        {mode === 'reset' && (
                            <form onSubmit={handleReset} className="login-form">
                                <div className="login-field">
                                    <label>Email Address</label>
                                    <div className="login-input-wrap">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="login-input-icon"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="login-submit" disabled={loading}>
                                    {loading ? (
                                        <span className="login-spinner"></span>
                                    ) : (
                                        <>Send Reset Link</>
                                    )}
                                </button>
                                <button type="button" className="login-back" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                                    ← Back to Sign In
                                </button>
                            </form>
                        )}

                        <p className="login-footer-text">
                            By continuing, you agree to our{' '}
                            <Link to="/about">Terms of Service</Link> and{' '}
                            <Link to="/about">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
