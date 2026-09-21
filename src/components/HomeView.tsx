import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Coffee, 
  Citrus, 
  CupSoda, 
  Milk, 
  Cake, 
  Zap, 
  Droplet, 
  Heart, 
  Star, 
  Plus, 
  ChevronRight, 
  Copy, 
  Check,
  Flame,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { Drink, DrinkCategory, UserProfile, HeroSlide } from '../types';
import { CATEGORIES } from '../data/mockDrinks';
import { DEFAULT_HERO_SLIDES } from '../data/mockHeroSlides';
import { formatCurrency, formatRating } from '../utils/formatters';

interface HomeViewProps {
  drinks: Drink[];
  userProfile: UserProfile;
  heroSlides?: HeroSlide[];
  onSelectDrink: (drink: Drink) => void;
  onQuickAdd: (drink: Drink) => void;
  onToggleFavorite: (drinkId: string) => void;
  onNavigateToMenu: (categoryId?: DrinkCategory) => void;
  onNavigateToOrders: () => void;
  onNavigateToFavorites: () => void;
  onShowToast: (msg: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  drinks,
  userProfile,
  heroSlides = DEFAULT_HERO_SLIDES,
  onSelectDrink,
  onQuickAdd,
  onToggleFavorite,
  onNavigateToMenu,
  onNavigateToOrders,
  onNavigateToFavorites,
  onShowToast,
}) => {
  const activeSlides = useMemo(() => {
    const list = (heroSlides && heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES).filter(
      (s) => s.isActive !== false
    );
    return list.length > 0 ? list : DEFAULT_HERO_SLIDES;
  }, [heroSlides]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [hasCopiedPromo, setHasCopiedPromo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DrinkCategory>('all');

  // Ensure currentSlide is within bounds when activeSlides change
  useEffect(() => {
    if (currentSlide >= activeSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  // Time-based dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☕' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🍹' };
    return { text: 'Good evening', emoji: '🌙' };
  };

  const greeting = getGreeting();
  const userName = userProfile.name ? userProfile.name.split(' ')[0] : 'Guest';

  // Auto-play hero carousel with direction tracking
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const goToSlide = (idx: number) => {
    setSlideDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSlideDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSlideDirection(1);
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  // Filter popular and best selling drinks
  const popularDrinks = drinks.filter((d) => d.isPopular || d.rating >= 4.85).slice(0, 6);
  const bestSellingDrinks = drinks.slice(0, 6);

  // Copy promo code
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setHasCopiedPromo(true);
    onShowToast(`Promo code "${code}" copied! (20% OFF)`);
    setTimeout(() => setHasCopiedPromo(false), 2500);
  };

  // Helper to render category icon
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      case 'Citrus':
        return <Citrus className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      case 'CupSoda':
        return <CupSoda className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      case 'Milk':
        return <Milk className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      case 'Cake':
        return <Cake className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      case 'Zap':
        return <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      case 'Droplet':
        return <Droplet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
    }
  };

  const activeHero = activeSlides[currentSlide] || activeSlides[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-6 sm:space-y-8"
    >
      
      {/* 1. Dynamic Personalized Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
            <span>{greeting.text}, {userName}!</span>
            <span className="text-xl sm:text-2xl">{greeting.emoji}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            What would you like to sip today?
          </p>
        </div>

        {/* Quick Direct Hotline Callout */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-zinc-400">Direct Hotline:</span>
          <a
            href="tel:0752619129"
            className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold hover:bg-amber-500 hover:text-black transition-all"
          >
            0752619129
          </a>
        </div>
      </div>

      {/* 2. REFINED HERO SLIDER (Side-by-Side Horizontal Layout, Finger-Scrollable & Clickable) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#151720] border border-white/10 shadow-2xl group touch-pan-y cursor-grab active:cursor-grabbing">
        
        {/* Animated Slide Canvas with Touch Swipe / Drag */}
        <div className="relative min-h-[190px] sm:min-h-[220px] md:min-h-[260px] overflow-hidden">
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={activeHero.id}
              custom={slideDirection}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              dragSnapToOrigin={true}
              onDragEnd={(_e, info) => {
                const swipeThreshold = 40;
                if (info.offset.x < -swipeThreshold || info.velocity.x < -200) {
                  handleNextSlide();
                } else if (info.offset.x > swipeThreshold || info.velocity.x > 200) {
                  handlePrevSlide();
                }
              }}
              initial={{ opacity: 0, x: slideDirection > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection > 0 ? -50 : 50 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 p-4 sm:p-7 md:p-8 flex items-center justify-between gap-3 sm:gap-6 z-10 select-none"
            >
              {/* Left Column: Minimal Punchy Words & CTA */}
              <div className="flex-1 max-w-[55%] sm:max-w-[52%] space-y-2 sm:space-y-3 z-10">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                  {activeHero.tag}
                </span>

                <h2 className="font-display font-extrabold text-base sm:text-2xl md:text-3xl text-white tracking-tight leading-snug">
                  {activeHero.highlightWord ? (() => {
                    const escaped = activeHero.highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const parts = activeHero.title.split(new RegExp(`(${escaped})`, 'i'));
                    return parts.length > 1 ? (
                      <>
                        {parts[0]}
                        <span className="text-amber-400 underline decoration-amber-400/40 underline-offset-4">
                          {parts[1]}
                        </span>
                        {parts[2]}
                      </>
                    ) : activeHero.title;
                  })() : activeHero.title}
                </h2>

                <p className="text-[11px] sm:text-xs text-zinc-300 line-clamp-1">
                  {activeHero.subtitle}
                </p>

                <div className="pt-0.5">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    id="hero-order-now-btn"
                    onClick={() => onNavigateToMenu(activeHero.categoryTarget)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-xl transition-all cursor-pointer"
                  >
                    <span>{activeHero.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </motion.button>
                </div>
              </div>

              {/* Right Column: Prominent, Expansive Visual Showcase */}
              <div className="flex-1 max-w-[45%] sm:max-w-[48%] h-full flex items-center justify-end">
                <motion.div 
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="relative w-full h-[155px] sm:h-[190px] md:h-[220px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black/40"
                >
                  <img
                    src={activeHero.image}
                    alt={activeHero.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-400">
                    Freshly Made
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Previous / Next Arrow Controls (Desktop / Hover) */}
          <button
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 hidden sm:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextSlide}
            aria-label="Next Slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 hidden sm:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Interactive Pagination Indicator */}
        <div className="flex items-center justify-center gap-2 pb-3.5 pt-1 relative z-20">
          {activeSlides.map((slide: HeroSlide, idx: number) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? 'w-7 bg-amber-400 shadow-sm shadow-amber-400/50'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>


      {/* 3. Categories Squircles Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight">
            Categories
          </h2>
          <button
            onClick={() => onNavigateToMenu('all')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Finger-Scrollable Flex Track */}
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1.5 snap-x scroll-smooth cursor-grab active:cursor-grabbing">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -2 }}
                key={cat.id}
                id={`home-category-${cat.id}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  onNavigateToMenu(cat.id);
                }}
                className="shrink-0 min-w-[76px] sm:min-w-[90px] flex flex-col items-center gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-[#14161f] hover:bg-[#1a1d29] border border-white/5 hover:border-amber-500/40 text-center transition-all group shadow-md snap-start"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-amber-500/20 border border-amber-500 shadow-md shadow-amber-500/20' 
                    : 'bg-white/10 group-hover:bg-white/15 border border-white/10'
                }`}>
                  {getCategoryIcon(cat.iconName)}
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors leading-tight line-clamp-1">
                  {cat.name.split(' ')[0]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. Popular Drinks Section */}
      {drinks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-[#14161f] border border-white/5 p-8 text-center space-y-4 max-w-lg mx-auto shadow-xl my-6"
        >
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-lg text-white">Menu is being Prepared</h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              We are currently preparing our fresh menu. Please check back shortly or log in as administrator to customize and add delicious drinks to the list!
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigateToMenu('all')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition-all"
            >
              Go to Menu Page
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight">
                Popular Drinks
              </h2>
              <button
                onClick={() => onNavigateToMenu('all')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Popular Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {popularDrinks.map((drink, idx) => {
                const isFav = userProfile.favoriteDrinkIds?.includes(drink.id);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                    key={drink.id}
                    id={`popular-drink-${drink.id}`}
                    onClick={() => onSelectDrink(drink)}
                    className="group relative cursor-pointer bg-[#14161f] border border-white/10 hover:border-amber-500/40 rounded-3xl p-3 sm:p-4 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
                  >
                    {/* Rounded Drink Image with Heart Button */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/40 mb-2.5">
                      <img
                        src={drink.image}
                        alt={drink.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {/* Floating Heart Button */}
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(drink.id);
                        }}
                        aria-label="Toggle favorite"
                        className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md border transition-all ${
                          isFav 
                            ? 'bg-rose-500/60 border-rose-400 text-white' 
                            : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white text-white' : 'text-white'}`} />
                      </motion.button>

                      {/* Rating Tag */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-bold text-white flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{formatRating(drink.rating)}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {drink.name}
                        </h3>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">
                          {drink.tagline}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="font-extrabold text-sm sm:text-base text-amber-400">
                          {formatCurrency(drink.price)}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          whileHover={{ scale: 1.08 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAdd(drink);
                          }}
                          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black shadow-md"
                          title="Quick Add"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* 5. REFINED SPECIAL OFFER BANNER (Horizontal Split, Generous Image Room, Minimal Words) */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#171922] via-[#1a1d29] to-[#201a14] border border-amber-500/30 p-3.5 sm:p-6 shadow-2xl flex items-center justify-between gap-3 sm:gap-6"
          >
            {/* Left Column: Direct Value Proposition & 1-Tap Promo Copy */}
            <div className="flex-1 max-w-[55%] sm:max-w-[50%] space-y-2 text-left">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/30">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Welcome Offer</span>
              </div>

              <h3 className="font-display font-black text-lg sm:text-2xl md:text-3xl text-white tracking-tight leading-tight">
                Get 20% OFF <span className="text-zinc-400 text-xs sm:text-sm font-medium block sm:inline">on your first order</span>
              </h3>

              <div className="pt-1">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleCopyCode('IMMY20')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-all group"
                >
                  <span>Code: <span className="text-amber-800 font-black">IMMY20</span></span>
                  {hasCopiedPromo ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-600 group-hover:text-black" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Right Column: Large, Edge-to-Edge Chilled Drink Visual */}
            <div className="flex-1 max-w-[45%] sm:max-w-[48%] h-[120px] sm:h-[150px] md:h-[170px] relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=85"
                alt="Welcome 20% Offer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-1.5 left-2 right-2 text-center text-[9px] sm:text-[10px] font-extrabold text-amber-300 bg-black/75 py-0.5 rounded-md backdrop-blur-sm border border-amber-400/20">
                20% Discount
              </span>
            </div>
          </motion.div>

          {/* 6. Best Selling Section */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight">
                Best Selling
              </h2>
              <button
                onClick={() => onNavigateToMenu('all')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Best Selling Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bestSellingDrinks.map((drink, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  whileHover={{ y: -2 }}
                  key={drink.id}
                  id={`bestseller-item-${drink.id}`}
                  onClick={() => onSelectDrink(drink)}
                  className="p-3 rounded-2xl bg-[#14161f] hover:bg-[#1a1d29] border border-white/10 hover:border-amber-500/40 flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-lg"
                >
                  {/* Left: Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-white/10">
                    <img
                      src={drink.image}
                      alt={drink.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Middle: Title & Meta */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                      {drink.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {drink.tagline}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5 font-bold">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {formatRating(drink.rating)}
                      </span>
                      <span className="text-[10px] text-zinc-500">•</span>
                      <span className="text-[10px] text-zinc-400">{drink.calories} kcal</span>
                    </div>
                  </div>

                  {/* Right: Price & Amber Square '+' Button */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-extrabold text-xs sm:text-sm text-white">
                      {formatCurrency(drink.price)}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.08 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(drink);
                      }}
                      className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold shadow-md"
                      title="Add to order"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

    </motion.div>
  );
};
