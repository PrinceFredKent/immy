import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  ShoppingBag, 
  MapPin, 
  User, 
  Clock, 
  Compass, 
  PhoneCall, 
  ChevronDown, 
  ShieldCheck, 
  Heart,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { DeliveryAddress, UserRole, UserProfile, PushNotificationEvent } from '../types';
import { formatCurrency } from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentTab: 'home' | 'menu' | 'tracker' | 'orders' | 'favorites' | 'profile';
  setCurrentTab: (tab: 'home' | 'menu' | 'tracker' | 'orders' | 'favorites' | 'profile') => void;
  cartCount: number;
  cartTotal: number;
  openCart: () => void;
  activeAddress: DeliveryAddress;
  savedAddresses: DeliveryAddress[];
  onSelectAddress: (addr: DeliveryAddress) => void;
  hasActiveOrder: boolean;
  userRole: UserRole;
  userProfile?: UserProfile;
  onOpenAuthModal: () => void;
  onOpenDrawer: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit?: () => void;
  recentNotification?: PushNotificationEvent | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  cartCount,
  cartTotal,
  openCart,
  activeAddress,
  savedAddresses,
  onSelectAddress,
  hasActiveOrder,
  userRole,
  userProfile,
  onOpenAuthModal,
  onOpenDrawer,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  recentNotification,
}) => {
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0d0f14]/95 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Left: Hamburger Drawer Trigger & Brand */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              id="header-hamburger-btn"
              onClick={onOpenDrawer}
              aria-label="Open Navigation Drawer"
              className="p-2 sm:p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Brand Logo */}
            <button
              id="brand-logo-btn"
              onClick={() => setCurrentTab('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
            >
              <img
                src="/logo.png"
                alt="Immy Drinks Logo"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="hidden lg:block">
                <div className="flex items-center gap-1">
                  <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                    Immy
                  </span>
                  <span className="font-display font-light text-base sm:text-lg text-amber-400">
                    Drinks
                  </span>
                </div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider -mt-0.5">
                  Drink With Distinction
                </p>
              </div>
            </button>
          </div>

          {/* Center: Rounded Pill Search Bar (Matching Design Mockup) */}
          <div className="flex-1 max-w-lg mx-1 sm:mx-4">
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="header-search-bar"
                type="text"
                placeholder="Search coffee, blended juices, smoothies, cakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (currentTab !== 'menu' && currentTab !== 'home') {
                    setCurrentTab('menu');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentTab('menu');
                    if (onSearchSubmit) onSearchSubmit();
                  }
                }}
                className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white/15 border border-white/10 focus:border-amber-500 text-xs sm:text-sm text-white placeholder:text-zinc-400 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            {[
              { id: 'home', label: 'Home' },
              { id: 'menu', label: 'Menu' },
              { id: 'orders', label: 'Orders' },
              { id: 'favorites', label: 'Favorites' },
              { id: 'tracker', label: 'Track', badge: hasActiveOrder },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === tab.id
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          {/* Right: Notifications, Profile Avatar & Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* PWA Install Button (desktop) */}
            <div className="hidden sm:block">
              <PWAInstallButton variant="header" />
            </div>

            {/* Notification Bell with Indicator Dot & Popover */}
            <div className="relative">
              <button
                id="header-notification-bell"
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                aria-label="View notifications"
                className="relative p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {hasActiveOrder && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
                {hasActiveOrder && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-black" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-3xl bg-[#141722] border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-xs text-white">Notifications & Alerts</span>
                    <button
                      onClick={() => setShowNotificationMenu(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {hasActiveOrder ? (
                    <div 
                      onClick={() => {
                        setCurrentTab('tracker');
                        setShowNotificationMenu(false);
                      }}
                      className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/20 transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                        <span>Live Delivery In Transit</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        Tap here to view real-time courier coordinates & arrival countdown.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 text-center py-3">
                      No active alerts right now. Order your favorite drink to track live!
                    </p>
                  )}

                  <div className="pt-2 border-t border-white/10 text-center">
                    <button
                      onClick={() => {
                        setCurrentTab('orders');
                        setShowNotificationMenu(false);
                      }}
                      className="text-[11px] text-amber-400 hover:underline font-semibold"
                    >
                      View Order History
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar / Icon */}
            <button
              id="header-profile-avatar-btn"
              onClick={() => {
                if (userProfile?.name) {
                  setCurrentTab('profile');
                } else {
                  onOpenAuthModal();
                }
              }}
              title={userProfile?.name ? `Signed in as ${userProfile.name}` : 'Sign In'}
              className="relative p-1 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/50 text-amber-400 hover:border-amber-400 transition-all active:scale-95"
            >
              {userProfile?.avatarUrl && !userProfile.avatarUrl.includes('unsplash.com') ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name || 'User'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 stroke-[2.2]" />
              )}
            </button>

            {/* Shopping Bag / Cart Trigger */}
            <button
              id="header-cart-btn"
              onClick={openCart}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              {cartCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black text-amber-400 text-[10px] sm:text-xs font-black flex items-center justify-center border border-amber-400">
                  {cartCount}
                </span>
              )}
              <span className="hidden md:inline font-bold">
                {cartCount > 0 ? formatCurrency(cartTotal) : 'Cart'}
              </span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
