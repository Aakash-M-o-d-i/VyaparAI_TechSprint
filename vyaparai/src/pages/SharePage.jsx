/**
 * Share Page Component
 * One-tap sharing to WhatsApp, Instagram, Facebook
 * Supports both new promotions and resharing previous promotions
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePromotion } from '../contexts/PromotionContext';
import ProgressIndicator from '../components/ProgressIndicator';
import TopBar from '../components/TopBar';

function SharePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { promotionData: currentPromotionData, markAsShared } = usePromotion();

    // Get promotionId and previousPromotion from location state
    const promotionId = location.state?.promotionId;
    const previousPromotion = location.state?.previousPromotion;

    // Use previous promotion data if available, otherwise use current promotion data
    const promotionData = previousPromotion || currentPromotionData;
    const isPreviousPromotion = !!previousPromotion;

    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [showCaptionPreview, setShowCaptionPreview] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);

    // Debug: Log promotion data
    console.log('SharePage - promotionData:', promotionData);
    console.log('SharePage - posterImageUrl:', promotionData?.posterImageUrl);

    // SVG Icons for social media platforms
    const WhatsAppIcon = () => (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );

    const InstagramIcon = () => (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="url(#instagram-gradient)">
            <defs>
                <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFDC80" />
                    <stop offset="25%" stopColor="#FCAF45" />
                    <stop offset="50%" stopColor="#F77737" />
                    <stop offset="75%" stopColor="#F56040" />
                    <stop offset="100%" stopColor="#C13584" />
                </linearGradient>
            </defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
    );

    const FacebookIcon = () => (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );

    // Direct message/post platforms
    const messagePlatforms = [
        {
            id: 'whatsapp',
            name: t('whatsapp'),
            icon: <WhatsAppIcon />,
            color: '#25D366',
            caption: promotionData.captions?.whatsapp || '',
            type: 'message'
        },
        {
            id: 'instagram',
            name: t('instagram'),
            icon: <InstagramIcon />,
            color: '#E4405F',
            caption: promotionData.captions?.instagram || '',
            type: 'post'
        },
        {
            id: 'facebook',
            name: t('facebook'),
            icon: <FacebookIcon />,
            color: '#1877F2',
            caption: promotionData.captions?.facebook || '',
            type: 'post'
        }
    ];

    // Status/Stories platforms
    const statusPlatforms = [
        {
            id: 'whatsapp-status',
            name: 'WhatsApp Status',
            icon: <WhatsAppIcon />,
            color: '#25D366',
            caption: promotionData.captions?.whatsapp || '',
            type: 'status'
        },
        {
            id: 'instagram-story',
            name: 'Instagram Story',
            icon: <InstagramIcon />,
            color: '#E4405F',
            caption: promotionData.captions?.instagram || '',
            type: 'story'
        },
        {
            id: 'facebook-story',
            name: 'Facebook Story',
            icon: <FacebookIcon />,
            color: '#1877F2',
            caption: promotionData.captions?.facebook || '',
            type: 'story'
        }
    ];

    // Combined platforms for backward compatibility
    const platforms = [...messagePlatforms];

    const handlePlatformSelect = (platform) => {
        setSelectedPlatform(platform);
        setShowCaptionPreview(true);
    };

    // Convert base64 data URL to blob
    const dataURLtoBlob = (dataURL) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    // Convert image URL to blob using canvas (works with external URLs)
    const imageUrlToBlob = async (imageUrl) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to convert image to blob'));
                    }
                }, 'image/png');
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            // Add cache buster to avoid CORS caching issues
            img.src = imageUrl.includes('?') ? imageUrl + '&t=' + Date.now() : imageUrl + '?t=' + Date.now();
        });
    };

    const handleShare = async () => {
        if (!selectedPlatform) return;

        const caption = selectedPlatform.caption;
        const posterUrl = promotionData.posterImageUrl;

        try {
            let blob;

            // If it's base64 data URL, convert directly
            if (posterUrl.startsWith('data:')) {
                blob = dataURLtoBlob(posterUrl);
            } else {
                // For Pollinations URLs: Capture the displayed image
                console.log('📥 Capturing Pollinations image for sharing...');

                const posterImg = document.querySelector('img[alt="Poster"]');

                if (posterImg && posterImg.complete && posterImg.naturalWidth > 0) {
                    // Image is loaded - draw to canvas and export
                    const canvas = document.createElement('canvas');
                    canvas.width = posterImg.naturalWidth;
                    canvas.height = posterImg.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(posterImg, 0, 0);

                    // Convert to blob
                    blob = await new Promise((resolve) => {
                        canvas.toBlob((b) => resolve(b), 'image/png');
                    });
                    console.log('✅ Pollinations image captured for sharing!');
                }

                if (!blob) {
                    console.warn('Could not capture image, trying fetch...');
                    // Last resort: try fetching (may fail with CORS)
                    // Try direct fetch as fallback
                    try {
                        const response = await fetch(posterUrl, { mode: 'cors' });
                        blob = await response.blob();
                    } catch (fetchError) {
                        console.warn('Fetch also failed:', fetchError);
                        blob = null;
                    }
                }
            }

            // Check if Web Share API is supported and we have a blob
            if (blob && navigator.share && navigator.canShare) {
                const file = new File([blob], 'vyaparai-poster.png', { type: 'image/png' });

                const shareData = {
                    title: promotionData.product,
                    text: caption,
                    files: [file]
                };

                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    setShareSuccess(true);
                    if (promotionId) {
                        await markAsShared(promotionId, selectedPlatform.id);
                    }
                    return;
                }
            }

            // Fallback: Download image and open share URL
            console.log('Using fallback share method...');

            // Download image first
            if (blob) {
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `${promotionData.product || 'poster'}_vyaparai.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
            } else {
                handleDownload();
            }

            // Copy caption to clipboard
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(caption);
            }

            // Platform-specific URLs and handling
            let shareUrl = '';
            const encodedText = encodeURIComponent(caption);

            switch (selectedPlatform.id) {
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${encodedText}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`;
                    break;
                case 'instagram':
                    alert('📸 Image downloaded! Caption copied to clipboard.\nOpen Instagram → Create Post → Select the downloaded image.');
                    setShareSuccess(true);
                    if (promotionId) {
                        await markAsShared(promotionId, selectedPlatform.id);
                    }
                    return;

                // Status/Story platforms
                case 'whatsapp-status':
                    alert('🟢 Image downloaded! Caption copied to clipboard.\n\nTo share as WhatsApp Status:\n1. Open WhatsApp\n2. Go to Status tab\n3. Tap the camera/pencil icon\n4. Select the downloaded image\n5. Add text if desired and post!');
                    setShareSuccess(true);
                    if (promotionId) {
                        await markAsShared(promotionId, selectedPlatform.id);
                    }
                    return;

                case 'instagram-story':
                    alert('📖 Image downloaded! Caption copied to clipboard.\n\nTo share as Instagram Story:\n1. Open Instagram\n2. Swipe right or tap your profile picture\n3. Select the downloaded image from gallery\n4. Add stickers, text, or effects\n5. Share to Your Story!');
                    setShareSuccess(true);
                    if (promotionId) {
                        await markAsShared(promotionId, selectedPlatform.id);
                    }
                    return;

                case 'facebook-story':
                    alert('📚 Image downloaded! Caption copied to clipboard.\n\nTo share as Facebook Story:\n1. Open Facebook app\n2. Tap "Create Story" at the top\n3. Select the downloaded image\n4. Add text or stickers if desired\n5. Share to Your Story!');
                    setShareSuccess(true);
                    if (promotionId) {
                        await markAsShared(promotionId, selectedPlatform.id);
                    }
                    return;

                default:
                    break;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank');
                setShareSuccess(true);
                if (promotionId) {
                    await markAsShared(promotionId, selectedPlatform.id);
                }
            }
        } catch (error) {
            console.error('Share error:', error);
            // Fallback to download
            handleDownload();
            alert('📥 Image downloaded! Please share manually.');
        }
    };

    const handleDownload = async () => {
        if (!promotionData.posterImageUrl) return;

        const posterUrl = promotionData.posterImageUrl;

        // Get the caption to copy (use selected platform or WhatsApp as default)
        const captionToCopy = selectedPlatform?.caption ||
            promotionData.captions?.whatsapp ||
            `${promotionData.product} - ${promotionData.price} ${promotionData.offer || ''}`;

        // If it's already a base64 data URL, download directly
        if (posterUrl.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = posterUrl;
            link.download = `${promotionData.product || 'poster'}_vyaparai.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Copy caption to clipboard
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(captionToCopy);
                console.log('📋 Caption copied to clipboard!');
            }
            alert(`✅ Image downloaded!\n\n📋 Caption copied to clipboard:\n\n${captionToCopy.substring(0, 100)}...`);
            return;
        }

        // For Pollinations URLs: Find the displayed image and capture it
        // This works because the image is already loaded in the browser cache
        try {
            console.log('📥 Downloading Pollinations image...');

            // Find any img element showing this poster (could be in preview)
            const posterImg = document.querySelector('img[alt="Poster"]');

            if (posterImg && posterImg.complete && posterImg.naturalWidth > 0) {
                // Image is loaded - draw to canvas and export
                const canvas = document.createElement('canvas');
                canvas.width = posterImg.naturalWidth;
                canvas.height = posterImg.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(posterImg, 0, 0);

                // Convert to blob and download
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${promotionData.product || 'poster'}_vyaparai.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        console.log('✅ Pollinations image downloaded!');

                        // Copy caption to clipboard
                        if (navigator.clipboard) {
                            await navigator.clipboard.writeText(captionToCopy);
                            console.log('📋 Caption copied to clipboard!');
                        }
                        alert(`✅ Image downloaded!\n\n📋 Caption copied to clipboard:\n\n${captionToCopy.substring(0, 150)}...`);
                    }
                }, 'image/png');
            } else {
                // Fallback: Open the image in a new tab (user can right-click Save)
                console.log('📌 Opening image in new tab for manual download...');

                // Still copy caption
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(captionToCopy);
                }
                window.open(posterUrl, '_blank');
                alert(`📋 Caption copied to clipboard!\n\nImage opened in new tab. Right-click and "Save Image As" to download.`);
            }
        } catch (error) {
            console.error('Download error:', error);
            // Fallback: Open in new tab
            window.open(posterUrl, '_blank');
            alert('Image opened in new tab. Right-click and select "Save Image As" to download.');
        }
    };

    const handleBack = () => {
        if (showCaptionPreview) {
            setShowCaptionPreview(false);
            setSelectedPlatform(null);
        } else {
            // Go to dashboard if this is a previous promotion, otherwise go to result
            navigate(isPreviousPromotion ? '/dashboard' : '/result');
        }
    };

    const handleDone = () => {
        navigate('/dashboard');
    };

    return (
        <div className="page">
            {/* TopBar - Language & Theme Toggle */}
            <TopBar />

            {/* Back Button */}
            <button className="back-btn" onClick={handleBack}>
                ← {t('back')}
            </button>

            {/* Progress Indicator */}
            <ProgressIndicator />

            {/* Main Content */}
            <div className="content fade-in">
                {!showCaptionPreview ? (
                    /* Platform Selection */
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '2.5rem' }}>{isPreviousPromotion ? '🔄' : '📤'}</span>
                            <h2 style={{ marginTop: '8px' }}>
                                {isPreviousPromotion ? 'Reshare Poster' : t('sendToCustomers')}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                                {isPreviousPromotion
                                    ? `${promotionData.product || 'Previous poster'}`
                                    : t('selectPlatform')}
                            </p>
                        </div>

                        {/* Poster Thumbnail */}
                        <div style={{
                            width: '180px',
                            height: '240px',
                            margin: '0 auto',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-lg)',
                            background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))'
                        }}>
                            {promotionData.posterImageUrl ? (
                                <img
                                    src={promotionData.posterImageUrl}
                                    alt="Poster"
                                    referrerPolicy="no-referrer"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        // Hide broken image and show placeholder
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `
                                            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; text-align: center;">
                                                <span style="font-size: 3rem;">🎨</span>
                                                <span style="font-size: 12px; color: var(--primary-600); margin-top: 8px; font-weight: 600;">
                                                    ${promotionData.product || 'Poster'}
                                                </span>
                                                <span style="font-size: 10px; color: var(--text-secondary); margin-top: 4px;">
                                                    Image expired
                                                </span>
                                            </div>
                                        `;
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '16px',
                                    textAlign: 'center'
                                }}>
                                    <span style={{ fontSize: '3rem' }}>🎨</span>
                                    <span style={{ fontSize: '12px', color: 'var(--primary-600)', marginTop: '8px', fontWeight: '600' }}>
                                        {promotionData.product || 'Poster'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Message/Post Platforms */}
                        <div style={{ marginTop: '16px' }}>
                            <h4 style={{
                                textAlign: 'center',
                                color: 'var(--text-secondary)',
                                marginBottom: '12px',
                                fontSize: '14px'
                            }}>
                                💬 Send as Message/Post
                            </h4>
                            <div className="share-grid">
                                {messagePlatforms.map((platform) => (
                                    <button
                                        key={platform.id}
                                        className={`share-btn share-btn--${platform.id}`}
                                        onClick={() => handlePlatformSelect(platform)}
                                    >
                                        <span className="share-btn__icon">{platform.icon}</span>
                                        <span className="share-btn__label">{platform.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status/Stories Platforms */}
                        <div style={{ marginTop: '20px' }}>
                            <h4 style={{
                                textAlign: 'center',
                                color: 'var(--text-secondary)',
                                marginBottom: '12px',
                                fontSize: '14px'
                            }}>
                                📱 Share as Status/Story
                            </h4>
                            <div className="share-grid">
                                {statusPlatforms.map((platform) => (
                                    <button
                                        key={platform.id}
                                        className={`share-btn`}
                                        style={{
                                            background: `${platform.color}20`,
                                            borderColor: platform.color
                                        }}
                                        onClick={() => handlePlatformSelect(platform)}
                                    >
                                        <span className="share-btn__icon">{platform.icon}</span>
                                        <span className="share-btn__label">{platform.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Download Option */}
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                className="btn btn--ghost"
                                onClick={handleDownload}
                            >
                                ⬇️ {t('downloadPoster')}
                            </button>
                        </div>
                    </>
                ) : (
                    /* Caption Preview & Share */
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '2.5rem' }}>{selectedPlatform?.icon}</span>
                            <h2 style={{ marginTop: '8px' }}>{selectedPlatform?.name}</h2>
                        </div>

                        {/* Poster + Caption Preview */}
                        <div className="card">
                            <div style={{
                                width: '100%',
                                maxWidth: '200px',
                                margin: '0 auto 16px',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={promotionData.posterImageUrl}
                                    alt="Poster"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            </div>

                            <div className="caption-preview">
                                <div className="caption-preview__title">
                                    {t('autoCaption')}
                                </div>
                                <div className="caption-preview__text">
                                    {selectedPlatform?.caption || 'No caption available'}
                                </div>
                            </div>
                        </div>

                        {shareSuccess && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🎉</div>
                                <h3 style={{ color: 'var(--success-600)', marginBottom: '8px' }}>
                                    Successfully Shared!
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    Your promotion has been shared to {selectedPlatform?.name}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Actions */}
            <div className="actions safe-area-bottom">
                {showCaptionPreview ? (
                    shareSuccess ? (
                        <button
                            className="btn btn--primary btn--xl btn--full"
                            onClick={handleDone}
                        >
                            ✓ Done
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                            <button
                                className="btn btn--primary btn--xl btn--full"
                                onClick={handleShare}
                                style={{
                                    background: selectedPlatform?.color || undefined
                                }}
                            >
                                📤 {t('send')} to {selectedPlatform?.name}
                            </button>
                            <button
                                className="btn btn--ghost btn--full"
                                onClick={handleDone}
                                style={{ padding: '12px' }}
                            >
                                ✓ Done
                            </button>
                        </div>
                    )
                ) : null}
            </div>
        </div>
    );
}

export default SharePage;
