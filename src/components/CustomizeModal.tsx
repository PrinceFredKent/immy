import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  Flame, 
  Droplet, 
  Snowflake,
  Clock,
  Heart,
  Star,
  ChevronRight,
  Coffee,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { 
  Drink, 
  DrinkSize, 
  IceLevel, 
  SweetnessLevel, 
  MilkOption, 
  CustomizationOptions 
} from '../types';
import { AVAILABLE_ADD_ONS } from '../data/mockDrinks';
import { calculateItemPrice, formatCurrency, formatRating } from '../utils/formatters';

interface CustomizeModalProps {
  drink: Drink | null;
  allDrinks?: Drink[];
  onSelectDrink?: (drink: Drink) => void;
  onClose: () => void;
  onAddToCart: (drink: Drink, customization: CustomizationOptions, quantity: number) => void;
  onQuickAdd?: (drink: Drink) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (drinkId: string) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  drink,
  allDrinks = [],
  onSelectDrink,
  onClose,
  onAddToCart,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const hasLargeOption = typeof drink?.priceLarge === 'number' && drink.priceLarge > 0;
  const standardPrice = drink?.price || 0;
  const largePrice = hasLargeOption ? drink.priceLarge! : standardPrice;
  const priceDiff = hasLargeOption ? Math.max(0, largePrice - standardPrice) : 0;

  const [size, setSize] = useState<DrinkSize>(
    hasLargeOption && drink?.defaultCustomization?.size === 'large' ? 'large' : 'standard'
  );
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFullScreenPhoto, setIsFullScreenPhoto] = useState(false);

  // Reset states when current drink changes
  useEffect(() => {
    if (drink) {
      const hasLarge = typeof drink.priceLarge === 'number' && drink.priceLarge > 0;
      setSize(hasLarge && drink?.defaultCustomization?.size === 'large' ? 'large' : 'standard');
      setSpecialInstructions('');
      setQuantity(1);
    }
  }, [drink?.id]);

  // Compute related items (same category first, then complementary)
  const relatedDrinks = useMemo(() => {
    if (!drink || allDrinks.length === 0) return [];
    const sameCategory = allDrinks.filter((d) => d.id !== drink.id && d.category === drink.category);
    const otherFavorites = allDrinks.filter((d) => d.id !== drink.id && d.category !== drink.category);
    return [...sameCategory, ...otherFavorites].slice(0, 3);
  }, [drink, allDrinks]);

  const unitPrice = calculateItemPrice(
    drink?.price || 0,
    hasLargeOption ? size : 'standard',
    '',
    [],
    [],
    hasLargeOption ? drink?.priceLarge : undefined
  );

  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    if (!drink) return;
    onAddToCart(
      drink,
      {
        size,
        ice: 'Regular Ice (70%)',
        sweetness: 'Standard (100%)',
        milk: 'No Milk / Black',
        selectedAddOns: [],
        specialInstructions: specialInstructions.trim() || undefined,
      },
      quantity
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {drink && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          
          {/* Background click to dismiss with smooth crossfade */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md" 
            onClick={onClose} 
          />

        {/* Full Screen High-Res Lightbox Modal */}
        <AnimatePresence>
          {isFullScreenPhoto && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-60 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6"
              onClick={() => setIsFullScreenPhoto(false)}
            >
              <div className="flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Immy Drinks View
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display truncate max-w-xs sm:max-w-md">
                    {drink.name}
                  </h3>
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setIsFullScreenPhoto(false)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                  aria-label="Close full view"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex-1 flex items-center justify-center p-2 relative">
                <motion.img
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 25 }}
                  src={drink.image}
                  alt={drink.name}
                  className="max-h-[80vh] max-w-[95vw] sm:max-w-2xl w-auto h-auto object-contain rounded-3xl shadow-2xl ring-1 ring-white/10"
                  referrerPolicy="no-referrer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 z-10 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                <p className="max-w-md truncate text-zinc-300 font-medium">{drink.tagline}</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFullScreenPhoto(false)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-colors"
                >
                  Back to Customization
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Container: Near full-height with fluid spring animation */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-2xl max-h-[92vh] bg-[#12151d] text-white rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden z-10"
        >
          
          {/* Floating Top Controls (Pinned above scroll) */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
            {/* Left: Category Badge & Full Photo Trigger */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase border border-white/15 shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {drink.category.replace('-', ' ')}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsFullScreenPhoto(true)}
                className="px-2.5 py-1 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold border border-white/15 shadow-md flex items-center gap-1 transition-colors"
                title="Expand full photo view"
              >
                <Maximize2 className="w-3 h-3 text-amber-400" />
                <span className="hidden xs:inline">Full Photo</span>
              </motion.button>
            </div>

            {/* Right: Favorite Toggle & Close */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {onToggleFavorite && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.08 }}
                  id={`modal-favorite-toggle-${drink.id}`}
                  onClick={() => onToggleFavorite(drink.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors shadow-md ${
                    isFavorite
                      ? 'bg-rose-500/50 border-rose-500 text-white shadow-rose-500/20'
                      : 'bg-black/75 hover:bg-black/90 text-zinc-200 hover:text-white border-white/20'
                  }`}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  title={isFavorite ? 'Favorited' : 'Favorite this drink'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite ? 'fill-white text-white' : 'text-zinc-200'
                    }`}
                  />
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
                id="close-customize-modal"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/75 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-colors shadow-md"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
            
            {/* Hero Image Viewport (Responsive & proportional height) */}
            <div 
              className="relative photo-card-overlay w-full h-[50vh] sm:h-[55vh] md:h-[60vh] bg-black/90 overflow-hidden cursor-pointer group"
              onClick={() => setIsFullScreenPhoto(true)}
            >
              <img
                src={drink.image}
                alt={drink.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 modal-gradient-overlay pointer-events-none" />
              
              {/* Badges bar on bottom of hero */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-400 flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {formatRating(drink.rating)}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-zinc-100 font-medium flex items-center gap-1 shadow-md">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {drink.calories} kcal
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-zinc-100 font-medium hidden xs:flex items-center gap-1 shadow-md">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {drink.prepTimeMinutes} min prep
                  </span>
                </div>

                <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[10px] text-zinc-200 flex items-center gap-1 shadow-md">
                  <Maximize2 className="w-3 h-3 text-amber-400" />
                  <span>Tap to enlarge</span>
                </div>
              </div>
            </div>

            {/* Drink Details Section */}
            <div className="px-5 sm:px-6 pt-2 space-y-6">
              
              {/* Title, Tagline & Base Price */}
              <div className="border-b border-white/10 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                      {drink.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-medium leading-relaxed">
                      {drink.tagline}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-semibold">Standard</span>
                    <span className="font-display font-black text-xl sm:text-2xl text-amber-400">
                      {formatCurrency(drink.price)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-400 mt-3 leading-relaxed">
                  {drink.description}
                </p>

                {/* Flavor Notes / Blend chips */}
                {drink.flavorNotes && drink.flavorNotes.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
                    <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mr-1">Notes:</span>
                    {drink.flavorNotes.map((note: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium">
                        {note}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Size Selector */}
              <div className="space-y-3">
                {hasLargeOption ? (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <span>Select Portion Size</span>
                      </label>
                      <span className="text-[11px] text-amber-400 font-semibold">
                        {size === 'large' ? `+${formatCurrency(priceDiff)}` : 'Standard'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => setSize('standard')}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                          size === 'standard'
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">Standard Cup</span>
                          {size === 'standard' && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">Regular Size</p>
                        <span className="text-xs font-bold text-amber-400 mt-2 block">
                          {formatCurrency(standardPrice)}
                        </span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={() => setSize('large')}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                          size === 'large'
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">Large Cup</span>
                          {size === 'large' && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">Jumbo Serving</p>
                        <span className="text-xs font-bold text-amber-400 mt-2 block">
                          {formatCurrency(largePrice)}
                        </span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="font-display font-bold text-sm text-white flex items-center gap-2">
                        <span>Portion Size</span>
                      </label>
                      <span className="text-[11px] text-zinc-400 font-medium">Standard</span>
                    </div>
                    <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-white block">Standard Portion</span>
                          <span className="text-[11px] text-zinc-400">Regular serving (Single size)</span>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-amber-400">
                        {formatCurrency(standardPrice)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Special Barista Instructions */}
              <div className="space-y-2">
                <label className="font-display font-bold text-sm text-white flex items-center justify-between">
                  <span>Special Preparation Notes</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra ginger kick, separate straw, no ice on side..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* You might also like / Paired Drinks */}
              {relatedDrinks.length > 0 && onSelectDrink && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-zinc-400">
                      Frequently Paired Together
                    </h4>
                    <span className="text-[10px] text-amber-400 font-semibold">Finger scroll & tap</span>
                  </div>

                  <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2 snap-x scroll-smooth cursor-grab active:cursor-grabbing">
                    {relatedDrinks.map((relDrink) => (
                      <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        key={relDrink.id}
                        onClick={() => onSelectDrink(relDrink)}
                        className="shrink-0 w-32 sm:w-36 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 rounded-2xl p-2.5 transition-all text-left group snap-start"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-black/40 mb-1.5">
                          <img
                            src={relDrink.image}
                            alt={relDrink.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>
                        <h5 className="font-bold text-[11px] text-white truncate group-hover:text-amber-300">
                          {relDrink.name}
                        </h5>
                        <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                          {formatCurrency(relDrink.price)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Sticky Bottom Bar for Adding to Cart */}
          <div className="p-4 sm:p-5 bg-[#0f1117] border-t border-white/10 flex items-center gap-3.5 z-20">
            
            {/* Quantity Controls */}
            <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
              <motion.button
                whileTap={{ scale: 0.85 }}
                id="drink-qty-decrement"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 text-white flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              <span className="w-8 text-center text-sm font-bold text-white">
                {quantity}
              </span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                id="drink-qty-increment"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Add to Cart CTA */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              id="confirm-add-to-cart-btn"
              onClick={handleConfirm}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm sm:text-base flex items-center justify-between shadow-lg shadow-amber-500/25 transition-all"
            >
              <span>Add to Order</span>
              <span>{formatCurrency(totalPrice)}</span>
            </motion.button>

          </div>

        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
