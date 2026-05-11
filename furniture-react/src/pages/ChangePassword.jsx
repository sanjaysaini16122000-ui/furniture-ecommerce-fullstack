import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/account.css';

export default function ChangePassword() {
    const { changePassword } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        const result = await changePassword(formData.oldPassword, formData.newPassword);
        setIsLoading(false);

        if (result.success) {
            setSuccess('Password changed successfully!');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => navigate('/account'), 2000);
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="account-container">
            <div className="account-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/account')}
                        className="btn btn-secondary"
                        style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}
                    >
                        ← Back
                    </button>
                    <h1 style={{ margin: 0 }}>Change Password</h1>
                </div>

                <div className="account-section">
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
                        Ensure your account is using a long, random password to stay secure.
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="oldPassword">Current Password</label>
                            <input
                                type="password"
                                id="oldPassword"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Min 8 characters"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repeat new password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                            style={{ marginTop: '1.5rem', width: '100%' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
