/**
 * Audio Recording Service
 * Records audio using MediaRecorder API and transcribes using Groq Whisper
 * Fallback for when Web Speech API doesn't work
 */

class AudioRecordingService {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.isRecording = false;
        this.onResult = null;
        this.onError = null;
        this.onStart = null;
        this.onEnd = null;
    }

    /**
     * Check if audio recording is supported
     */
    isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
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
     * Start recording audio
     */
    async start() {
        if (!this.isSupported()) {
            if (this.onError) {
                this.onError('Audio recording not supported in this browser.');
            }
            return;
        }

        try {
            // Request microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });

            this.audioChunks = [];

            // Create MediaRecorder with best available format
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : 'audio/mp4';

            this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstart = () => {
                this.isRecording = true;
                if (this.onStart) this.onStart();
            };

            this.mediaRecorder.onstop = async () => {
                this.isRecording = false;

                // Create audio blob
                const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });

                // Stop all tracks
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                }

                // Transcribe audio using Groq Whisper
                await this.transcribeWithGroq(audioBlob);

                if (this.onEnd) this.onEnd();
            };

            this.mediaRecorder.onerror = (event) => {
                this.isRecording = false;
                if (this.onError) {
                    this.onError('Recording failed: ' + event.error?.message || 'Unknown error');
                }
            };

            // Start recording - collect data every 1 second
            this.mediaRecorder.start(1000);

        } catch (err) {
            console.error('Error starting recording:', err);
            if (this.onError) {
                if (err.name === 'NotAllowedError') {
                    this.onError('Microphone permission denied. Please allow microphone access.');
                } else if (err.name === 'NotFoundError') {
                    this.onError('No microphone found. Please connect a microphone.');
                } else {
                    this.onError('Failed to start recording: ' + err.message);
                }
            }
        }
    }

    /**
     * Stop recording
     */
    stop() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
    }

    /**
     * Transcribe using Groq Whisper API (FREE!)
     * Supports 50+ languages including Hindi and Tamil
     */
    async transcribeWithGroq(audioBlob) {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            if (this.onError) {
                this.onError('Groq API key not configured. Please add VITE_GROQ_API_KEY to .env');
            }
            return;
        }

        try {
            // Create form data with audio file
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-large-v3');
            formData.append('response_format', 'json');

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Groq transcription failed');
            }

            const data = await response.json();
            const transcription = data.text?.trim();

            if (transcription) {
                if (this.onResult) {
                    this.onResult(transcription, true);
                }
            } else {
                if (this.onError) {
                    this.onError('No speech detected. Please try speaking louder.');
                }
            }

        } catch (err) {
            console.error('Transcription error:', err);
            if (this.onError) {
                this.onError('Transcription failed: ' + err.message);
            }
        }
    }

    /**
     * Get recording state
     */
    getIsRecording() {
        return this.isRecording;
    }
}

// Export singleton instance
export const audioRecordingService = new AudioRecordingService();

export default audioRecordingService;
