import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function Settings() {
    const { settings, updateSettings, resetData } = useData();
    const [form, setForm] = useState({ ...settings });
    const [saved, setSaved] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSettings(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset ALL data to defaults? This cannot be undone.')) {
            resetData();
            setForm({ ...settings });
            alert('Data reset to defaults!');
        }
    };

    return (
        <>
            <div className="admin-header">
                <h1>⚙️ Settings</h1>
            </div>

            <div className="settings-container">
                <form onSubmit={handleSubmit}>
                    {/* Business Information */}
                    <div className="settings-section">
                        <h3>🏢 Business Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Business Name</label>
                                <input
                                    type="text"
                                    value={form.businessName || ''}
                                    onChange={e => setForm({ ...form, businessName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tagline</label>
                                <input
                                    type="text"
                                    value={form.tagline || ''}
                                    onChange={e => setForm({ ...form, tagline: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                value={form.address || ''}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="settings-section">
                        <h3>📞 Contact Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>WhatsApp Number (with country code)</label>
                                <input
                                    type="text"
                                    value={form.whatsappNumber || ''}
                                    onChange={e => setForm({ ...form, whatsappNumber: e.target.value })}
                                    placeholder="917688885688"
                                    required
                                />
                                <small>Format: 91XXXXXXXXXX (without + or spaces)</small>
                            </div>
                            <div className="form-group">
                                <label>Phone Display</label>
                                <input
                                    type="text"
                                    value={form.phone || ''}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+91 76888 85688"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={form.email || ''}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="settings-section">
                        <h3>🔗 Social Media Links</h3>
                        <div className="form-group">
                            <label>📸 Instagram URL</label>
                            <input
                                type="url"
                                value={form.instagramUrl || ''}
                                onChange={e => setForm({ ...form, instagramUrl: e.target.value })}
                                placeholder="https://instagram.com/yourusername"
                            />
                        </div>
                        <div className="form-group">
                            <label>📘 Facebook URL</label>
                            <input
                                type="url"
                                value={form.facebookUrl || ''}
                                onChange={e => setForm({ ...form, facebookUrl: e.target.value })}
                                placeholder="https://facebook.com/yourpage"
                            />
                        </div>
                        <div className="form-group">
                            <label>💼 LinkedIn URL</label>
                            <input
                                type="url"
                                value={form.linkedinUrl || ''}
                                onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
                                placeholder="https://linkedin.com/company/yourcompany"
                            />
                        </div>
                        <div className="form-group">
                            <label>📌 Pinterest URL</label>
                            <input
                                type="url"
                                value={form.pinterestUrl || ''}
                                onChange={e => setForm({ ...form, pinterestUrl: e.target.value })}
                                placeholder="https://pinterest.com/yourprofile"
                            />
                        </div>
                        <div className="form-group">
                            <label>▶️ YouTube URL</label>
                            <input
                                type="url"
                                value={form.youtubeUrl || ''}
                                onChange={e => setForm({ ...form, youtubeUrl: e.target.value })}
                                placeholder="https://youtube.com/@yourchannel"
                            />
                        </div>
                    </div>

                    <div className="settings-actions">
                        <button type="submit" className="btn btn-primary">
                            💾 Save Settings
                        </button>
                        {saved && <span className="success-message">✓ Settings saved successfully!</span>}
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="settings-section danger-zone">
                    <h3>⚠️ Danger Zone</h3>
                    <p>Reset all data to default values. This will delete all your custom products, kitchens, projects, and settings.</p>
                    <button type="button" className="btn btn-danger" onClick={handleReset}>
                        🗑️ Reset All Data
                    </button>
                </div>
            </div>
        </>
    );
}
