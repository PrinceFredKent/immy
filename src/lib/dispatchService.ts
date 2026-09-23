import { Order } from '../types';

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  // Choice 1: Direct WhatsApp URL click-to-dispatch or Choice 2: Webhook / CallMeBot API key
  phoneNumber: string; // e.g., 256752619129 (international format without +)
  apiKey?: string; // CallMeBot or custom webhook gateway
  customWebhookUrl?: string; // Optional custom Discord / Slack / WhatsApp relay webhook
}

export interface AdminDispatchSettings {
  telegram: TelegramConfig;
  whatsapp: WhatsAppConfig;
}

const STORAGE_KEY = 'immy_admin_dispatch_settings';

export const DEFAULT_DISPATCH_SETTINGS: AdminDispatchSettings = {
  telegram: {
    enabled: false,
    botToken: '',
    chatId: '',
  },
  whatsapp: {
    enabled: false,
    phoneNumber: '256752619129',
    apiKey: '',
    customWebhookUrl: '',
  },
};

export function getAdminDispatchSettings(): AdminDispatchSettings {
  if (typeof window === 'undefined') return DEFAULT_DISPATCH_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DISPATCH_SETTINGS;
    return { ...DEFAULT_DISPATCH_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_DISPATCH_SETTINGS;
  }
}

export function saveAdminDispatchSettings(settings: AdminDispatchSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Persist to backend server so backend dispatches Telegram alerts when app is closed
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch(() => {});
  } catch (e) {
    console.warn('Failed to persist admin dispatch settings', e);
  }
}

/**
 * Formats a clean, readable text message for Telegram or WhatsApp alerts.
 */
export function formatOrderDispatchMessage(order: Order): string {
  const itemsText = (order.items || [])
    .map((it) => `• ${it.quantity}x ${it.drink.name} (${(it.totalPrice || 0).toLocaleString()} UGX)`)
    .join('\n');

  const addr = order.deliveryAddress?.street || 'Pick up / In-store';
  const customerName = order.customerName || 'Guest Customer';
  const customerPhone = order.customerPhone || 'N/A';
  const totalUgx = (order.total || 0).toLocaleString();

  return `🚨 *NEW IMMY DRINKS ORDER #${order.orderNumber || order.id}* 🚨

👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
📍 *Delivery Address:* ${addr}
💰 *Total:* UGX ${totalUgx}

🍹 *Items Ordered:*
${itemsText}

⏰ *Time:* ${order.createdAt || 'Just now'}
🔗 *Manage:* https://ais-dev-fdnbiidmg6ekn6turbhj6o-681356195509.europe-west2.run.app`;
}

/**
 * Sends real-time Telegram message via Telegram Bot API.
 * Telegram Bot API is 100% free, requires zero server infrastructure,
 * works with standard HTTPS fetch, and rings Android phones immediately with push alerts.
 */
export async function sendTelegramAlert(
  botToken: string,
  chatId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!botToken || !chatId) {
      return { success: false, error: 'Bot token and Chat ID are required' };
    }

    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();

    const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      return { success: false, error: data.description || 'Telegram API request failed' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error reaching Telegram API' };
  }
}

/**
 * Sends real-time WhatsApp alert via CallMeBot API or custom webhook
 */
export async function sendWhatsAppWebhookAlert(
  phone: string,
  apiKey: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || !apiKey) {
      return { success: false, error: 'Phone number and API Key are required' };
    }

    // CallMeBot Free WhatsApp API endpoint
    const encodedText = encodeURIComponent(text);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${apiKey.trim()}`;

    // Note: CallMeBot supports standard GET request
    const response = await fetch(url, { method: 'GET', mode: 'no-cors' });
    // In no-cors mode, we can't inspect the exact response body, but request successfully dispatches
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to dispatch WhatsApp alert' };
  }
}

/**
 * Sends alerts to all active configured messenger channels (Telegram, WhatsApp, Webhooks)
 */
export async function dispatchRealtimeAdminAlerts(order: Order): Promise<{
  telegramSent: boolean;
  whatsAppSent: boolean;
  errors: string[];
}> {
  const settings = getAdminDispatchSettings();
  const errors: string[] = [];
  let telegramSent = false;
  let whatsAppSent = false;

  const message = formatOrderDispatchMessage(order);

  // 1. Telegram Dispatch
  if (settings.telegram.enabled && settings.telegram.botToken && settings.telegram.chatId) {
    try {
      const res = await sendTelegramAlert(
        settings.telegram.botToken,
        settings.telegram.chatId,
        message
      );
      if (res.success) {
        telegramSent = true;
      } else if (res.error) {
        errors.push(`Telegram: ${res.error}`);
      }
    } catch (e: any) {
      errors.push(`Telegram: ${e.message}`);
    }
  }

  // 2. WhatsApp Dispatch (if CallMeBot API key or custom webhook is provided)
  if (settings.whatsapp.enabled && settings.whatsapp.phoneNumber && settings.whatsapp.apiKey) {
    try {
      const res = await sendWhatsAppWebhookAlert(
        settings.whatsapp.phoneNumber,
        settings.whatsapp.apiKey,
        message
      );
      if (res.success) {
        whatsAppSent = true;
      } else if (res.error) {
        errors.push(`WhatsApp: ${res.error}`);
      }
    } catch (e: any) {
      errors.push(`WhatsApp: ${e.message}`);
    }
  }

  // 3. Custom Webhook (Discord / Slack / n8n / Zapier) if configured
  if (settings.whatsapp.customWebhookUrl) {
    try {
      await fetch(settings.whatsapp.customWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          order,
        }),
      });
    } catch (e: any) {
      console.debug('Custom webhook error:', e);
    }
  }

  return { telegramSent, whatsAppSent, errors };
}

/**
 * Generates direct WhatsApp click-to-chat URL with pre-filled order details
 */
export function getWhatsAppOrderLink(phone: string, order: Order): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const text = formatOrderDispatchMessage(order);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
