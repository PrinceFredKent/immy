import React from 'react';
import { X, CheckCircle2, Download, Printer, Coffee, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  onReorder: (order: Order) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
  onReorder,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#151922] border border-white/15 rounded-3xl w-full max-w-lg text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Receipt Header */}
        <div className="p-5 bg-[#12151c] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Itemized Order Receipt</h3>
              <p className="text-[11px] text-zinc-400">Order #{order.orderNumber} · {order.createdAt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Status stamp banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {order.status === 'delivered' ? 'Order Fulfilled & Delivered' : 'Payment Processed & Active'}
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">Verified ID: {order.id}</span>
          </div>

          {/* Delivery & Destination info */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <span className="text-zinc-400 block mb-1 font-semibold uppercase text-[10px]">
                Delivered To
              </span>
              <p className="font-semibold text-white">{order.deliveryAddress.label}</p>
              <p className="text-zinc-400 leading-relaxed">{order.deliveryAddress.street}</p>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1 font-semibold uppercase text-[10px]">
                Courier Dispatch
              </span>
              <p className="font-semibold text-white">{order.courier.name}</p>
              <p className="text-zinc-400">{order.courier.vehicle}</p>
            </div>
          </div>

          {/* Itemized drinks */}
          <div>
            <span className="text-zinc-400 block mb-2 font-semibold uppercase text-[10px] tracking-wider">
              Handcrafted Items ({order.items.length})
            </span>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between gap-3">
                  <div>
                    <p className="font-bold text-white text-sm">
                      {item.quantity}x {item.drink.name}
                    </p>
                    <p className="text-[11px] text-amber-300 font-medium capitalize mt-0.5">
                      Size: {item.customization.size === 'large' ? 'Large (500mls)' : 'Standard (400mls)'}
                    </p>
                    {item.customization.specialInstructions && (
                      <p className="text-[10px] text-zinc-400 italic">
                        Note: "{item.customization.specialInstructions}"
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-white text-sm">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial summary breakdown */}
          <div className="space-y-1.5 pt-1 text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Discount ({order.promoCode || 'PROMO'})</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-white">
              <span>Total Charged</span>
              <span className="text-amber-400">{formatCurrency(order.total)}</span>
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 bg-[#10131a] border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={() => {
              onReorder(order);
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Re-order These Drinks</span>
          </button>
        </div>

      </div>
    </div>
  );
};
