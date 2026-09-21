import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  ChevronRight, 
  Compass, 
  CheckCircle2, 
  Coffee, 
  Bike, 
  PackageCheck,
  Sparkles
} from 'lucide-react';
import { PushNotificationEvent, DeliveryStatus } from '../types';

interface PushNotificationBannerProps {
  event?: PushNotificationEvent | null;
  notification?: PushNotificationEvent | null;
  onClose?: () => void;
  onDismiss?: () => void;
  onClickTrack?: () => void;
  onOpenTracker?: () => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  event,
  notification,
  onClose,
  onDismiss,
  onClickTrack,
  onOpenTracker,
}) => {
  const activeNotification = event || notification || null;
  const handleDismiss = onClose || onDismiss || (() => {});
  const handleTrack = onClickTrack || onOpenTracker || (() => {});

  // Auto dismiss after 6.5s
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, 6500);
    return () => clearTimeout(timer);
  }, [activeNotification, handleDismiss]);

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'placed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'brewing':
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'packaged':
        return <PackageCheck className="w-5 h-5 text-blue-400" />;
      case 'on_the_way':
        return <Bike className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'delivered':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <AnimatePresence>
      {activeNotification && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: -45, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: -100, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -20) {
                handleDismiss();
              }
            }}
            id="push-notification-toast"
            className="pointer-events-auto w-full max-w-lg bg-[#141720]/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 text-white shadow-2xl shadow-amber-500/15 flex items-start gap-3.5 transition-colors hover:border-amber-400 cursor-grab active:cursor-grabbing"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
              {getStatusIcon(activeNotification.status)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Immy Push Alert
                  </span>
                  <span className="text-[10px] text-zinc-400">{activeNotification.timestamp}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleDismiss}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <h4 className="font-display font-bold text-sm text-white mt-1">
                {activeNotification.title}
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                {activeNotification.message}
              </p>

              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">
                  {activeNotification.orderNumber ? `Order #${activeNotification.orderNumber}` : 'Immy Real-Time Notification'}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ x: 2 }}
                  onClick={() => {
                    handleTrack();
                    handleDismiss();
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Live Courier Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
