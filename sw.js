// BJJ Workout App Service Worker
const CACHE_NAME = 'bjj-workout-v1.0.0';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/script.js',
    '/src/styles/design-tokens.css',
    '/src/styles/components.css',
    '/src/js/app.js',
    '/src/js/utils/animations.js',
    '/src/js/utils/helpers.js',
    '/manifest.json',
    // External resources
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/lucide@latest/dist/umd/lucide.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell...');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('App shell cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache app shell:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    // For HTML files, try to update cache in background
                    if (event.request.destination === 'document') {
                        updateCache(event.request);
                    }
                    return cachedResponse;
                }

                // If not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Add to cache for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Fetch failed:', error);
                        
                        // Return offline fallback for HTML requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for workout data
self.addEventListener('sync', (event) => {
    if (event.tag === 'workout-sync') {
        event.waitUntil(syncWorkoutData());
    }
});

// Push notifications (for future workout reminders)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Time for your BJJ workout!',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'start-workout',
                title: 'Start Workout',
                icon: '/icons/action-start.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/action-close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('BJJ Workout Reminder', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'start-workout') {
        event.waitUntil(
            clients.openWindow('/?action=start')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background fetch for large resources (future feature)
self.addEventListener('backgroundfetch', (event) => {
    if (event.tag === 'workout-videos') {
        event.waitUntil(downloadWorkoutVideos());
    }
});

// Helper functions
async function updateCache(request) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
            console.log('Cache updated for:', request.url);
        }
    } catch (error) {
        console.error('Failed to update cache:', error);
    }
}

async function syncWorkoutData() {
    try {
        // Sync workout progress data when online
        const data = await getStoredWorkoutData();
        if (data) {
            await uploadWorkoutData(data);
            await clearStoredWorkoutData();
            console.log('Workout data synced successfully');
        }
    } catch (error) {
        console.error('Failed to sync workout data:', error);
    }
}

async function getStoredWorkoutData() {
    // Get workout data from IndexedDB or localStorage
    return null; // Placeholder
}

async function uploadWorkoutData(data) {
    // Upload workout data to server
    // Placeholder for future implementation
}

async function clearStoredWorkoutData() {
    // Clear synced data from local storage
    // Placeholder for future implementation
}

async function downloadWorkoutVideos() {
    // Download workout videos for offline use
    // Placeholder for future implementation
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
        default:
            console.log('Unknown message type:', type);
    }
});

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
}

// Periodic background sync (future feature)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'workout-reminder') {
        event.waitUntil(checkWorkoutReminder());
    }
});

async function checkWorkoutReminder() {
    // Check if user needs workout reminder
    // Placeholder for future implementation
} 