/**
 * Start Promotion Page Component
 * Voice-first input with text fallback
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePromotion } from '../contexts/PromotionContext';
import { speechService } from '../services/speechService';
import ProgressIndicator from '../components/ProgressIndicator';
import TopBar from '../components/TopBar';

function StartPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language, getSpeechLanguageCode } = useLanguage();
    const { updatePromotionData } = usePromotion();

    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState('');
    const [showTextInput, setShowTextInput] = useState(false);

    const inputMethod = location.state?.method || 'voice';
    const textInputRef = useRef(null);

    useEffect(() => {
        if (inputMethod === 'text') {
            setShowTextInput(true);
        }

        // Initialize speech service
        if (speechService.isSupported()) {
            speechService.init(getSpeechLanguageCode());
            speechService.setCallbacks({
                onStart: () => {
                    setIsListening(true);
                    setError('');
                },
                onResult: (transcript, isFinal) => {
                    if (isFinal) {
                        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
                        setInterimTranscript('');
                    } else {
                        setInterimTranscript(transcript);
                    }
                },
                onError: (errorMessage) => {
                    setError(errorMessage);
                    setIsListening(false);
                },
                onEnd: () => {
                    setIsListening(false);
                }
            });
        }

        return () => {
            speechService.stop();
        };
    }, [inputMethod]);

    const handleVoiceStart = () => {
        if (!speechService.isSupported()) {
            setError('Voice input is not supported in your browser. Please use text input.');
            setShowTextInput(true);
            return;
        }

        if (isListening) {
            speechService.stop();
        } else {
            setError('');
            speechService.start(getSpeechLanguageCode());
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
            speechService.stop();
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
                            className={`btn--voice ${isListening ? 'listening' : ''}`}
                            onClick={handleVoiceStart}
                        >
                            <span className={`mic-icon ${isListening ? 'mic-icon--active' : ''}`}>
                                {isListening ? '🔴' : '🎤'}
                            </span>
                        </button>
                        <p style={{
                            marginTop: '16px',
                            color: isListening ? 'var(--primary-600)' : 'var(--text-muted)',
                            fontWeight: isListening ? '600' : '400',
                            fontSize: '1rem'
                        }}>
                            {isListening ? t('listening') : t('tapToSpeak')}
                        </p>
                    </div>
                )}

                {/* Transcript Display */}
                {(inputText || interimTranscript) && (
                    <div className="card" style={{
                        width: '100%',
                        maxWidth: '320px',
                        textAlign: 'center',
                        minHeight: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: '1.5',
                            color: interimTranscript ? 'var(--text-muted)' : 'var(--text-primary)'
                        }}>
                            {inputText}
                            {interimTranscript && (
                                <span style={{ opacity: 0.5 }}> {interimTranscript}</span>
                            )}
                        </p>
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
