/**
 * Login Page Component
 * Simple authentication with Google Sign-in and OTP
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { signInWithGoogle, sendOTP, verifyOTP, fetchUserProfile, loading } = useAuth();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const redirectTo = location.state?.redirectTo || '/dashboard';
    const inputMethod = location.state?.method;

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const user = await signInWithGoogle();
            // Fetch profile explicitly if not already in context
            const profile = await fetchUserProfile(user.uid);

            if (!profile?.profileCompleted) {
                // Mandatory setup for new users
                navigate('/setup');
            } else {
                // Existing users go to dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Google sign in error:', err);
            setError('Failed to sign in with Google. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setError('');
        setIsLoading(true);
        try {
            const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
            const result = await sendOTP(formattedNumber, 'recaptcha-container');
            setConfirmationResult(result);
            setIsOtpSent(true);
        } catch (err) {
            console.error('Send OTP error:', err);
            setError('Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setError('');
        setIsLoading(true);
        try {
            const user = await verifyOTP(confirmationResult, otp);
            const profile = await fetchUserProfile(user.uid);

            if (!profile?.profileCompleted) {
                // Mandatory setup
                navigate('/setup');
            } else {
                // Dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            setError('Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (isOtpSent) {
            setIsOtpSent(false);
            setOtp('');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="page">
            {/* TopBar - Language & Theme Toggle */}
            <TopBar />

            {/* Back Button */}
            <button className="back-btn" onClick={handleBack}>
                ← {t('back')}
            </button>

            {/* Main Content */}
            <div className="center-content fade-in">
                {/* Logo */}
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🛒</h1>
                    <h2 style={{ marginBottom: '8px' }}>{t('welcomeBack')}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('loginToContinue')}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="info-card" style={{ background: 'var(--error-50)', borderColor: 'var(--error-500)', width: '100%' }}>
                        <span className="info-card__icon">⚠️</span>
                        <span className="info-card__text" style={{ color: 'var(--error-600)' }}>{error}</span>
                    </div>
                )}

                {/* Auth Options */}
                <div style={{ width: '100%', maxWidth: '320px' }}>
                    {/* Google Sign In - Primary */}
                    <button
                        className="btn btn--google btn--lg btn--full"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        style={{ marginBottom: '24px' }}
                    >
                        <svg className="google-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {isLoading ? t('loading') : t('signInWithGoogle')}
                    </button>

                    {/* Divider */}
                    <div className="divider" style={{ marginBottom: '24px' }}>
                        <span>{t('orContinueWith')}</span>
                    </div>

                    {/* Phone OTP */}
                    {!isOtpSent ? (
                        <div className="input-group">
                            <label className="input-label">{t('phoneNumber')}</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{
                                    padding: '12px 16px',
                                    background: 'var(--neutral-100)',
                                    borderRadius: '12px',
                                    fontWeight: '600'
                                }}>
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    className="input input--lg"
                                    placeholder="98765 43210"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    maxLength={10}
                                />
                            </div>
                            <button
                                className="btn btn--primary btn--lg btn--full"
                                onClick={handleSendOTP}
                                disabled={isLoading || phoneNumber.length < 10}
                                style={{ marginTop: '16px' }}
                            >
                                {isLoading ? t('loading') : t('sendOtp')}
                            </button>
                        </div>
                    ) : (
                        <div className="input-group">
                            <label className="input-label">{t('enterOtp')}</label>
                            <input
                                type="text"
                                className="input input--lg"
                                placeholder="• • • • • •"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }}
                            />
                            <button
                                className="btn btn--primary btn--lg btn--full"
                                onClick={handleVerifyOTP}
                                disabled={isLoading || otp.length < 6}
                                style={{ marginTop: '16px' }}
                            >
                                {isLoading ? t('loading') : t('verifyOtp')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Recaptcha Container (invisible) */}
                <div id="recaptcha-container"></div>
            </div>
        </div>
    );
}

export default LoginPage;
