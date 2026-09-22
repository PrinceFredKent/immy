import React from 'react';
import { motion } from 'motion/react';
import { Star, Plus, Sparkles, Heart, ChevronRight } from 'lucide-react';
import { Drink } from '../types';
import { formatCurrency, formatRating, isDrinkNew } from '../utils/formatters';

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
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
      className="group relative cursor-pointer photo-card-overlay bg-[#12151d] border border-white/10 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-amber-500/15 focus:outline-none focus:ring-2 focus:ring-amber-500 h-[460px] sm:h-[500px] w-full"
    >
      {/* Full-Bleed High-Res Drink Image */}
      <img
        src={drink.image}
        alt={drink.name}
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Cinematic Gradient Overlays for Superior Visual Depth & Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-[#0d0f14]/70 via-50% to-black/30 pointer-events-none" />

      {/* Top Floating Action Bar */}
      <div className="relative z-10 p-3.5 sm:p-4 flex items-center justify-between pointer-events-none">
        {/* Left: Badges */}
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
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-zinc-300">
            {drink.category.replace('-', ' ')}
          </span>
        </div>

        {/* Right: Favorite & Rating */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
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
              className={`p-2 rounded-full backdrop-blur-md border transition-all shadow-md ${
                isFavorite
                  ? 'bg-rose-500/50 border-rose-500 text-white'
                  : 'bg-black/65 hover:bg-black/85 text-zinc-300 hover:text-white border-white/20'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isFavorite ? 'fill-white text-white' : 'text-zinc-300'
                }`}
              />
            </motion.button>
          )}

          {/* Rating pill */}
          <div className="px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{formatRating(drink.rating)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Information Card Overlay */}
      <div className="relative z-10 p-4 sm:p-5 pt-0 space-y-2.5">
        {/* Flavor Notes Chips */}
        {drink.flavorNotes && drink.flavorNotes.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {drink.flavorNotes.slice(0, 3).map((note) => (
              <span 
                key={note}
                className="text-[10px] px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300"
              >
                {note}
              </span>
            ))}
          </div>
        )}

        <div>
          <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight group-hover:text-amber-400 transition-colors drop-shadow-md">
            {drink.name}
          </h3>
          <p className="text-xs text-zinc-300 line-clamp-1 mt-0.5 leading-relaxed drop-shadow">
            {drink.tagline || drink.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2.5 border-t border-white/15 flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] uppercase font-semibold text-zinc-400 block tracking-wider">
              Price
            </span>
            <span className="font-display text-lg sm:text-xl font-extrabold text-amber-400 drop-shadow">
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
              className="p-2.5 rounded-2xl bg-black/60 hover:bg-white/20 text-zinc-200 hover:text-white border border-white/20 transition-all shadow-md flex items-center justify-center backdrop-blur-md"
            >
              <Plus className="w-4 h-4 text-amber-400" />
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
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5"
            >
              <span>Order</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
