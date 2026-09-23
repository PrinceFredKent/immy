import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BellRing,
  Phone,
  MapPin,
  Coffee,
  ExternalLink,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { Order, DeliveryStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { playAdminOrderChime, getAdminSoundSetting, setAdminSoundSetting } from '../utils/notifications';
import { getWhatsAppOrderLink, getAdminDispatchSettings } from '../lib/dispatchService';

interface AdminOrderAlertBannerProps {
  order: Order | null;
  onDismiss: () => void;
  onViewOrder: (order: Order) => void;
  onUpdateStatus?: (orderId: string, status: DeliveryStatus) => void;
}

export const AdminOrderAlertBanner: React.FC<AdminOrderAlertBannerProps> = ({
  order,
  onDismiss,
  onViewOrder,
  onUpdateStatus,
}) => {
  const [soundEnabled, setSoundState] = useState<boolean>(() => getAdminSoundSetting());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Reset countdown and timer when a new order appears
  useEffect(() => {
    if (!order) return;

    setSecondsRemaining(30);

    const interval = setInterval(() => {
      if (!isHovered) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onDismiss();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.id, isHovered, onDismiss]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundState(next);
    setAdminSoundSetting(next);
    if (next) {
      playAdminOrderChime();
    }
  };

  if (!order) return null;

  const totalItemsCount = (order.items || []).reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      <motion.div
        key={order.id}
        initial={{ opacity: 0, y: -80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -60, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed top-3 sm:top-5 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[580px] max-w-full z-[999999] pointer-events-auto"
        role="alert"
        aria-live="assertive"
      >
        <div className="relative rounded-3xl bg-[#0f1219]/95 text-white border-2 border-amber-500/80 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.35)] backdrop-blur-xl p-4 sm:p-5 overflow-hidden">
          {/* Top Progress countdown line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-white/10">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(secondsRemaining / 30) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
            />
          </div>

          {/* Glowing pulse aura in the background */}
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Header Bar */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 animate-bounce" />
                Incoming Real-Time Order
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold font-mono">
                {order.orderNumber || order.id}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
              </button>
              <button
                onClick={onDismiss}
                title="Dismiss banner"
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Order Snapshot Content */}
          <div className="py-3 space-y-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <h4 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>{order.customerName || 'Customer'}</span>
                  {order.customerPhone && (
                    <a
                      href={`tel:${order.customerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg"
                      title="Call customer"
                    >
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </a>
                  )}
                </h4>
                {order.deliveryAddress?.street && (
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 truncate max-w-sm">
                    <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span>{order.deliveryAddress.street}</span>
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-400 block font-medium">Total</span>
                <span className="text-lg sm:text-xl font-black font-display text-amber-400">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {/* Items Summary Pills */}
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate text-zinc-300">
                <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-white shrink-0">
                  {totalItemsCount} drink{totalItemsCount > 1 ? 's' : ''}:
                </span>
                <span className="truncate text-zinc-300">
                  {(order.items || [])
                    .map((item) => `${item.quantity}× ${item.drink.name}`)
                    .join(', ')}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                {order.promoCode ? `Promo: ${order.promoCode}` : 'Verified Order'}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                if (onUpdateStatus) {
                  onUpdateStatus(order.id, 'brewing');
                }
                onDismiss();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>Accept & Brew</span>
            </button>

            <a
              href={getWhatsAppOrderLink(
                getAdminDispatchSettings().whatsapp.phoneNumber || '256752619129',
                order
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="Open pre-filled WhatsApp dispatch text"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Rider</span>
            </a>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  onViewOrder(order);
                  onDismiss();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <span>View in Queue</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
