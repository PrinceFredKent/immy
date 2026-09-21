import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Search, 
  Sparkles, 
  Star, 
  Plus, 
  Coffee, 
  ChevronRight, 
  Flame, 
  ArrowRight 
} from 'lucide-react';
import { Drink, UserProfile } from '../types';
import { formatCurrency, formatRating } from '../utils/formatters';

interface FavoritesViewProps {
  favoriteDrinkIds: string[];
  allDrinks: Drink[];
  onSelectDrink: (drink: Drink) => void;
  onQuickAdd: (drink: Drink) => void;
  onToggleFavorite: (drinkId: string) => void;
  onBrowseMenu: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteDrinkIds,
  allDrinks,
  onSelectDrink,
  onQuickAdd,
  onToggleFavorite,
  onBrowseMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteDrinks = allDrinks.filter((d) => d && favoriteDrinkIds.includes(d.id));
  const filteredFavorites = favoriteDrinks.filter((d) =>
    (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.tagline || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6"
    >
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Saved Favorites · {favoriteDrinks.length} Items</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Your Favorite Beverages
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Quick 1-tap reordering for your daily juice, smoothie, bongo & coffee rituals.
          </p>
        </div>

        {/* Search inside favorites */}
        {favoriteDrinks.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search saved drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {favoriteDrinks.length === 0 ? (
        <div className="text-center py-16 bg-[#13161f] rounded-3xl border border-white/10 p-8 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-xl text-white">
            No Favorites Saved Yet
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Tap the heart icon on any beverage card to save your favorite drinks here for instant access anytime!
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={onBrowseMenu}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-xl transition-all"
          >
            <span>Explore Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-sm">No saved favorites match "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-amber-400 underline mt-2"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFavorites.map((drink) => (
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              key={drink.id}
              onClick={() => onSelectDrink(drink)}
              className="group relative cursor-pointer bg-[#14161f] border border-white/10 hover:border-amber-500/40 rounded-3xl p-4 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/40 mb-3.5">
                <img
                  src={drink.image}
                  alt={drink.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Remove from favorites */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(drink.id);
                  }}
                  title="Remove from favorites"
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-rose-500/70 border border-rose-400 text-white backdrop-blur-md shadow-md"
                >
                  <Heart className="w-4 h-4 fill-white" />
                </motion.button>

                {/* Rating & Calories */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {formatRating(drink.rating)}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[11px] text-zinc-300">
                    {drink.calories} kcal
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors">
                    {drink.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {drink.tagline}
                  </p>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                  <span className="font-extrabold text-base sm:text-lg text-amber-400">
                    {formatCurrency(drink.price)}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(drink);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Quick Add</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
