import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import '../styles/account.css';

export default function Account() {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Helper to get full image URL
    const getAvatarUrl = (path) => {
        if (!path) return null;
        if (typeof path !== 'string') return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        
        // Remove 'api' from base URL to get host (e.g., http://127.0.0.1:8000)
        const baseUrl = API_BASE_URL.replace('/api', '').replace(/\/$/, '');
        
        // Ensure path starts with /media/ if it's a relative path from the backend
        let cleanPath = path;
        if (!cleanPath.startsWith('/media/') && !cleanPath.startsWith('media/')) {
            cleanPath = cleanPath.startsWith('/') ? `/media${cleanPath}` : `/media/${cleanPath}`;
        } else {
            cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        }
        
        const fullUrl = `${baseUrl}${cleanPath}`;
        return fullUrl;
    };
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Populate form with user data
        setFormData({
            name: user.first_name || '',
            email: user.email || '',
            phone: user.phone || '',
        });
        
        // Sync local profile image state with context user
        if (user.avatar) {
            setProfileImage(user.avatar);
        } else {
            setProfileImage(null);
        }
    }, [user, navigate]);

    // Cleanup state on unmount or logout
    useEffect(() => {
        if (!user) {
            setProfileImage(null);
        }
    }, [user]);

    const handleImageError = (e) => {
        console.error('Avatar load failure:', e.target.src);
        // Fallback to initials UI
        setProfileImage(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        // Backend expects first_name and last_name separately
        const trimmedName = formData.name.trim();
        const spaceIndex = trimmedName.indexOf(' ');
        const first_name = spaceIndex > -1 ? trimmedName.substring(0, spaceIndex) : trimmedName;
        const last_name = spaceIndex > -1 ? trimmedName.substring(spaceIndex + 1) : '';

        const dataToUpdate = {
            first_name,
            last_name,
            phone: formData.phone,
        };

        const result = await updateProfile(dataToUpdate, false);
        setIsSubmitting(false);

        if (result.success) {
            setSuccess('Profile details updated successfully!');
        } else {
            setError(result.error || 'Failed to update profile details.');
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }
            
            setError('');
            setSuccess('');
            setIsUploading(true);
            
            // Show preview immediately for good UX
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to backend
            const uploadData = new FormData();
            uploadData.append('avatar', file); // changed from profile_image
            
            const result = await updateProfile(uploadData, true);
            setIsUploading(false);
            
            if (result.success) {
                setSuccess('Profile photo updated successfully!');
            } else {
                setError(result.error || 'Failed to update photo');
                // Revert to old image on failure
                setProfileImage(user.avatar || null);
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="account-page">
            <div className="container">
                <div className="account-grid">
                    {/* Left Sidebar - Profile Summary */}
                    <div className="account-sidebar">
                        <div className="profile-card glass-card">
                            <label className="profile-avatar-wrapper" htmlFor="profile-upload">
                                <div className={`profile-avatar ${isUploading ? 'uploading' : ''}`}>
                                    {isUploading ? (
                                        <div className="orders-loading-spinner" style={{width: '30px', height: '30px', margin: 'auto'}}></div>
                                    ) : (profileImage && typeof profileImage === 'string') ? (
                                        <img 
                                            src={getAvatarUrl(profileImage)} 
                                            alt="Profile" 
                                            loading="eager" 
                                            fetchPriority="high" 
                                            onError={handleImageError}
                                        />
                                    ) : (
                                        formData.name.charAt(0) || user.email.charAt(0)
                                    )}
                                </div>
                                <div className="profile-avatar-overlay">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                </div>
                                <input 
                                    type="file" 
                                    id="profile-upload" 
                                    hidden 
                                    accept="image/*" 
                                    onChange={handleImageChange}
                                />
                            </label>
                            <div className="profile-info">
                                <h3>{formData.name || 'User'}</h3>
                                <p>{user.email}</p>
                            </div>
                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-value">Active</span>
                                    <span className="stat-label">Status</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">Premium</span>
                                    <span className="stat-label">Member</span>
                                </div>
                            </div>
                            <nav className="account-nav">
                                <button onClick={() => navigate('/account/orders')} className="nav-btn">
                                    <span className="nav-icon">📦</span> My Orders
                                </button>
                                <button onClick={() => navigate('/account/change-password')} className="nav-btn">
                                    <span className="nav-icon">🔒</span> Security
                                </button>
                                <button onClick={handleLogout} className="nav-btn logout-btn">
                                    <span className="nav-icon">🚪</span> Sign Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content - Profile Settings */}
                    <div className="account-main">
                        <div className="settings-card glass-card">
                            <div className="card-header">
                                <h2 className="gradient-text">Profile Settings</h2>
                                <p>Manage your account settings and personal information</p>
                            </div>

                            <div className="settings-body">
                                {error && <div className="alert alert-error">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}

                                <form className="settings-form" onSubmit={handleProfileSubmit}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">Full Name</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon">👤</span>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone Number</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon">📞</span>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <div className="input-wrapper disabled">
                                            <span className="input-icon">✉️</span>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                disabled
                                            />
                                        </div>
                                        <small className="help-text">Your email address is used for secure login and cannot be changed.</small>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="btn-luxury" disabled={isSubmitting}>
                                            {isSubmitting ? 'Updating...' : 'Update Profile'}
                                            <span className="btn-shine"></span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
