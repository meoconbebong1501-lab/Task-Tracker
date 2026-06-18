// ═══════════════════════════════════════════════════
// TaskFlow Service Worker
// Hỗ trợ: PWA install (Add to Home Screen) + Push Notification
// ═══════════════════════════════════════════════════

const CACHE_NAME = 'taskflow-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Không cache aggressive — luôn lấy bản mới nhất từ network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ── PUSH NOTIFICATION ──
// Nhận push event từ server (qua Web Push API) và hiển thị notification
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'TaskFlow', body: event.data ? event.data.text() : 'Có thông báo mới' };
  }

  const title = data.title || 'TaskFlow';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'taskflow-' + Date.now(),
    requireInteraction: true,
    data: { url: data.url || 'https://app.taskflow.com.vn' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Khi user bấm vào notification → mở/focus app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || 'https://app.taskflow.com.vn';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('taskflow.com.vn') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
