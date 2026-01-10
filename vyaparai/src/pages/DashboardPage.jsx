/**
 * Dashboard Page Component
 * User's home screen showing stats and past promotions
 */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { usePromotion } from '../contexts/PromotionContext';
import TopBar from '../components/TopBar';

function DashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { currentUser, userProfile, logout } = useAuth();
    const {
        pastPromotions,
        loadingPromotions,
        fetchPastPromotions,
        resetPromotion,
        deletePromotion
    } = usePromotion();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 4; // 2x2 grid per page

    // Fetch promotions when page loads or navigates back
    useEffect(() => {
        if (currentUser) {
            fetchPastPromotions();
        }
    }, [currentUser, location.key]);

    // Remove duplicate promotions based on product + price + offer
    const uniquePromotions = pastPromotions.reduce((acc, current) => {
        const key = `${current.product}-${current.price}-${current.offer}`;
        const exists = acc.find(item =>
            `${item.product}-${item.price}-${item.offer}` === key
        );
        if (!exists) {
            acc.push(current);
        } else {
            // Keep the more recent one or the one that was shared
            if (current.shared && !exists.shared) {
                const index = acc.indexOf(exists);
                acc[index] = current;
            }
        }
        return acc;
    }, []);

    const handleCreateNew = () => {
        resetPromotion();
        navigate('/start');
    };

    // Handle clicking on a previous promotion to reshare
    const handlePromotionClick = (promotion) => {
        // Navigate to share page with the previous promotion data
        navigate('/share', {
            state: {
                promotionId: promotion.id,
                previousPromotion: {
                    posterImageUrl: promotion.posterImageUrl,
                    captions: promotion.captions,
                    product: promotion.product,
                    price: promotion.price,
                    offer: promotion.offer,
                    businessType: promotion.businessType
                }
            }
        });
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleDelete = async (e, promotionId) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            try {
                await deletePromotion(promotionId);
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    // Calculate today's count from de-duplicated promotions
    const today = new Date().toDateString();
    const todayCount = uniquePromotions.filter(p => {
        const promotionDate = new Date(p.createdAt).toDateString();
        return promotionDate === today;
    }).length;

    return (
        <div className="page">
            {/* TopBar - Language & Theme Toggle */}
            <TopBar />

            {/* Header */}
            <header className="header" style={{ margin: '-16px -16px 0', padding: '16px' }}>
                <div className="header__logo">🛒 {t('appName')}</div>
                <div className="header__actions">
                    <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                        {t('logout')}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="content fade-in">
                {/* Welcome Banner */}
                <div className="card card--elevated" style={{
                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                    color: 'white'
                }}>
                    <h2 style={{ marginBottom: '8px' }}>{t('myShop')} 🏪</h2>
                    <p style={{ opacity: 0.9, marginBottom: '16px' }}>
                        {userProfile?.businessName || currentUser?.displayName || 'Welcome!'}
                    </p>

                    {/* Today's Stats */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px'
                    }}>
                        <span style={{ fontSize: '2rem' }}>📊</span>
                        <div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{t('today')}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                {todayCount} posters created
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create New Offer Button */}
            <button
                className="btn btn--primary btn--xl btn--full"
                onClick={handleCreateNew}
                style={{ marginTop: '8px' }}
            >
                ✨ {t('createNewOffer')}
            </button>

            {/* Recent Promotions */}
            <div style={{ marginTop: '8px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    📜 {t('recent')}
                </h3>

                {loadingPromotions ? (
                    <div className="loader" style={{ padding: '40px 0' }}>
                        <div className="loader__spinner"></div>
                        <span className="loader__text">{t('loading')}</span>
                    </div>
                ) : uniquePromotions.length > 0 ? (
                    <>
                        {/* 2-column grid layout for poster cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px'
                        }}>
                            {uniquePromotions
                                .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                                .map((promotion) => (
                                    <div
                                        key={promotion.id}
                                        className="promotion-card"
                                        style={{
                                            cursor: 'pointer',
                                            position: 'relative',
                                            flexDirection: 'column',
                                            padding: '12px'
                                        }}
                                        onClick={() => handlePromotionClick(promotion)}
                                    >
                                        {/* Poster Image - taller for grid view */}
                                        <div style={{
                                            width: '100%',
                                            height: '120px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            marginBottom: '8px'
                                        }}>
                                            {promotion.posterImageUrl ? (
                                                <img
                                                    src={promotion.posterImageUrl}
                                                    alt={promotion.product}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                    onError={(e) => {
                                                        console.error('Image load failed for:', promotion.product);
                                                        e.target.style.display = 'none';
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
                                                    fontSize: '2rem',
                                                    background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
                                                    color: 'var(--primary-600)'
                                                }}>
                                                    🎨
                                                    <span style={{ fontSize: '10px', marginTop: '4px' }}>{promotion.product?.substring(0, 12)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="promotion-card__content" style={{ padding: 0 }}>
                                            <div className="promotion-card__title" style={{ fontSize: '12px', fontWeight: '600' }}>
                                                {promotion.product?.substring(0, 18)}
                                                {promotion.product?.length > 18 ? '...' : ''}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--primary-500)', marginTop: '2px' }}>
                                                {promotion.price}
                                            </div>
                                            <div className="promotion-card__meta" style={{ fontSize: '10px', marginTop: '4px' }}>
                                                {new Date(promotion.createdAt).toLocaleDateString()}
                                                {promotion.shared && ' • ✓'}
                                            </div>
                                        </div>
                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDelete(e, promotion.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                border: 'none',
                                                background: 'rgba(239, 68, 68, 0.9)',
                                                color: 'white',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                transition: 'transform 0.2s, background 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 1)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'}
                                            title="Delete promotion"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                        </div>

                        {/* Pagination Controls */}
                        {uniquePromotions.length > itemsPerPage && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '16px',
                                marginTop: '20px',
                                padding: '12px'
                            }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: currentPage === 0 ? 'var(--gray-200)' : 'var(--primary-500)',
                                        color: currentPage === 0 ? 'var(--gray-400)' : 'white',
                                        fontWeight: '600',
                                        cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    ← Previous
                                </button>

                                <span style={{
                                    fontSize: '14px',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '500'
                                }}>
                                    Page {currentPage + 1} of {Math.ceil(uniquePromotions.length / itemsPerPage)}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev =>
                                        prev < Math.ceil(uniquePromotions.length / itemsPerPage) - 1 ? prev + 1 : prev
                                    )}
                                    disabled={currentPage >= Math.ceil(uniquePromotions.length / itemsPerPage) - 1}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: currentPage >= Math.ceil(uniquePromotions.length / itemsPerPage) - 1
                                            ? 'var(--gray-200)' : 'var(--primary-500)',
                                        color: currentPage >= Math.ceil(uniquePromotions.length / itemsPerPage) - 1
                                            ? 'var(--gray-400)' : 'white',
                                        fontWeight: '600',
                                        cursor: currentPage >= Math.ceil(uniquePromotions.length / itemsPerPage) - 1
                                            ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state__icon">📭</div>
                        <p className="empty-state__text">{t('noPreviousPromotions')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
