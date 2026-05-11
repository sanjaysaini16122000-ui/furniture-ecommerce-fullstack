import { useState } from 'react';
import { useData, normalizeImage } from '../context/DataContext';
import { adminUploadAPI } from '../services/adminAPI';

export default function ManageKitchens() {
    const { kitchens, addKitchen, updateKitchen, deleteKitchen, uploadImages } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ name: '', type: 'L-Shape', description: '', price: '', features: [], images: [] });
    const [featureInput, setFeatureInput] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    const types = ['L-Shape', 'U-Shape', 'Parallel', 'Island', 'Straight'];

    const formatPrice = (price) => {
        if (!price || price === 0) return 'Get Quote';
        return '₹' + Number(price).toLocaleString('en-IN');
    };

    const openAdd = () => {
        setEditItem(null);
        setForm({ name: '', type: 'L-Shape', description: '', price: '', features: [], images: [] });
        setNewImageUrl('');
        setIsModalOpen(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        const images = item.images || (item.image ? [item.image] : []);
        setForm({ ...item, features: [...item.features], price: item.price || '', images });
        setNewImageUrl('');
        setIsModalOpen(true);
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            setForm({ ...form, features: [...form.features, featureInput.trim()] });
            setFeatureInput('');
        }
    };

    const removeFeature = (index) => {
        setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...form,
            price: form.price ? Number(form.price) : 0,
            images: form.images
        };
        delete submitData.image;

        if (editItem) {
            updateKitchen(editItem.id, submitData);
        } else {
            addKitchen(submitData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteKitchen(id);
        }
    };

    const getImageCount = (item) => {
        const images = item.images || (item.image ? [item.image] : []);
        return images.length;
    };

    return (
        <>
            <div className="admin-header">
                <h1>Manage Kitchens</h1>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Kitchen</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Images</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kitchens.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.type}</td>
                                <td style={{ fontWeight: '600', color: '#c9a24d' }}>{formatPrice(item.price)}</td>
                                <td>{getImageCount(item)} photo(s)</td>
                                <td className="table-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal modal-large" onClick={e => e.stopPropagation()}>
                        <h2>{editItem ? 'Edit Kitchen' : 'Add Kitchen'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Starting Price (₹) - Leave empty for "Get Quote"</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: e.target.value })}
                                    placeholder="e.g. 150000"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Features ({form.features.length} added)</label>
                                <div className="feature-input">
                                    <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add a feature" />
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={addFeature}>Add</button>
                                </div>
                                {form.features.length > 0 && (
                                    <ul className="feature-list">
                                        {form.features.map((f, i) => (
                                            <li key={i}>
                                                {f} <button type="button" className="remove-feature" onClick={() => removeFeature(i)}>×</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Kitchen Images ({form.images.length} added)</label>

                                {/* File Upload Option */}
                                <div className="image-upload-row">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files);
                                            if (files.length === 0) return;
                                            try {
                                                const urls = await uploadImages(files);
                                                setForm(prev => ({
                                                    ...prev,
                                                    images: [...prev.images, ...urls]
                                                }));
                                            } catch (err) {
                                                console.error('Upload failed:', err);
                                                alert('Failed to upload images');
                                            }
                                            e.target.value = ''; // Reset input
                                        }}
                                        style={{ display: 'none' }}
                                        id="kitchen-image-upload"
                                    />
                                    <label htmlFor="kitchen-image-upload" className="btn btn-secondary btn-sm upload-btn">
                                        📁 Upload from Computer
                                    </label>
                                    <span className="upload-hint">or paste URL below</span>
                                </div>

                                {/* URL Input Option */}
                                <div className="image-input-row">
                                    <input
                                        type="text"
                                        value={newImageUrl}
                                        onChange={e => setNewImageUrl(e.target.value)}
                                        placeholder="Enter image URL and click Add"
                                    />
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={addImage}>Add</button>
                                </div>

                                {/* Image Previews */}
                                {form.images.length > 0 && (
                                    <div className="image-list">
                                        {form.images.map((img, index) => (
                                            <div key={index} className="image-item">
                                                <img src={img} alt={`Preview ${index + 1}`} />
                                                <button type="button" className="remove-image" onClick={() => removeImage(index)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

