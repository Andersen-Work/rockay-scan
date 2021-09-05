const PRECACHE = 'precache-v3';
const RUNTIME = 'runtime';

const PRECACHE_URLS = ['/scan/', '/scan/index.html'];

const scripts = ['axios','dom','loader','main','qr']//.map((i)=>{PRECACHE_URLS.push('/scan/js/'+i+'.js')})
const styles = ['base','color','font','loader','reset']//.map((i)=>{PRECACHE_URLS.push('/scan/css/'+i+'.css')})

for (let i = 0; i<scripts.length; i++) { PRECACHE_URLS.push('/scan/js/' + scripts[i] + '.js') }
for (let i = 0; i<styles.length; i++) { PRECACHE_URLS.push('/scan/css/' + scripts[i] + '.css') }

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if ( event.request.method !== 'GET' ) {
    return false;
  }
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});