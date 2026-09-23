import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  PackageCheck, 
  Bike, 
  Share2, 
  Leaf,
  XCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Order, DeliveryStatus } from '../types';
import { formatCurrency } from '../utils/formatters';

interface LiveTrackerProps {
  activeOrder: Order | null;
  onUpdateOrderStatus?: (status: DeliveryStatus, progress: number) => void;
  onViewMenu: () => void;
  onCancelOrder?: (orderId: string) => void;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({
  activeOrder,
  onViewMenu,
  onCancelOrder,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Dynamic progress percentage calculated directly from order status & admin updates
  const getDynamicProgress = (status: DeliveryStatus, explicitPercent?: number): number => {
    if (typeof explicitPercent === 'number' && explicitPercent > 0) {
      return explicitPercent;
    }
    switch (status) {
      case 'placed':
        return 25;
      case 'brewing':
        return 45;
      case 'packaged':
        return 65;
      case 'on_the_way':
        return 85;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 20;
    }
  };

  const handleShareTracking = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If no order is currently active
  if (!activeOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 mx-auto mb-6 shadow-xl shadow-amber-500/5">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '12s' }} />
        </div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
          No Active Drinks In Delivery
        </h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
          Order your favorite fresh juices, smoothies, or pastries to experience live doorstep status updates.
        </p>
        <div className="flex items-center justify-center">
          <button
            id="tracker-order-now-btn"
            onClick={onViewMenu}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/25 transition-all"
          >
            Explore Drinks Menu
          </button>
        </div>
      </div>
    );
  }

  // If order was cancelled
  if (activeOrder.status === 'cancelled') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-[#151922] border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Order #{activeOrder.orderNumber}</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
              Order Has Been Cancelled
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto">
              This delivery request was cancelled. You have not been charged. If you need any assistance, please reach our store hotlines below.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onViewMenu}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              Order Another Drink
            </button>
          </div>
        </div>

        {/* Store Hotlines Contact */}
        <div className="p-5 rounded-3xl bg-[#151922] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xl">
          <div>
            <span className="text-amber-400 font-bold text-sm">Immy Drinks Store Hotlines:</span>
            <p className="text-zinc-400 mt-0.5">Contact us directly for inquiries, custom catering, or questions.</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="tel:0752619129"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-mono font-semibold flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>0752619129</span>
            </a>
            <a
              href="tel:0760535440"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-mono font-semibold flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>0760535440</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Stages definition (4 Stages)
  const steps = [
    { id: 'placed', label: 'Placed', icon: CheckCircle2, desc: 'Order received & confirmed' },
    { id: 'packaged', label: 'Packaged', icon: PackageCheck, desc: 'Sealed in thermal beverage bag' },
    { id: 'on_the_way', label: 'On Way', icon: Bike, desc: 'Courier en route to destination' },
    { id: 'delivered', label: 'Delivered', icon: MapPin, desc: 'Arrived at your doorstep' },
  ];

  const currentStepIdx = steps.findIndex((s) => s.id === activeOrder.status) >= 0
    ? steps.findIndex((s) => s.id === activeOrder.status)
    : activeOrder.status === 'brewing' ? 0 : 0;

  // Can cancel only if 'placed' or 'packaged'
  const isCancellable = activeOrder.status === 'placed' || activeOrder.status === 'packaged' || activeOrder.status === 'brewing';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner Status */}
      <div className="bg-[#151922] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Order Progress
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Order #{activeOrder.orderNumber}
              </span>
            </div>
            
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              {activeOrder.status === 'placed' && 'Order Received & Confirmed'}
              {activeOrder.status === 'brewing' && 'Brewing & Blending Fresh Drinks'}
              {activeOrder.status === 'packaged' && 'Drinks Packaged & Sealed'}
              {activeOrder.status === 'on_the_way' && 'Courier On The Way to You'}
              {activeOrder.status === 'delivered' && 'Delivered! Enjoy Your Drinks'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Estimated arrival:{' '}
              <span className="text-amber-400 font-bold">
                {activeOrder.status === 'delivered' ? 'Completed' : activeOrder.estimatedDeliveryTime}
              </span>
              {' '}· Destination: <span className="text-zinc-200">{activeOrder.deliveryAddress.street}</span>
            </p>
          </div>

          {/* Share Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="tracker-share-btn"
              onClick={handleShareTracking}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Copy shareable tracking link"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Milestone Progress Bar (Placed -> Packaged -> On Way -> Delivered) */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div className="relative">
            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${Math.max(getDynamicProgress(activeOrder.status, activeOrder.progressPercent), 10)}%` }}
              />
            </div>
          </div>

          {/* 4 Milestone stages with icons */}
          <div className="grid grid-cols-4 text-center gap-2">
            {steps.map((step, idx) => {
              const isPassed = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center mb-1.5 transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/20 scale-105'
                      : isPassed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/5 text-zinc-500 border border-white/5'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold ${
                    isCurrent ? 'text-amber-400' : isPassed ? 'text-zinc-200' : 'text-zinc-500'
                  }`}>
                    {step.label}
                  </span>
                  <span className="hidden sm:block text-[10px] text-zinc-400 mt-0.5 max-w-[120px]">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Store Hotlines & Order Cancellation Section */}
      <div className="bg-[#151922] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-amber-400 font-bold text-sm">Immy Drinks Store Hotlines</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Direct dispatch support for orders, special requests, and location updates.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:0752619129"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-mono font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>0752619129</span>
            </a>
            <a
              href="tel:0760535440"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-mono font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>0760535440</span>
            </a>
          </div>
        </div>

        {/* Cancel Order Action Bar */}
        {onCancelOrder && activeOrder.status !== 'delivered' && (
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-zinc-300">Need to change plans?</p>
              <p className="text-[11px] text-zinc-500">
                {isCancellable
                  ? 'You can cancel free of charge while the order is being prepared.'
                  : 'Orders cannot be cancelled once the courier is on the way.'}
              </p>
            </div>

            {isCancellable ? (
              <button
                id="cancel-active-order-btn"
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Cancel Placed Order</span>
              </button>
            ) : (
              <button
                disabled
                title="Order is already on the way and cannot be cancelled"
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-600 cursor-not-allowed text-xs font-semibold flex items-center justify-center gap-1.5 opacity-50 self-start sm:self-auto"
              >
                <XCircle className="w-3.5 h-3.5 text-zinc-600" />
                <span>Cancel Order (Unavailable once On The Way)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order Summary Details */}
      <div className="bg-[#151922] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Leaf className="w-4 h-4 text-amber-400" />
            Items in This Delivery ({activeOrder.items.length})
          </h3>
          <span className="font-bold text-amber-400 text-sm">
            Total: {formatCurrency(activeOrder.total)}
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {activeOrder.items.map((item, index) => (
            <div key={index} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <img
                  src={item.drink.image}
                  alt={item.drink.name}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    {item.quantity}x {item.drink.name}
                  </h4>
                  <p className="text-xs text-amber-300 font-medium capitalize mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>Size: {item.customization.size === 'large' ? 'Large (500mls)' : 'Standard (400mls)'}</span>
                    {item.customization.selectedFlavor && (
                      <>
                        <span className="text-zinc-500">•</span>
                        <span className="text-white font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">Flavor: {item.customization.selectedFlavor}</span>
                      </>
                    )}
                  </p>
                  {item.customization.specialInstructions && (
                    <p className="text-[11px] text-amber-400/90 italic mt-0.5">
                      Note: "{item.customization.specialInstructions}"
                    </p>
                  )}
                </div>
              </div>
              <span className="font-semibold text-sm text-zinc-300">
                {formatCurrency(item.totalPrice)}
              </span>
            </div>
          ))}
        </div>

        {/* Delivery Address Note */}
        <div className="pt-3 border-t border-white/10 flex items-start gap-2.5 text-xs text-zinc-400">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">
              Deliver to: {activeOrder.deliveryAddress.label} ({activeOrder.deliveryAddress.street})
            </p>
            {activeOrder.deliveryAddress.notes && (
              <p className="text-zinc-400 mt-0.5">Instructions: {activeOrder.deliveryAddress.notes}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && onCancelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#181c25] border border-rose-500/30 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-display font-bold text-lg text-white">
                Cancel Order #{activeOrder.orderNumber}?
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Are you sure you want to cancel this order? This will halt dispatch and remove the delivery from live tracking.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                id="confirm-cancel-order-modal-btn"
                onClick={() => {
                  setShowCancelModal(false);
                  onCancelOrder(activeOrder.id);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
