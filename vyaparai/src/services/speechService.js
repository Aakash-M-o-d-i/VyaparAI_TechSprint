/**
 * Speech Service
 * Handles voice input using Web Speech API
 */

class SpeechService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentLanguage = null;
        this.onResult = null;
        this.onError = null;
        this.onStart = null;
        this.onEnd = null;
    }

    /**
     * Check if speech recognition is supported
     */
    isSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    /**
     * Initialize speech recognition
     */
    init(languageCode = 'en-IN') {
        if (!this.isSupported()) {
            console.warn('Speech recognition not supported');
            return false;
        }

        // Store current language
        this.currentLanguage = languageCode;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // Configure recognition
        this.recognition.lang = languageCode;
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onStart) this.onStart();
        };

        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            const isFinal = result.isFinal;

            if (this.onResult) {
                this.onResult(transcript, isFinal);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;

            if (this.onError) {
                let errorMessage = 'Speech recognition error';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected. Please try again.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Microphone not found or not working.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone permission denied. Please allow microphone access.';
                        break;
                    case 'network':
                        // Network error - usually means Google's speech servers are unreachable
                        // or the browser requires HTTPS for speech recognition
                        errorMessage = 'Network error. Trying to reconnect... (Speech requires internet connection)';
                        // Auto-retry after a short delay
                        setTimeout(() => {
                            if (!this.isListening) {
                                console.log('Auto-retrying speech recognition...');
                                this.recognition = null;
                                this.init(this.currentLanguage);
                                // Restore callbacks
                                const callbacks = {
                                    onResult: this.onResult,
                                    onError: this.onError,
                                    onStart: this.onStart,
                                    onEnd: this.onEnd
                                };
                                this.setCallbacks(callbacks);
                            }
                        }, 1000);
                        break;
                    case 'aborted':
                        errorMessage = 'Speech recognition was cancelled.';
                        break;
                    case 'service-not-allowed':
                        errorMessage = 'Speech service not available. Try using Chrome browser.';
                        break;
                    default:
                        errorMessage = `Error: ${event.error}`;
                }
                this.onError(errorMessage);
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEnd) this.onEnd();
        };

        return true;
    }

    /**
     * Change language - reinitializes recognition with new language
     * Some browsers require recreating the recognition instance for language changes
     */
    changeLanguage(languageCode) {
        if (this.currentLanguage === languageCode) {
            return; // No change needed
        }

        console.log(`Changing speech language from ${this.currentLanguage} to ${languageCode}`);

        // Stop current recognition if running
        if (this.isListening) {
            this.stop();
        }

        // Preserve callbacks
        const savedCallbacks = {
            onResult: this.onResult,
            onError: this.onError,
            onStart: this.onStart,
            onEnd: this.onEnd
        };

        // Reinitialize with new language
        this.recognition = null;
        this.init(languageCode);

        // Restore callbacks
        this.setCallbacks(savedCallbacks);
    }

    /**
     * Start listening
     */
    start(languageCode) {
        // If language changed, reinitialize the recognition
        if (!this.recognition || this.currentLanguage !== languageCode) {
            this.changeLanguage(languageCode);
        }

        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Failed to start recognition:', error);
                // Recognition might already be started
                this.stop();
                setTimeout(() => {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.error('Retry failed:', e);
                    }
                }, 100);
            }
        }
    }

    /**
     * Stop listening
     */
    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    /**
     * Set callbacks
     */
    setCallbacks({ onResult, onError, onStart, onEnd }) {
        if (onResult) this.onResult = onResult;
        if (onError) this.onError = onError;
        if (onStart) this.onStart = onStart;
        if (onEnd) this.onEnd = onEnd;
    }

    /**
     * Get listening state
     */
    getIsListening() {
        return this.isListening;
    }
}

// Export singleton instance
export const speechService = new SpeechService();

export default speechService;
