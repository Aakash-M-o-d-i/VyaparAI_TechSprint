/**
 * Confirm Page Component
 * Shows Gemini-enhanced promotional content
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePromotion } from '../contexts/PromotionContext';
import { parseUserInput } from '../services/aiService';
import ProgressIndicator from '../components/ProgressIndicator';
import TopBar from '../components/TopBar';

function ConfirmPage() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { promotionData, updatePromotionData } = usePromotion();

    const [isParsing, setIsParsing] = useState(true);
    const [enhancedPrompt, setEnhancedPrompt] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!promotionData.rawInput) {
            navigate('/start');
            return;
        }

        parseAndEnhance();
    }, []);

    const parseAndEnhance = async () => {
        setIsParsing(true);
        setError('');

        try {
            const parsed = await parseUserInput(promotionData.rawInput, language);

            const updatedData = {
                product: parsed.product || '',
                price: parsed.price || '',
                offer: parsed.offer || '',
                businessType: parsed.businessType || 'Shop',
                enhancedPrompt: parsed.enhancedPrompt // Save enhanced prompt for poster generation
            };

            updatePromotionData(updatedData);
            setEnhancedPrompt(parsed.enhancedPrompt);
        } catch (err) {
            console.error('Parse error:', err);
            setError('Failed to enhance your input. Please try again.');
            const fallbackEnhanced = {
                headline: promotionData.rawInput,
                tagline: 'Special offer for you!',
                offerHighlight: 'Limited time offer!',
                detailedFeatures: [],
                callToAction: 'Visit us today!',
                fullDescription: promotionData.rawInput
            };
            setEnhancedPrompt(fallbackEnhanced);
            updatePromotionData({ enhancedPrompt: fallbackEnhanced });
        } finally {
            setIsParsing(false);
        }
    };

    const handleLooksGood = () => {
        // Ensure enhanced prompt is saved before navigating
        if (enhancedPrompt) {
            updatePromotionData({ enhancedPrompt });
        }
        navigate('/style');
    };

    const handleBack = () => {
        navigate('/start');
    };

    const handleRegenerate = () => {
        parseAndEnhance();
    };

    // Gemini Sparkle Icon
    const GeminiSparkle = () => (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <defs>
                <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4285F4" />
                    <stop offset="50%" stopColor="#9B72CB" />
                    <stop offset="100%" stopColor="#D96570" />
                </linearGradient>
            </defs>
            <path d="M16 2L18.5 12.5L29 16L18.5 19.5L16 30L13.5 19.5L3 16L13.5 12.5L16 2Z"
                fill="url(#geminiGrad)" />
        </svg>
    );

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
                {isParsing ? (
                    /* Loading State */
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 20px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.15), rgba(155, 114, 203, 0.15), rgba(217, 101, 112, 0.15))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                border: '3px solid transparent',
                                borderTop: '3px solid #4285F4',
                                borderRight: '3px solid #9B72CB',
                                borderBottom: '3px solid #D96570',
                                animation: 'spin 1s linear infinite'
                            }} />
                        </div>
                        <h3 style={{
                            background: 'linear-gradient(135deg, #4285F4, #9B72CB, #D96570)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '8px'
                        }}>
                            ✨ Gemini is enhancing your offer...
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Creating a compelling promotional message
                        </p>
                    </div>
                ) : (
                    /* Enhanced Prompt Display */
                    <>
                        {/* Header */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(155, 114, 203, 0.1))',
                                borderRadius: '20px',
                                marginBottom: '12px'
                            }}>
                                <GeminiSparkle />
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    background: 'linear-gradient(135deg, #4285F4, #9B72CB)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    Powered by Gemini
                                </span>
                            </div>
                            <h2 style={{
                                fontSize: '1.3rem',
                                color: 'var(--text-primary)',
                                marginBottom: '4px'
                            }}>
                                Your Enhanced Promotion
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                Gemini transformed your simple input into this
                            </p>
                        </div>

                        {/* Original Input */}
                        <div style={{
                            padding: '12px 16px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            borderLeft: '4px solid var(--neutral-400)'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                📝 Your input:
                            </div>
                            <div style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>
                                "{promotionData.rawInput}"
                            </div>
                        </div>

                        {/* Arrow */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4285F4, #9B72CB)',
                                color: 'white',
                                fontSize: '1.2rem'
                            }}>
                                ↓
                            </div>
                        </div>

                        {/* Enhanced Content Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.05), rgba(155, 114, 203, 0.05), rgba(217, 101, 112, 0.05))',
                            border: '2px solid',
                            borderImage: 'linear-gradient(135deg, #4285F4, #9B72CB, #D96570) 1',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            marginBottom: '20px'
                        }}>
                            {/* Gradient Top Bar */}
                            <div style={{
                                height: '6px',
                                background: 'linear-gradient(90deg, #4285F4, #9B72CB, #D96570, #F49C46)'
                            }} />

                            <div style={{ padding: '20px' }}>
                                {/* Headline */}
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        color: '#4285F4',
                                        marginBottom: '8px',
                                        fontWeight: '600'
                                    }}>
                                        ✨ Headline
                                    </div>
                                    <h2 style={{
                                        fontSize: '1.6rem',
                                        fontWeight: '800',
                                        background: 'linear-gradient(135deg, #4285F4, #9B72CB)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        lineHeight: '1.3'
                                    }}>
                                        {enhancedPrompt?.headline || 'Amazing Offer!'}
                                    </h2>
                                </div>

                                {/* Tagline */}
                                <div style={{
                                    textAlign: 'center',
                                    padding: '12px 16px',
                                    background: 'rgba(155, 114, 203, 0.1)',
                                    borderRadius: '12px',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        color: '#9B72CB',
                                        marginBottom: '6px',
                                        fontWeight: '600'
                                    }}>
                                        💫 Tagline
                                    </div>
                                    <p style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        color: 'var(--text-primary)',
                                        margin: 0
                                    }}>
                                        {enhancedPrompt?.tagline || 'Best quality guaranteed!'}
                                    </p>
                                </div>

                                {/* Offer Highlight */}
                                <div style={{
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, rgba(217, 101, 112, 0.1), rgba(244, 156, 70, 0.1))',
                                    borderRadius: '12px',
                                    marginBottom: '16px',
                                    border: '1px dashed rgba(217, 101, 112, 0.3)'
                                }}>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        color: '#D96570',
                                        marginBottom: '8px',
                                        fontWeight: '600'
                                    }}>
                                        🎁 Special Offer
                                    </div>
                                    <p style={{
                                        fontSize: '1.15rem',
                                        fontWeight: '700',
                                        color: '#D96570',
                                        margin: 0
                                    }}>
                                        {enhancedPrompt?.offerHighlight || 'Limited time offer!'}
                                    </p>
                                </div>

                                {/* Detailed Features */}
                                {enhancedPrompt?.detailedFeatures && enhancedPrompt.detailedFeatures.length > 0 && (
                                    <div style={{
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, rgba(52, 168, 83, 0.08), rgba(66, 133, 244, 0.08))',
                                        borderRadius: '12px',
                                        marginBottom: '16px',
                                        border: '1px solid rgba(52, 168, 83, 0.2)'
                                    }}>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            color: '#34A853',
                                            marginBottom: '12px',
                                            fontWeight: '600'
                                        }}>
                                            ⭐ Key Features & Benefits
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {enhancedPrompt.detailedFeatures.map((feature, index) => (
                                                <div key={index} style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                    padding: '10px 12px',
                                                    background: 'rgba(255,255,255,0.5)',
                                                    borderRadius: '8px'
                                                }}>
                                                    <span style={{
                                                        color: '#34A853',
                                                        fontWeight: '700',
                                                        fontSize: '1rem'
                                                    }}>
                                                        ✓
                                                    </span>
                                                    <span style={{
                                                        color: 'var(--text-primary)',
                                                        fontSize: '0.95rem',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {feature.replace(/^[✓•\-\s]+/, '')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Full Description */}
                                <div style={{
                                    padding: '16px',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '12px',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '8px',
                                        fontWeight: '600'
                                    }}>
                                        📄 Full Promotional Description
                                    </div>
                                    <p style={{
                                        fontSize: '1rem',
                                        color: 'var(--text-primary)',
                                        lineHeight: '1.7',
                                        margin: 0,
                                        textAlign: 'justify'
                                    }}>
                                        {enhancedPrompt?.fullDescription || 'Check out this amazing offer!'}
                                    </p>
                                </div>

                                {/* Call to Action */}
                                <div style={{
                                    textAlign: 'center',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #4285F4, #9B72CB)',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        color: 'rgba(255,255,255,0.8)',
                                        marginBottom: '6px',
                                        fontWeight: '600'
                                    }}>
                                        📢 Call to Action
                                    </div>
                                    <p style={{
                                        fontSize: '1.3rem',
                                        fontWeight: '800',
                                        color: 'white',
                                        margin: 0
                                    }}>
                                        {enhancedPrompt?.callToAction || 'Visit us today!'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '12px',
                                color: '#EF4444',
                                marginBottom: '16px'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Actions */}
            {!isParsing && (
                <div className="actions safe-area-bottom">
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="btn btn--secondary btn--lg"
                            onClick={handleRegenerate}
                            style={{ flex: 1 }}
                        >
                            🔄 Regenerate
                        </button>
                        <button
                            className="btn btn--lg"
                            onClick={handleLooksGood}
                            style={{
                                flex: 2,
                                background: 'linear-gradient(135deg, #4285F4, #9B72CB, #D96570)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '600'
                            }}
                        >
                            ✨ Create Poster
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
}

export default ConfirmPage;
