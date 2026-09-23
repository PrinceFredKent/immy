/**
 * pushClient.ts — Client-side Web Push subscription manager for Android & desktop notifications
 */

// Helper to convert base64 VAPID public key to Uint8Array for browser PushManager
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('Immy Drinks Service Worker registered:', reg.scope);
    return reg;
  } catch (err) {
    console.warn('Failed to register service worker:', err);
    return null;
  }
}

export async function subscribeToPushNotifications(
  role: 'admin' | 'customer' = 'customer',
  orderId?: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('PushManager' in window) || !('serviceWorker' in navigator)) {
    return { success: false, error: 'Push notifications are not supported on this browser' };
  }

  try {
    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was denied' };
    }

    // 2. Ensure Service Worker is registered and active
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js');
    }
    await navigator.serviceWorker.ready;

    // 3. Fetch VAPID public key from backend
    const res = await fetch('/api/push/vapid-public-key');
    if (!res.ok) {
      return { success: false, error: 'Failed to retrieve push server key' };
    }
    const { publicKey } = await res.json();
    if (!publicKey) {
      return { success: false, error: 'No VAPID public key returned' };
    }

    // 4. Subscribe with PushManager
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });
    }

    // 5. Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        role,
        orderId,
      }),
    });

    return { success: true };
  } catch (err: any) {
    console.warn('Push subscription failed:', err);
    return { success: false, error: err.message || 'Push subscription error' };
  }
}
