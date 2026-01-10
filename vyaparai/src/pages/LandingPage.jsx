import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';

function LandingPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { currentUser, userProfile } = useAuth();

    const handleSpeakOffer = () => {
        if (currentUser) {
            if (!userProfile?.profileCompleted) {
                // If profile not complete, must go to setup first, then dashboard
                navigate('/setup');
            } else {
                navigate('/start', { state: { method: 'voice' } });
            }
        } else {
            // Not logged in, go to login. After login, LoginPage logic will handle setup -> dashboard
            navigate('/login');
        }
    };

    const handleTypeOffer = () => {
        if (currentUser) {
            if (!userProfile?.profileCompleted) {
                navigate('/setup');
            } else {
                navigate('/start', { state: { method: 'text' } });
            }
        } else {
            navigate('/login');
        }
    };

    const handleGetStarted = () => {
        if (currentUser) {
            if (!userProfile?.profileCompleted) {
                navigate('/setup');
            } else {
                navigate('/dashboard');
            }
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="page page--full">
            {/* TopBar - Language & Theme Toggle */}
            <TopBar />
            {/* Hero Section */}
            <section className="hero">
                <h1 className="hero__logo">🛒 {t('appName')}</h1>
                <p className="hero__tagline">{t('tagline')}</p>

                {/* Features */}
                <div className="features fade-in">
                    <div className="feature-item">
                        <span className="feature-item__icon">📦</span>
                        <span>{t('youSell')}</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-item__icon">🎨</span>
                        <span>{t('weCreate')}</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-item__icon">🤝</span>
                        <span>{t('customersCome')}</span>
                    </div>
                </div>

                {/* Benefits Pills */}
                <div className="benefits">
                    <span className="benefit-pill">✓ {t('noEnglish')}</span>
                    <span className="benefit-pill">✓ {t('noDesigner')}</span>
                    <span className="benefit-pill">✓ {t('noComputer')}</span>
                </div>

                {/* CTA Buttons */}
                <div className="actions" style={{ width: '100%', maxWidth: '360px' }}>
                    <button
                        className="btn btn--xl btn--secondary btn--full"
                        onClick={handleSpeakOffer}
                    >
                        🎤 {t('speakOffer')}
                    </button>
                    <button
                        className="btn btn--xl btn--outline btn--full"
                        onClick={handleTypeOffer}
                        style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
                    >
                        ⌨️ {t('typeOffer')}
                    </button>
                </div>

                {/* Ready Message */}
                <p style={{ marginTop: '24px', opacity: 0.9, fontSize: '1.1rem' }}>
                    ⚡ {t('posterReady')}
                </p>
            </section>

            {/* Get Started Section */}
            <div className="content" style={{ padding: '24px 16px' }}>
                <div style={{ textAlign: 'center' }}>
                    <button
                        className="btn btn--primary btn--lg"
                        onClick={handleGetStarted}
                    >
                        {currentUser ? t('myShop') : t('getStarted')} →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
