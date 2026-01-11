/**
 * Start Promotion Page Component
 * Voice-first input with text fallback - Uses Groq Whisper for transcription
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePromotion } from '../contexts/PromotionContext';
import { audioRecordingService } from '../services/audioRecordingService';
import ProgressIndicator from '../components/ProgressIndicator';
import TopBar from '../components/TopBar';

function StartPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language } = useLanguage();
    const { updatePromotionData } = usePromotion();

    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const inputMethod = location.state?.method || 'voice';
    const textInputRef = useRef(null);

    useEffect(() => {
        if (inputMethod === 'text') {
            setShowTextInput(true);
        }

        // Initialize Groq Whisper audio recording service
        if (audioRecordingService.isSupported()) {
            audioRecordingService.setCallbacks({
                onStart: () => {
                    setIsListening(true);
                    setIsProcessing(false);
                    setError('');
                },
                onResult: (transcript, isFinal) => {
                    if (isFinal) {
                        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
                        setIsProcessing(false);
                    }
                },
                onError: (errorMessage) => {
                    setError(errorMessage);
                    setIsListening(false);
                    setIsProcessing(false);
                },
                onEnd: () => {
                    setIsListening(false);
                    setIsProcessing(true); // Show processing state while Groq transcribes
                }
            });
        }

        return () => {
            audioRecordingService.stop();
        };
    }, [inputMethod, language]);

    const handleVoiceStart = () => {
        if (!audioRecordingService.isSupported()) {
            setError('Audio recording not supported. Please use text input.');
            setShowTextInput(true);
            return;
        }

        if (isListening) {
            audioRecordingService.stop();
        } else {
            setError('');
            audioRecordingService.start();
        }
    };


    const handleContinue = () => {
        if (!inputText.trim()) {
            setError('Please enter or speak your offer first');
            return;
        }

        updatePromotionData({
            rawInput: inputText.trim(),
            language
        });

        navigate('/confirm');
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    const toggleInputMethod = () => {
        setShowTextInput(!showTextInput);
        if (!showTextInput) {
            audioRecordingService.stop();
            setIsListening(false);
            setTimeout(() => textInputRef.current?.focus(), 100);
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

            {/* Progress Indicator */}
            <ProgressIndicator />

            {/* Main Content */}
            <div className="center-content fade-in">
                <div>
                    <h2 style={{ marginBottom: '8px' }}>🎯 {t('tellUsOffer')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {t('exampleVoice')}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="info-card" style={{
                        background: 'var(--error-50)',
                        borderColor: 'var(--error-500)',
                        width: '100%',
                        maxWidth: '320px'
                    }}>
                        <span className="info-card__icon">⚠️</span>
                        <span className="info-card__text" style={{ color: 'var(--error-600)' }}>{error}</span>
                    </div>
                )}

                {/* Voice Input Area */}
                {!showTextInput && (
                    <div style={{ textAlign: 'center' }}>
                        <button
                            className={`btn--voice ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
                            onClick={handleVoiceStart}
                            disabled={isProcessing}
                        >
                            <span className={`mic-icon ${isListening ? 'mic-icon--active' : ''}`}>
                                {isProcessing ? '⏳' : isListening ? '🔴' : '🎤'}
                            </span>
                        </button>
                        <p style={{
                            marginTop: '16px',
                            color: isProcessing ? 'var(--primary-500)' : isListening ? 'var(--primary-600)' : 'var(--text-muted)',
                            fontWeight: isListening || isProcessing ? '600' : '400',
                            fontSize: '1rem'
                        }}>
                            {isProcessing ? '✨ AI is transcribing...' : isListening ? t('listening') : t('tapToSpeak')}
                        </p>
                        {/* Groq Whisper Mode Indicator */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '12px',
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.15), rgba(155, 114, 203, 0.15))',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            color: 'var(--primary-600)'
                        }}>
                            <span>✨</span>
                            <span>
                                {language === 'hi' ? 'AI मोड (हिंदी)' : language === 'ta' ? 'AI பயன்முறை (தமிழ்)' : 'AI Mode (Groq Whisper)'}
                            </span>
                        </div>
                        <p style={{
                            marginTop: '8px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                        }}>
                            Tap mic → Speak → Tap again to transcribe
                        </p>
                    </div>
                )}

                {/* Transcript Display */}
                {inputText && (
                    <div style={{ width: '100%', maxWidth: '320px' }}>
                        <div className="card" style={{
                            textAlign: 'center',
                            minHeight: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <p style={{
                                fontSize: '1.1rem',
                                lineHeight: '1.5',
                                color: 'var(--text-primary)'
                            }}>
                                {inputText}
                            </p>
                        </div>
                        {/* Re-speak Button */}
                        <button
                            className="btn btn--ghost btn--sm btn--full"
                            onClick={() => {
                                audioRecordingService.stop();
                                setInputText('');
                                setError('');
                                setIsProcessing(false);
                                setIsListening(false);
                            }}
                            style={{ marginTop: '8px' }}
                        >
                            🔄 Re-speak / Clear
                        </button>
                    </div>
                )}

                {/* Divider */}
                <div className="divider" style={{ width: '100%', maxWidth: '320px' }}>
                    <span>{t('or')}</span>
                </div>

                {/* Text Input Toggle / Area */}
                {showTextInput ? (
                    <div style={{ width: '100%', maxWidth: '320px' }}>
                        <textarea
                            ref={textInputRef}
                            className="input textarea"
                            placeholder={t('typeYourOffer')}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            style={{
                                minHeight: '120px',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                        <button
                            className="btn btn--ghost btn--sm"
                            onClick={toggleInputMethod}
                            style={{ marginTop: '8px' }}
                        >
                            🎤 Switch to Voice
                        </button>
                    </div>
                ) : (
                    <button
                        className="btn btn--secondary"
                        onClick={toggleInputMethod}
                    >
                        ⌨️ {t('typeOffer')}
                    </button>
                )}
            </div>

            {/* Continue Button */}
            <div className="actions safe-area-bottom">
                <button
                    className="btn btn--primary btn--xl btn--full"
                    onClick={handleContinue}
                    disabled={!inputText.trim()}
                >
                    {t('continue')} →
                </button>
            </div>
        </div>
    );
}

export default StartPage;
