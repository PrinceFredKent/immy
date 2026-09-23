// Service Worker for Immy Drinks - Background Push Notifications & Caching
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for incoming Web Push events from Google FCM / Android background
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || '🚨 Immy Drinks Order Alert';
    const options = {
      body: data.body || 'New order activity detected.',
      icon: data.icon || '/logo.png',
      badge: '/icon.svg',
      tag: data.tag || 'immy-order-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      data: data.data || { url: '/' },
      vibrate: [300, 150, 300, 150, 400],
      actions: [
        { action: 'open_order', title: 'Open Order' }
      ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Immy Drinks Alert', {
        body: text,
        icon: '/logo.png',
        badge: '/icon.svg',
        vibrate: [300, 150, 300]
      })
    );
  }
});

// Handle notification tap
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            if (targetUrl && client.navigate) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
