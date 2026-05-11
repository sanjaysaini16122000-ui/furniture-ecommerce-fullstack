import { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { adminProductsAPI, adminCategoriesAPI, adminUploadAPI } from '../services/adminAPI';
import { normalizeImage } from '../context/DataContext';

export default function ManageFurniture() {
    const { furniture, categories, refreshData } = useData();
    const [products, setProducts] = useState([]);
    const [catList, setCatList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({
        name: '', category: '', description: '', price: '',
        originalPrice: '', rating: '', features: '', finishes: '', images: []
    });
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newCategory, setNewCategory] = useState('');

    // Sync from context
    useEffect(() => {
        setProducts(furniture || []);
    }, [furniture]);

    useEffect(() => {
        setCatList(categories || []);
    }, [categories]);

    const formatPrice = (price) => {
        if (!price || price === 0) return 'Get Quote';
        return '₹' + Number(price).toLocaleString('en-IN');
    };

    const openAdd = () => {
        setEditItem(null);
        setForm({
            name: '', category: catList[0] || 'Sofa Sets', description: '', price: '',
            originalPrice: '', rating: '', features: '', finishes: '', images: []
        });
        setNewImageUrl('');
        setIsModalOpen(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        const images = item.images || (item.image ? [item.image] : []);
        setForm({
            ...item,
            price: item.price || '',
            originalPrice: item.originalPrice || item.original_price || '',
            rating: item.rating || '',
            features: Array.isArray(item.features) ? item.features.join('\n') : (item.features || ''),
            finishes: Array.isArray(item.finishes)
                ? item.finishes.map(f => typeof f === 'string' ? f : f.name).join(', ')
                : (item.finishes || ''),
            images
        });
        setNewImageUrl('');
        setIsModalOpen(true);
    };

    const addImage = () => {
        if (newImageUrl.trim()) {
            setForm({ ...form, images: [...form.images, newImageUrl.trim()] });
            setNewImageUrl('');
        }
    };

    const removeImage = (index) => {
        setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        try {
            const urls = await adminUploadAPI.uploadImages(files);
            setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
        } catch (err) {
            console.error('[ManageFurniture] Upload failed:', err);
            alert('Failed to upload images. Please try again.');
        }
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Parse features
            const featuresArray = form.features
                ? form.features.split('\n').map(f => f.trim()).filter(Boolean)
                : [];

            // Parse finishes
            const finishesArray = form.finishes
                ? form.finishes.split(',').map(f => {
                    const name = f.trim();
                    const colors = {
                        'Teak': '#8B6914', 'Light Walnut': '#A0785A', 'Walnut': '#5C4033',
                        'Natural': '#D2B48C', 'Honey': '#EB9605', 'Mahogany': '#420D09',
                        'Dark Brown': '#3B2316', 'Cherry': '#6B0F1A', 'Oak': '#C3A26A',
                    };
                    return { name, color: colors[name] || '#8B6914' };
                }).filter(f => f.name)
                : [];

            const submitData = {
                name: form.name,
                description: form.description,
                price: form.price ? Number(form.price) : 0,
                original_price: form.originalPrice ? Number(form.originalPrice) : 0,
                category: form.category,
                rating: form.rating ? Number(form.rating) : 0,
                features: featuresArray,
                finishes: finishesArray,
                images: form.images,
            };

            if (editItem) {
                // Try backend update
                try {
                    await adminProductsAPI.updateJSON(editItem.id, submitData);
                } catch (err) {
                    console.warn('[ManageFurniture] Backend update failed, updating locally:', err.message);
                }
                // Update local state
                setProducts(prev =>
                    prev.map(item => item.id === editItem.id ? { ...item, ...submitData, originalPrice: submitData.original_price } : item)
                );
            } else {
                // Try backend create
                try {
                    const created = await adminProductsAPI.createJSON(submitData);
                    setProducts(prev => [{ ...submitData, ...created, originalPrice: submitData.original_price }, ...prev]);
                } catch (err) {
                    console.warn('[ManageFurniture] Backend create failed, adding locally:', err.message);
                    const newItem = {
                        ...submitData,
                        id: Date.now().toString(),
                        originalPrice: submitData.original_price,
                        image: form.images[0] || '',
                        createdAt: new Date().toISOString(),
                    };
                    setProducts(prev => [newItem, ...prev]);
                }
            }

            setIsModalOpen(false);
            // Refresh context data
            if (refreshData) refreshData();
        } catch (err) {
            console.error('[ManageFurniture] Submit failed:', err);
            alert('Failed to save product. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await adminProductsAPI.delete(id);
        } catch (err) {
            console.warn('[ManageFurniture] Backend delete failed:', err.message);
        }
        setProducts(prev => prev.filter(item => item.id !== id));
        if (refreshData) refreshData();
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await adminCategoriesAPI.create({ name: newCategory.trim() });
        } catch (err) {
            console.warn('[ManageFurniture] Backend category create failed:', err.message);
        }
        setCatList(prev => prev.includes(newCategory.trim()) ? prev : [...prev, newCategory.trim()]);
        setNewCategory('');
    };

    const handleDeleteCategory = async (cat) => {
        if (!confirm(`Delete category "${cat}"?`)) return;
        // Find category ID if needed
        try {
            const allCats = await adminCategoriesAPI.getAll();
            const catData = (allCats.results || allCats || []).find(c =>
                (typeof c === 'string' ? c : c.name) === cat
            );
            if (catData?.id) {
                await adminCategoriesAPI.delete(catData.id);
            }
        } catch (err) {
            console.warn('[ManageFurniture] Backend category delete failed:', err.message);
        }
        setCatList(prev => prev.filter(c => c !== cat));
    };

    const getImageCount = (item) => {
        const images = item.images || (item.image ? [item.image] : []);
        return images.length;
    };

    const getThumbUrl = (item) => {
        const images = item.images || (item.image ? [item.image] : []);
        const first = images[0];
        return first ? normalizeImage(first) : '';
    };

    // Filtered products
    const filteredProducts = products.filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (item.name || '').toLowerCase().includes(q) ||
            (item.category || '').toLowerCase().includes(q);
    });

    return (
        <>
            <div className="admin-header">
                <h1>🛋️ Manage Furniture</h1>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div className="admin-search">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(true)}>
                        📂 Categories
                    </button>
                    <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
                </div>
            </div>

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
                <div className="admin-card empty-state">
                    <span className="empty-icon">🛋️</span>
                    <p>{searchTerm ? 'No products match your search' : 'No furniture products yet'}</p>
                    <small>Add your first product using the button above</small>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>MRP</th>
                                <th>Rating</th>
                                <th>Images</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        {getThumbUrl(item) ? (
                                            <img
                                                src={getThumbUrl(item)}
                                                alt={item.name}
                                                className="product-thumb"
                                                onError={e => e.target.style.display = 'none'}
                                            />
                                        ) : (
                                            <div className="product-thumb" style={{
                                                background: 'var(--admin-surface-hover)',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '1.2rem'
                                            }}>
                                                🖼️
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{item.name}</td>
                                    <td>{item.category}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--admin-accent)' }}>{formatPrice(item.price)}</td>
                                    <td style={{ color: 'var(--admin-text-muted)', textDecoration: 'line-through' }}>
                                        {item.originalPrice || item.original_price ? formatPrice(item.originalPrice || item.original_price) : '—'}
                                    </td>
                                    <td>{item.rating ? `${item.rating} ★` : '—'}</td>
                                    <td>{getImageCount(item)}</td>
                                    <td className="table-actions">
                                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}>✏️ Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Category Modal */}
            {isCategoryModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
                    <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📂 Manage Categories</h2>
                            <button className="modal-close" onClick={() => setIsCategoryModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddCategory} className="add-category-form">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    placeholder="New Category Name"
                                    required
                                />
                                <button type="submit" className="btn btn-primary">Add</button>
                            </form>
                            <div className="category-list">
                                {catList.map(cat => (
                                    <div key={cat} className="category-item">
                                        <span>{cat}</span>
                                        <button className="btn-icon delete" onClick={() => handleDeleteCategory(cat)}>
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal modal-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? '✏️ Edit Product' : '➕ Add Product'}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {catList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sale Price (₹)</label>
                                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 29999" min="0" />
                                </div>
                                <div className="form-group">
                                    <label>Original Price / MRP (₹)</label>
                                    <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="e.g. 66898" min="0" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Rating (1-5)</label>
                                    <input type="number" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} placeholder="e.g. 4.8" min="0" max="5" step="0.1" />
                                </div>
                                <div className="form-group">
                                    <label>Finishes (comma-separated)</label>
                                    <input type="text" value={form.finishes} onChange={e => setForm({ ...form, finishes: e.target.value })} placeholder="e.g. Teak, Walnut, Honey" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                            </div>

                            <div className="form-group">
                                <label>Features (one per line)</label>
                                <textarea
                                    value={form.features}
                                    onChange={e => setForm({ ...form, features: e.target.value })}
                                    placeholder={"Premium Quality Sheesham Wood\nElegant Handcrafted Design\nLong-Lasting & Termite Resistant"}
                                    rows={4}
                                />
                            </div>

                            <div className="form-group">
                                <label>Product Images ({form.images.length} added)</label>
                                <div className="image-upload-row">
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} id="furniture-image-upload" />
                                    <label htmlFor="furniture-image-upload" className="btn btn-secondary btn-sm upload-btn">📁 Upload</label>
                                    <span className="upload-hint">or paste URL below</span>
                                </div>
                                <div className="image-input-row">
                                    <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Enter image URL and click Add" />
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={addImage}>Add</button>
                                </div>
                                {form.images.length > 0 && (
                                    <div className="image-list">
                                        {form.images.map((img, index) => (
                                            <div key={index} className="image-item">
                                                <img src={normalizeImage(img)} alt={`Preview ${index + 1}`} />
                                                <button type="button" className="remove-image" onClick={() => removeImage(index)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <><span className="spinner"></span> Saving...</> : editItem ? '💾 Update' : '➕ Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
