import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Menu as MenuIcon, ReceiptText, ShoppingBag, Heart, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'menu' | 'tracker' | 'orders' | 'favorites' | 'profile';
  setCurrentTab: (tab: 'home' | 'menu' | 'tracker' | 'orders' | 'favorites' | 'profile') => void;
  cartCount: number;
  openCart: () => void;
  hasActiveOrder: boolean;
  activeOrdersCount?: number;
  favoritesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  cartCount,
  openCart,
  hasActiveOrder,
  activeOrdersCount = 0,
  favoritesCount = 0,
}) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'menu' as const, label: 'Menu', icon: MenuIcon },
    {
      id: 'orders' as const,
      label: 'Orders',
      icon: ReceiptText, // Changed from ShoppingBag to ReceiptText so it is never confused with Cart
      isOrderTab: true,
    },
    { id: 'favorites' as const, label: 'Favorites', icon: Heart, badge: favoritesCount },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Floating Active Cart Pill on Mobile (above bottom nav) when cart has items */}
      <AnimatePresence>
        {cartCount > 0 && (
          <div className="fixed bottom-[68px] inset-x-0 z-40 px-3 md:hidden pointer-events-none">
            <motion.button
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              whileTap={{ scale: 0.96 }}
              onClick={openCart}
              id="mobile-floating-cart-pill"
              className="pointer-events-auto w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-2xl shadow-amber-500/30 flex items-center justify-between border border-amber-300/40 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>
                  Active Cart &middot; {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <span className="font-extrabold text-[11px] bg-black/15 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                Checkout &rarr;
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0e1017]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 pb-safe shadow-2xl">
        <div className="flex items-center justify-around relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.isOrderTab
              ? currentTab === 'orders' || currentTab === 'tracker'
              : currentTab === tab.id;

            return (
              <motion.button
                whileTap={{ scale: 0.88 }}
                key={tab.id}
                id={`mobile-nav-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {/* Fluid Sliding Background Capsule */}
                {isActive && (
                  <motion.div
                    layoutId="activeBottomTabPill"
                    className="absolute inset-0 bg-amber-500/15 rounded-2xl border border-amber-500/30 -z-10 shadow-sm shadow-amber-500/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative z-10">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? tab.id === 'favorites'
                          ? 'fill-amber-400 stroke-amber-400 scale-110'
                          : 'stroke-[2.5] scale-110'
                        : 'stroke-2'
                    }`}
                  />

                  {/* Pulsing indicator for active live delivery tracking */}
                  {tab.isOrderTab && hasActiveOrder && (
                    <>
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
                    </>
                  )}

                  {/* Orders or Favorites count badge */}
                  {tab.badge !== undefined && tab.badge > 0 && !(tab.isOrderTab && hasActiveOrder) && (
                    <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-extrabold text-[9px] shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </>
  );
};
