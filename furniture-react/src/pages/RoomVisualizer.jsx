import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, visualizerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/visualizer.css';

export default function RoomVisualizer() {
    const [searchParams] = useSearchParams();
    const productIdFromUrl = searchParams.get('product_id');
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [roomImage, setRoomImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    
    // Furniture State: Position (%), Scale, Rotation
    const [furniture, setFurniture] = useState({
        x: 50,
        y: 50,
        scale: 1,
        rotation: 0,
        width: 300 // Base width in pixels
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const [roomFile, setRoomFile] = useState(null);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [extractedImage, setExtractedImage] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);

    // Fetch product if ID is provided
    useEffect(() => {
        const loadProduct = async (id) => {
            if (!id) return;
            try {
                const data = await productsAPI.getById(id);
                setProduct(data);
                setExtractedImage(null); // Reset extraction on product change
                setStatus({ type: '', msg: '' });
            } catch (err) {
                console.error('[RoomVisualizer] Load error:', err);
                setStatus({ type: 'error', msg: 'Failed to load product details.' });
            }
        };
        loadProduct(productIdFromUrl);
    }, [productIdFromUrl]);

    const handleExtract = async () => {
        if (!product) return;
        setIsExtracting(true);
        setStatus({ type: 'loading', msg: '🤖 AI is removing background... Please wait.' });
        
        try {
            const res = await visualizerAPI.removeBackground(product.id);
            if (res.image) {
                setExtractedImage(res.image);
                setStatus({ type: 'success', msg: '✨ Product extracted successfully!' });
                setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
            }
        } catch (err) {
            console.error('Extraction error:', err);
            const errMsg = err.response?.data?.error || 'Failed to connect to AI service.';
            setStatus({ type: 'error', msg: errMsg });
        } finally {
            setIsExtracting(false);
        }
    };

    // Other handlers...
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.trim().length > 2) {
                try {
                    const data = await productsAPI.getAll({ search: searchTerm });
                    setSearchResults(data.results || data);
                    setShowResults(true);
                } catch (err) {
                    console.error('Search error:', err);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setRoomFile(file);
            const reader = new FileReader();
            reader.onload = (err) => setRoomImage(err.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Interaction Handlers
    const startDrag = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX, y: clientY });
    };

    const onDrag = useCallback((e) => {
        if (!isDragging) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - dragStart.x;
        const dy = clientY - dragStart.y;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const dxPct = (dx / rect.width) * 100;
        const dyPct = (dy / rect.height) * 100;

        setFurniture(prev => ({
            ...prev,
            x: Math.max(0, Math.min(100, prev.x + dxPct)),
            y: Math.max(0, Math.min(100, prev.y + dyPct))
        }));

        setDragStart({ x: clientX, y: clientY });
    }, [isDragging, dragStart]);

    const stopDrag = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onDrag);
            window.addEventListener('mouseup', stopDrag);
            window.addEventListener('touchmove', onDrag);
            window.addEventListener('touchend', stopDrag);
        } else {
            window.removeEventListener('mousemove', onDrag);
            window.removeEventListener('mouseup', stopDrag);
            window.removeEventListener('touchmove', onDrag);
            window.removeEventListener('touchend', stopDrag);
        }
        return () => {
            window.removeEventListener('mousemove', onDrag);
            window.removeEventListener('mouseup', stopDrag);
            window.removeEventListener('touchmove', onDrag);
            window.removeEventListener('touchend', stopDrag);
        };
    }, [isDragging, onDrag]);

    const handleSave = async () => {
        if (!isAuthenticated) {
            setStatus({ type: 'error', msg: 'Please log in to save your design.' });
            return;
        }
        if (!roomFile || !product) return;
        
        setIsLoading(true);
        setStatus({ type: 'loading', msg: 'Saving visualization to your account...' });

        try {
            const formData = new FormData();
            formData.append('room_image', roomFile);
            formData.append('product', product.id);
            formData.append('x_pos', (furniture.x / 100).toFixed(4));
            formData.append('y_pos', (furniture.y / 100).toFixed(4));
            formData.append('scale', furniture.scale.toFixed(4));
            formData.append('rotation', furniture.rotation.toFixed(2));

            await visualizerAPI.save(formData);
            
            setStatus({ type: 'success', msg: '✨ Saved! View it in your account.' });
            setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
        } catch (err) {
            console.error('Failed to save visualization:', err);
            setStatus({ type: 'error', msg: 'Connection failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const getProductImage = (p) => {
        if (!p) return null;
        const images = p.images || (p.image ? [p.image] : []);
        const first = images[0];
        if (typeof first === 'object') return first.image || null;
        return first || null;
    };

    return (
        <div className="visualizer-page">
            <div className="container">
                {status.msg && (
                    <div className={`v-alert ${status.type}`}>
                        {status.msg}
                    </div>
                )}
                <div className="visualizer-container">
                    {/* Main Canvas Area */}
                    <div className="visualizer-canvas-area" ref={canvasRef}>
                        {roomImage ? (
                            <>
                                <img src={roomImage} className="room-bg" alt="Room" />
                                {product && getProductImage(product) && (
                                    <div 
                                        className={`furniture-overlay ${isDragging ? 'active' : ''}`}
                                        style={{
                                            left: `${furniture.x}%`,
                                            top: `${furniture.y}%`,
                                            width: `${furniture.width * furniture.scale}px`,
                                            transform: `translate(-50%, -50%) rotate(${furniture.rotation}deg)`,
                                        }}
                                        onMouseDown={startDrag}
                                        onTouchStart={startDrag}
                                    >
                                        <img src={extractedImage || getProductImage(product)} alt={product.name} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-canvas-msg">
                                <span>📸</span>
                                <h2>Upload your room photo to start</h2>
                                <p>See how luxury furniture fits in your space</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Controls */}
                    <div className="visualizer-sidebar">
                        <div className="v-card">
                            <h3>1. Setup Your Room</h3>
                            <label className="upload-zone">
                                <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                {roomImage ? 'Change Room Photo' : 'Upload Room Photo'}
                            </label>
                        </div>

                        <div className="v-card">
                            <h3>2. Choose Furniture</h3>
                            <div className="v-search-box">
                                <input 
                                    type="text" 
                                    placeholder="Search furniture..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="v-search-input"
                                />
                                {showResults && searchResults.length > 0 && (
                                    <div className="v-search-results">
                                        {searchResults.map(p => {
                                            const pImg = getProductImage(p);
                                            return (
                                                <div key={p.id} className="v-search-item" onClick={() => { setProduct(p); setShowResults(false); setSearchTerm(''); setExtractedImage(null); }}>
                                                    {pImg ? <img src={pImg} alt="" /> : <span className="v-search-placeholder">🪑</span>}
                                                    <span>{p.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {product && (
                                <div className="v-product-selected">
                                    {getProductImage(product) ? (
                                        <img 
                                            src={extractedImage || getProductImage(product)} 
                                            alt={product.name} 
                                            className="v-product-img" 
                                        />
                                    ) : (
                                        <div className="v-product-img-placeholder">🪑</div>
                                    )}
                                    <div className="v-product-info">
                                        <h4>{product.name}</h4>
                                        <p>{product.category}</p>
                                    </div>
                                </div>
                            )}
                            
                            {product && !extractedImage && (
                                <button 
                                    className="v-control-btn primary" 
                                    style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
                                    onClick={handleExtract}
                                    disabled={isExtracting}
                                >
                                    {isExtracting ? '🤖 Extracting...' : '✨ AI: Extract Product (PNG)'}
                                </button>
                            )}
                        </div>

                        {roomImage && product && (
                            <div className="v-card">
                                <h3>3. Adjust Design</h3>
                                <div className="v-controls-grid">
                                    <button className="v-control-btn" onClick={() => setFurniture(f => ({...f, scale: f.scale + 0.1}))}>➕ Size</button>
                                    <button className="v-control-btn" onClick={() => setFurniture(f => ({...f, scale: Math.max(0.1, f.scale - 0.1)}))}>➖ Size</button>
                                    <button className="v-control-btn" onClick={() => setFurniture(f => ({...f, rotation: f.rotation + 15}))}>🔄 Rotate</button>
                                    <button className="v-control-btn" onClick={() => setFurniture(f => ({...f, rotation: f.rotation - 15}))}>↩️ Rotate</button>
                                </div>
                                <button 
                                    className="v-control-btn primary" 
                                    style={{ width: '100%', marginTop: '1.5rem' }}
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : '💾 Save Visualisation'}
                                </button>
                            </div>
                        )}

                        <Link to="/furniture" className="v-control-btn link">
                            Back to Gallery
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
