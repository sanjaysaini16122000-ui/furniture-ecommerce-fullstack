import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function ManageDashboardImages() {
    const {
        dashboardImages,
        carouselSettings,
        furniture,
        projects,
        addDashboardImage,
        updateDashboardImage,
        deleteDashboardImage,
        updateCarouselSettings,
        uploadImage
    } = useData();

    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({
        image: '',
        title: '',
        subtitle: '',
        linkType: 'url',
        linkId: null,
        linkUrl: '',
        order: 1,
        active: true
    });

    const sortedImages = [...(dashboardImages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

    const resetForm = () => {
        setFormData({
            image: '',
            title: '',
            subtitle: '',
            linkType: 'url',
            linkId: null,
            linkUrl: '',
            order: (dashboardImages?.length || 0) + 1,
            active: true
        });
        setEditItem(null);
    };

    const handleAdd = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setFormData({
            image: item.image || '',
            title: item.title || '',
            subtitle: item.subtitle || '',
            linkType: item.linkType || 'url',
            linkId: item.linkId || null,
            linkUrl: item.linkUrl || '',
            order: item.order || 1,
            active: item.active !== false
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this image?')) {
            deleteDashboardImage(id);
        }
    };

    const handleToggleActive = (item) => {
        updateDashboardImage(item.id, { active: !item.active });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.image) {
            alert('Please provide an image URL');
            return;
        }

        const data = {
            ...formData,
            linkId: formData.linkType !== 'url' ? parseInt(formData.linkId) || null : null,
            linkUrl: formData.linkType === 'url' ? formData.linkUrl : null
        };

        if (editItem) {
            updateDashboardImage(editItem.id, data);
        } else {
            addDashboardImage(data);
        }

        setShowModal(false);
        resetForm();
    };

    const handleSettingsChange = (key, value) => {
        updateCarouselSettings({ [key]: value });
    };

    const getLinkDisplayText = (item) => {
        if (item.linkType === 'url') {
            return item.linkUrl || 'No link';
        }
        if (item.linkType === 'project') {
            const project = projects?.find(p => p.id === item.linkId);
            return project ? `Project: ${project.name}` : 'Unknown project';
        }
        if (item.linkType === 'product') {
            const product = furniture?.find(f => f.id === item.linkId);
            return product ? `Product: ${product.name}` : 'Unknown product';
        }
        return 'No link';
    };

    return (
        <div className="admin-page">
            <div className="page-header-admin">
                <div>
                    <h1>🖼️ Dashboard Images</h1>
                    <p>Manage hero carousel images displayed on the homepage</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    + Add Image
                </button>
            </div>

            {/* Carousel Settings */}
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>⚙️ Carousel Settings</h3>
                <div className="settings-row">
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Auto-rotate Interval</label>
                        <select
                            value={carouselSettings?.interval || 5000}
                            onChange={(e) => handleSettingsChange('interval', parseInt(e.target.value))}
                        >
                            <option value={3000}>3 seconds</option>
                            <option value={5000}>5 seconds</option>
                            <option value={7000}>7 seconds</option>
                            <option value={10000}>10 seconds</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Show Indicators</label>
                        <select
                            value={carouselSettings?.showIndicators !== false ? 'true' : 'false'}
                            onChange={(e) => handleSettingsChange('showIndicators', e.target.value === 'true')}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Pause on Hover</label>
                        <select
                            value={carouselSettings?.pauseOnHover !== false ? 'true' : 'false'}
                            onChange={(e) => handleSettingsChange('pauseOnHover', e.target.value === 'true')}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Images List */}
            {sortedImages.length === 0 ? (
                <div className="admin-card empty-state">
                    <span className="empty-icon">🖼️</span>
                    <p>No dashboard images yet</p>
                    <small>Add images to create a beautiful hero carousel on your homepage</small>
                </div>
            ) : (
                <div className="dashboard-images-grid">
                    {sortedImages.map((item) => (
                        <div key={item.id} className={`dashboard-image-card ${!item.active ? 'inactive' : ''}`}>
                            <div className="dashboard-image-preview">
                                <img src={item.image} alt={item.title || 'Carousel image'} />
                                <div className="dashboard-image-order">#{item.order}</div>
                                {!item.active && <div className="dashboard-image-inactive-badge">Inactive</div>}
                            </div>
                            <div className="dashboard-image-content">
                                <h4>{item.title || 'Untitled'}</h4>
                                <p className="subtitle-text">{item.subtitle || 'No subtitle'}</p>
                                <p className="link-text">🔗 {getLinkDisplayText(item)}</p>
                            </div>
                            <div className="dashboard-image-actions">
                                <button
                                    className={`btn btn-sm ${item.active ? 'btn-secondary' : 'btn-primary'}`}
                                    onClick={() => handleToggleActive(item)}
                                >
                                    {item.active ? '🚫 Deactivate' : '✅ Activate'}
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(item)}>
                                    ✏️ Edit
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? 'Edit Image' : 'Add New Image'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Image *</label>

                                    {/* File Upload Option */}
                                    <div className="image-upload-row">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    try {
                                                        const url = await uploadImage(file);
                                                        setFormData({ ...formData, image: url });
                                                    } catch (err) {
                                                        console.error('Upload failed:', err);
                                                        alert('Failed to upload image');
                                                    }
                                                }
                                                e.target.value = '';
                                            }}
                                            style={{ display: 'none' }}
                                            id="dashboard-image-upload"
                                        />
                                        <label htmlFor="dashboard-image-upload" className="btn btn-secondary btn-sm upload-btn">
                                            📁 Upload from Computer
                                        </label>
                                        <span className="upload-hint">or paste URL below</span>
                                    </div>

                                    {/* URL Input */}
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                    />

                                    {/* Preview */}
                                    {formData.image && (
                                        <div className="image-preview" style={{ marginTop: '0.5rem' }}>
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                style={{ maxHeight: '150px', borderRadius: '8px' }}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Transform Your Space"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Order</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Subtitle</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        placeholder="Premium furniture manufacturing..."
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Link Type</label>
                                        <select
                                            value={formData.linkType}
                                            onChange={(e) => setFormData({ ...formData, linkType: e.target.value, linkId: null, linkUrl: '' })}
                                        >
                                            <option value="url">Custom URL</option>
                                            <option value="project">Link to Project</option>
                                            <option value="product">Link to Product</option>
                                        </select>
                                    </div>

                                    {formData.linkType === 'url' && (
                                        <div className="form-group">
                                            <label>URL</label>
                                            <input
                                                type="text"
                                                value={formData.linkUrl}
                                                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                                placeholder="/furniture or https://..."
                                            />
                                        </div>
                                    )}

                                    {formData.linkType === 'project' && (
                                        <div className="form-group">
                                            <label>Select Project</label>
                                            <select
                                                value={formData.linkId || ''}
                                                onChange={(e) => setFormData({ ...formData, linkId: e.target.value })}
                                            >
                                                <option value="">-- Select Project --</option>
                                                {(projects || []).map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.linkType === 'product' && (
                                        <div className="form-group">
                                            <label>Select Product</label>
                                            <select
                                                value={formData.linkId || ''}
                                                onChange={(e) => setFormData({ ...formData, linkId: e.target.value })}
                                            >
                                                <option value="">-- Select Product --</option>
                                                {(furniture || []).map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        />
                                        <span>Active (show in carousel)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editItem ? 'Update Image' : 'Add Image'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
