/**
 * Style Selection Page Component
 * Choose promotion mood/style
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePromotion } from '../contexts/PromotionContext';
import ProgressIndicator from '../components/ProgressIndicator';
import TopBar from '../components/TopBar';

function StylePage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { promotionData, updatePromotionData } = usePromotion();

    const [selectedStyle, setSelectedStyle] = useState(promotionData.style || 'friendly');

    const styles = [
        {
            id: 'friendly',
            icon: '😊',
            label: t('friendly'),
            description: 'Warm & welcoming'
        },
        {
            id: 'festive',
            icon: '🎉',
            label: t('festive'),
            description: 'Celebration vibes'
        },
        {
            id: 'offerFocused',
            icon: '💥',
            label: t('offerFocused'),
            description: 'Highlight savings'
        },
        {
            id: 'localStyle',
            icon: '🏠',
            label: t('localStyle'),
            description: 'Traditional look'
        }
    ];

    const handleStyleSelect = (styleId) => {
        setSelectedStyle(styleId);
    };

    const handleGeneratePoster = () => {
        updatePromotionData({ style: selectedStyle });
        navigate('/result');
    };

    const handleBack = () => {
        navigate('/confirm');
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
                    <span style={{ fontSize: '2.5rem' }}>🎨</span>
                    <h2 style={{ marginTop: '8px' }}>{t('howShouldFeel')}</h2>
                </div>

                {/* Style Grid */}
                <div className="style-grid">
                    {styles.map((style) => (
                        <button
                            key={style.id}
                            className={`style-card ${selectedStyle === style.id ? 'selected' : ''}`}
                            onClick={() => handleStyleSelect(style.id)}
                        >
                            <div className="style-card__icon">{style.icon}</div>
                            <div className="style-card__label">{style.label}</div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginTop: '4px'
                            }}>
                                {style.description}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Preview summary */}
                <div className="card" style={{
                    background: 'var(--primary-50)',
                    borderLeft: '4px solid var(--primary-500)',
                    padding: '16px'
                }}>
                    <h4 style={{ marginBottom: '8px', color: 'var(--primary-700)' }}>
                        📋 Your Promotion
                    </h4>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <p><strong>{promotionData.product}</strong> {promotionData.price && `@ ${promotionData.price}`}</p>
                        {promotionData.offer && <p>🎁 {promotionData.offer}</p>}
                        <p style={{ marginTop: '8px' }}>
                            Style: <strong>{styles.find(s => s.id === selectedStyle)?.label}</strong> {styles.find(s => s.id === selectedStyle)?.icon}
                        </p>
                    </div>
                </div>
            </div>

            {/* Generate Button */}
            <div className="actions safe-area-bottom">
                <button
                    className="btn btn--primary btn--xl btn--full"
                    onClick={handleGeneratePoster}
                >
                    ✨ {t('generatePoster')}
                </button>
            </div>
        </div>
    );
}

export default StylePage;
