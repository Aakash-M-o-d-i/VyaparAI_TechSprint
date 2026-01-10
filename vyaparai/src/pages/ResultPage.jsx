/**
 * Result Page Component
 * AI-generated poster preview with regenerate options
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePromotion } from '../contexts/PromotionContext';
import { generatePosterAndCaptions, regeneratePoster } from '../services/aiService';
import ProgressIndicator from '../components/ProgressIndicator';
import TopBar from '../components/TopBar';

function ResultPage() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { promotionData, updatePromotionData, savePromotion } = usePromotion();

    const [isGenerating, setIsGenerating] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);
    const [posterUrl, setPosterUrl] = useState('');
    const [captions, setCaptions] = useState({
        whatsapp: '',
        instagram: '',
        facebook: ''
    });
    const [error, setError] = useState('');
    const [savedPromotionId, setSavedPromotionId] = useState(null);

    // Timer effect - counts up while generating
    useEffect(() => {
        if (isGenerating) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isGenerating]);

    useEffect(() => {
        if (!promotionData.product) {
            navigate('/start');
            return;
        }

        generatePoster();
    }, []);

    const generatePoster = async () => {
        setIsGenerating(true);
        setError('');

        try {
            const result = await generatePosterAndCaptions({
                ...promotionData,
                language
            });

            console.log('📊 Generation result:', {
                hasPosterUrl: !!result.posterImageUrl,
                hasBackup: !!result.posterImageBackup,
                posterUrlType: result.posterImageUrl?.substring(0, 30),
                backupType: result.posterImageBackup?.substring(0, 30)
            });

            setPosterUrl(result.posterImageUrl);
            setCaptions(result.captions);

            // Determine which image to store - prefer Canvas backup (base64)
            const imageToStore = result.posterImageBackup || result.posterImageUrl;
            console.log('💾 Storing image type:', imageToStore?.substring(0, 50));

            // Update promotion data
            updatePromotionData({
                posterImageUrl: result.posterImageUrl,
                posterImageBackup: result.posterImageBackup,
                captions: result.captions
            });

            // Save to Firestore - store backup for persistence
            const saved = await savePromotion({
                posterImageUrl: imageToStore,
                captions: result.captions
            });

            if (saved) {
                console.log('✅ Promotion saved with ID:', saved.id);
                setSavedPromotionId(saved.id);
            }
        } catch (err) {
            console.error('Generate poster error:', err);
            setError('Failed to generate poster. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerate = async () => {
        setIsGenerating(true);
        setError('');

        try {
            const result = await regeneratePoster({
                ...promotionData,
                language
            });

            setPosterUrl(result.posterImageUrl);
            setCaptions(result.captions);

            updatePromotionData({
                posterImageUrl: result.posterImageUrl,
                captions: result.captions
            });
        } catch (err) {
            console.error('Regenerate error:', err);
            setError('Failed to regenerate. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleChangeStyle = () => {
        navigate('/style');
    };

    const handleShare = () => {
        navigate('/share', { state: { promotionId: savedPromotionId } });
    };

    const handleBack = () => {
        navigate('/style');
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
                <div style={{ textAlign: 'center' }}>
                    <h2>
                        {isGenerating ? (
                            <>🎨 {t('generating')}</>
                        ) : (
                            <>🎉 {t('posterReady')}</>
                        )}
                    </h2>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="info-card" style={{
                        background: 'var(--error-50)',
                        borderColor: 'var(--error-500)'
                    }}>
                        <span className="info-card__icon">⚠️</span>
                        <span className="info-card__text" style={{ color: 'var(--error-600)' }}>{error}</span>
                    </div>
                )}

                {/* Poster Preview */}
                <div className={`poster-preview ${isGenerating ? 'poster-preview--loading' : ''}`}>
                    {isGenerating ? (
                        <div className="loader" style={{ padding: '40px 20px' }}>
                            <div className="loader__spinner" style={{ width: '60px', height: '60px' }}></div>
                            <span className="loader__text" style={{ fontSize: '18px', fontWeight: '600', marginTop: '16px' }}>
                                {t('generating')}
                            </span>

                            {/* Timer Display */}
                            <div style={{
                                marginTop: '16px',
                                fontSize: '32px',
                                fontWeight: '700',
                                color: 'var(--primary-500)',
                                fontFamily: 'monospace'
                            }}>
                                {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:
                                {(elapsedTime % 60).toString().padStart(2, '0')}
                            </div>

                            {/* Progress Messages */}
                            <div style={{
                                marginTop: '12px',
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                textAlign: 'center'
                            }}>
                                {elapsedTime < 5 && '🚀 Starting AI engine...'}
                                {elapsedTime >= 5 && elapsedTime < 10 && '🎨 Generating creative content...'}
                                {elapsedTime >= 10 && elapsedTime < 20 && '✨ Creating stunning visuals...'}
                                {elapsedTime >= 20 && elapsedTime < 30 && '🖼️ Adding finishing touches...'}
                                {elapsedTime >= 30 && elapsedTime < 45 && '⏳ Almost there...'}
                                {elapsedTime >= 45 && '🔥 Just a moment more...'}
                            </div>
                        </div>
                    ) : posterUrl ? (
                        <div style={{ position: 'relative', width: '100%' }}>
                            <img
                                src={posterUrl}
                                alt="Generated Poster"
                                referrerPolicy="no-referrer"
                                loading="eager"
                                style={{
                                    maxWidth: '100%',
                                    borderRadius: '16px',
                                    minHeight: '400px',
                                    objectFit: 'contain',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                                onLoad={() => console.log('✅ Image loaded successfully')}
                                onError={(e) => {
                                    console.error('❌ Image load error, URL:', posterUrl);
                                    // Try to reload without referrer policy
                                    if (!e.target.dataset.retried) {
                                        e.target.dataset.retried = 'true';
                                        e.target.src = posterUrl + '&t=' + Date.now();
                                    }
                                }}
                            />
                            {/* Show loading indicator while image loads */}
                            <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px'
                            }}>
                                ✨ AI Generated
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state__icon">🖼️</div>
                            <p>No poster generated</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons - Only show when not generating */}
                {!isGenerating && (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn--secondary btn--sm"
                            onClick={handleChangeStyle}
                        >
                            🎨 {t('changeStyle')}
                        </button>
                        <button
                            className="btn btn--secondary btn--sm"
                            onClick={handleRegenerate}
                        >
                            🔄 {t('regenerate')}
                        </button>
                    </div>
                )}

                {/* Caption Preview */}
                {!isGenerating && captions.whatsapp && (
                    <div className="card" style={{ marginTop: '8px' }}>
                        <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                            📝 Preview Captions
                        </h4>

                        <div className="caption-preview" style={{ marginBottom: '12px' }}>
                            <div className="caption-preview__title">
                                <span style={{ color: '#25D366' }}>💬</span> WhatsApp
                            </div>
                            <div className="caption-preview__text">
                                {captions.whatsapp || 'Caption will appear here...'}
                            </div>
                        </div>

                        <div className="caption-preview">
                            <div className="caption-preview__title">
                                <span style={{ color: '#E4405F' }}>📸</span> Instagram
                            </div>
                            <div className="caption-preview__text">
                                {captions.instagram || 'Caption will appear here...'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Share Button */}
            {!isGenerating && posterUrl && (
                <div className="actions safe-area-bottom">
                    <button
                        className="btn btn--primary btn--xl btn--full"
                        onClick={handleShare}
                    >
                        📤 {t('share')}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ResultPage;
