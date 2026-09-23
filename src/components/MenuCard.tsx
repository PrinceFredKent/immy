import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Plus, Sparkles, Heart, ChevronRight } from 'lucide-react';
import { Drink } from '../types';
import { formatCurrency, formatRating, isDrinkNew } from '../utils/formatters';
import { MenuCardSkeleton, MenuGridSkeleton } from './MenuCardSkeleton';

export { MenuCardSkeleton, MenuGridSkeleton };

export interface DrinkThemeConfig {
  accentColor: string;
  glowGradient: string;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  hoverBorder: string;
  priceColor: string;
}

export const getDrinkTheme = (category: string, name: string = ''): DrinkThemeConfig => {
  const lowerName = name.toLowerCase();

  // 1. Specific signature flavor/brand themes
  if (
    lowerName.includes('dew') ||
    lowerName.includes('sprite') ||
    lowerName.includes('lime') ||
    lowerName.includes('lemon')
  ) {
    return {
      accentColor: '#10b981', // Lime / Emerald
      glowGradient: 'from-emerald-500/35 via-lime-500/20 to-transparent',
      badgeBorder: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-400',
      hoverBorder: 'hover:border-emerald-500/60',
      priceColor: 'text-emerald-500',
    };
  }

  if (
    lowerName.includes('cola') ||
    lowerName.includes('coke') ||
    lowerName.includes('pepsi') ||
    lowerName.includes('berry') ||
    lowerName.includes('watermelon') ||
    lowerName.includes('hibiscus')
  ) {
    return {
      accentColor: '#f43f5e', // Ruby / Crimson
      glowGradient: 'from-rose-500/35 via-red-500/20 to-transparent',
      badgeBorder: 'border-rose-500/40',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-400',
      hoverBorder: 'hover:border-rose-500/60',
      priceColor: 'text-rose-500',
    };
  }

  // 2. Category themes
  switch (category) {
    case 'blended-juices':
      return {
        accentColor: '#f59e0b',
        glowGradient: 'from-amber-500/40 via-orange-500/25 to-transparent',
        badgeBorder: 'border-amber-500/40',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-500',
        hoverBorder: 'hover:border-amber-500/60',
        priceColor: 'text-amber-500',
      };
    case 'smoothies-mixtures':
    case 'smoothies-mixes':
      return {
        accentColor: '#a855f7',
        glowGradient: 'from-purple-500/40 via-fuchsia-500/25 to-transparent',
        badgeBorder: 'border-purple-500/40',
        badgeBg: 'bg-purple-500/20',
        badgeText: 'text-purple-400',
        hoverBorder: 'hover:border-purple-500/60',
        priceColor: 'text-purple-400',
      };
    case 'bongo-kitiribita':
    case 'bongo':
    case 'kitiribita':
      return {
        accentColor: '#eab308',
        glowGradient: 'from-yellow-500/35 via-amber-500/20 to-transparent',
        badgeBorder: 'border-yellow-500/40',
        badgeBg: 'bg-yellow-500/20',
        badgeText: 'text-yellow-500',
        hoverBorder: 'hover:border-yellow-500/60',
        priceColor: 'text-yellow-500',
      };
    case 'energy-bottled-juices':
    case 'energy-drinks':
      return {
        accentColor: '#06b6d4',
        glowGradient: 'from-cyan-500/40 via-blue-500/25 to-transparent',
        badgeBorder: 'border-cyan-500/40',
        badgeBg: 'bg-cyan-500/20',
        badgeText: 'text-cyan-400',
        hoverBorder: 'hover:border-cyan-500/60',
        priceColor: 'text-cyan-400',
      };
    case 'water-sodas':
      return {
        accentColor: '#10b981',
        glowGradient: 'from-emerald-500/35 via-teal-500/20 to-transparent',
        badgeBorder: 'border-emerald-500/40',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-500',
        hoverBorder: 'hover:border-emerald-500/60',
        priceColor: 'text-emerald-500',
      };
    case 'cakes-pastries':
    case 'cakes':
      return {
        accentColor: '#f43f5e',
        glowGradient: 'from-rose-500/35 via-pink-500/20 to-transparent',
        badgeBorder: 'border-rose-500/40',
        badgeBg: 'bg-rose-500/20',
        badgeText: 'text-rose-400',
        hoverBorder: 'hover:border-rose-500/60',
        priceColor: 'text-rose-500',
      };
    default:
      return {
        accentColor: '#f59e0b',
        glowGradient: 'from-amber-500/35 via-orange-500/20 to-transparent',
        badgeBorder: 'border-amber-500/40',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-500',
        hoverBorder: 'hover:border-amber-500/60',
        priceColor: 'text-amber-500',
      };
  }
};

interface MenuCardProps {
  drink: Drink;
  onCustomize: (drink: Drink) => void;
  onQuickAdd: (drink: Drink) => void;
  onDirectOrder?: (drink: Drink) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (drinkId: string) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  drink,
  onCustomize,
  onQuickAdd,
  onDirectOrder,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const isNewItem = isDrinkNew(drink);
  const [imageLoaded, setImageLoaded] = useState(false);
  const theme = getDrinkTheme(drink.category, drink.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      id={`drink-card-${drink.id}`}
      onClick={() => onCustomize(drink)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCustomize(drink);
        }
      }}
      className={`group relative cursor-pointer bg-[#12151d] border border-white/10 ${theme.hoverBorder} rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-end hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 h-[420px] sm:h-[460px] w-full`}
    >
      {/* 1. Shimmer Skeleton Placeholder while high-res image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-[#12151d] overflow-hidden flex flex-col justify-between p-4 z-[1]">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 rounded-full skeleton-pulse bg-white/10 animate-pulse" />
            <div className="h-5 w-14 rounded-full skeleton-pulse bg-white/10 animate-pulse" />
          </div>
          <div className="space-y-3 pt-32">
            <div className="flex gap-2">
              <div className="h-4 w-12 rounded skeleton-pulse bg-white/10 animate-pulse" />
              <div className="h-4 w-14 rounded skeleton-pulse bg-white/10 animate-pulse" />
            </div>
            <div className="h-6 w-36 rounded-lg skeleton-pulse-deep bg-white/15 animate-pulse" />
            <div className="h-3.5 w-48 rounded skeleton-pulse bg-white/10 animate-pulse" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 w-20 rounded skeleton-pulse-deep bg-white/15 animate-pulse" />
              <div className="h-9 w-24 rounded-2xl skeleton-pulse bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* 2. Full-Bleed High-Res Drink Photography */}
      <img
        src={drink.image}
        alt={drink.name}
        onLoad={() => setImageLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* 3. Top Protective Scrim for category badges */}
      <div className="absolute top-0 inset-x-0 h-24 menu-card-top-scrim pointer-events-none z-[2]" />

      {/* 4. Subtle Ambient Glow (does not wash out the bottle) */}
      <div
        className={`absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t ${theme.glowGradient} opacity-20 group-hover:opacity-40 transition-all duration-500 pointer-events-none z-[2]`}
      />

      {/* 5. Custom Gradual Blend Overlay (feathering seamlessly beneath the beverage) */}
      <div className="absolute inset-0 menu-card-blend-overlay pointer-events-none z-[3]" />

      {/* 6. Top Floating Category & Status Badges */}
      <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
          {drink.isPopular && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-black shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-black text-black" />
              Popular
            </span>
          )}
          {isNewItem && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-black shadow-md">
              New
            </span>
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md border ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText} shadow-sm`}
          >
            {drink.category.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* 7. Bottom Information Content Shelf (Always visible with Rating & Heart) */}
      <div className="relative z-10 p-4 sm:p-5 pt-0 space-y-2.5">
        {/* Chips & Rating Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Flavor Notes Chips */}
          {drink.flavorNotes && drink.flavorNotes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {drink.flavorNotes.slice(0, 3).map((note) => (
                <span
                  key={note}
                  className="menu-card-chip text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-zinc-200 border border-slate-300 dark:border-white/15 shadow-sm"
                >
                  {note}
                </span>
              ))}
            </div>
          )}

          {/* Prominent Rating Pill */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black shadow-sm ml-auto">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{formatRating(drink.rating)}</span>
          </div>
        </div>

        {/* Title, Tagline and Heart Favorite Button Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="menu-card-title font-display font-black text-lg sm:text-xl text-slate-950 dark:text-white tracking-tight group-hover:text-amber-500 transition-colors drop-shadow-sm truncate">
              {drink.name}
            </h3>
            <p className="menu-card-subtitle text-xs text-slate-700 dark:text-zinc-300 line-clamp-1 mt-0.5 leading-relaxed font-semibold">
              {drink.tagline || drink.description}
            </p>
          </div>

          {/* Prominent Heart Favorite Button */}
          {onToggleFavorite && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              id={`favorite-toggle-${drink.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(drink.id);
              }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Favorited drink' : 'Add to favorites'}
              className={`p-2 rounded-full border shadow-sm transition-all shrink-0 ${
                isFavorite
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-rose-500 dark:bg-white/10 dark:border-white/20 dark:text-zinc-200'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'fill-white text-white' : 'text-slate-700 dark:text-zinc-200'
                }`}
              />
            </motion.button>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="menu-card-divider pt-2.5 border-t border-slate-200 dark:border-white/15 flex items-center justify-between gap-3">
          <div>
            <span className="menu-card-price-label text-[9px] uppercase font-bold text-slate-500 dark:text-zinc-400 block tracking-wider">
              Price
            </span>
            <span className="font-display text-lg sm:text-xl font-black text-slate-950 dark:text-amber-400">
              {formatCurrency(drink.price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.88 }}
              id={`quick-add-${drink.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(drink);
              }}
              title="Add to cart (+)"
              className="menu-card-quick-add p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 transition-all shadow-sm flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-amber-500 stroke-[2.5]" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              id={`order-now-btn-${drink.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onDirectOrder) {
                  onDirectOrder(drink);
                } else {
                  onCustomize(drink);
                }
              }}
              className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Order</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
