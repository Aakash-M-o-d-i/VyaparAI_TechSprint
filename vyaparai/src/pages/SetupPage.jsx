/**
 * Setup Page Component
 * Business profile setup form - required after first login
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';

function SetupPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { currentUser, updateBusinessProfile, userProfile } = useAuth();

    const [formData, setFormData] = useState({
        businessName: userProfile?.businessName || '',
        businessType: userProfile?.businessType || '',
        ownerName: userProfile?.ownerName || currentUser?.displayName || '',
        phone: userProfile?.phone || currentUser?.phoneNumber || '',
        location: userProfile?.location || '',
        description: userProfile?.description || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const businessTypes = [
        { id: 'kirana', label: 'Kirana / Grocery Store', icon: '🏪' },
        { id: 'restaurant', label: 'Restaurant / Cafe', icon: '🍽️' },
        { id: 'salon', label: 'Salon / Beauty Parlour', icon: '💇' },
        { id: 'clothing', label: 'Clothing / Fashion Store', icon: '👔' },
        { id: 'electronics', label: 'Electronics Shop', icon: '📱' },
        { id: 'pharmacy', label: 'Pharmacy / Medical Store', icon: '💊' },
        { id: 'bakery', label: 'Bakery / Sweet Shop', icon: '🍰' },
        { id: 'juice', label: 'Juice / Snack Shop', icon: '🥤' },
        { id: 'hardware', label: 'Hardware Store', icon: '🔧' },
        { id: 'stationery', label: 'Stationery / Books', icon: '📚' },
        { id: 'flower', label: 'Flower / Gift Shop', icon: '💐' },
        { id: 'other', label: 'Other', icon: '🏢' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBusinessTypeSelect = (typeId) => {
        setFormData(prev => ({ ...prev, businessType: typeId }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.businessName.trim()) {
            setError('Please enter your business name');
            return;
        }
        if (!formData.businessType) {
            setError('Please select your business type');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await updateBusinessProfile({
                businessName: formData.businessName.trim(),
                businessType: formData.businessType,
                ownerName: formData.ownerName.trim(),
                phone: formData.phone.trim(),
                location: formData.location.trim(),
                description: formData.description.trim(),
                profileCompleted: true
            });

            navigate('/dashboard');
        } catch (err) {
            console.error('Setup error:', err);
            setError('Failed to save your details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page">
            {/* TopBar - Language & Theme Toggle */}
            <TopBar />

            {/* Main Content */}
            <div className="content fade-in">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '3rem' }}>🏪</span>
                    <h2 style={{ marginTop: '12px', marginBottom: '8px' }}>
                        {t('setupBusiness') || 'Set Up Your Business'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {t('setupDescription') || 'Tell us about your shop to create amazing posters'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="info-card" style={{
                        background: 'var(--error-50)',
                        borderColor: 'var(--error-500)',
                        marginBottom: '16px'
                    }}>
                        <span className="info-card__icon">⚠️</span>
                        <span className="info-card__text" style={{ color: 'var(--error-600)' }}>{error}</span>
                    </div>
                )}

                {/* Setup Form */}
                <form onSubmit={handleSubmit}>
                    {/* Business Name */}
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label className="input-label">
                            🏷️ {t('businessName') || 'Business / Shop Name'} *
                        </label>
                        <input
                            type="text"
                            name="businessName"
                            className="input input--lg"
                            placeholder="e.g., Sharma Kirana Store"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Owner Name */}
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label className="input-label">
                            👤 {t('ownerName') || 'Your Name'}
                        </label>
                        <input
                            type="text"
                            name="ownerName"
                            className="input"
                            placeholder="e.g., Rajesh Sharma"
                            value={formData.ownerName}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label className="input-label">
                            📞 {t('phoneNumber') || 'Phone Number'}
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            className="input"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Location */}
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label className="input-label">
                            📍 {t('location') || 'Location / Area'}
                        </label>
                        <input
                            type="text"
                            name="location"
                            className="input"
                            placeholder="e.g., MG Road, Bangalore"
                            value={formData.location}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Business Type Selection */}
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label className="input-label">
                            🏢 {t('businessType') || 'Type of Business'} *
                        </label>
                        <div className="business-type-grid">
                            {businessTypes.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`business-type-card ${formData.businessType === type.id ? 'selected' : ''}`}
                                    onClick={() => handleBusinessTypeSelect(type.id)}
                                >
                                    <span className="business-type-card__icon">{type.icon}</span>
                                    <span className="business-type-card__label">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Business Description */}
                    <div className="input-group" style={{ marginBottom: '24px' }}>
                        <label className="input-label">
                            📝 {t('businessDescription') || 'About Your Business (Optional)'}
                        </label>
                        <textarea
                            name="description"
                            className="input textarea"
                            placeholder="Tell us what you sell, your specialties, etc."
                            value={formData.description}
                            onChange={handleInputChange}
                            style={{ minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn--primary btn--xl btn--full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>{t('loading') || 'Saving...'}</>
                        ) : (
                            <>✓ {t('saveAndContinue') || 'Save & Continue'}</>
                        )}
                    </button>
                </form>

                {/* Skip for now - if editing */}
                {userProfile?.profileCompleted && (
                    <button
                        className="btn btn--ghost btn--full"
                        onClick={() => navigate('/dashboard')}
                        style={{ marginTop: '12px' }}
                    >
                        ← {t('back') || 'Back to Dashboard'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default SetupPage;
