import fs from 'fs';
import path from 'path';
import webPush from 'web-push';

const DATA_DIR = path.join(process.cwd(), 'data');
const VAPID_FILE = path.join(DATA_DIR, 'vapid.json');
const SUBS_FILE = path.join(DATA_DIR, 'subscriptions.json');

export interface PushSubscriptionItem {
  id: string;
  subscription: webPush.PushSubscription;
  role: 'admin' | 'customer';
  orderId?: string;
  createdAt: string;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 1. Initialize or load VAPID Keys
interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

let vapidKeys: VapidKeys;
if (fs.existsSync(VAPID_FILE)) {
  try {
    vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf-8'));
  } catch {
    vapidKeys = webPush.generateVAPIDKeys();
    fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2));
  }
} else {
  vapidKeys = webPush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2));
}

try {
  webPush.setVapidDetails(
    'mailto:orders@immydrinks.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} catch (e) {
  console.warn('Failed to set VAPID details:', e);
}

export function getVapidPublicKey(): string {
  return vapidKeys.publicKey;
}

// 2. Subscription storage
export function loadSubscriptions(): PushSubscriptionItem[] {
  if (!fs.existsSync(SUBS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveSubscriptions(subs: PushSubscriptionItem[]): void {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
  } catch (err) {
    console.error('Error writing subscriptions.json', err);
  }
}

export function addOrUpdateSubscription(
  subscription: webPush.PushSubscription,
  role: 'admin' | 'customer' = 'admin',
  orderId?: string
): void {
  const subs = loadSubscriptions();
  const endpoint = subscription.endpoint;
  const filtered = subs.filter((s) => s.subscription?.endpoint !== endpoint);

  filtered.push({
    id: 'sub_' + Math.random().toString(36).substring(2, 9),
    subscription,
    role,
    orderId,
    createdAt: new Date().toISOString(),
  });

  saveSubscriptions(filtered);
}

export async function sendPushNotification(
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
  },
  filter?: (sub: PushSubscriptionItem) => boolean
): Promise<{ sent: number; failed: number }> {
  const subs = loadSubscriptions();
  const targets = filter ? subs.filter(filter) : subs;

  let sent = 0;
  let failed = 0;
  const toRemoveEndpoints: string[] = [];

  const jsonPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/icon.svg',
    tag: payload.tag || 'immy-alert-' + Date.now(),
    data: payload.data || { url: '/' },
  });

  await Promise.all(
    targets.map(async (target) => {
      try {
        await webPush.sendNotification(target.subscription, jsonPayload);
        sent++;
      } catch (err: any) {
        failed++;
        // If expired or gone (404 or 410), mark for removal
        if (err.statusCode === 404 || err.statusCode === 410) {
          toRemoveEndpoints.push(target.subscription.endpoint);
        }
      }
    })
  );

  if (toRemoveEndpoints.length > 0) {
    const remaining = subs.filter((s) => !toRemoveEndpoints.includes(s.subscription.endpoint));
    saveSubscriptions(remaining);
  }

  return { sent, failed };
}
