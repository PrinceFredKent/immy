import { DeliveryStatus, NotificationPreferences, PushNotificationEvent } from '../types';

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

// Request Browser Push Notification permission
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop push notifications.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
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
