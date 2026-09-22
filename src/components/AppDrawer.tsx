import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Leaf,
  Clock, 
  Heart, 
  User, 
  PhoneCall, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';
import { DrinkCategory, UserProfile, UserRole } from '../types';
import { CATEGORIES } from '../data/mockDrinks';
import { ThemeSelector } from './ThemeSelector';
import { ThemeMode } from '../hooks/useTheme';
import versionData from '../version.json';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: 'home' | 'menu' | 'tracker' | 'orders' | 'favorites' | 'profile';
  onNavigate: (tab: 'home' | 'menu' | 'tracker' | 'orders' | 'favorites' | 'profile', category?: DrinkCategory) => void;
  userProfile: UserProfile;
  userRole: UserRole;
  hasActiveOrder: boolean;
  themeMode: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  onChangeTheme: (mode: ThemeMode) => void;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onNavigate,
  userProfile,
  userRole,
  hasActiveOrder,
  themeMode,
  resolvedTheme,
  onChangeTheme,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex">
          {/* Backdrop with Smooth Fade */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Content with Spring Slide Animation */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative max-w-xs w-full bg-[#11131a] border-r border-white/10 shadow-2xl flex flex-col justify-between p-5 sm:p-6 overflow-y-auto z-10"
          >
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo.png"
                    alt="Immy Drinks Logo"
                    className="w-10 h-10 rounded-full object-cover shadow-lg shadow-amber-500/20 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-display font-extrabold text-base text-white">
                      Immy <span className="text-amber-400 font-light">Drinks</span>
                    </h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                      Drink With Distinction
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* User Quick Info */}
              <div className="p-3.5 rounded-2xl bg-[#161823] border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                  {userProfile.avatarUrl && !userProfile.avatarUrl.includes('unsplash.com') ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-amber-400 stroke-[2.2]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-white truncate">{userProfile.name || 'Valued Guest'}</h4>
                  <p className="text-[10px] text-amber-400 font-semibold">{userProfile.phone || '0752619129'}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 block mb-1">
                  Navigation
                </span>

                {[
                  { id: 'home', label: 'Home Feed', icon: Sparkles },
                  { id: 'menu', label: 'All Drinks & Catalog', icon: Leaf },
                  { id: 'orders', label: 'My Orders & History', icon: Clock },
                  { id: 'favorites', label: 'Saved Favorites', icon: Heart, count: userProfile.favoriteDrinkIds?.length },
                  { id: 'tracker', label: 'Live Delivery Tracker', icon: Compass, badge: hasActiveOrder ? 'Active' : undefined },
                  { id: 'profile', label: userRole === 'admin' ? 'Admin Dashboard' : 'My Account', icon: userRole === 'admin' ? ShieldCheck : User },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <motion.button
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id as any);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'}`}>
                          {item.count}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* App Theme Auto Detect & Switcher */}
              <div className="pt-2">
                <ThemeSelector
                  themeMode={themeMode}
                  resolvedTheme={resolvedTheme}
                  onChangeTheme={onChangeTheme}
                />
              </div>

              {/* Categories Quick Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 block mb-1">
                  Drink Categories
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      key={cat.id}
                      onClick={() => {
                        onNavigate('menu', cat.id);
                        onClose();
                      }}
                      className="text-left px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-zinc-300 hover:text-amber-400 truncate transition-colors"
                    >
                      {cat.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer & Direct Hotline */}
            <div className="pt-4 border-t border-white/10 space-y-3 mt-6">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Direct Hotline Orders</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-300">
                  <a href="tel:0752619129" className="hover:text-amber-400 underline font-semibold">
                    0752619129
                  </a>
                  <span>|</span>
                  <a href="tel:0760535440" className="hover:text-amber-400 underline font-semibold">
                    0760535440
                  </a>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-[10px] text-zinc-500">
                  Immy Drinks · Kampala, Uganda
                </p>
                <p className="text-[9px] text-zinc-600 font-mono">
                  v{versionData.version}
                </p>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
