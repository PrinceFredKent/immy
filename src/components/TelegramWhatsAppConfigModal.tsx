import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Save,
  HelpCircle,
} from 'lucide-react';
import {
  AdminDispatchSettings,
  getAdminDispatchSettings,
  saveAdminDispatchSettings,
  sendTelegramAlert,
  sendWhatsAppWebhookAlert,
  formatOrderDispatchMessage,
} from '../lib/dispatchService';
import { Order } from '../types';

interface TelegramWhatsAppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleOrder?: Order;
}

export const TelegramWhatsAppConfigModal: React.FC<TelegramWhatsAppConfigModalProps> = ({
  isOpen,
  onClose,
  sampleOrder,
}) => {
  const [settings, setSettings] = useState<AdminDispatchSettings>(() => getAdminDispatchSettings());
  const [activeTab, setActiveTab] = useState<'telegram' | 'whatsapp'>('telegram');

  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const [saveFeedback, setSaveFeedback] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAdminDispatchSettings(settings);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handleTestTelegram = async () => {
    if (!settings.telegram.botToken || !settings.telegram.chatId) {
      setTelegramStatus({ success: false, message: 'Please enter both Bot Token and Chat ID' });
      return;
    }

    setTestingTelegram(true);
    setTelegramStatus(null);

    const testText = `🔔 *Immy Drinks Test Alert*\n\n✅ Your Telegram real-time order alerts are working perfectly! You will receive Android notifications here whenever a new order is placed, even when your browser or app is closed.`;

    const res = await sendTelegramAlert(
      settings.telegram.botToken,
      settings.telegram.chatId,
      testText
    );

    setTestingTelegram(false);
    if (res.success) {
      setTelegramStatus({
        success: true,
        message: 'Success! Check your Telegram app — the notification should be on your phone!',
      });
    } else {
      setTelegramStatus({
        success: false,
        message: res.error || 'Failed to send Telegram message. Double check your token and chat ID.',
      });
    }
  };

  const handleTestWhatsApp = async () => {
    if (!settings.whatsapp.phoneNumber) {
      setWhatsAppStatus({ success: false, message: 'Please enter a phone number' });
      return;
    }

    setTestingWhatsApp(true);
    setWhatsAppStatus(null);

    const testText = `🔔 Immy Drinks Test Alert: Real-time order notifications are configured for ${settings.whatsapp.phoneNumber}!`;

    if (settings.whatsapp.apiKey) {
      const res = await sendWhatsAppWebhookAlert(
        settings.whatsapp.phoneNumber,
        settings.whatsapp.apiKey,
        testText
      );
      setTestingWhatsApp(false);
      if (res.success) {
        setWhatsAppStatus({
          success: true,
          message: 'Dispatch sent via WhatsApp Gateway! Check your phone messages.',
        });
      } else {
        setWhatsAppStatus({ success: false, message: res.error });
      }
    } else {
      // Direct WhatsApp Web click test
      setTestingWhatsApp(false);
      const cleanPhone = settings.whatsapp.phoneNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(testText)}`, '_blank');
      setWhatsAppStatus({
        success: true,
        message: 'WhatsApp Web/App opened in new tab with the pre-filled dispatch message.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#12151c] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/20 via-black/40 to-emerald-500/15 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Instant Android Order Notifications</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  App Closed
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Receive loud phone ringtones and lock-screen messages the second a customer checks out.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('telegram')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'telegram'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Telegram Bot (Recommended - 100% Free & Loud)</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'whatsapp'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Alerts</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          
          {/* ================= TELEGRAM TAB ================= */}
          {activeTab === 'telegram' && (
            <div className="space-y-5">
              {/* Feature Highlights */}
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs sm:text-sm">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Why Telegram is best for Android order alerts:</span>
                </div>
                <ul className="text-xs text-zinc-300 space-y-1.5 pl-5 list-disc">
                  <li><strong>Rings Android when closed:</strong> Delivered via Telegram's background service.</li>
                  <li><strong>Loud Custom Ringtone:</strong> In Telegram on Android, you can set a special kitchen alert tone specifically for your order bot.</li>
                  <li><strong>Group Notifications:</strong> You can add your manager, chef, and dispatch rider into the same group, and all phones will ring simultaneously!</li>
                  <li><strong>Free forever:</strong> Official Telegram Bot API has zero monthly fees.</li>
                </ul>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/10">
                <div>
                  <span className="font-bold text-white text-sm block">Enable Telegram Order Alerts</span>
                  <span className="text-xs text-zinc-400">Automatically broadcast all new orders to Telegram</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.telegram.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        telegram: { ...settings.telegram, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Configuration Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-300">
                      Telegram Bot Token
                    </label>
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Get from @BotFather</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    value={settings.telegram.botToken}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        telegram: { ...settings.telegram, botToken: e.target.value },
                      })
                    }
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-cyan-500 text-sm text-white font-mono focus:outline-none placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-300">
                      Target Telegram Chat ID / Group ID
                    </label>
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Find ID via @userinfobot</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    value={settings.telegram.chatId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        telegram: { ...settings.telegram, chatId: e.target.value },
                      })
                    }
                    placeholder="e.g. 987654321 or -100123456789 for groups"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-cyan-500 text-sm text-white font-mono focus:outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* 30-Second Setup Guide */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-zinc-400">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Quick 2-minute setup:
                </span>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-300">
                  <li>Open Telegram on your phone and search for <strong className="text-cyan-400">@BotFather</strong>.</li>
                  <li>Send <code className="bg-white/10 px-1 py-0.5 rounded text-amber-300">/newbot</code>, give it a name (e.g. <em>Immy Drinks Dispatch</em>), and copy the HTTP API Token here.</li>
                  <li>Search for your bot username in Telegram and tap <strong>"Start"</strong>.</li>
                  <li>Send a message to <strong className="text-cyan-400">@userinfobot</strong> to get your numerical <em>Id</em>, paste it in "Chat ID" above, and tap <strong>"Send Test Alert"</strong>!</li>
                </ol>
              </div>

              {/* Test Status feedback */}
              {telegramStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    telegramStatus.success
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {telegramStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{telegramStatus.message}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTestTelegram}
                  disabled={testingTelegram}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingTelegram ? 'Sending Test...' : 'Send Test Alert to Phone'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= WHATSAPP TAB ================= */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>WhatsApp Business Order Dispatch:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Automatically format every incoming order into a WhatsApp message. You can route orders directly to the admin WhatsApp or connect a WhatsApp gateway API key (e.g., CallMeBot or Twilio).
                </p>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/10">
                <div>
                  <span className="font-bold text-white text-sm block">Enable WhatsApp Dispatch</span>
                  <span className="text-xs text-zinc-400">Pre-format and dispatch orders to WhatsApp</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.whatsapp.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        whatsapp: { ...settings.whatsapp, enabled: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Store / Admin WhatsApp Phone Number
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp.phoneNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        whatsapp: { ...settings.whatsapp, phoneNumber: e.target.value },
                      })
                    }
                    placeholder="e.g. 256752619129 (with country code, no +)"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-emerald-500 text-sm text-white font-mono focus:outline-none placeholder:text-zinc-600"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Format: 256752619129 (Uganda +256, 0752... without 0)
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-300">
                      WhatsApp Gateway API Key (Optional for auto-sending)
                    </label>
                    <a
                      href="https://www.callmebot.com/blog/free-api-whatsapp-messages/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Free CallMeBot Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="text"
                    value={settings.whatsapp.apiKey || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        whatsapp: { ...settings.whatsapp, apiKey: e.target.value },
                      })
                    }
                    placeholder="Enter API key if using automated gateway"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-emerald-500 text-sm text-white font-mono focus:outline-none placeholder:text-zinc-600"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Leave blank if you prefer 1-tap WhatsApp Web / mobile app dispatch buttons on order cards.
                  </p>
                </div>
              </div>

              {whatsAppStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    whatsAppStatus.success
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {whatsAppStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{whatsAppStatus.message}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTestWhatsApp}
                  disabled={testingWhatsApp}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{testingWhatsApp ? 'Testing...' : 'Test WhatsApp Dispatch'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Save & Actions */}
        <div className="p-4 sm:p-5 bg-black/60 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {saveFeedback && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Dispatch Settings</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
