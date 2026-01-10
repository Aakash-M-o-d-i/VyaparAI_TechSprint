/**
 * Speech Service
 * Handles voice input using Web Speech API
 */

class SpeechService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
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
                        errorMessage = 'Microphone permission denied.';
                        break;
                    case 'network':
                        errorMessage = 'Network error. Please check your connection.';
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
     * Start listening
     */
    start(languageCode) {
        if (!this.recognition) {
            this.init(languageCode);
        } else {
            this.recognition.lang = languageCode;
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
