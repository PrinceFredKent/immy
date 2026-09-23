import { DeliveryStatus, NotificationPreferences, PushNotificationEvent, Order } from '../types';

// Web Audio API chime player (lightweight, zero external sound asset dependency)
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle melodic two-tone chime (E5 to B5)
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.56);
  } catch (e) {
    // Audio context may be restricted by autoplay policy
    console.debug('Audio chime unable to play:', e);
  }
}

// Loud, distinctive 3-tone restaurant kitchen bell/order chime for admin alert
export function playAdminOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: High crisp ding (880 Hz - A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.48);

    // Tone 2: Ascending celebration bell (1318.51 Hz - E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, now + 0.15);
    gain2.gain.setValueAtTime(0.001, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.45, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.82);

    // Tone 3: Harmonic sparkle (1760 Hz - A6)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1760, now + 0.3);
    gain3.gain.setValueAtTime(0.001, now + 0.3);
    gain3.gain.linearRampToValueAtTime(0.3, now + 0.32);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.3);
    osc3.stop(now + 1.08);
  } catch (e) {
    console.debug('Admin audio chime unable to play:', e);
  }
}

// Admin sound preference getter & setter
export function getAdminSoundSetting(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('immy_admin_sound_alerts');
  return saved === null ? true : saved === 'true';
}

export function setAdminSoundSetting(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('immy_admin_sound_alerts', String(enabled));
}

import { subscribeToPushNotifications } from '../lib/pushClient';

// Request Browser Push Notification permission & subscribe to background Web Push
export async function requestPushPermission(role: 'admin' | 'customer' = 'admin'): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop push notifications.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      subscribeToPushNotifications(role).catch((err) => {
        console.debug('Background push subscription notice:', err);
      });
    }
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

// Check current notification permission
export function getPushPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

// Dispatch native system notification if permitted
export function sendNativePushNotification(title: string, body: string, iconUrl?: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body,
      icon: iconUrl || '/favicon.ico',
      badge: '/favicon.ico',
      silent: false,
    });
  } catch (e) {
    console.debug('Failed to send native notification:', e);
  }
}

// Dispatch browser notification specifically tailored for new incoming orders to admin
export function sendAdminOrderPushNotification(order: Order, onAction?: () => void) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const totalDrinks = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
  const title = `🚨 New Order #${order.orderNumber || order.id}!`;
  const body = `${order.customerName || 'Customer'} ordered ${totalDrinks} drink${totalDrinks > 1 ? 's' : ''} (UGX ${(order.total || 0).toLocaleString()}). Tap to manage order.`;

  try {
    const notif = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `admin-order-${order.id}`,
      requireInteraction: true,
      silent: false,
    });

    notif.onclick = () => {
      window.focus();
      if (onAction) onAction();
      notif.close();
    };
  } catch (e) {
    console.debug('Failed to send admin push notification:', e);
  }
}

// Combined real-time notify helper for admin
export function notifyAdminNewOrder(order: Order, onAction?: () => void) {
  // 1. Play audio chime if enabled
  if (getAdminSoundSetting()) {
    playAdminOrderChime();
  }

  // 2. Tactile vibration for mobile admin devices
  if (typeof window !== 'undefined' && window.navigator && typeof window.navigator.vibrate === 'function') {
    window.navigator.vibrate([250, 100, 250, 100, 400]);
  }

  // 3. System desktop notification
  sendAdminOrderPushNotification(order, onAction);
}

export const ORDER_STATUS_NOTIFICATIONS: Record<
  DeliveryStatus,
  { title: string; message: string; status: DeliveryStatus }
> = {
  placed: {
    title: 'Order Confirmed! ☕',
    message: 'Your Immy Drinks order has been verified and sent to our barista bar.',
    status: 'placed',
  },
  brewing: {
    title: 'Handcrafting & Brewing 🧋',
    message: 'Baristas are pulling fresh espresso shots and slow-steeping artisan boba.',
    status: 'brewing',
  },
  packaged: {
    title: 'Thermal Packaged & Sealed ❄️',
    message: 'Your drinks are sealed in temperature-controlled insulated packaging.',
    status: 'packaged',
  },
  on_the_way: {
    title: 'Out for Delivery! 🛵',
    message: 'Courier Julian is en route on his scooter! Track your delivery live on the map.',
    status: 'on_the_way',
  },
  delivered: {
    title: 'Order Delivered! 🎉',
    message: 'Your Immy Drinks order has arrived chilled and fresh at your door. Enjoy!',
    status: 'delivered',
  },
  cancelled: {
    title: 'Order Cancelled',
    message: 'Your order has been cancelled.',
    status: 'cancelled',
  },
};

export function triggerPushNotification(
  event: PushNotificationEvent,
  preferences?: NotificationPreferences
) {
  // If preferences provided, check if sound is enabled
  if (!preferences || preferences.soundEnabled !== false) {
    playNotificationSound();
  }

  // Check if push notifications are enabled in preferences
  if (preferences && preferences.pushEnabled === false) {
    return;
  }

  // Native notification if granted
  sendNativePushNotification(event.title, event.message);
}

export interface StatusNotificationContent {
  title: string;
  message: string;
  badge: string;
}

export function getStatusNotificationDetails(
  status: DeliveryStatus,
  orderNumber: string
): StatusNotificationContent {
  switch (status) {
    case 'placed':
      return {
        title: 'Order Confirmed! ☕',
        message: `Your Immy Drinks order #${orderNumber} has been received and verified by our craft barista bar.`,
        badge: 'Placed',
      };
    case 'brewing':
      return {
        title: 'Handcrafting & Brewing 🧋',
        message: `Baristas are pulling fresh espresso and slow-steeping artisan boba for order #${orderNumber}.`,
        badge: 'Preparing',
      };
    case 'packaged':
      return {
        title: 'Thermal Packaged & Sealed ❄️',
        message: `Order #${orderNumber} is locked in temperature-controlled insulated packaging for courier pickup.`,
        badge: 'Packaged',
      };
    case 'on_the_way':
      return {
        title: 'Out for Delivery! 🛵',
        message: `Courier Julian is en route on his scooter! Track your iced drinks live on the map.`,
        badge: 'En Route',
      };
    case 'delivered':
      return {
        title: 'Order Delivered! Enjoy 🎉',
        message: `Your Immy Drinks order #${orderNumber} has arrived fresh and chilled at your doorstep!`,
        badge: 'Delivered',
      };
    default:
      return {
        title: 'Order Status Updated',
        message: `Your order #${orderNumber} status has updated.`,
        badge: 'Update',
      };
  }
}
