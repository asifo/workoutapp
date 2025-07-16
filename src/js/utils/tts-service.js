// Google Cloud Text-to-Speech Service (Free Tier)
class TTSService {
    constructor() {
        this.isInitialized = false;
        this.audioContext = null;
        this.currentAudio = null;
        this.speechQueue = [];
        this.isSpeaking = false;
        this.apiKey = null;
        this.serviceAccount = null;
        this.baseUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';
        
        // Free tier limits: 4 million characters per month
        this.monthlyUsage = 0;
        this.monthlyLimit = 4000000; // 4M characters
        
        // Default voice settings (optimized for free tier)
        this.defaultVoice = {
            languageCode: 'en-US',
            name: 'en-US-Standard-A', // Standard voices are cheaper
            ssmlGender: 'FEMALE'
        };
        
        // Voice options (Standard voices for cost efficiency)
        this.voiceOptions = {
            'en-US-Standard-A': { name: 'en-US-Standard-A', ssmlGender: 'FEMALE', description: 'Standard Female A' },
            'en-US-Standard-B': { name: 'en-US-Standard-B', ssmlGender: 'MALE', description: 'Standard Male B' },
            'en-US-Standard-C': { name: 'en-US-Standard-C', ssmlGender: 'FEMALE', description: 'Standard Female C' },
            'en-US-Standard-D': { name: 'en-US-Standard-D', ssmlGender: 'MALE', description: 'Standard Male D' },
            'en-US-Standard-E': { name: 'en-US-Standard-E', ssmlGender: 'FEMALE', description: 'Standard Female E' },
            'en-US-Standard-F': { name: 'en-US-Standard-F', ssmlGender: 'FEMALE', description: 'Standard Female F' },
            'en-US-Standard-G': { name: 'en-US-Standard-G', ssmlGender: 'MALE', description: 'Standard Male G' },
            'en-US-Standard-H': { name: 'en-US-Standard-H', ssmlGender: 'FEMALE', description: 'Standard Female H' },
            'en-US-Standard-I': { name: 'en-US-Standard-I', ssmlGender: 'MALE', description: 'Standard Male I' },
            'en-US-Standard-J': { name: 'en-US-Standard-J', ssmlGender: 'MALE', description: 'Standard Male J' }
        };

        // Load usage from localStorage
        this.loadUsage();
    }

    async initialize(apiKey = null, serviceAccountJson = null) {
        try {
            // Try to get credentials from various sources
            this.apiKey = apiKey || this.getApiKey();
            this.serviceAccount = serviceAccountJson || this.getServiceAccount();
            
            if (!this.apiKey && !this.serviceAccount) {
                console.warn('No Google Cloud credentials found. Falling back to browser speech synthesis.');
                return false;
            }

            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Test the API with a simple request
            await this.testConnection();
            
            this.isInitialized = true;
            console.log('Google Cloud TTS initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize Google Cloud TTS:', error);
            return false;
        }
    }

    getApiKey() {
        // Try to get API key from various sources
        return (
            import.meta.env?.VITE_GOOGLE_CLOUD_API_KEY ||
            window.GOOGLE_CLOUD_API_KEY ||
            localStorage.getItem('google-cloud-api-key')
        );
    }

    getServiceAccount() {
        // Try to get service account from localStorage
        const saved = localStorage.getItem('google-service-account');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.warn('Invalid service account JSON in localStorage');
                return null;
            }
        }
        return null;
    }

    async testConnection() {
        const testText = 'TTS test';
        const audioData = await this.synthesizeSpeech(testText, this.defaultVoice);
        return audioData !== null;
    }

    async synthesizeSpeech(text, voiceConfig = null) {
        if (!this.apiKey && !this.serviceAccount) {
            throw new Error('Google Cloud credentials not configured');
        }

        // Check usage limits
        if (this.monthlyUsage + text.length > this.monthlyLimit) {
            throw new Error('Monthly free tier limit reached. Please upgrade or wait until next month.');
        }

        const voice = voiceConfig || this.defaultVoice;
        
        const requestBody = {
            input: { text },
            voice: {
                languageCode: voice.languageCode || 'en-US',
                name: voice.name || 'en-US-Standard-A',
                ssmlGender: voice.ssmlGender || 'FEMALE'
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.9,
                pitch: 0,
                volumeGainDb: 0
            }
        };

        try {
            let url = this.baseUrl;
            let headers = {
                'Content-Type': 'application/json',
            };

            // Use API key if available (simpler)
            if (this.apiKey) {
                url += `?key=${this.apiKey}`;
            } else if (this.serviceAccount) {
                // For service account, we need to get an access token first
                const accessToken = await this.getAccessToken();
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Google Cloud TTS API error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            // Update usage
            this.monthlyUsage += text.length;
            this.saveUsage();
            
            return data.audioContent;

        } catch (error) {
            console.error('Speech synthesis failed:', error);
            throw error;
        }
    }

    async getAccessToken() {
        if (!this.serviceAccount) {
            throw new Error('Service account not configured');
        }

        // For service accounts, we need to create a JWT and exchange it for an access token
        // This is a simplified version - in production, you might want to use a backend service
        
        const now = Math.floor(Date.now() / 1000);
        const header = {
            alg: 'RS256',
            typ: 'JWT'
        };

        const claim = {
            iss: this.serviceAccount.client_email,
            scope: 'https://www.googleapis.com/auth/cloud-platform',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600,
            iat: now
        };

        // Note: This is a simplified approach. In a real application, you'd want to:
        // 1. Use a backend service to handle JWT signing
        // 2. Or use Google's client libraries
        // 3. Or use API keys instead (simpler for client-side apps)
        
        console.warn('Service account authentication requires backend support. Please use API key instead.');
        throw new Error('Service account authentication not supported in client-side app. Please use API key.');
    }

    async playAudio(audioData) {
        try {
            // Decode base64 audio data
            const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
            
            // Create audio buffer from array buffer
            const arrayBuffer = audioBuffer.buffer.slice(
                audioBuffer.byteOffset,
                audioBuffer.byteOffset + audioBuffer.byteLength
            );
            
            const audioBufferSource = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Create and play audio
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBufferSource;
            source.connect(this.audioContext.destination);
            
            // Store current audio for potential stopping
            this.currentAudio = source;
            
            return new Promise((resolve, reject) => {
                source.onended = () => {
                    this.currentAudio = null;
                    resolve();
                };
                source.onerror = (error) => {
                    this.currentAudio = null;
                    reject(error);
                };
                source.start(0);
            });
            
        } catch (error) {
            console.error('Failed to play audio:', error);
            throw error;
        }
    }

    async speak(text, priority = false, voiceConfig = null) {
        if (!this.isInitialized) {
            console.warn('TTS not initialized, cannot speak');
            return;
        }

        if (priority) {
            this.clearSpeech();
        }

        this.speechQueue.push({ text, voiceConfig });
        await this.processSpeechQueue();
    }

    async processSpeechQueue() {
        if (this.speechQueue.length === 0 || this.isSpeaking) {
            return;
        }

        this.isSpeaking = true;

        try {
            while (this.speechQueue.length > 0) {
                const { text, voiceConfig } = this.speechQueue.shift();
                
                // Synthesize speech
                const audioData = await this.synthesizeSpeech(text, voiceConfig);
                
                // Play audio
                await this.playAudio(audioData);
                
                // Small delay between speech items
                if (this.speechQueue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        } catch (error) {
            console.error('Error processing speech queue:', error);
        } finally {
            this.isSpeaking = false;
        }
    }

    clearSpeech() {
        // Stop current audio
        if (this.currentAudio) {
            try {
                this.currentAudio.stop();
            } catch (error) {
                console.warn('Error stopping audio:', error);
            }
            this.currentAudio = null;
        }

        // Clear queue
        this.speechQueue = [];
        this.isSpeaking = false;
    }

    stop() {
        this.clearSpeech();
    }

    // Voice management
    getAvailableVoices() {
        return Object.keys(this.voiceOptions);
    }

    setVoice(voiceName) {
        if (this.voiceOptions[voiceName]) {
            this.defaultVoice = {
                languageCode: 'en-US',
                ...this.voiceOptions[voiceName]
            };
            return true;
        }
        return false;
    }

    // Usage tracking
    loadUsage() {
        const saved = localStorage.getItem('google-tts-usage');
        if (saved) {
            const data = JSON.parse(saved);
            const now = new Date();
            const savedDate = new Date(data.date);
            
            // Reset if it's a new month
            if (now.getMonth() !== savedDate.getMonth() || now.getFullYear() !== savedDate.getFullYear()) {
                this.monthlyUsage = 0;
                this.saveUsage();
            } else {
                this.monthlyUsage = data.usage || 0;
            }
        }
    }

    saveUsage() {
        const data = {
            usage: this.monthlyUsage,
            date: new Date().toISOString()
        };
        localStorage.setItem('google-tts-usage', JSON.stringify(data));
    }

    getUsageInfo() {
        const remaining = this.monthlyLimit - this.monthlyUsage;
        const percentage = (this.monthlyUsage / this.monthlyLimit) * 100;
        
        return {
            used: this.monthlyUsage,
            limit: this.monthlyLimit,
            remaining,
            percentage: Math.round(percentage * 100) / 100
        };
    }

    // Settings management
    updateSettings(settings) {
        if (settings.voiceRate !== undefined) {
            // Adjust speaking rate (0.25 to 4.0)
            const rate = Math.max(0.25, Math.min(4.0, settings.voiceRate));
            // This would need to be applied in synthesizeSpeech method
        }
        
        if (settings.voiceVolume !== undefined) {
            // Adjust volume (0.0 to 1.0)
            const volume = Math.max(0.0, Math.min(1.0, settings.voiceVolume));
            // This would need to be applied in playAudio method
        }
    }

    // Cleanup
    destroy() {
        this.clearSpeech();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.isInitialized = false;
    }
}

export default TTSService; 