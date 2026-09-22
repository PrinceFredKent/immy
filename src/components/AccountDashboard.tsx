import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  CreditCard, 
  Award, 
  Sparkles, 
  RotateCcw, 
  Receipt, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2, 
  Compass,
  Gift,
  Leaf,
  CheckCircle2,
  Heart,
  Bell,
  Volume2,
  VolumeX,
  Send,
  ExternalLink,
  ShieldCheck,
  Tag,
  Star,
  Banknote,
  Smartphone,
  User
} from 'lucide-react';
import { 
  UserProfile, 
  Order, 
  DeliveryAddress, 
  PaymentMethod, 
  Drink, 
  RedeemedVoucher 
} from '../types';
import { formatCurrency, formatRating } from '../utils/formatters';
import { requestPushPermission, getPushPermissionStatus } from '../utils/notifications';

interface AccountDashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  orderHistory: Order[];
  activeOrder: Order | null;
  onTrackOrder: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
  onReorder: (order: Order) => void;
  onAddNewAddress: (address: DeliveryAddress) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  onAddNewPayment: (pm: PaymentMethod) => void;
  allDrinks: Drink[];
  onToggleFavorite: (drinkId: string) => void;
  onQuickAddDrink: (drink: Drink) => void;
  onCustomizeDrink: (drink: Drink) => void;
  onSendTestNotification: () => void;
  onOpenAuthModal?: () => void;
  initialTab?: 'favorites' | 'history' | 'rewards' | 'notifications' | 'addresses' | 'payments';
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  userProfile,
  onUpdateProfile,
  orderHistory,
  activeOrder,
  onTrackOrder,
  onViewReceipt,
  onReorder,
  onAddNewAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onAddNewPayment,
  allDrinks,
  onToggleFavorite,
  onQuickAddDrink,
  onCustomizeDrink,
  onSendTestNotification,
  onOpenAuthModal,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'rewards' | 'notifications' | 'addresses' | 'payments'>(initialTab || 'favorites');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [emailInput, setEmailInput] = useState(userProfile.email);
  const [phoneInput, setPhoneInput] = useState(userProfile.phone);

  // Address add form state
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrZip, setNewAddrZip] = useState('');
  const [newAddrNotes, setNewAddrNotes] = useState('');

  // Payment add form state
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newCardBrand, setNewCardBrand] = useState('Visa');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');

  // Browser push notification status
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(
    getPushPermissionStatus()
  );

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: nameInput.trim() || userProfile.name,
      email: emailInput.trim() || userProfile.email,
      phone: phoneInput.trim() || userProfile.phone,
    });
    setIsEditingProfile(false);
  };

  const handleRequestBrowserPush = async () => {
    const res = await requestPushPermission();
    setBrowserPermission(res);
    if (res === 'granted') {
      onUpdateProfile({
        notificationPreferences: {
          ...userProfile.notificationPreferences,
          pushEnabled: true,
        },
      });
      onSendTestNotification();
    }
  };

  const handleTogglePreference = (key: keyof typeof userProfile.notificationPreferences) => {
    const updated = {
      ...userProfile.notificationPreferences,
      [key]: !userProfile.notificationPreferences[key],
    };
    onUpdateProfile({ notificationPreferences: updated });
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) return;

    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      label: newAddrLabel.trim() || 'Other',
      street: newAddrStreet.trim(),
      city: newAddrCity.trim() || 'San Francisco',
      zip: newAddrZip.trim() || '94105',
      notes: newAddrNotes.trim() || undefined,
      isDefault: userProfile.savedAddresses.length === 0,
    };

    onAddNewAddress(newAddr);
    setShowAddAddressModal(false);
    setNewAddrLabel('');
    setNewAddrStreet('');
    setNewAddrCity('');
    setNewAddrZip('');
    setNewAddrNotes('');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim()) return;

    const last4 = newCardNumber.replace(/\D/g, '').slice(-4) || '4242';
    const newPm: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: 'card',
      last4,
      cardBrand: newCardBrand,
      expiry: newCardExpiry || '12/28',
      isDefault: userProfile.savedPaymentMethods.length === 0,
    };

    onAddNewPayment(newPm);
    setShowAddPaymentModal(false);
    setNewCardNumber('');
    setNewCardExpiry('');
  };

  // Favorited drinks resolution
  const favoriteDrinkList = allDrinks.filter((d) => 
    userProfile.favoriteDrinkIds?.includes(d.id)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Profile Overview Card */}
      <div className="bg-[#151922] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-600/20 to-amber-700/30 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xl shrink-0">
              {userProfile.avatarUrl && !userProfile.avatarUrl.includes('unsplash.com') ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-full h-full rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 stroke-[2]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
                  {userProfile.name}
                </h1>
                <button
                  id="edit-profile-btn"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{userProfile.email}</p>
              <p className="text-xs text-zinc-500">{userProfile.phone}</p>
            </div>
          </div>

          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Switch Access / Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

        </div>

        {/* Inline Edit Profile form */}
        {isEditingProfile && (
          <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                Full Name
              </label>
              <input
                id="edit-profile-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                Email Address
              </label>
              <input
                id="edit-profile-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  id="edit-profile-phone"
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  id="save-profile-btn"
                  onClick={handleSaveProfile}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: 'favorites', label: 'Favorite Drinks', icon: Heart },
          { id: 'history', label: 'Order History', icon: Clock },
          { id: 'rewards', label: 'Immy Rewards & Points', icon: Gift },
          { id: 'notifications', label: 'Push Alerts', icon: Bell },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          { id: 'payments', label: 'Payment Methods', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================== TAB 1: FAVORITE DRINKS ===================== */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Favorite Drinks
            </h2>
            <span className="text-xs text-zinc-400 font-medium">
              {favoriteDrinkList.length} saved
            </span>
          </div>

          {favoriteDrinkList.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#151922] border border-white/10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-base text-white">No Favorite Drinks Saved Yet</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Tap the heart icon on any beverage card in our drink menu or in your past orders to save it here for effortless quick reordering!
              </p>
              <div className="pt-2">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                  Popular Drinks You Might Enjoy:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                  {allDrinks.slice(0, 2).map((drink) => (
                    <div
                      key={drink.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={drink.image}
                          alt={drink.name}
                          className="w-12 h-12 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{drink.name}</p>
                          <p className="text-[11px] text-amber-400">{formatCurrency(drink.price)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleFavorite(drink.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                        Favorite
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteDrinkList.map((drink) => (
                <div
                  key={drink.id}
                  id={`favorite-card-${drink.id}`}
                  className="p-4 sm:p-5 rounded-3xl bg-[#151922] border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div className="flex items-start gap-3.5">
                    <div 
                      className="relative shrink-0 cursor-pointer group/img"
                      onClick={() => onCustomizeDrink(drink)}
                      title="Click to view details & customize"
                    >
                      <img
                        src={drink.image}
                        alt={drink.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/10 group-hover/img:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(drink.id);
                        }}
                        className="absolute -top-2 -left-2 p-1.5 rounded-full bg-black/80 border border-rose-500/50 text-rose-500 hover:scale-110 transition-transform shadow-md"
                        title="Remove from favorites"
                        aria-label="Remove from favorites"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-amber-300 border border-white/10">
                          {drink.category.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-300 font-semibold">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{formatRating(drink.rating)}</span>
                        </div>
                      </div>

                      <h3 
                        onClick={() => onCustomizeDrink(drink)}
                        className="font-display font-bold text-white text-base mt-1 truncate cursor-pointer hover:text-amber-400 transition-colors"
                        title="Click to view details"
                      >
                        {drink.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                        {drink.tagline}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="font-bold text-amber-400 font-display text-sm">
                          {formatCurrency(drink.price)}
                        </span>
                        <span className="text-zinc-500">·</span>
                        <span className="text-zinc-400 text-[11px]">{drink.calories} kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Flavor profile pills */}
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-white/10">
                    {drink.flavorNotes.slice(0, 3).map((note, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5"
                      >
                        {note}
                      </span>
                    ))}
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
                    <button
                      id={`favorite-quick-order-${drink.id}`}
                      onClick={() => onQuickAddDrink(drink)}
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Quick Order</span>
                    </button>
                    <button
                      id={`favorite-customize-${drink.id}`}
                      onClick={() => onCustomizeDrink(drink)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: ORDER HISTORY ===================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">Your Orders & Drink History</h2>
            <span className="text-xs text-zinc-400">{orderHistory.length} total orders</span>
          </div>

          {orderHistory.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#151922] border border-white/10 text-center text-zinc-400">
              <Clock className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No past orders yet</p>
              <p className="text-xs mt-1">Place your first handcrafted drinks order to begin tracking history!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderHistory.map((order) => {
                const isActive = activeOrder?.id === order.id && order.status !== 'delivered';
                return (
                  <div
                    key={order.id}
                    id={`order-history-${order.id}`}
                    className={`p-5 rounded-3xl bg-[#151922] border transition-all ${
                      isActive ? 'border-amber-500/50 shadow-xl shadow-amber-500/10' : 'border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs text-zinc-400">· {order.createdAt}</span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase animate-pulse border border-emerald-500/30">
                              Active Delivery
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Delivered to {order.deliveryAddress.label} · {order.deliveryAddress.street}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-amber-400 text-base">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Items List with Favorite Drink Buttons */}
                    <div className="py-3 divide-y divide-white/5 space-y-2.5">
                      {order.items.map((item, idx) => {
                        const isFav = userProfile.favoriteDrinkIds?.includes(item.drink.id);
                        return (
                          <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.drink.image}
                                alt={item.drink.name}
                                className="w-10 h-10 rounded-xl object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">
                                    {item.quantity}x {item.drink.name}
                                  </span>
                                  <button
                                    onClick={() => onToggleFavorite(item.drink.id)}
                                    title={isFav ? 'Favorited' : 'Mark as favorite drink'}
                                    className={`p-1 rounded-full border transition-all ${
                                      isFav
                                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    <Heart
                                      className={`w-3 h-3 ${
                                        isFav ? 'fill-rose-500 text-rose-500' : ''
                                      }`}
                                    />
                                  </button>
                                </div>
                                <p className="text-[11px] text-amber-300 capitalize font-medium">
                                  Size: {item.customization.size === 'large' ? 'Large (500mls)' : 'Standard (400mls)'}
                                  {item.customization.selectedFlavor && ` • Flavor: ${item.customization.selectedFlavor}`}
                                </p>
                              </div>
                            </div>

                            <span className="font-semibold text-zinc-300">
                              {formatCurrency(item.totalPrice)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <button
                            onClick={() => onTrackOrder(order)}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Live GPS Tracking</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onReorder(order)}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                            <span>Re-order Drink(s)</span>
                          </button>
                        )}

                        <button
                          onClick={() => onViewReceipt(order)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-medium text-xs border border-white/10 flex items-center gap-1.5 transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View Itemized Receipt</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-zinc-500">
                        Courier: {order.courier.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: IMMY REWARDS & POINTS ===================== */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          
          {/* Main Loyalty Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1b1f2b] via-[#141720] to-black border border-amber-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-black">
                    Immy Rewards Club
                  </span>
                  <span className="text-xs text-amber-400 font-bold">{userProfile.loyaltyTier}</span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  {userProfile.loyaltyPoints}{' '}
                  <span className="text-amber-400 text-xl font-sans">Points Available</span>
                </h2>
                <p className="text-xs text-zinc-300 mt-1 max-w-md leading-relaxed">
                  Earn 10 points for every $1 spent on all online orders. Redeem accumulated points for instant cash-off discounts, free beverage vouchers, or signature reward items!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/15 text-center min-w-[180px] shadow-xl">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                  Current Redemption Value
                </span>
                <span className="font-display font-bold text-2xl text-emerald-400">
                  {formatCurrency(userProfile.loyaltyPoints / 100)}
                </span>
                <p className="text-[10px] text-zinc-400 mt-1">100 pts = $1.00 store discount</p>
              </div>
            </div>

            {/* Tier Progress */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Status Progress to Obsidian Elite (1,500 pts)
                </span>
                <span className="text-amber-400 font-bold">
                  {Math.max(0, 1500 - userProfile.loyaltyPoints)} pts to level up
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (userProfile.loyaltyPoints / 1500) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Member Tier Privileges & Point Perks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Your {userProfile.loyaltyTier} Member Benefits
                </h3>
                <p className="text-xs text-zinc-400">
                  Every order earns 10 points per $1 spent automatically.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#151922] border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-block">
                  Priority Crafting
                </span>
                <h4 className="font-display font-bold text-white text-sm">Express Barista Queue</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your drink orders are routed with priority thermal packaging and express dispatch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#151922] border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-block">
                  Automatic Cash-Off
                </span>
                <h4 className="font-display font-bold text-white text-sm">Direct Points Value</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Accumulated points convert directly at 100 points per $1.00 for seamless checkout savings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#151922] border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 inline-block">
                  Special Seasonal Drops
                </span>
                <h4 className="font-display font-bold text-white text-sm">Secret Menu Previews</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Early seasonal tasting access to limited-edition botanical blends and aromatic spiced teas.
                </p>
              </div>
            </div>
          </div>

          {/* 10-Drink Stamp Card */}
          <div className="p-5 rounded-3xl bg-[#151922] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-amber-400" />
                  Immy 10-Drink Stamp Card
                </h3>
                <p className="text-xs text-zinc-400">
                  Buy 10 handcrafted drinks, earn 1 Free Beverage voucher automatically!
                </p>
              </div>
              <span className="text-xs font-bold text-amber-400">
                {userProfile.stampsCount}/{userProfile.stampsRequiredForFreeDrink} Stamps
              </span>
            </div>

            {/* Stamp visual circles */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
              {Array.from({ length: userProfile.stampsRequiredForFreeDrink }).map((_, index) => {
                const isStamped = index < userProfile.stampsCount;
                const isFinal = index === userProfile.stampsRequiredForFreeDrink - 1;
                return (
                  <div
                    key={index}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      isStamped
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                        : isFinal
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-black/40 border-white/10 text-zinc-600'
                    }`}
                  >
                    {isStamped ? (
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    ) : isFinal ? (
                      <Gift className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Leaf className="w-4 h-4" />
                    )}
                    <span className="text-[9px] font-bold mt-0.5">#{index + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ===================== TAB 4: PUSH NOTIFICATIONS & PREFERENCES ===================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          
          {/* Header & Status Banner */}
          <div className="p-6 rounded-3xl bg-[#151922] border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">
                    Real-Time Order Push Notifications
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Stay notified at every step: confirmed, brewing, out for delivery, and arrival.
                  </p>
                </div>
              </div>

              {/* Browser Permission Control */}
              <div className="flex items-center gap-2">
                <button
                  id="test-push-btn"
                  onClick={onSendTestNotification}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Push Alert</span>
                </button>
              </div>
            </div>

            {/* Browser permission status callout */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  browserPermission === 'granted' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                <span className="text-zinc-300">
                  System Browser Notification Status:{' '}
                  <strong className="text-white capitalize font-mono">{browserPermission}</strong>
                </span>
              </div>

              {browserPermission !== 'granted' && (
                <button
                  id="request-permission-btn"
                  onClick={handleRequestBrowserPush}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
                >
                  Request System Permission
                </button>
              )}
            </div>
          </div>

          {/* Granular Notification Preferences */}
          <div className="p-6 rounded-3xl bg-[#151922] border border-white/10 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              Notification Delivery Preferences
            </h3>
            <p className="text-xs text-zinc-400">
              Customize which alerts you receive across your devices and mobile browsers.
            </p>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {[
                {
                  key: 'orderUpdates' as const,
                  title: 'Order Confirmation Alerts',
                  desc: 'Instant notice when your payment is verified and order is sent to the kitchen.',
                  icon: CheckCircle2,
                },
                {
                  key: 'brewingAlerts' as const,
                  title: 'Brewing & Preparation Progress',
                  desc: 'Notice when we begin blending your drinks and preparing fresh toppings.',
                  icon: Leaf,
                },
                {
                  key: 'outForDelivery' as const,
                  title: 'Out for Delivery & Courier Dispatch',
                  desc: 'Live notice when courier takes route with real-time ETA updates.',
                  icon: Compass,
                },
                {
                  key: 'deliveredAlert' as const,
                  title: 'Delivery Arrival & Drop-off',
                  desc: 'Alert when beverages arrive safely at your doorstep or concierge.',
                  icon: Sparkles,
                },
                {
                  key: 'promotionsAndRewards' as const,
                  title: 'Special Rewards & Double Points Days',
                  desc: 'Exclusive member promos, secret menu drops, and points multipliers.',
                  icon: Gift,
                },
                {
                  key: 'soundEnabled' as const,
                  title: 'Synthesized Chimes & Sound Effects',
                  desc: 'Pleasant melodic tone played whenever an order status advances.',
                  icon: Volume2,
                },
              ].map((pref) => {
                const Icon = pref.icon;
                const isEnabled = userProfile.notificationPreferences?.[pref.key] ?? true;
                return (
                  <div key={pref.key} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs sm:text-sm">{pref.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{pref.desc}</p>
                      </div>
                    </div>

                    <button
                      id={`toggle-${pref.key}`}
                      onClick={() => handleTogglePreference(pref.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-amber-500' : 'bg-white/10'
                      }`}
                      role="switch"
                      aria-checked={isEnabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ===================== TAB 5: SAVED ADDRESSES ===================== */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">Saved Delivery Addresses</h2>
            <button
              id="add-address-modal-btn"
              onClick={() => setShowAddAddressModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userProfile.savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-3xl bg-[#151922] border transition-all flex flex-col justify-between ${
                  addr.isDefault ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 font-medium">{addr.street}</p>
                  <p className="text-xs text-zinc-400">
                    {addr.city}, {addr.zip}
                  </p>
                  {addr.notes && (
                    <p className="text-[11px] text-amber-300/80 italic mt-2">
                      Note: "{addr.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => onSetDefaultAddress(addr.id)}
                      className="text-zinc-400 hover:text-white underline text-[11px]"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium">Primary location</span>
                  )}

                  {userProfile.savedAddresses.length > 1 && (
                    <button
                      onClick={() => onDeleteAddress(addr.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 6: PAYMENT METHODS ===================== */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Accepted Payment Methods</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                We accept Cash on Delivery and are actively onboarding Mobile Money providers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cash on Delivery */}
            <div className="p-5 rounded-3xl bg-[#151922] border border-amber-500/50 shadow-lg shadow-amber-500/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <Banknote className="w-4 h-4" />
                    </div>
                    Cash on Delivery
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active & Default
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  Pay directly to the scooter courier with physical cash upon arrival.
                </p>
                <p className="text-[11px] text-zinc-500 mt-2">
                  • Exact change or small bills appreciated<br />
                  • Zero transaction surcharges or card hold fees
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Instant Receipt on Delivery
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">All Delivery Zones</span>
              </div>
            </div>

            {/* Mobile Money (Coming Soon) */}
            <div className="p-5 rounded-3xl bg-[#151922]/60 border border-white/10 flex flex-col justify-between opacity-85">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/5 text-amber-400/80 border border-white/10 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    Mobile Money (MoMo)
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  Pay via prompt push on your phone with any supported mobile telecom provider.
                </p>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {['MTN MoMo', 'AirtelTigo', 'Telecel Cash', 'M-Pesa'].map((provider) => (
                    <span
                      key={provider}
                      className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold text-zinc-300"
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1 text-[11px] text-amber-400/80">
                  <Clock className="w-3.5 h-3.5" /> Carrier Integration in Progress
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181c25] border border-white/15 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
            <h3 className="font-display font-bold text-lg mb-4">Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block uppercase font-bold text-zinc-400 mb-1">Label (e.g. Home, Loft, Office)</label>
                <input
                  type="text"
                  required
                  placeholder="Home"
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block uppercase font-bold text-zinc-400 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="350 Mission St, Apt 14B"
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block uppercase font-bold text-zinc-400 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="San Francisco"
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-zinc-400 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    placeholder="94105"
                    value={newAddrZip}
                    onChange={(e) => setNewAddrZip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block uppercase font-bold text-zinc-400 mb-1">Driver Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="Buzz 1402, leave at front desk"
                  value={newAddrNotes}
                  onChange={(e) => setNewAddrNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181c25] border border-white/15 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl">
            <h3 className="font-display font-bold text-lg mb-4">Add Payment Method</h3>
            <form onSubmit={handleAddPayment} className="space-y-3 text-xs">
              <div>
                <label className="block uppercase font-bold text-zinc-400 mb-1">Card Brand</label>
                <select
                  value={newCardBrand}
                  onChange={(e) => setNewCardBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                </select>
              </div>
              <div>
                <label className="block uppercase font-bold text-zinc-400 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4242 •••• •••• 9842"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block uppercase font-bold text-zinc-400 mb-1">Expiry Date (MM/YY)</label>
                <input
                  type="text"
                  required
                  placeholder="08/29"
                  value={newCardExpiry}
                  onChange={(e) => setNewCardExpiry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
