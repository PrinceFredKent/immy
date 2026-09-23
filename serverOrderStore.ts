import fs from 'fs';
import path from 'path';
import type { Response } from 'express';
import { sendPushNotification } from './serverPush';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ----------------------------------------------------
// Realtime SSE Clients List
// ----------------------------------------------------
interface SSEClient {
  id: string;
  res: Response;
}

const sseClients: SSEClient[] = [];

export function addSSEClient(res: Response): string {
  const id = 'sse_' + Math.random().toString(36).substring(2, 9);
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', id })}\n\n`);

  sseClients.push({ id, res });

  res.on('close', () => {
    const idx = sseClients.findIndex((c) => c.id === id);
    if (idx !== -1) {
      sseClients.splice(idx, 1);
    }
  });

  return id;
}

export function broadcastSSE(type: string, data: any): void {
  const message = `data: ${JSON.stringify({ type, data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.res.write(message);
    } catch (e) {
      // client connection likely terminated
    }
  }
}

// ----------------------------------------------------
// Persistent Admin Dispatch Settings
// ----------------------------------------------------
export interface ServerDispatchSettings {
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
  whatsapp: {
    enabled: boolean;
    phoneNumber: string;
    apiKey?: string;
  };
}

export function getStoredSettings(): ServerDispatchSettings {
  if (!fs.existsSync(SETTINGS_FILE)) {
    return {
      telegram: { enabled: false, botToken: '', chatId: '' },
      whatsapp: { enabled: false, phoneNumber: '256752619129', apiKey: '' },
    };
  }
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch {
    return {
      telegram: { enabled: false, botToken: '', chatId: '' },
      whatsapp: { enabled: false, phoneNumber: '256752619129', apiKey: '' },
    };
  }
}

export function saveStoredSettings(settings: ServerDispatchSettings): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error('Error saving settings.json', err);
  }
}

// ----------------------------------------------------
// Persistent Orders Storage
// ----------------------------------------------------
export function loadOrdersFromDisk(): any[] {
  if (!fs.existsSync(ORDERS_FILE)) return [];
  try {
    const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading orders.json', err);
    return [];
  }
}

export function saveOrdersToDisk(orders: any[]): void {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Error saving orders.json', err);
  }
}

// Seed default orders if file is empty
export function initOrdersStorage(defaultOrders: any[] = []): void {
  if (!fs.existsSync(ORDERS_FILE)) {
    saveOrdersToDisk(defaultOrders);
  }
}

// ----------------------------------------------------
// Telegram Direct Dispatch from Server (Works When App Is Closed)
// ----------------------------------------------------
export async function sendTelegramFromBackend(order: any): Promise<void> {
  const settings = getStoredSettings();
  if (!settings.telegram.enabled || !settings.telegram.botToken || !settings.telegram.chatId) {
    return;
  }

  try {
    const itemsText = (order.items || [])
      .map((it: any) => `• ${it.quantity}x ${it.drink?.name || 'Drink'} (${(it.totalPrice || 0).toLocaleString()} UGX)`)
      .join('\n');

    const addr = order.deliveryAddress?.street || 'Pick up / In-store';
    const customerName = order.customerName || 'Guest Customer';
    const customerPhone = order.customerPhone || 'N/A';
    const totalUgx = (order.total || 0).toLocaleString();

    const text = `🚨 *NEW IMMY DRINKS ORDER #${order.orderNumber || order.id}* 🚨

👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
📍 *Address:* ${addr}
💰 *Total:* UGX ${totalUgx}

🍹 *Items:*
${itemsText}

⏰ *Time:* ${order.createdAt || 'Just now'}`;

    await fetch(`https://api.telegram.org/bot${settings.telegram.botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: settings.telegram.chatId.trim(),
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.warn('Backend Telegram dispatch failed:', err);
  }
}

// ----------------------------------------------------
// Order CRUD Operations with Instant Realtime Sync & Push
// ----------------------------------------------------
export async function createOrder(order: any): Promise<any> {
  const orders = loadOrdersFromDisk();
  
  // Prevent duplicate if already exists
  const existsIdx = orders.findIndex((o) => o.id === order.id);
  if (existsIdx !== -1) {
    orders[existsIdx] = order;
  } else {
    orders.unshift(order);
  }

  saveOrdersToDisk(orders);

  // 1. Instant Realtime SSE Broadcast across all open admin & client tabs
  broadcastSSE('new-order', order);
  broadcastSSE('orders-updated', orders);

  // 2. Server-side Telegram Bot push to Android phones (works when app is closed)
  sendTelegramFromBackend(order).catch(() => {});

  // 3. Android Web Push Notification to Admin devices (lock screen alert)
  const totalUgx = (order.total || 0).toLocaleString();
  const summary = (order.items || []).map((i: any) => `${i.quantity}x ${i.drink?.name}`).join(', ');
  
  sendPushNotification(
    {
      title: `🚨 New Order #${order.orderNumber || order.id}!`,
      body: `${summary || 'New items'} • UGX ${totalUgx}\nTap to open admin kitchen dashboard.`,
      tag: `order-${order.id}`,
      data: { url: '/?view=admin' },
    },
    (sub) => sub.role === 'admin'
  ).catch((e) => console.warn('Push error:', e));

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  progressPercent?: number
): Promise<any | null> {
  const orders = loadOrdersFromDisk();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;

  const defaultProgress: Record<string, number> = {
    placed: 25,
    brewing: 45,
    packaged: 65,
    on_the_way: 85,
    delivered: 100,
    cancelled: 0,
  };

  const calculatedProgress = progressPercent ?? defaultProgress[status] ?? 25;

  const updatedOrder = {
    ...orders[idx],
    status,
    progressPercent: calculatedProgress,
    updatedAt: new Date().toISOString(),
  };

  // Update timeline if present
  if (Array.isArray(updatedOrder.timeline)) {
    const statusOrder = ['placed', 'brewing', 'packaged', 'on_the_way', 'delivered'];
    const currentIdx = statusOrder.indexOf(status);

    updatedOrder.timeline = updatedOrder.timeline.map((step: any) => {
      const stepIdx = statusOrder.indexOf(step.status);
      return {
        ...step,
        completed: stepIdx !== -1 && stepIdx <= currentIdx,
        current: step.status === status,
      };
    });
  }

  orders[idx] = updatedOrder;
  saveOrdersToDisk(orders);

  // 1. Instant Realtime SSE Broadcast to customer & admin
  broadcastSSE('order-status-changed', updatedOrder);
  broadcastSSE('orders-updated', orders);

  // 2. Android Web Push to Customer's phone (works when customer closed app)
  const statusTitles: Record<string, string> = {
    brewing: '🍹 Your Drinks are Brewing & Blending!',
    packaged: '📦 Your Drinks are Packaged & Sealed!',
    on_the_way: '🚴 Courier is On The Way to You!',
    delivered: '🎉 Your Order Has Arrived! Enjoy!',
  };

  if (statusTitles[status]) {
    sendPushNotification(
      {
        title: statusTitles[status],
        body: `Order #${updatedOrder.orderNumber || updatedOrder.id} status updated to ${status.replace(/_/g, ' ')}.`,
        tag: `order-status-${orderId}`,
        data: { url: '/?view=orders' },
      },
      (sub) => sub.orderId === orderId || sub.role === 'customer'
    ).catch(() => {});
  }

  // 3. Android Web Push to Admin phone if order was cancelled
  if (status === 'cancelled') {
    sendPushNotification(
      {
        title: `⚠️ Order #${updatedOrder.orderNumber || updatedOrder.id} Cancelled`,
        body: `Customer cancelled order #${updatedOrder.orderNumber || updatedOrder.id}. Preparation and dispatch stopped.`,
        tag: `order-cancel-${orderId}`,
        data: { url: '/?view=admin' },
      },
      (sub) => sub.role === 'admin'
    ).catch(() => {});
  }

  return updatedOrder;
}
