import { useState } from 'react';
import { useData, normalizeImage } from '../context/DataContext';
import { adminUploadAPI } from '../services/adminAPI';

export default function ManageProjects() {
    const {
        projects,
        projectCategories,
        addProject,
        updateProject,
        deleteProject,
        uploadImages,
        addProjectCategory,
        deleteProjectCategory
    } = useData();

    // Safety check for projects
    const projectList = Array.isArray(projects) ? projects : [];

    // Normalize categories to lowercase for comparisons/slugs, but keep display names
    // If projectCategories is missing, fallback to defaults (although server should provide them)
    const availableCategories = projectCategories || ['Hotel Interiors', 'Home Interiors', 'Office Interiors'];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ name: '', category: availableCategories[0], description: '', images: [] });
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newCategory, setNewCategory] = useState('');

    const openAdd = () => {
        setEditItem(null);
        setForm({ name: '', category: availableCategories[0], description: '', images: [] });
        setNewImageUrl('');
        setIsModalOpen(true);
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategory.trim()) {
            addProjectCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const openEdit = (item) => {
        setEditItem(item);
        const images = item.images || (item.image ? [item.image] : []);
        setForm({ ...item, images });
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = { ...form, images: form.images };
        delete submitData.image;

        if (editItem) {
            updateProject(editItem.id, submitData);
        } else {
            addProject(submitData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this project?')) {
            deleteProject(id);
        }
    };

    const getImageCount = (item) => {
        const images = item.images || (item.image ? [item.image] : []);
        return images.length;
    };

    return (
        <>
            <div className="admin-header">
                <h1>Manage Projects</h1>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(true)}>Manage Categories</button>
                    <button className="btn btn-primary" onClick={openAdd}>+ Add Project</button>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Images</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projectList.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
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
                        <h2>{editItem ? 'Edit Project' : 'Add Project'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {availableCategories.map(cat => <option key={cat} value={cat} style={{ textTransform: 'capitalize' }}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Project Images ({form.images.length} added)</label>

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
                                        id="project-image-upload"
                                    />
                                    <label htmlFor="project-image-upload" className="btn btn-secondary btn-sm upload-btn">
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

            {isCategoryModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Manage Categories</h2>
                            <button className="modal-close" onClick={() => setIsCategoryModalOpen(false)}>&times;</button>
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
                                {availableCategories.map(cat => (
                                    <div key={cat} className="category-item">
                                        <span>{cat}</span>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => {
                                                if (confirm(`Delete category "${cat}"?`)) deleteProjectCategory(cat);
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

