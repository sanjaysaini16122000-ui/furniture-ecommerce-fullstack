import { useState } from 'react';
import { useData } from '../context/DataContext';

/**
 * Share button with WhatsApp share (includes image link), native share with image file, and copy-to-clipboard.
 */
export default function ShareButton({ productName, productPrice, productImage, productDescription, productCategory, productId }) {
    const { settings } = useData();
    const [copied, setCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [sharing, setSharing] = useState(false);

    const currentUrl = typeof window !== 'undefined'
        ? (productId ? `${window.location.origin}/furniture/${productId}` : window.location.href)
        : '';
    const businessName = settings.businessName || 'The Urban Karigar';

    // Rich share text with product details
    const shareText = [
        `🪑 *${productName}*`,
        productPrice ? `💰 Price: ${productPrice}` : '',
        productCategory ? `📂 Category: ${productCategory}` : '',
        productDescription ? `📝 ${productDescription.substring(0, 120)}${productDescription.length > 120 ? '...' : ''}` : '',
        '',
        `🏪 ${businessName}`,
        productImage ? `🖼️ Product Image: ${productImage}` : '',
        `🔗 ${currentUrl}`
    ].filter(Boolean).join('\n');

    const shareWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
        setMenuOpen(false);
    };

    const copyLink = async () => {
        try {
            // Copy rich text with product details
            const copyText = `${productName}${productPrice ? ` — ${productPrice}` : ''}\n${productImage || ''}\n${currentUrl}`;
            await navigator.clipboard.writeText(copyText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = currentUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        setMenuOpen(false);
    };

    const nativeShare = async () => {
        if (!navigator.share) return;
        setSharing(true);

        try {
            const shareData = {
                title: productName,
                text: shareText,
                url: currentUrl,
            };

            // Try to share with image file if available
            if (productImage && navigator.canShare) {
                try {
                    const response = await fetch(productImage);
                    const blob = await response.blob();
                    const fileName = `${productName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                    const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });

                    const fileShareData = { ...shareData, files: [file] };
                    if (navigator.canShare(fileShareData)) {
                        await navigator.share(fileShareData);
                        setSharing(false);
                        setMenuOpen(false);
                        return;
                    }
                } catch {
                    // Image fetch failed (CORS etc.), fall through to text-only share
                }
            }

            // Fallback: text-only share
            await navigator.share(shareData);
        } catch {
            // User cancelled or share failed
        }
        setSharing(false);
        setMenuOpen(false);
    };

    // Download image to device (for manual sharing)
    const downloadImage = async () => {
        if (!productImage) return;
        setSharing(true);

        try {
            const response = await fetch(productImage);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${productName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            // Fallback: open image in new tab
            window.open(productImage, '_blank');
        }
        setSharing(false);
        setMenuOpen(false);
    };

    return (
        <div className="share-button-wrapper">
            <button
                className="share-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Share this product"
                title="Share"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
            </button>

            {menuOpen && (
                <>
                    <div className="share-overlay" onClick={() => setMenuOpen(false)} />
                    <div className="share-menu">
                        {/* Preview card */}
                        {productImage && (
                            <div className="share-preview">
                                <img src={productImage} alt={productName} className="share-preview-img" />
                                <div className="share-preview-info">
                                    <strong>{productName}</strong>
                                    {productPrice && <span>{productPrice}</span>}
                                </div>
                            </div>
                        )}

                        <button onClick={shareWhatsApp} className="share-menu-item" disabled={sharing}>
                            <span>💬</span> WhatsApp
                        </button>
                        {navigator.share && (
                            <button onClick={nativeShare} className="share-menu-item" disabled={sharing}>
                                <span>{sharing ? '⏳' : '📤'}</span> {sharing ? 'Sharing...' : 'Share with Image'}
                            </button>
                        )}
                        {productImage && (
                            <button onClick={downloadImage} className="share-menu-item" disabled={sharing}>
                                <span>📥</span> Save Image
                            </button>
                        )}
                        <button onClick={copyLink} className="share-menu-item" disabled={sharing}>
                            <span>{copied ? '✅' : '🔗'}</span> {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
