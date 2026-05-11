import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo-new.png';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // If already authenticated, redirect to admin
    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="admin-login-header">
                        <img src={logo} alt="The Urban Karigar" className="admin-login-logo" />
                        <h1>Admin Panel</h1>
                        <p>Sign in to manage your content</p>
                    </div>

                    <form onSubmit={handleSubmit} className="admin-login-form">
                        {error && (
                            <div className="admin-login-error">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="admin-login-field">
                            <label htmlFor="admin-email">Email</label>
                            <input
                                type="email"
                                id="admin-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="admin-login-field">
                            <label htmlFor="admin-password">Password</label>
                            <input
                                type="password"
                                id="admin-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="admin-login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="admin-login-footer">
                        <a href="/" className="admin-back-to-site">
                            ← Back to Website
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
