import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Banknote,
  Smartphone,
  Navigation,
  Edit3,
  Check,
  Compass,
  PackageCheck,
  Truck,
  Leaf,
  CheckCircle2,
  Receipt,
  Eye,
  ShieldCheck,
  Phone,
  User,
  UserCheck,
  UserPlus,
  LogIn,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, DeliveryAddress, PaymentMethod, UserProfile, UserRole, Order, DeliveryStatus } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  deliveryAddress: DeliveryAddress;
  savedAddresses: DeliveryAddress[];
  onSelectAddress: (addr: DeliveryAddress) => void;
  paymentMethods: PaymentMethod[];
  userProfile: UserProfile;
  onCheckoutComplete: (orderData: {
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    tip: number;
    discount: number;
    promoCode?: string;
    total: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    deliveryAddress: DeliveryAddress;
    paymentMethod: PaymentMethod;
    pointsUsed?: number;
    voucherUsedId?: string;
  }) => void;
  userRole?: UserRole;
  isGuest?: boolean;
  onRequestAuth?: (initialMode?: 'signin' | 'signup') => void;
  allOrders?: Order[];
  onUpdateOrderStatus?: (orderId: string, status: DeliveryStatus) => void;
  onViewReceipt?: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  deliveryAddress,
  savedAddresses,
  onSelectAddress,
  paymentMethods,
  userProfile,
  onCheckoutComplete,
  userRole = 'customer',
  isGuest = false,
  onRequestAuth,
  allOrders = [],
  onUpdateOrderStatus,
  onViewReceipt,
}) => {
  const [adminCartTab, setAdminCartTab] = useState<'pending' | 'my_cart'>('pending');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('pm-cash');
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isAutoDetected, setIsAutoDetected] = useState(true);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  // Manual address form state
  const [manualLabel, setManualLabel] = useState(deliveryAddress.label || 'Auto-Detected Delivery Spot');
  const [manualStreet, setManualStreet] = useState(deliveryAddress.street || 'Acacia Avenue, Plot 14, Kololo');
  const [manualUnit, setManualUnit] = useState(deliveryAddress.unit || 'Flat 2B / Gate entrance');
  const [manualCity, setManualCity] = useState(deliveryAddress.city || 'Kampala, Uganda');
  const [manualNotes, setManualNotes] = useState(deliveryAddress.notes || 'Call upon arrival at gate');

  // Subtotal & Fee calculations (UGX)
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const deliveryFee = 0;
  const total = subtotal;

  if (!isOpen) return null;

  // Auto detect location using browser GPS or fallback
  const handleAutoDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetectingLocation(false);
          setIsAutoDetected(true);
          const lat = typeof position?.coords?.latitude === 'number' ? position.coords.latitude.toFixed(4) : '0.3476';
          const lon = typeof position?.coords?.longitude === 'number' ? position.coords.longitude.toFixed(4) : '32.5825';
          const autoAddr: DeliveryAddress = {
            id: 'addr-auto-gps',
            label: 'Current GPS Location',
            street: 'Acacia Avenue Area (GPS Fixed)',
            unit: `Lat: ${lat}, Lon: ${lon}`,
            city: 'Kampala, Uganda',
            notes: 'Auto-detected device GPS coordinates',
            isDefault: true,
          };
          setManualLabel(autoAddr.label);
          setManualStreet(autoAddr.street);
          setManualUnit(autoAddr.unit || '');
          setManualCity(autoAddr.city);
          setManualNotes(autoAddr.notes || '');
          onSelectAddress(autoAddr);
        },
        () => {
          setIsDetectingLocation(false);
          setIsAutoDetected(true);
          const fallbackAddr: DeliveryAddress = {
            id: 'addr-auto-fallback',
            label: 'Kololo Acacia Auto-Location',
            street: 'Plot 14 Acacia Avenue, Kololo',
            unit: 'Main Gate / Reception',
            city: 'Kampala, Uganda',
            notes: 'Auto-located near Kampala Central',
            isDefault: true,
          };
          setManualLabel(fallbackAddr.label);
          setManualStreet(fallbackAddr.street);
          setManualUnit(fallbackAddr.unit || '');
          setManualCity(fallbackAddr.city);
          setManualNotes(fallbackAddr.notes || '');
          onSelectAddress(fallbackAddr);
        },
        { timeout: 4000 }
      );
    } else {
      setIsDetectingLocation(false);
      setIsAutoDetected(true);
      const fallbackAddr: DeliveryAddress = {
        id: 'addr-auto-fallback',
        label: 'Kololo Acacia Auto-Location',
        street: 'Plot 14 Acacia Avenue, Kololo',
        unit: 'Main Gate',
        city: 'Kampala, Uganda',
        notes: 'Auto-located in Kampala',
        isDefault: true,
      };
      onSelectAddress(fallbackAddr);
    }
  };

  const handleSaveManualAddress = () => {
    const updatedAddr: DeliveryAddress = {
      id: deliveryAddress.id || `addr-custom-${Date.now()}`,
      label: manualLabel.trim() || 'Custom Destination',
      street: manualStreet.trim() || 'Kampala Road',
      unit: manualUnit.trim(),
      city: manualCity.trim() || 'Kampala, Uganda',
      notes: manualNotes.trim(),
      isDefault: true,
    };
    onSelectAddress(updatedAddr);
    setIsEditingManual(false);
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) return;

    // If customer is browsing as a guest, prompt them to sign in or create an account
    if (isGuest) {
      setShowGuestPrompt(true);
      return;
    }

    setIsPlacingOrder(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      const defaultCash: PaymentMethod = {
        id: 'pm-cash',
        type: 'cash',
        label: 'Cash on Doorstep Delivery',
        subtitle: 'UGX Cash (Exact change appreciated)',
        expiry: 'Pay upon delivery',
        isDefault: true,
        comingSoon: false,
      };

      const selectedPayment =
        paymentMethods.find((p) => p.id === selectedPaymentId) ||
        paymentMethods.find((p) => p.type === 'cash') ||
        defaultCash;

      const activeAddressToSubmit: DeliveryAddress = {
        id: deliveryAddress.id || 'addr-current',
        label: manualLabel || deliveryAddress.label || 'Delivery Address',
        street: manualStreet || deliveryAddress.street || 'Acacia Avenue, Kololo',
        unit: manualUnit || deliveryAddress.unit || '',
        city: manualCity || deliveryAddress.city || 'Kampala, Uganda',
        notes: manualNotes || deliveryAddress.notes || '',
        isDefault: true,
      };

      onCheckoutComplete({
        items,
        subtotal,
        deliveryFee,
        tip: 0,
        discount: 0,
        total,
        customerName: userProfile.name || 'Customer',
        customerPhone: userProfile.phone || '0752619129',
        customerEmail: userProfile.email || 'customer@gmail.com',
        deliveryAddress: activeAddressToSubmit,
        paymentMethod: selectedPayment,
      });

      setIsPlacingOrder(false);
      onClose();
    }, 600);
  };

  // ADMIN PENDING ORDERS:
  // Arranged with the NEWEST order at the bottom (chronological ascending: oldest at top, newest at bottom)
  const pendingOrders = (allOrders || [])
    .filter((o) => o.status !== 'delivered')
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeA - timeB; // Oldest at top, Newest at bottom
    });

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'placed':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">New Order</span>;
      case 'brewing':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">Blending & Crafting</span>;
      case 'packaged':
        return <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold">Packaged & Sealed</span>;
      case 'on_the_way':
        return <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">Courier On Road</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">Delivered</span>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="relative max-w-full flex pl-4 sm:pl-10 z-10 pointer-events-none h-full">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="pointer-events-auto w-screen max-w-md sm:max-w-lg bg-[#13161e] border-l border-white/10 shadow-2xl flex flex-col text-white h-full"
            >
              
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {userRole === 'admin' ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display font-bold text-lg sm:text-xl text-white">Pending Orders Queue</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                          {pendingOrders.length} pending
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Arranged with newest incoming orders at the bottom
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-display font-bold text-xl text-white">Your Cart</h2>
                      {items.length > 0 && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                          {items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  id="close-cart-btn"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

          {/* Admin Tab Switcher if admin wants to switch between Pending Queue and Test Bag */}
          {userRole === 'admin' && (
            <div className="px-5 pt-3 pb-1 border-b border-white/10 flex items-center gap-2">
              <button
                onClick={() => setAdminCartTab('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  adminCartTab === 'pending'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                }`}
              >
                Pending Orders Queue ({pendingOrders.length})
              </button>
              <button
                onClick={() => setAdminCartTab('my_cart')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  adminCartTab === 'my_cart'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                }`}
              >
                My Test Bag ({items.length})
              </button>
            </div>
          )}

          {/* MAIN CONTENT: EITHER ADMIN PENDING ORDERS OR CUSTOMER CART */}
          {userRole === 'admin' && adminCartTab === 'pending' ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {pendingOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-1">
                    No Pending Orders
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-xs mb-4">
                    All incoming customer orders have been completed and delivered!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                    <span>Oldest orders on top</span>
                    <span className="text-amber-400 font-bold">Newest orders at the bottom ↓</span>
                  </div>

                  {pendingOrders.map((order, idx) => {
                    const custName = order.customerName || 'Customer';
                    const custPhone = order.customerPhone || '0752619129';

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative group hover:border-amber-500/30 transition-all shadow-lg"
                      >
                        {/* Order Header & Customer Info */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">
                                {order.orderNumber || order.id}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                Order #{idx + 1}
                              </span>
                            </div>

                            {/* Customer Name & Phone Number */}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 text-white text-xs font-semibold">
                                <User className="w-3 h-3 text-amber-400" />
                                <span>{custName}</span>
                              </span>

                              <a
                                href={`tel:${custPhone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold transition-colors"
                                title="Click to call customer"
                              >
                                <Phone className="w-3 h-3 text-emerald-400" />
                                <span>{custPhone}</span>
                              </a>
                            </div>

                            <p className="text-[11px] text-zinc-400 mt-1">
                              Placed: {order.createdAt || 'Just now'} · {order.deliveryAddress?.street || 'Kampala'}
                            </p>
                          </div>

                          <div>{getStatusBadge(order.status)}</div>
                        </div>

                        {/* Items Ordered */}
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                          {order.items.map((it, itemIdx) => (
                            <div key={itemIdx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center">
                                  {it.quantity}x
                                </span>
                                <span className="text-zinc-200 font-medium">{it.drink.name}</span>
                              </div>
                              <span className="text-amber-400/90 font-semibold">{formatCurrency(it.totalPrice)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total & Payment */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-zinc-400">
                            Total: <strong className="text-white text-sm">{formatCurrency(order.total)}</strong>
                          </span>
                          <span className="text-[11px] text-zinc-300 px-2 py-0.5 rounded bg-white/10">
                            Cash on Delivery
                          </span>
                        </div>

                        {/* Quick Status Advancement Buttons */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                          {onViewReceipt && (
                            <button
                              onClick={() => onViewReceipt(order)}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Receipt</span>
                            </button>
                          )}

                          <div className="flex items-center gap-2">
                            {(order.status === 'placed' || order.status === 'brewing') && onUpdateOrderStatus && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'packaged')}
                                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>Mark Packaged ➔</span>
                              </button>
                            )}

                            {order.status === 'packaged' && onUpdateOrderStatus && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'on_the_way')}
                                className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Dispatch Courier ➔</span>
                              </button>
                            )}

                            {order.status === 'on_the_way' && onUpdateOrderStatus && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Delivered ✓</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          ) : (
            /* STANDARD CART FOR CUSTOMERS */
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-4">
                      <Sparkles className="w-8 h-8 text-amber-400/50" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-white mb-1">
                      Your cart is empty
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-xs mb-6">
                      Explore our handcrafted drinks menu to order blended juices, smoothies, shakes, and spiced teas.
                    </p>
                    <button
                      id="browse-menu-empty-cart-btn"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-xs transition-colors hover:bg-amber-400 shadow-md"
                    >
                      Explore Menu
                    </button>
                  </div>
                ) : (
                  <>
                    {/* List of ordered items */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.cartItemId}
                          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex gap-3.5 items-center relative group"
                        >
                          <img
                            src={item.drink.image}
                            alt={item.drink.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-semibold text-sm text-white truncate">
                                {item.drink.name}
                              </h4>
                              <span className="font-bold text-sm text-amber-400 shrink-0">
                                {formatCurrency(item.totalPrice)}
                              </span>
                            </div>

                            {/* Customization specs breakdown */}
                            <div className="text-[11px] text-zinc-400 space-y-0.5 mt-0.5">
                              <div className="capitalize font-medium text-amber-300/90 flex items-center gap-1.5 flex-wrap">
                                <span>Size: {item.customization.size === 'large' ? 'Large (500mls)' : 'Standard (400mls)'}</span>
                                {item.customization.selectedFlavor && (
                                  <>
                                    <span className="text-zinc-500">•</span>
                                    <span className="text-amber-400 font-bold inline-flex items-center gap-1">
                                      {item.customization.selectedFlavorImage && (
                                        <img
                                          src={item.customization.selectedFlavorImage}
                                          alt={item.customization.selectedFlavor}
                                          referrerPolicy="no-referrer"
                                          className="w-3.5 h-3.5 rounded object-cover ring-1 ring-amber-400/40"
                                        />
                                      )}
                                      <span>Flavor: {item.customization.selectedFlavor}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                              {item.customization.specialInstructions && (
                                <div className="text-zinc-400 italic truncate text-[10px]">
                                  "{item.customization.specialInstructions}"
                                </div>
                              )}
                            </div>

                            {/* Quantity and Remove row */}
                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                              <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-0.5 border border-white/10">
                                <button
                                  onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => onRemoveItem(item.cartItemId)}
                                className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                                aria-label="Remove item"
                                title="Remove from order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Destination Section */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          Delivery Destination
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            id="auto-detect-gps-btn"
                            onClick={handleAutoDetectLocation}
                            disabled={isDetectingLocation}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1 transition-all"
                            title="Auto detect location using GPS"
                          >
                            <Compass className={`w-3 h-3 text-amber-400 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                            <span>{isDetectingLocation ? 'Locating...' : 'Auto-Detect'}</span>
                          </button>

                          <button
                            id="toggle-edit-address-btn"
                            onClick={() => {
                              setIsEditingManual(!isEditingManual);
                              setIsChangingAddress(false);
                            }}
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{isEditingManual ? 'Done' : 'Edit Manually'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Active Address View or Manual Form */}
                      {!isEditingManual && !isChangingAddress ? (
                        <div className="text-xs bg-black/40 p-3 rounded-xl border border-white/10 relative">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-white">{manualLabel || deliveryAddress.label}</p>
                                {isAutoDetected && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Auto-GPS
                                  </span>
                                )}
                              </div>
                              <p className="text-zinc-300 text-[11px] mt-0.5 font-medium">
                                {manualStreet || deliveryAddress.street}
                              </p>
                              {(manualUnit || deliveryAddress.unit) && (
                                <p className="text-zinc-400 text-[10px]">
                                  {manualUnit || deliveryAddress.unit}
                                </p>
                              )}
                              <p className="text-zinc-400 text-[10px]">
                                {manualCity || deliveryAddress.city}
                              </p>
                              {(manualNotes || deliveryAddress.notes) && (
                                <p className="text-amber-300/80 text-[10px] mt-1 italic">
                                  Note: {manualNotes || deliveryAddress.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 p-3 bg-black/50 rounded-xl border border-amber-500/30">
                          <input
                            type="text"
                            placeholder="Address Label (e.g. Kololo Apartment)"
                            value={manualLabel}
                            onChange={(e) => setManualLabel(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                          />
                          <input
                            type="text"
                            placeholder="Street / Plot number / Area"
                            value={manualStreet}
                            onChange={(e) => setManualStreet(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Flat / Unit / Gate"
                              value={manualUnit}
                              onChange={(e) => setManualUnit(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              placeholder="City"
                              value={manualCity}
                              onChange={(e) => setManualCity(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Courier notes (e.g. Call at gate)"
                            value={manualNotes}
                            onChange={(e) => setManualNotes(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={handleSaveManualAddress}
                            className="w-full py-1.5 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors shadow-sm"
                          >
                            Set This Delivery Spot
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Selector */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-amber-400" />
                        Payment Options
                      </span>

                      <div className="space-y-2">
                        {/* Option 1: Cash on Doorstep Delivery */}
                        <button
                          id="payment-method-cash"
                          onClick={() => setSelectedPaymentId('pm-cash')}
                          className={`w-full p-3 rounded-xl border text-left transition-all ${
                            selectedPaymentId === 'pm-cash'
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-white/10 hover:border-white/20 bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                                <Banknote className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-xs text-white">Cash on Delivery</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                    Available
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-400 mt-0.5">Pay in UGX cash to courier upon arrival</p>
                              </div>
                            </div>

                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              selectedPaymentId === 'pm-cash'
                                ? 'border-amber-500 bg-amber-500'
                                : 'border-white/30 bg-transparent'
                            }`}>
                              {selectedPaymentId === 'pm-cash' && (
                                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Option 2: Mobile Money (Coming Soon) */}
                        <div
                          id="payment-method-momo"
                          className="w-full p-3 rounded-xl border border-white/10 bg-white/[0.02] opacity-75 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-white/5 text-zinc-400 border border-white/10 flex items-center justify-center shrink-0">
                                <Smartphone className="w-4 h-4 text-amber-400/80" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-xs text-zinc-300">Mobile Money</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                    Coming Soon
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-400 mt-0.5">MTN MoMo, Airtel Money</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Cost Breakdown */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                        <span>Total</span>
                        <span className="text-amber-400 text-base">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Footer Checkout Action */}
              {items.length > 0 && (
                <div className="p-5 bg-[#0f1115] border-t border-white/10">
                  {isGuest && (
                    <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-300">
                      <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Account required to place order & track delivery</span>
                    </div>
                  )}

                  <button
                    id="place-order-checkout-btn"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-bold text-sm sm:text-base flex items-center justify-between shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2">
                      {isGuest ? (
                        <>
                          <UserCheck className="w-4 h-4 text-black" />
                          <span>Sign In / Register to Order</span>
                        </>
                      ) : (
                        <span>{isPlacingOrder ? 'Confirming Order...' : 'Place Order (Cash on Delivery)'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>{formatCurrency(total)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              )}
            </>
          )}

          {/* GUEST AUTHENTICATION REQUIRED PROMPT */}
          <AnimatePresence>
            {showGuestPrompt && (
              <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  className="w-full max-w-sm bg-[#151922] border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative text-center"
                >
                  <button
                    onClick={() => setShowGuestPrompt(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
                    <UserCheck className="w-7 h-7" />
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-2">
                    Account Required to Place Order
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                    Please log in or create an account to confirm your order, track your live courier in real time, and earn loyalty rewards.
                  </p>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        setShowGuestPrompt(false);
                        onRequestAuth?.('signin');
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Existing Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowGuestPrompt(false);
                        onRequestAuth?.('signup');
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span>Create New Account</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
