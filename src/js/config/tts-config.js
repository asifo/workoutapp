// Google Cloud TTS Configuration (Free Tier)
export const TTS_CONFIG = {
    // Google Cloud TTS API Key
    // You can set this in several ways:
    // 1. Environment variable: VITE_GOOGLE_CLOUD_API_KEY
    // 2. Window object: window.GOOGLE_CLOUD_API_KEY
    // 3. Local storage: localStorage.getItem('google-cloud-api-key')
    // 4. Settings panel in the app
    
    // Free tier limits
    freeTier: {
        monthlyCharacters: 4000000, // 4 million characters per month
        resetDate: 'monthly', // Resets on the 1st of each month
        description: 'Free tier includes 4 million characters per month'
    },
    
    // Default voice settings (optimized for free tier)
    defaultVoice: {
        languageCode: 'en-US',
        name: 'en-US-Standard-A', // Standard voices are included in free tier
        ssmlGender: 'FEMALE'
    },
    
    // Voice options (all Standard voices - included in free tier)
    voices: {
        // Standard voices (included in free tier)
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
    },
    
    // Audio configuration
    audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // 0.25 to 4.0
        pitch: 0, // -20.0 to 20.0
        volumeGainDb: 0 // -96.0 to 16.0
    },
    
    // Fallback settings
    fallbackToBrowserTTS: true,
    
    // Rate limiting (to avoid hitting API limits)
    rateLimit: {
        maxRequestsPerMinute: 60,
        maxConcurrentRequests: 3
    }
};

// Helper function to get API key
export function getApiKey() {
    const envKey = import.meta.env?.VITE_GOOGLE_CLOUD_API_KEY;
    const windowKey = window.GOOGLE_CLOUD_API_KEY;
    const localKey = localStorage.getItem('google-cloud-api-key');
    
    console.log('🔍 API Key Debug:', {
        envKey: envKey ? '✅ Found' : '❌ Not found',
        windowKey: windowKey ? '✅ Found' : '❌ Not found',
        localKey: localKey ? '✅ Found' : '❌ Not found',
        envKeyValue: envKey ? `${envKey.substring(0, 10)}...` : 'null'
    });
    
    return envKey || windowKey || localKey || null;
}

// Helper function to set API key
export function setApiKey(apiKey) {
    if (apiKey) {
        localStorage.setItem('google-cloud-api-key', apiKey);
        window.GOOGLE_CLOUD_API_KEY = apiKey;
    } else {
        localStorage.removeItem('google-cloud-api-key');
        delete window.GOOGLE_CLOUD_API_KEY;
    }
}

// Helper function to set service account JSON
export function setServiceAccount(serviceAccountJson) {
    if (serviceAccountJson) {
        localStorage.setItem('google-service-account', JSON.stringify(serviceAccountJson));
        window.GOOGLE_SERVICE_ACCOUNT = serviceAccountJson;
    } else {
        localStorage.removeItem('google-service-account');
        delete window.GOOGLE_SERVICE_ACCOUNT;
    }
}

// Helper function to get service account
export function getServiceAccount() {
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

// Helper function to validate service account JSON
export function validateServiceAccount(serviceAccountJson) {
    try {
        if (!serviceAccountJson || typeof serviceAccountJson !== 'object') {
            return false;
        }
        
        // Check for required fields
        const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
        return requiredFields.every(field => serviceAccountJson.hasOwnProperty(field));
    } catch (error) {
        return false;
    }
}

// Helper function to validate API key format
export function validateApiKey(apiKey) {
    // Basic validation - Google Cloud API keys are typically 39 characters
    return apiKey && typeof apiKey === 'string' && apiKey.length >= 30;
}

// Helper function to format usage for display
export function formatUsage(usage) {
    if (usage >= 1000000) {
        return `${(usage / 1000000).toFixed(1)}M`;
    } else if (usage >= 1000) {
        return `${(usage / 1000).toFixed(1)}K`;
    }
    return usage.toString();
} 