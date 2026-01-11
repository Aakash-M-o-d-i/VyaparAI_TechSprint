/**
 * Audio Recording Service
 * Records audio using MediaRecorder API and transcribes using Gemini
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

                // Transcribe audio using Gemini
                await this.transcribeWithGemini(audioBlob);

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
     * Transcribe audio using Gemini API
     */
    async transcribeWithGemini(audioBlob) {
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('Gemini API key not configured');
            }

            // Convert blob to base64
            const base64Audio = await this.blobToBase64(audioBlob);
            const base64Data = base64Audio.split(',')[1]; // Remove data URL prefix

            // Determine MIME type
            const mimeType = audioBlob.type || 'audio/webm';

            // Call Gemini API for transcription
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: "Transcribe this audio exactly as spoken. Only output the transcription, nothing else. If it's in Hindi, Tamil, or any other language, transcribe it in that language. If no speech is detected, respond with '[no speech detected]'."
                                },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Data
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 500
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Transcription failed');
            }

            const data = await response.json();
            const transcription = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (transcription && transcription !== '[no speech detected]') {
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
     * Convert blob to base64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
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
