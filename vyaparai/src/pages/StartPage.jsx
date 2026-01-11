/**
 * Start Promotion Page Component
 * Voice-first input with text fallback
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { usePromotion } from '../contexts/PromotionContext';
import { speechService } from '../services/speechService';
import { audioRecordingService } from '../services/audioRecordingService';
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
    const [useGeminiTranscription, setUseGeminiTranscription] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const inputMethod = location.state?.method || 'voice';
    const textInputRef = useRef(null);
    const networkErrorCount = useRef(0);

    useEffect(() => {
        if (inputMethod === 'text') {
            setShowTextInput(true);
        }

        // Initialize speech service with current language
        if (speechService.isSupported()) {
            const currentSpeechLang = getSpeechLanguageCode();
            speechService.init(currentSpeechLang);
            speechService.setCallbacks({
                onStart: () => {
                    setIsListening(true);
                    setError('');
                },
                onResult: (transcript, isFinal) => {
                    if (isFinal) {
                        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
                        setInterimTranscript('');
                        networkErrorCount.current = 0; // Reset on success
                    } else {
                        setInterimTranscript(transcript);
                    }
                },
                onError: (errorMessage) => {
                    setIsListening(false);
                    // Check for network error - switch to Gemini fallback
                    if (errorMessage.includes('Network error') || errorMessage.includes('network')) {
                        networkErrorCount.current++;
                        if (networkErrorCount.current >= 2) {
                            // Switch to Gemini transcription after 2 network errors
                            setUseGeminiTranscription(true);
                            setError('Switching to AI transcription mode (more reliable)...');
                            setTimeout(() => setError(''), 2000);
                            return;
                        }
                    }
                    setError(errorMessage);
                },
                onEnd: () => {
                    setIsListening(false);
                }
            });
        }

        // Initialize Gemini audio recording service
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
                    setIsProcessing(true); // Show processing state while Gemini transcribes
                }
            });
        }

        return () => {
            speechService.stop();
            audioRecordingService.stop();
        };
    }, [inputMethod, language, getSpeechLanguageCode]);

    const handleVoiceStart = () => {
        // Use Gemini transcription if Web Speech API keeps failing
        if (useGeminiTranscription) {
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
            return;
        }

        // Try Web Speech API first
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
                        {/* Language / Mode Indicator Badge */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '12px',
                            padding: '6px 12px',
                            background: useGeminiTranscription ? 'linear-gradient(135deg, rgba(66, 133, 244, 0.15), rgba(155, 114, 203, 0.15))' : 'var(--bg-secondary)',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            color: useGeminiTranscription ? 'var(--primary-600)' : 'var(--text-secondary)'
                        }}>
                            <span>{useGeminiTranscription ? '✨' : '🌐'}</span>
                            <span>
                                {useGeminiTranscription
                                    ? 'AI Mode (Gemini)'
                                    : language === 'hi' ? 'हिंदी में बोलें' : language === 'ta' ? 'தமிழில் பேசுங்கள்' : 'Speak in English'}
                            </span>
                        </div>
                        {/* Tip for AI mode */}
                        {useGeminiTranscription && (
                            <p style={{
                                marginTop: '8px',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)'
                            }}>
                                Tap mic → Speak → Tap again to transcribe
                            </p>
                        )}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <button
                            className="btn btn--secondary"
                            onClick={toggleInputMethod}
                        >
                            ⌨️ {t('typeOffer')}
                        </button>
                        {!useGeminiTranscription && (
                            <button
                                className="btn btn--ghost btn--sm"
                                onClick={() => {
                                    setUseGeminiTranscription(true);
                                    setError('');
                                }}
                                style={{ fontSize: '0.8rem' }}
                            >
                                ✨ Use AI Mode (if voice not working)
                            </button>
                        )}
                    </div>
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
