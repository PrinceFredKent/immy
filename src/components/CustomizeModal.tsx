import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  Heart,
  Star,
  Maximize2
} from 'lucide-react';
import { 
  Drink, 
  DrinkSize, 
  CustomizationOptions,
  DrinkFlavor
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
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [flavorError, setFlavorError] = useState(false);

  // Compute available flavors with small individual images
  const availableFlavors: DrinkFlavor[] = useMemo(() => {
    if (!drink) return [];
    if (drink.flavors && drink.flavors.length > 0) {
      return drink.flavors;
    }
    const id = drink.id.toLowerCase();
    const name = drink.name.toLowerCase();
    
    if (id.includes('soda') || name.includes('soda')) {
      return [
        { id: 'soda-pepsi', name: 'Pepsi Cola', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'soda-mirinda-orange', name: 'Mirinda Orange', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'soda-mirinda-fruity', name: 'Mirinda Fruity', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'soda-mountain-dew', name: 'Mountain Dew', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'soda-7up', name: '7UP Crisp Lemon', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'soda-coca-cola', name: 'Coca-Cola Classic', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'soda-fanta-orange', name: 'Fanta Orange', image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=200&q=80', inStock: true },
      ];
    }
    if (id.includes('minute-maid') || name.includes('minute-maid') || name.includes('maid')) {
      return [
        { id: 'mm-mango', name: 'Mango Delight', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'mm-tropical', name: 'Tropical Blend', image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'mm-apple', name: 'Apple Breeze', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'mm-orange', name: 'Orange Pulpy', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=200&q=80', inStock: true },
      ];
    }
    if (id.includes('oner') || name.includes('oner')) {
      return [
        { id: 'oner-mango', name: 'Rich Mango', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'oner-passion', name: 'Tropical Passion', image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'oner-apple', name: 'Crisp Apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=200&q=80', inStock: true },
      ];
    }
    if (id.includes('cake') || name.includes('cake')) {
      return [
        { id: 'cake-vanilla', name: 'Vanilla Sponge', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'cake-chocolate', name: 'Rich Chocolate', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'cake-redvelvet', name: 'Red Velvet', image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=200&q=80', inStock: true },
        { id: 'cake-fruit', name: 'Forest Berry Fruit', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=200&q=80', inStock: true },
      ];
    }
    return [];
  }, [drink]);

  // Compute selected flavor object & active display image
  const currentFlavorObj = useMemo(() => {
    if (!selectedFlavor) return null;
    return availableFlavors.find((f) => f.name === selectedFlavor) || null;
  }, [selectedFlavor, availableFlavors]);

  const activeDisplayImage = (currentFlavorObj && currentFlavorObj.image) 
    ? currentFlavorObj.image 
    : (drink?.image || '');

  // Reset states when current drink changes - NO flavor selected by default
  useEffect(() => {
    if (drink) {
      const hasLarge = typeof drink.priceLarge === 'number' && drink.priceLarge > 0;
      setSize(hasLarge && drink?.defaultCustomization?.size === 'large' ? 'large' : 'standard');
      setSpecialInstructions('');
      setQuantity(1);
      // Explicit requirement: none of the chips must be selected by default
      setSelectedFlavor('');
      setFlavorError(false);
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

    // If item has flavors and none was selected, prompt the user
    if (availableFlavors.length > 0 && !selectedFlavor) {
      setFlavorError(true);
      return;
    }

    const selectedFlavorObj = availableFlavors.find((f) => f.name === selectedFlavor);

    onAddToCart(
      drink,
      {
        size,
        ice: 'Regular Ice (70%)',
        sweetness: 'Standard (100%)',
        milk: 'No Milk / Black',
        selectedAddOns: [],
        specialInstructions: specialInstructions.trim() || undefined,
        selectedFlavor: selectedFlavor || undefined,
        selectedFlavorImage: selectedFlavorObj?.image || undefined,
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
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeDisplayImage}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    src={activeDisplayImage}
                    alt={currentFlavorObj ? `${drink.name} - ${currentFlavorObj.name}` : drink.name}
                    className="max-h-[80vh] max-w-[95vw] sm:max-w-2xl w-auto h-auto object-contain rounded-3xl shadow-2xl ring-1 ring-white/10"
                    referrerPolicy="no-referrer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 z-10 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                <p className="max-w-md truncate text-zinc-300 font-medium">
                  {currentFlavorObj ? `${drink.name} (${currentFlavorObj.name})` : drink.tagline}
                </p>
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
            {/* Left: Category Badge */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase border border-white/15 shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {drink.category.replace('-', ' ')}
              </span>
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
            
            {/* Hero Image Viewport (Responsive & proportional height with smooth animated transitions) */}
            <div 
              className="relative photo-card-overlay w-full h-[50vh] sm:h-[55vh] md:h-[60vh] bg-black overflow-hidden cursor-pointer group select-none"
              onClick={() => setIsFullScreenPhoto(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeDisplayImage}
                  src={activeDisplayImage}
                  alt={currentFlavorObj ? `${drink.name} - ${currentFlavorObj.name}` : drink.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              <div className="absolute inset-0 modal-gradient-overlay pointer-events-none" />

              {/* Flavor indicator badge floating over hero image when a flavor is actively picked */}
              {availableFlavors.length > 0 && currentFlavorObj && (
                <div className="absolute top-14 left-3 z-10 pointer-events-none">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFlavorObj.name}
                      initial={{ opacity: 0, y: -8, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.92 }}
                      transition={{ duration: 0.25 }}
                      className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 shadow-2xl"
                    >
                      {currentFlavorObj.image && (
                        <img
                          src={currentFlavorObj.image}
                          alt={currentFlavorObj.name}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 rounded-md object-cover ring-1 ring-amber-400"
                        />
                      )}
                      <span>{currentFlavorObj.name}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
              
              {/* Badges bar on bottom of hero */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-400 flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {formatRating(drink.rating)}
                  </span>
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

              {/* Dynamic Flavor Selector chips for Soda, Minute Maid, Oner */}
              {availableFlavors.length > 0 && (
                <div className={`space-y-3 pt-1 rounded-2xl p-3 transition-colors ${
                  flavorError && !selectedFlavor
                    ? 'bg-rose-500/10 border border-rose-500/30'
                    : 'bg-transparent'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <span>Select Flavor Choice</span>
                    </label>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      flavorError && !selectedFlavor
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                        : selectedFlavor
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {selectedFlavor ? 'Selected' : 'Required'}
                    </span>
                  </div>

                  {flavorError && !selectedFlavor && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-rose-300 font-medium flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      Please choose your favorite flavor below to preview and add to order.
                    </motion.p>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableFlavors.map((flavor) => {
                      const isSelected = selectedFlavor === flavor.name;
                      const isOutOfStock = flavor.inStock === false;

                      return (
                        <motion.button
                          whileTap={isOutOfStock ? undefined : { scale: 0.96 }}
                          whileHover={isOutOfStock ? undefined : { scale: 1.02 }}
                          type="button"
                          key={flavor.id || flavor.name}
                          disabled={isOutOfStock}
                          onClick={() => {
                            if (isOutOfStock) return;
                            setFlavorError(false);
                            // Set selected flavor (or toggle if clicked again)
                            setSelectedFlavor((prev) => (prev === flavor.name ? '' : flavor.name));
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold transition-all border ${
                            isOutOfStock
                              ? 'bg-zinc-900/40 border-white/5 text-zinc-600 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/50'
                              : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          {/* Small Individual Flavor Image with rounded styling */}
                          {flavor.image ? (
                            <img
                              src={flavor.image}
                              alt={flavor.name}
                              referrerPolicy="no-referrer"
                              className={`w-9 h-9 rounded-lg object-cover ring-1 shrink-0 bg-black/40 transition-transform ${
                                isSelected ? 'ring-amber-400 scale-105' : 'ring-white/15'
                              }`}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[11px] font-bold text-amber-400">
                              {flavor.name.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-xs ${isSelected ? 'font-bold text-amber-300' : 'text-zinc-200'}`}>
                              {flavor.name}
                            </p>
                            {isOutOfStock ? (
                              <span className="text-[9px] text-rose-400 font-medium block">Out of stock</span>
                            ) : isSelected ? (
                              <span className="text-[9px] text-amber-400 font-medium flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Active photo
                              </span>
                            ) : (
                              <span className="text-[9px] text-zinc-400 block truncate">
                                Tap to switch
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

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
