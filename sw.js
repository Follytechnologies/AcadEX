// ============================================
// ACADEX — Service Worker (PWA)
// sw.js — Place in root directory
// Enables offline access + install-as-app
// ============================================

const CACHE_NAME = 'acadex-v1';

// Files to cache for offline access
const STATIC_ASSETS = [
  '/landing.html',
  '/login.html',
  '/signup.html',
  '/dashboard-100.html',
  '/dashboard-200.html',
  '/dashboard-300.html',
  '/dashboard-400.html',
  '/dashboard-500.html',
  '/cbt.html',
  '/review.html',
  '/appeal.html',
  '/gpa-tracker.html',
  '/materials.html',
  '/past-questions.html',
  '/onboarding.html',
  '/lecturer-dashboard.html',
  '/appeals-manager.html',
  '/assignments.html',
  '/upload-materials.html',
  '/manage-cbt.html',
  // Scripts
  '/app.js',
  '/firebase-config.js',
  '/ai.js',
  '/notifications.js',
  '/nav.js',
  '/darkmode.js',
  '/accessibility.js',
  '/icons.css',
  // Styles
  '/style.css',
  '/landing.css',
  '/dashboard-100.css',
  '/dashboard-200.css',
  '/cbt.css',
  '/review.css',
  '/appeal.css',
  '/gpa-tracker.css',
  '/onboarding.css',
  '/materials.css',
  '/signup.css',
  '/darkmode.css',
  '/accessibility.css',
];

// ---- INSTALL: Cache all static assets ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('AcadEx SW: Caching static assets');
      // Cache individually so one failure doesn't block all
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => console.warn('Could not cache:', url)))
      );
    })
  );
  self.skipWaiting();
});

// ---- ACTIVATE: Clear old caches ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ---- FETCH: Network first, fall back to cache ----
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin requests (Firebase, Anthropic API)
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For HTML pages, serve a basic offline page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return new Response(`
              <!DOCTYPE html>
              <html>
              <head><title>AcadEx — Offline</title><style>
                body { font-family: sans-serif; text-align: center; padding: 60px 20px; background: #f4f6f9; }
                .logo { font-size: 48px; font-weight: 800; color: #1A3C6E; margin-bottom: 16px; }
                h1 { color: #1A3C6E; }
                p { color: #666; max-width: 400px; margin: 0 auto 24px; }
                button { background: #1A3C6E; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; }
              </style></head>
              <body>
                <div class="logo">Ax</div>
                <h1>You're Offline</h1>
                <p>AcadEx needs an internet connection to load this page. Connect to Wi-Fi or mobile data and try again.</p>
                <button onclick="window.location.reload()">Try Again</button>
              </body>
              </html>
            `, { headers: { 'Content-Type': 'text/html' } });
          }
        });
      })
  );
});

// ---- BACKGROUND SYNC: Queue appeal submissions when offline ----
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-appeals') {
    event.waitUntil(syncPendingAppeals());
  }
});

async function syncPendingAppeals() {
  // This would sync locally-queued appeals to Firestore when back online
  console.log('AcadEx SW: Syncing pending appeals...');
}
