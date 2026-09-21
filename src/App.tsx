import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  Flame, 
  Filter, 
  Clock, 
  ShieldCheck, 
  ArrowUpDown, 
  Coffee,
  CheckCircle2,
  X,
  Compass,
  ChevronRight,
  TrendingUp,
  Leaf,
  Heart,
  Gift,
  Award,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { 
  Drink, 
  DrinkCategory, 
  CartItem, 
  Order, 
  DeliveryStatus, 
  DeliveryAddress, 
  PaymentMethod, 
  UserProfile, 
  CustomizationOptions,
  PushNotificationEvent,
  AuthUser,
  UserRole,
  HeroSlide
} from './types';
import { CATEGORIES, MOCK_DRINKS, AVAILABLE_ADD_ONS } from './data/mockDrinks';
import { DEFAULT_HERO_SLIDES } from './data/mockHeroSlides';
import { INITIAL_USER_PROFILE, INITIAL_ORDER_HISTORY } from './data/mockUserData';
import { calculateItemPrice, formatCurrency, safeLocalStorage } from './utils/formatters';
import { triggerPushNotification, ORDER_STATUS_NOTIFICATIONS } from './utils/notifications';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MenuCard } from './components/MenuCard';
import { HomeView } from './components/HomeView';
import { FavoritesView } from './components/FavoritesView';
import { AppDrawer } from './components/AppDrawer';
import { CustomizeModal } from './components/CustomizeModal';
import { CartDrawer } from './components/CartDrawer';
import { LiveTracker } from './components/LiveTracker';
import { OrdersView } from './components/OrdersView';
import { CustomerAccountView } from './components/CustomerAccountView';
import { ReceiptModal } from './components/ReceiptModal';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { AuthModal } from './components/AuthModal';
import { AdminAccountView } from './components/AdminAccountView';
import { AdminDashboard } from './components/AdminDashboard';
import { AppPreloader } from './components/AppPreloader';
import { PWAInstallButton } from './components/PWAInstallButton';
import { useDeviceGestures } from './hooks/useDeviceGestures';
import { useTheme } from './hooks/useTheme';
import { supabase } from './lib/supabase';
import {
  subscribeToDrinks,
  subscribeToOrders,
  subscribeToHeroSlides,
  seedDrinksIfEmpty,
  seedHeroSlidesIfEmpty,
  saveOrderToCloud,
  updateOrderStatusInCloud,
  createDrinkInCloud,
  updateDrinkInCloud,
  deleteDrinkFromCloud,
  toggleDrinkStockInCloud,
  createHeroSlideInCloud,
  updateHeroSlideInCloud,
  deleteHeroSlideFromCloud,
  saveUserProfileToCloud,
  loadUserProfileFromCloud,
  cloudSignOut,
  wipeDatabaseFromCloud,
} from './lib/cloudService';

export default function App() {
  // Theme Auto Detect Hook
  const { themeMode, resolvedTheme, changeTheme } = useTheme();

  // Navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'menu' | 'tracker' | 'orders' | 'favorites' | 'profile'>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Preloader States: Launch & Auth
  const [isAppLaunching, setIsAppLaunching] = useState(true);
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLaunching(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  // Dynamic Drinks Inventory with Persistent Cloud & Local Storage (All items stay persistent)
  const [drinks, setDrinks] = useState<Drink[]>(() => {
    const saved = safeLocalStorage.getItem('immy_drinks_inventory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  useEffect(() => {
    safeLocalStorage.setItem('immy_drinks_inventory', JSON.stringify(drinks));
  }, [drinks]);

  // Dynamic Hero Banner Slides
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = safeLocalStorage.getItem('immy_hero_slides');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_HERO_SLIDES;
  });

  useEffect(() => {
    safeLocalStorage.setItem('immy_hero_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  // Real-time Cloud Subscriptions
  useEffect(() => {
    seedDrinksIfEmpty().catch(console.error);
    seedHeroSlidesIfEmpty().catch(console.error);

    const unsubSlides = subscribeToHeroSlides((slides) => {
      if (slides && slides.length > 0) {
        setHeroSlides(slides);
      }
    });

    const unsubDrinks = subscribeToDrinks((cloudDrinks) => {
      setDrinks((prev) => {
        const cloudIds = new Set((cloudDrinks || []).map((d) => d.id));
        const pendingLocal = prev.filter((d) => !cloudIds.has(d.id) && d.id.startsWith('drink-'));
        return [...pendingLocal, ...(cloudDrinks || [])];
      });
    });

    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrderHistory(cloudOrders);
      }
    });

    return () => {
      unsubSlides();
      unsubDrinks();
      unsubOrders();
    };
  }, []);

  // User & Addresses
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = safeLocalStorage.getItem('immy_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasCashOrMomo = parsed.savedPaymentMethods?.some(
          (pm: any) => pm.type === 'cash' || pm.type === 'mobile_money'
        );

        // Sanitize legacy mock favorites if present from earlier versions
        const legacyFavorites = ['blended-passion-juice', 'yoghurt-mango-mixture', 'smoothie-fruit-mix'];
        const rawFavs: string[] = Array.isArray(parsed.favoriteDrinkIds) ? parsed.favoriteDrinkIds : [];
        const isLegacyOnly = rawFavs.length === 3 && rawFavs.every((id) => legacyFavorites.includes(id));
        const cleanFavorites = isLegacyOnly ? [] : rawFavs;

        const rawAvatar = parsed.avatarUrl || '';
        const cleanAvatar = rawAvatar.includes('unsplash.com') ? '' : rawAvatar;

        return {
          ...INITIAL_USER_PROFILE,
          ...parsed,
          avatarUrl: cleanAvatar,
          savedPaymentMethods: hasCashOrMomo
            ? parsed.savedPaymentMethods
            : INITIAL_USER_PROFILE.savedPaymentMethods,
          favoriteDrinkIds: cleanFavorites,
          notificationPreferences: parsed.notificationPreferences || INITIAL_USER_PROFILE.notificationPreferences,
          loyaltyPoints: parsed.loyaltyPoints ?? 0,
          redeemedVouchers: parsed.redeemedVouchers || [],
        };
      } catch (e) {
        return INITIAL_USER_PROFILE;
      }
    }
    return INITIAL_USER_PROFILE;
  });

  const [activeAddress, setActiveAddress] = useState<DeliveryAddress>(
    userProfile.savedAddresses.find((a) => a.isDefault) || userProfile.savedAddresses[0]
  );

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = safeLocalStorage.getItem('immy_cart') || safeLocalStorage.getItem('sipcraft_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Drink customization modal
  const [customizingDrink, setCustomizingDrink] = useState<Drink | null>(null);

  // Orders & Live Tracking
  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    const saved = safeLocalStorage.getItem('immy_orders') || safeLocalStorage.getItem('sipcraft_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDER_HISTORY;
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    const saved = safeLocalStorage.getItem('immy_active_order') || safeLocalStorage.getItem('sipcraft_active_order');
    return saved ? JSON.parse(saved) : null;
  });

  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DrinkCategory>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'popular' | 'low-cal' | 'dairy-free'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Push Notification State
  const [currentPushEvent, setCurrentPushEvent] = useState<PushNotificationEvent | null>(null);

  // Authentication & App Protection State
  const [authUser, setAuthUser] = useState<AuthUser>(() => {
    const saved = safeLocalStorage.getItem('immy_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      id: '',
      name: '',
      email: '',
      role: 'customer',
      isLoggedIn: false,
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    initialMode: 'signin' | 'signup';
    promptTitle?: string;
    promptSubtitle?: string;
    hideGuestOption?: boolean;
  }>({
    initialMode: 'signin',
    promptTitle: undefined,
    promptSubtitle: undefined,
    hideGuestOption: false,
  });

  const handleOpenAuthModal = (options?: {
    mode?: 'signin' | 'signup';
    title?: string;
    subtitle?: string;
    hideGuest?: boolean;
  }) => {
    setAuthModalConfig({
      initialMode: options?.mode || 'signin',
      promptTitle: options?.title,
      promptSubtitle: options?.subtitle,
      hideGuestOption: options?.hideGuest ?? false,
    });
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    safeLocalStorage.setItem('immy_auth_user', JSON.stringify(authUser));
  }, [authUser]);

  // Hook device system gestures & hardware back button handling
  useDeviceGestures({
    currentTab,
    setCurrentTab,
    customizingDrink,
    setCustomizingDrink,
    isCartOpen,
    setIsCartOpen,
    viewingReceiptOrder,
    setViewingReceiptOrder,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isLoggedIn: authUser.isLoggedIn,
  });

  // Quick Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase Auth session listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = session.user;
        const profile = await loadUserProfileFromCloud(user.id);
        if (profile) {
          setUserProfile((prev) => ({ ...prev, ...profile }));
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Sync state to local storage
  useEffect(() => {
    safeLocalStorage.setItem('immy_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    safeLocalStorage.setItem('immy_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeLocalStorage.setItem('immy_orders', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    if (activeOrder) {
      safeLocalStorage.setItem('immy_active_order', JSON.stringify(activeOrder));
    } else {
      safeLocalStorage.removeItem('immy_active_order');
    }
  }, [activeOrder]);

  // HERO SLIDES CRUD HANDLERS
  const handleCreateHeroSlide = (newSlide: Omit<HeroSlide, 'id'>) => {
    createHeroSlideInCloud(newSlide)
      .then((created) => {
        setHeroSlides((prev) => [created, ...prev]);
        showToast('Created new hero slide banner! ✨');
      })
      .catch((err) => {
        console.error('Failed creating hero slide:', err);
        const fallback: HeroSlide = {
          ...newSlide,
          id: `slide-${Date.now()}`,
          isActive: newSlide.isActive ?? true,
        };
        setHeroSlides((prev) => [fallback, ...prev]);
        showToast('Created new hero slide banner! ✨');
      });
  };

  const handleUpdateHeroSlide = (updatedSlide: HeroSlide) => {
    setHeroSlides((prev) => prev.map((s) => (s.id === updatedSlide.id ? updatedSlide : s)));
    updateHeroSlideInCloud(updatedSlide)
      .then(() => {
        showToast('Updated hero slide successfully! ✅');
      })
      .catch((err) => {
        console.error('Failed updating hero slide:', err);
        showToast('Updated hero slide locally! ✅');
      });
  };

  const handleDeleteHeroSlide = (slideId: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== slideId));
    deleteHeroSlideFromCloud(slideId)
      .then(() => {
        showToast('Deleted hero slide from banner.');
      })
      .catch((err) => {
        console.error('Failed deleting hero slide:', err);
        showToast('Deleted hero slide locally.');
      });
  };

  // DRINKS CRUD HANDLERS (Real-time Cloud Sync + Instant Optimistic UI)
  const handleCreateDrink = async (newDrink: Omit<Drink, 'id'>) => {
    const drinkId = `drink-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const optimisticDrink: Drink = {
      ...newDrink,
      id: drinkId,
      name: newDrink.name || 'New Beverage',
      tagline: newDrink.tagline || 'Fresh handcrafted blend',
      description: newDrink.description || 'Delicious freshly prepared beverage.',
      price: typeof newDrink.price === 'number' && !isNaN(newDrink.price) ? newDrink.price : 5000,
      priceLarge: typeof newDrink.priceLarge === 'number' && !isNaN(newDrink.priceLarge) ? newDrink.priceLarge : undefined,
      category: newDrink.category || 'blended-juices',
      image: newDrink.image || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      calories: typeof newDrink.calories === 'number' ? newDrink.calories : 150,
      rating: typeof newDrink.rating === 'number' ? newDrink.rating : 4.9,
      reviewsCount: typeof newDrink.reviewsCount === 'number' ? newDrink.reviewsCount : 12,
      prepTimeMinutes: typeof newDrink.prepTimeMinutes === 'number' ? newDrink.prepTimeMinutes : 5,
      isPopular: newDrink.isPopular ?? false,
      isNew: newDrink.isNew ?? true,
      isOutOfStock: newDrink.isOutOfStock ?? false,
      flavorNotes: Array.isArray(newDrink.flavorNotes) && newDrink.flavorNotes.length > 0 ? newDrink.flavorNotes : ['Fresh', 'Organic', 'Natural'],
      defaultCustomization: newDrink.defaultCustomization || {
        size: 'standard',
        ice: 'Regular Ice (70%)',
        sweetness: 'Standard (100%)',
        milk: 'No Milk / Black',
        selectedAddOns: [],
      },
    };
    setDrinks((prev) => [optimisticDrink, ...prev.filter((d) => d && d.id !== drinkId)]);
    showToast(`Added "${optimisticDrink.name}" to menu! ✨`);

    try {
      const created = await createDrinkInCloud(optimisticDrink);
      setDrinks((prev) => [created, ...prev.filter((d) => d && d.id !== drinkId)]);
    } catch (err) {
      console.error('Failed creating drink in Firestore cloud:', err);
    }
  };

  const handleUpdateDrink = async (updatedDrink: Drink) => {
    setDrinks((prev) => prev.map((d) => (d.id === updatedDrink.id ? updatedDrink : d)));
    showToast(`Updated "${updatedDrink.name}" successfully! ✅`);
    try {
      await updateDrinkInCloud(updatedDrink);
    } catch (err) {
      console.error('Failed updating drink in Firestore cloud:', err);
    }
  };

  const handleDeleteDrink = async (drinkId: string) => {
    const drinkToDelete = drinks.find((d) => d.id === drinkId);
    setDrinks((prev) => prev.filter((d) => d.id !== drinkId));
    showToast(`Deleted "${drinkToDelete?.name || 'Drink'}" from menu.`);
    try {
      await deleteDrinkFromCloud(drinkId);
    } catch (err) {
      console.error('Failed deleting drink from Firestore cloud:', err);
    }
  };

  const handleToggleDrinkStock = async (drinkId: string) => {
    const target = drinks.find((d) => d.id === drinkId);
    const currentOutOfStock = !!target?.isOutOfStock;
    const nextState = !currentOutOfStock;

    setDrinks((prev) =>
      prev.map((d) => {
        if (d.id === drinkId) {
          return { ...d, isOutOfStock: nextState };
        }
        return d;
      })
    );
    showToast(`${target?.name || 'Drink'} is now ${nextState ? 'Sold Out' : 'In Stock'}`);

    try {
      await toggleDrinkStockInCloud(drinkId, currentOutOfStock);
    } catch (err) {
      console.error('Failed toggling stock in Firestore cloud:', err);
    }
  };

  // ORDER STATUS UPDATE (Admin Operations)
  const handleAdminUpdateOrderStatus = async (orderId: string, newStatus: DeliveryStatus) => {
    setOrderHistory((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);

    try {
      await updateOrderStatusInCloud(orderId, newStatus);
    } catch (err) {
      console.error('Failed updating order status in cloud:', err);
    }
  };

  // Favorite drinks toggle handler
  const handleToggleFavorite = (drinkId: string) => {
    setUserProfile((prev) => {
      const current = prev.favoriteDrinkIds || [];
      const exists = current.includes(drinkId);
      const updated = exists ? current.filter((id) => id !== drinkId) : [...current, drinkId];
      const drinkObj = drinks.find((d) => d.id === drinkId);
      showToast(
        exists
          ? `Removed ${drinkObj?.name || 'drink'} from favorites`
          : `Saved ${drinkObj?.name || 'drink'} to favorites! ❤️`
      );
      return {
        ...prev,
        favoriteDrinkIds: updated,
      };
    });
  };

  // Send Push Notification Helper
  const sendPushNotification = (event: PushNotificationEvent) => {
    triggerPushNotification(event, userProfile.notificationPreferences);
    setCurrentPushEvent(event);
  };

  // Trigger test push alert
  const handleSendTestNotification = () => {
    const testEvent: PushNotificationEvent = {
      id: `test-${Date.now()}`,
      title: 'Immy Drinks Live Notification 🔔',
      message: 'Push alerts and chime tones are connected! You will receive real-time updates when orders are placed and delivered.',
      status: 'placed',
      timestamp: 'Just now',
    };
    sendPushNotification(testEvent);
    showToast('Sent test push notification with chime!');
  };

  // Cart actions
  const handleAddToCart = (drink: Drink, customization?: CustomizationOptions, quantity: number = 1) => {
    const safeCustomization: CustomizationOptions = customization || drink.defaultCustomization || {
      size: 'standard',
      ice: 'Regular Ice (70%)',
      sweetness: 'Standard (100%)',
      milk: 'No Milk / Black',
      selectedAddOns: [],
    };

    const unitPrice = calculateItemPrice(
      drink.price,
      safeCustomization.size,
      safeCustomization.milk,
      safeCustomization.selectedAddOns || [],
      AVAILABLE_ADD_ONS,
      drink.priceLarge
    );

    const newItem: CartItem = {
      cartItemId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      drink,
      customization: safeCustomization,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
    };

    setCart((prev) => [...prev, newItem]);
    showToast(`Added ${quantity}x ${drink.name} to order!`);
  };

  const handleQuickAdd = (drink: Drink) => {
    handleAddToCart(drink, drink.defaultCustomization || {
      size: 'standard',
      ice: 'Regular Ice (70%)',
      sweetness: 'Standard (100%)',
      milk: 'No Milk / Black',
      selectedAddOns: [],
    }, 1);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: item.unitPrice * newQuantity,
            }
          : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Order Placement & Live Tracking initialization
  const handleCheckoutComplete = (orderData: {
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    tip: number;
    discount: number;
    promoCode?: string;
    total: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    deliveryAddress: DeliveryAddress;
    paymentMethod: PaymentMethod;
    pointsUsed?: number;
    voucherUsedId?: string;
  }) => {
    const orderNum = `IMMY-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: 'Just now',
      customerName: orderData.customerName || userProfile.name || 'Prince Fred Kent',
      customerPhone: orderData.customerPhone || userProfile.phone || '0752619129',
      customerEmail: orderData.customerEmail || userProfile.email || 'princefredkent@gmail.com',
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      tip: orderData.tip,
      discount: orderData.discount,
      promoCode: orderData.promoCode,
      total: orderData.total,
      status: 'placed',
      progressPercent: 15,
      estimatedDeliveryTime: 'In ~18-22 mins',
      courier: {
        name: 'Julian Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        vehicle: 'Vespa Sprint 150 (Matte Emerald)',
        phone: '0752619129',
        rating: 4.96,
        deliveredCount: 1421,
      },
      deliveryAddress: orderData.deliveryAddress,
      timeline: [
        {
          status: 'placed',
          title: 'Order Confirmed',
          time: 'Just now',
          description: 'Payment verified and sent to Immy Drinks Barista bar',
          completed: true,
          current: true,
        },
        {
          status: 'packaged',
          title: 'Thermal Packaged',
          time: 'Pending',
          description: 'Sealing beverages with tamper-proof insulated lock',
          completed: false,
          current: false,
        },
        {
          status: 'on_the_way',
          title: 'Courier Dispatched',
          time: 'Pending',
          description: 'Courier en route with temperature-guarded carry bag',
          completed: false,
          current: false,
        },
        {
          status: 'delivered',
          title: 'Delivered',
          time: 'Pending',
          description: 'Handed over directly to recipient',
          completed: false,
          current: false,
        },
      ],
    };

    // Loyalty points calculation
    const pointsEarned = Math.round(orderData.total / 100);
    const pointsUsed = orderData.pointsUsed || 0;
    const totalDrinks = orderData.items.reduce((s, i) => s + i.quantity, 0);

    setUserProfile((prev) => {
      const remainingPoints = Math.max(0, prev.loyaltyPoints - pointsUsed + pointsEarned);
      let updatedVouchers = prev.redeemedVouchers || [];
      if (orderData.voucherUsedId) {
        updatedVouchers = updatedVouchers.map((v) =>
          v.id === orderData.voucherUsedId ? { ...v, isUsed: true } : v
        );
      }

      return {
        ...prev,
        stampsCount: Math.min(10, prev.stampsCount + totalDrinks),
        loyaltyPoints: remainingPoints,
        redeemedVouchers: updatedVouchers,
      };
    });

    // Update active order & history
    setActiveOrder(newOrder);
    setOrderHistory((prev) => [newOrder, ...prev]);
    setCart([]);

    // Send push notification for confirmed order
    const confirmPush: PushNotificationEvent = {
      ...ORDER_STATUS_NOTIFICATIONS.placed,
      id: `push-placed-${newOrder.id}`,
      orderId: newOrder.id,
      timestamp: 'Just now',
    };
    sendPushNotification(confirmPush);

    // Transition immediately to live tracker
    setCurrentTab('tracker');
    showToast(`Order #${orderNum} placed! +${pointsEarned} Immy Points earned!`);
  };

  // Demo order generator for instant test
  const handleStartDemoOrder = () => {
    const demoItems: CartItem[] = [
      {
        cartItemId: `demo-1-${Date.now()}`,
        drink: drinks[0] || MOCK_DRINKS[0],
        customization: (drinks[0] || MOCK_DRINKS[0]).defaultCustomization,
        quantity: 1,
        unitPrice: (drinks[0] || MOCK_DRINKS[0]).price,
        totalPrice: (drinks[0] || MOCK_DRINKS[0]).price,
      },
    ];

    handleCheckoutComplete({
      items: demoItems,
      subtotal: demoItems[0].totalPrice,
      deliveryFee: 1500,
      tip: 0,
      discount: 0,
      total: demoItems[0].totalPrice + 1500,
      customerName: userProfile.name,
      customerPhone: userProfile.phone,
      customerEmail: userProfile.email,
      deliveryAddress: activeAddress,
      paymentMethod: userProfile.savedPaymentMethods[0],
    });
  };

  // Live Tracking simulation step handler for active order
  const handleUpdateOrderStatus = (status: DeliveryStatus) => {
    if (!activeOrder) return;

    let progress = 20;
    if (status === 'brewing') progress = 45;
    if (status === 'packaged') progress = 65;
    if (status === 'on_the_way') progress = 85;
    if (status === 'delivered') progress = 100;

    const updatedTimeline = activeOrder.timeline.map((step) => {
      const orderStatuses: DeliveryStatus[] = ['placed', 'brewing', 'packaged', 'on_the_way', 'delivered'];
      const currentIndex = orderStatuses.indexOf(status);
      const stepIndex = orderStatuses.indexOf(step.status);

      return {
        ...step,
        completed: stepIndex <= currentIndex,
        current: step.status === status,
        time: stepIndex <= currentIndex ? 'Updated just now' : step.time,
      };
    });

    const updatedOrder: Order = {
      ...activeOrder,
      status,
      progressPercent: progress,
      timeline: updatedTimeline,
      estimatedDeliveryTime:
        status === 'delivered'
          ? 'Delivered'
          : status === 'on_the_way'
          ? 'Arriving in ~4 mins'
          : status === 'packaged'
          ? 'Arriving in ~12 mins'
          : 'Arriving in ~18 mins',
    };

    setActiveOrder(updatedOrder);

    // Also update order history entry
    setOrderHistory((prev) =>
      prev.map((ord) => (ord.id === updatedOrder.id ? updatedOrder : ord))
    );
  };

  // Update specific order by ID (e.g. from Admin Cart drawer or Admin Orders page)
  const handleUpdateOrderStatusById = (orderId: string, status: DeliveryStatus) => {
    let progress = 20;
    if (status === 'brewing') progress = 45;
    if (status === 'packaged') progress = 65;
    if (status === 'on_the_way') progress = 85;
    if (status === 'delivered') progress = 100;

    setOrderHistory((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status,
          progressPercent: progress,
          estimatedDeliveryTime:
            status === 'delivered'
              ? 'Delivered'
              : status === 'on_the_way'
              ? 'Arriving in ~4 mins'
              : status === 'packaged'
              ? 'Arriving in ~12 mins'
              : 'Arriving in ~18 mins',
        };
      })
    );

    if (activeOrder && activeOrder.id === orderId) {
      handleUpdateOrderStatus(status);
    }
  };

  // Direct Order handler (bypasses cart completely)
  const handleDirectOrder = (drink: Drink) => {
    const orderNum = `IMMY-${Math.floor(1000 + Math.random() * 9000)}`;
    const custName = authUser.name || userProfile.name || 'Customer';
    const custPhone = authUser.phone || userProfile.phone || '0752619129';
    const custEmail = authUser.email || userProfile.email || '';
    const deliveryAddr = activeAddress || userProfile.savedAddresses[0] || {
      id: 'addr-default',
      label: 'Home',
      street: 'Plot 14, Acacia Avenue, Kololo',
      city: 'Kampala, Uganda',
      isDefault: true,
    };

    const directItem: CartItem = {
      cartItemId: `item-direct-${Date.now()}`,
      drink,
      customization: drink.defaultCustomization,
      quantity: 1,
      unitPrice: drink.price,
      totalPrice: drink.price,
    };

    const deliveryFee = 2000;
    const total = drink.price + deliveryFee;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: 'Just now',
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      items: [directItem],
      subtotal: drink.price,
      deliveryFee,
      tip: 0,
      discount: 0,
      total,
      status: 'placed',
      progressPercent: 20,
      estimatedDeliveryTime: 'In ~18-22 mins',
      courier: {
        name: 'Express Dispatcher',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        vehicle: 'Motorcycle Courier',
        phone: '0752619129',
        rating: 4.96,
        deliveredCount: 1421,
      },
      deliveryAddress: deliveryAddr,
      timeline: [
        {
          status: 'placed',
          title: 'Order Confirmed',
          time: 'Just now',
          description: 'Order placed directly and queued for preparation',
          completed: true,
          current: true,
        },
        {
          status: 'packaged',
          title: 'Packaged & Sealed',
          time: 'Pending',
          description: 'Sealing beverages with tamper-proof insulated lock',
          completed: false,
          current: false,
        },
        {
          status: 'on_the_way',
          title: 'Courier Dispatched',
          time: 'Pending',
          description: 'Courier en route to your delivery address',
          completed: false,
          current: false,
        },
        {
          status: 'delivered',
          title: 'Delivered',
          time: 'Pending',
          description: 'Handed over at doorstep',
          completed: false,
          current: false,
        },
      ],
    };

    // Loyalty points
    const pointsEarned = Math.round(total / 100);
    setUserProfile((prev) => ({
      ...prev,
      stampsCount: Math.min(10, prev.stampsCount + 1),
      loyaltyPoints: (prev.loyaltyPoints || 0) + pointsEarned,
    }));

    // Update active order & history
    setActiveOrder(newOrder);
    setOrderHistory((prev) => [newOrder, ...prev]);

    // Send push notification
    const confirmPush: PushNotificationEvent = {
      ...ORDER_STATUS_NOTIFICATIONS.placed,
      id: `push-placed-${newOrder.id}`,
      orderId: newOrder.id,
      timestamp: 'Just now',
    };
    sendPushNotification(confirmPush);

    // Switch to tracker view directly
    setCurrentTab('tracker');
    showToast(`Order #${orderNum} placed directly for ${drink.name}!`);
  };

  // Cancel Order handler (disallowed if on the way or delivered)
  const handleCancelOrder = (orderId: string) => {
    const order = orderHistory.find((o) => o.id === orderId);
    if (!order) return;

    if (order.status === 'on_the_way' || order.status === 'delivered') {
      showToast('Cannot cancel order once it is on the way or delivered.');
      return;
    }

    const updatedOrders = orderHistory.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'cancelled' as DeliveryStatus,
          progressPercent: 0,
        };
      }
      return o;
    });

    setOrderHistory(updatedOrders);

    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder({
        ...activeOrder,
        status: 'cancelled',
        progressPercent: 0,
      });
    }

    showToast(`Order #${order.orderNumber} has been cancelled.`);
  };

  // Delete Account handler
  const handleDeleteAccount = () => {
    try {
      const storedUsersRaw = safeLocalStorage.getItem('immy_registered_users');
      if (storedUsersRaw) {
        const registeredUsers: any[] = JSON.parse(storedUsersRaw);
        const filteredUsers = registeredUsers.filter(
          (u) =>
            u.id !== authUser.id &&
            u.email !== authUser.email &&
            u.phone !== authUser.phone
        );
        safeLocalStorage.setItem('immy_registered_users', JSON.stringify(filteredUsers));
      }
    } catch (e) {
      // ignore
    }

    safeLocalStorage.removeItem('immy_auth_user');
    safeLocalStorage.removeItem('immy_profile');
    safeLocalStorage.removeItem('immy_active_order');

    setAuthUser({
      id: '',
      name: '',
      email: '',
      role: 'customer',
      isLoggedIn: false,
    });
    setUserProfile(INITIAL_USER_PROFILE);
    setActiveOrder(null);
    setCurrentTab('home');
    showToast('Your account has been deleted successfully.');
  };

  // Customer-specific orders filtering (Prevents new accounts from seeing unplaced mock orders)
  const displayedOrders = useMemo(() => {
    if (authUser.role === 'admin') {
      return orderHistory;
    }

    if (authUser.isLoggedIn) {
      const userEmail = (authUser.email || userProfile.email || '').toLowerCase().trim();
      const userPhone = (authUser.phone || userProfile.phone || '').trim();
      const userName = (authUser.name || userProfile.name || '').toLowerCase().trim();

      return orderHistory.filter((ord) => {
        const ordEmail = (ord.customerEmail || '').toLowerCase().trim();
        const ordPhone = (ord.customerPhone || '').trim();
        const ordName = (ord.customerName || '').toLowerCase().trim();

        const matchEmail = Boolean(userEmail && ordEmail && userEmail === ordEmail);
        const matchPhone = Boolean(userPhone && ordPhone && userPhone === ordPhone);
        const matchName = Boolean(userName && ordName && userName === ordName);

        return matchEmail || matchPhone || matchName;
      });
    }

    // Guest customers see orders created in guest session
    return orderHistory.filter((ord) => 
      ord.customerEmail === 'guest@immydrinks.com' || ord.customerName === 'Guest Customer'
    );
  }, [authUser, userProfile, orderHistory]);

  // Reorder flow
  const handleReorder = (order: Order) => {
    setCart(order.items);
    setIsCartOpen(true);
    showToast(`Loaded ${order.items.length} drink(s) into your bag!`);
  };

  // Filtered & Sorted Drinks
  const filteredDrinks = useMemo(() => {
    let result = (drinks || []).filter(Boolean);

    // Category filter (only when not viewing all favorites)
    if (activeFilter !== 'favorites' && selectedCategory !== 'all') {
      result = result.filter((d) => d.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          (d.name || '').toLowerCase().includes(q) ||
          (d.description || '').toLowerCase().includes(q) ||
          (d.tagline || '').toLowerCase().includes(q) ||
          (Array.isArray(d.flavorNotes) && d.flavorNotes.some((n) => typeof n === 'string' && n.toLowerCase().includes(q)))
      );
    }

    // Tag pills
    if (activeFilter === 'favorites') {
      result = result.filter((d) => userProfile.favoriteDrinkIds?.includes(d.id));
    } else if (activeFilter === 'popular') {
      result = result.filter((d) => d.isPopular);
    } else if (activeFilter === 'low-cal') {
      result = result.filter((d) => (d.calories || 0) <= 180);
    } else if (activeFilter === 'dairy-free') {
      result = result.filter(
        (d) =>
          d.category === 'blended-juices' ||
          d.category === 'smoothies-mixtures' ||
          d.category === 'water-sodas'
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [drinks, selectedCategory, searchQuery, activeFilter, sortBy, userProfile.favoriteDrinkIds]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Filter active delivery to only the current user's genuine order
  const effectiveActiveOrder = useMemo(() => {
    if (!activeOrder || activeOrder.status === 'delivered' || activeOrder.status === 'cancelled') {
      return null;
    }
    if (authUser.role === 'admin') {
      return activeOrder;
    }
    if (authUser.isLoggedIn && authUser.id !== 'guest') {
      const userEmail = (authUser.email || userProfile.email || '').toLowerCase().trim();
      const userPhone = (authUser.phone || userProfile.phone || '').trim();
      const userName = (authUser.name || userProfile.name || '').toLowerCase().trim();

      const ordEmail = (activeOrder.customerEmail || '').toLowerCase().trim();
      const ordPhone = (activeOrder.customerPhone || '').trim();
      const ordName = (activeOrder.customerName || '').toLowerCase().trim();

      const matches =
        (userEmail && ordEmail && userEmail === ordEmail) ||
        (userPhone && ordPhone && userPhone === ordPhone) ||
        (userName && ordName && userName === ordName);
      return matches ? activeOrder : null;
    }
    // Guest customers ONLY see active orders created within their current guest session
    const isGuestOrder =
      activeOrder.customerEmail === 'guest@immydrinks.com' ||
      activeOrder.customerName === 'Guest Customer';
    return isGuestOrder ? activeOrder : null;
  }, [activeOrder, authUser, userProfile]);

  // Active delivery check (hidden if delivered, cancelled, or not belonging to current customer)
  const hasActiveDelivery = Boolean(effectiveActiveOrder);

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#f1f3f7] flex flex-col selection:bg-amber-500 selection:text-black">
      
      {/* App Launching Preloader */}
      {isAppLaunching && (
        <AppPreloader
          isLoading={isAppLaunching}
          type="launch"
          onFinish={() => setIsAppLaunching(false)}
        />
      )}

      {/* Post-Auth Transition Preloader */}
      {isAuthTransitioning && (
        <AppPreloader
          isLoading={isAuthTransitioning}
          type="auth"
          customTitle="Authenticating Session"
          customSubtitle={`Syncing ${authUser.name || 'your'} personalized drink menu & preferences...`}
          onFinish={() => setIsAuthTransitioning(false)}
        />
      )}

      {/* Real-Time Push Notification Banner */}
      <PushNotificationBanner
        event={currentPushEvent}
        onClose={() => setCurrentPushEvent(null)}
        onClickTrack={() => {
          setCurrentTab('tracker');
          setCurrentPushEvent(null);
        }}
      />

      {/* Top Main Navigation (Hidden on Admin Console Dashboard to prevent double headers) */}
      {!(authUser.role === 'admin' && currentTab === 'profile') && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          cartCount={totalCartCount}
          cartTotal={totalCartAmount}
          openCart={() => setIsCartOpen(true)}
          activeAddress={activeAddress}
          savedAddresses={userProfile.savedAddresses}
          onSelectAddress={(addr) => {
            setActiveAddress(addr);
            showToast(`Delivery location set to ${addr.label}`);
          }}
          hasActiveOrder={hasActiveDelivery}
          userRole={authUser.role}
          userProfile={userProfile}
          onOpenAuthModal={() => handleOpenAuthModal({ mode: 'signin' })}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={() => setCurrentTab('menu')}
          recentNotification={currentPushEvent}
        />
      )}

      {/* Side Navigation Drawer */}
      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onNavigate={(tab, cat) => {
          setCurrentTab(tab);
          if (cat) setSelectedCategory(cat);
        }}
        userProfile={userProfile}
        userRole={authUser.role}
        hasActiveOrder={hasActiveDelivery}
        themeMode={themeMode}
        resolvedTheme={resolvedTheme}
        onChangeTheme={changeTheme}
      />

      {/* Main Unified Storefront Application Content */}
      <main className="flex-1 pb-24 md:pb-12">

          {/* VIEW 0: UPGRADED HOME FEED (Matching Design Mockup) */}
          {currentTab === 'home' && (
            <HomeView
              drinks={drinks}
              heroSlides={heroSlides}
              userProfile={userProfile}
              onSelectDrink={(d) => setCustomizingDrink(d)}
              onQuickAdd={handleQuickAdd}
              onToggleFavorite={handleToggleFavorite}
              onNavigateToMenu={(cat) => {
                if (cat) setSelectedCategory(cat);
                setCurrentTab('menu');
              }}
              onNavigateToOrders={() => setCurrentTab('orders')}
              onNavigateToFavorites={() => setCurrentTab('favorites')}
              onShowToast={showToast}
            />
          )}

          {/* VIEW 1: MENU & DISCOVERY */}
          {currentTab === 'menu' && (
            <div className="space-y-6">
              
              {/* Compact, Visually Refined Hero Banner */}
              <div className="relative border-b border-white/10 bg-gradient-to-b from-[#161a22] via-[#12151c] to-[#0d0f14] px-4 sm:px-6 lg:px-8 py-4 sm:py-7 overflow-hidden">
                <div className="absolute -top-24 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6 relative z-10">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-1 sm:mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Immy Drinks · Drink With Distinction</span>
                    </div>
                    <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                      Our Stock Menu & Refreshments
                    </h1>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed hidden sm:block">
                      Blended Juices, Smoothies, Bongo, Kitiribita, Energy Drinks, Bottled Juices & Cakes. For Direct Phone Orders: <span className="text-amber-400 font-bold">0752619129 | 0760535440</span>.
                    </p>
                  </div>

                  {/* Quick Live Tracking CTA if active order exists and is not cancelled/delivered */}
                  {hasActiveDelivery && effectiveActiveOrder && (
                    <button
                      onClick={() => setCurrentTab('tracker')}
                      className="p-3 sm:p-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-left flex items-center justify-between gap-4 transition-all group shadow-xl"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Live Delivery In Transit
                        </div>
                        <p className="font-semibold text-white text-xs sm:text-sm mt-0.5">
                          Order #{effectiveActiveOrder.orderNumber} · {effectiveActiveOrder.estimatedDeliveryTime}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* In-App PWA Install Banner */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PWAInstallButton variant="banner" />
              </div>

              {/* Sticky Search with Merged Sorter & Filter Bar */}
              <div className="sticky top-16 md:top-20 z-30 bg-[#0d0f14]/95 backdrop-blur-md border-b border-white/10 py-3 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-2.5">
                  
                  {/* Unified Search Input with Merged Sort & Filter Trigger */}
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="menu-search-input"
                        type="text"
                        placeholder="Search juices, smoothies, bongo, rock boom, water, cakes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-28 py-2.5 sm:py-3 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                      />

                      {/* Controls inside the search bar */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
                            title="Clear search text"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {/* Merged Sorter & Filter Button */}
                        <button
                          id="toggle-sort-filter-btn"
                          onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
                            activeFilter !== 'all' || sortBy !== 'featured'
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/25'
                              : 'bg-white/10 hover:bg-white/15 text-zinc-200 border-white/10'
                          }`}
                          title="Sort & Filter drinks"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span className="text-[11px] sm:text-xs">
                            {activeFilter !== 'all' || sortBy !== 'featured' ? 'Filtered' : 'Sort & Filter'}
                          </span>
                          {(activeFilter !== 'all' || sortBy !== 'featured') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-black" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Active Filter Chips (Inline under search when active) */}
                    {(activeFilter !== 'all' || sortBy !== 'featured' || searchQuery) && (
                      <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Applied:</span>
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/10 text-xs text-white border border-white/10">
                            "{searchQuery}"
                            <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 text-zinc-400 hover:text-white" /></button>
                          </span>
                        )}
                        {activeFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-xs text-amber-300 border border-amber-500/30">
                            {activeFilter === 'favorites' ? '❤️ Favorites' : activeFilter === 'popular' ? '★ Popular' : activeFilter === 'low-cal' ? '🔥 < 200 kcal' : '🌱 Dairy Free'}
                            <button onClick={() => setActiveFilter('all')}><X className="w-3 h-3 text-amber-300 hover:text-white" /></button>
                          </span>
                        )}
                        {sortBy !== 'featured' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-xs text-amber-300 border border-amber-500/30">
                            Sort: {sortBy === 'rating' ? 'Top Rated ★' : sortBy === 'price-asc' ? '$ Low-High' : '$ High-Low'}
                            <button onClick={() => setSortBy('featured')}><X className="w-3 h-3 text-amber-300 hover:text-white" /></button>
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setActiveFilter('all');
                            setSortBy('featured');
                            setSearchQuery('');
                          }}
                          className="text-[11px] text-zinc-400 hover:text-amber-400 underline ml-1"
                        >
                          Reset all
                        </button>
                      </div>
                    )}

                    {/* Integrated Sort & Filter Popover Panel */}
                    {isFilterDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-[#141722] border border-white/15 rounded-2xl p-4 shadow-2xl z-40 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-bold text-white">Sort & Filter Menu</span>
                          </div>
                          <button
                            onClick={() => setIsFilterDropdownOpen(false)}
                            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Sort By Section */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Sort By</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { id: 'featured', label: 'Featured' },
                              { id: 'rating', label: 'Top Rated ★' },
                              { id: 'price-asc', label: 'Price: Low to High' },
                              { id: 'price-desc', label: 'Price: High to Low' },
                            ].map((option) => (
                              <button
                                key={option.id}
                                onClick={() => setSortBy(option.id as any)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all ${
                                  sortBy === option.id
                                    ? 'bg-white text-black font-bold shadow-md'
                                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Filter Presets Section */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Dietary & Preferences</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {[
                              { id: 'all', label: 'All Crafts' },
                              { 
                                id: 'favorites', 
                                label: `❤️ Favorites (${userProfile.favoriteDrinkIds?.length || 0})` 
                              },
                              { id: 'popular', label: '★ Popular Pick' },
                              { id: 'low-cal', label: '🔥 < 200 kcal' },
                              { id: 'dairy-free', label: '🌱 Dairy Free' },
                            ].map((chip) => (
                              <button
                                key={chip.id}
                                onClick={() => setActiveFilter(chip.id as any)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                  activeFilter === chip.id
                                    ? 'bg-amber-500 text-black shadow-md'
                                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                                }`}
                              >
                                {chip.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              setActiveFilter('all');
                              setSortBy('featured');
                            }}
                            className="text-xs text-zinc-400 hover:text-white"
                          >
                            Reset Filters
                          </button>
                          <button
                            onClick={() => setIsFilterDropdownOpen(false)}
                            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clean Category & Favourites Horizontal Scroller */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
                    {/* Category Pills */}
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id && activeFilter !== 'favorites';
                      return (
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          whileHover={{ y: -1 }}
                          key={cat.id}
                          id={`category-btn-${cat.id}`}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            if (activeFilter === 'favorites') {
                              setActiveFilter('all');
                            }
                          }}
                          className={`relative px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center gap-2 transition-colors shrink-0 ${
                            isSelected
                              ? 'text-black font-extrabold'
                              : 'bg-zinc-800/40 hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="activeCategoryPill"
                              className="absolute inset-0 bg-amber-500 rounded-2xl shadow-md shadow-amber-500/25"
                              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                            />
                          )}
                          <span className="relative z-10">{cat.name}</span>
                          <span className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                            isSelected ? 'bg-black/20 text-black' : 'bg-black/10 dark:bg-white/10 text-slate-600 dark:text-zinc-400'
                          }`}>
                            {cat.id === 'all'
                              ? drinks.length
                              : drinks.filter((d) => d.category === cat.id).length}
                          </span>
                        </motion.button>
                      );
                    })}

                    {/* Favourites Chip in Horizontal Scroller */}
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      whileHover={{ y: -1 }}
                      id="category-btn-favorites"
                      onClick={() => {
                        if (activeFilter === 'favorites') {
                          setActiveFilter('all');
                        } else {
                          setSelectedCategory('all');
                          setActiveFilter('favorites');
                        }
                      }}
                      className={`relative px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-colors shrink-0 ${
                        activeFilter === 'favorites'
                          ? 'text-white font-bold'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {activeFilter === 'favorites' && (
                        <motion.div
                          layoutId="activeCategoryPill"
                          className="absolute inset-0 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/30 border border-rose-400"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <Heart className={`relative z-10 w-3.5 h-3.5 ${activeFilter === 'favorites' ? 'fill-white text-white' : 'fill-rose-400 text-rose-400'}`} />
                      <span className="relative z-10">Favourites</span>
                      <span className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        activeFilter === 'favorites' ? 'bg-black/20 text-white' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {userProfile.favoriteDrinkIds?.length || 0}
                      </span>
                    </motion.button>
                  </div>

                </div>
              </div>

              {/* Drinks Grid */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {filteredDrinks.length === 0 ? (
                  <div className="text-center py-16 bg-[#13161e] rounded-3xl border border-white/10 p-8">
                    {activeFilter === 'favorites' ? (
                      <>
                        <Heart className="w-12 h-12 text-rose-500/60 mx-auto mb-3" />
                        <h3 className="font-display font-bold text-lg text-white">
                          No Favorite Drinks Yet
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                          Tap the heart icon on any beverage card to save your favorite drinks for fast 1-click reordering!
                        </p>
                      </>
                    ) : (
                      <>
                        <Coffee className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <h3 className="font-display font-bold text-lg text-white">
                          No drinks match your filter
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                          Try clearing the search query or switching categories to explore our full menu.
                        </p>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setActiveFilter('all');
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors"
                    >
                      View All Drinks
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredDrinks.map((drink) => (
                      <MenuCard
                        key={drink.id}
                        drink={drink}
                        onCustomize={(d) => setCustomizingDrink(d)}
                        onQuickAdd={handleQuickAdd}
                        onDirectOrder={handleDirectOrder}
                        isFavorite={userProfile.favoriteDrinkIds?.includes(drink.id)}
                        onToggleFavorite={() => handleToggleFavorite(drink.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW 2: LIVE TRACKER */}
          {currentTab === 'tracker' && (
            <LiveTracker
              activeOrder={effectiveActiveOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onStartDemoOrder={handleStartDemoOrder}
              onViewMenu={() => setCurrentTab('menu')}
              onCancelOrder={handleCancelOrder}
            />
          )}

          {/* VIEW 3: ORDER HISTORY */}
          {currentTab === 'orders' && (
            <OrdersView
              orders={displayedOrders}
              activeOrder={effectiveActiveOrder}
              userRole={authUser.role}
              onTrackOrder={(ord) => {
                setActiveOrder(ord);
                setCurrentTab('tracker');
              }}
              onViewReceipt={(ord) => setViewingReceiptOrder(ord)}
              onReorder={handleReorder}
              onBrowseMenu={() => setCurrentTab('menu')}
              onUpdateOrderStatus={handleUpdateOrderStatusById}
              onCancelOrder={handleCancelOrder}
            />
          )}

          {/* VIEW 3.5: FAVORITES VIEW (Matching Design Mockup) */}
          {currentTab === 'favorites' && (
            <FavoritesView
              favoriteDrinkIds={userProfile.favoriteDrinkIds || []}
              allDrinks={drinks}
              onSelectDrink={(d) => setCustomizingDrink(d)}
              onQuickAdd={handleQuickAdd}
              onToggleFavorite={handleToggleFavorite}
              onBrowseMenu={() => setCurrentTab('menu')}
            />
          )}

          {/* VIEW 4: USER PROFILE / ADMIN APP & MENU EDITOR */}
          {currentTab === 'profile' && (
            authUser.role === 'admin' ? (
              <AdminDashboard
                drinks={drinks}
                orders={orderHistory}
                heroSlides={heroSlides}
                onCreateDrink={handleCreateDrink}
                onUpdateDrink={handleUpdateDrink}
                onDeleteDrink={handleDeleteDrink}
                onToggleDrinkStock={handleToggleDrinkStock}
                onUpdateOrderStatus={handleAdminUpdateOrderStatus}
                onCreateHeroSlide={handleCreateHeroSlide}
                onUpdateHeroSlide={handleUpdateHeroSlide}
                onDeleteHeroSlide={handleDeleteHeroSlide}
                onSwitchToCustomerStore={() => setCurrentTab('menu')}
                onWipeDatabase={wipeDatabaseFromCloud}
                adminEmail={authUser.email}
                adminName={authUser.name}
                themeMode={themeMode}
                resolvedTheme={resolvedTheme}
                onChangeTheme={changeTheme}
                onLogout={() => {
                  setAuthUser({
                    id: '',
                    name: '',
                    email: '',
                    role: 'customer',
                    isLoggedIn: false,
                  });
                  showToast('Signed out');
                  setCurrentTab('menu');
                }}
              />
            ) : (
              <CustomerAccountView
                userProfile={userProfile}
                themeMode={themeMode}
                resolvedTheme={resolvedTheme}
                onChangeTheme={changeTheme}
                onUpdateProfile={(updated) => {
                  setUserProfile((prev) => ({ ...prev, ...updated }));
                  showToast('Profile updated successfully');
                }}
                onAddNewAddress={(addr) => {
                  setUserProfile((prev) => ({
                    ...prev,
                    savedAddresses: [...prev.savedAddresses, addr],
                  }));
                  showToast('New address saved');
                }}
                onDeleteAddress={(id) => {
                  setUserProfile((prev) => ({
                    ...prev,
                    savedAddresses: prev.savedAddresses.filter((a) => a.id !== id),
                  }));
                }}
                onSetDefaultAddress={(id) => {
                  setUserProfile((prev) => ({
                    ...prev,
                    savedAddresses: prev.savedAddresses.map((a) => ({
                      ...a,
                      isDefault: a.id === id,
                    })),
                  }));
                  const newDefault = userProfile.savedAddresses.find((a) => a.id === id);
                  if (newDefault) setActiveAddress(newDefault);
                  showToast('Default delivery address updated');
                }}
                onLogout={() => {
                  setAuthUser({
                    id: '',
                    name: '',
                    email: '',
                    role: 'customer',
                    isLoggedIn: false,
                  });
                  showToast('Signed out');
                  setCurrentTab('menu');
                }}
                onDeleteAccount={handleDeleteAccount}
              />
            )
          )}
        </main>

      {/* Auth Portal / App Protection Screen */}
      <AuthModal
        isOpen={isAuthModalOpen || !authUser.isLoggedIn}
        onClose={authUser.isLoggedIn ? () => setIsAuthModalOpen(false) : undefined}
        currentUser={authUser}
        initialMode={authModalConfig.initialMode}
        promptTitle={authModalConfig.promptTitle}
        promptSubtitle={authModalConfig.promptSubtitle}
        hideGuestOption={authModalConfig.hideGuestOption}
        onLogin={(user) => {
          setIsAuthTransitioning(true);
          setAuthUser(user);

          if (user.id === 'guest') {
            // Guest customer: clean slate with 0 pre-selected favorites and 0 pending orders
            setUserProfile({
              name: 'Guest Customer',
              email: 'guest@immydrinks.com',
              phone: '',
              avatarUrl: '',
              loyaltyTier: 'Silver Member',
              loyaltyPoints: 0,
              stampsCount: 0,
              stampsRequiredForFreeDrink: 10,
              favoriteDrinkIds: [],
              notificationPreferences: {
                pushEnabled: true,
                orderUpdates: true,
                brewingAlerts: false,
                outForDelivery: true,
                deliveredAlert: true,
                promotionsAndRewards: true,
                soundEnabled: true,
              },
              redeemedVouchers: [],
              savedAddresses: [
                {
                  id: 'addr-default',
                  label: 'Kampala Delivery',
                  street: 'Plot 14, Acacia Avenue, Kololo',
                  unit: '',
                  city: 'Kampala, Uganda',
                  notes: '',
                  isDefault: true,
                },
              ],
              savedPaymentMethods: [
                {
                  id: 'pm-cash',
                  type: 'cash',
                  label: 'Cash on Delivery',
                  subtitle: 'Pay with cash upon delivery to the courier',
                  cardBrand: 'Cash on Delivery',
                  last4: 'CASH',
                  expiry: 'Pay upon delivery',
                  isDefault: true,
                  comingSoon: false,
                },
              ],
            });
            setActiveOrder(null);
            safeLocalStorage.removeItem('immy_active_order');
          } else if (user.role === 'admin') {
            setUserProfile((prev) => ({
              ...prev,
              name: user.name || 'Prince Fred Kent',
              email: user.email || 'princefredkent@gmail.com',
              phone: user.phone || '0752619129',
            }));
          } else {
            // Logged-in customer
            setUserProfile((prev) => {
              const isMatch = (user.email && prev.email === user.email) || (user.phone && prev.phone === user.phone);
              return {
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone || '',
                authProvider: user.authProvider || prev.authProvider,
                phoneConfirmed: user.phoneConfirmed ?? prev.phoneConfirmed,
                favoriteDrinkIds: isMatch ? (prev.favoriteDrinkIds || []) : [],
              };
            });
            setActiveOrder((prev) => {
              if (!prev) return null;
              const matches =
                (user.email && prev.customerEmail?.toLowerCase() === user.email.toLowerCase()) ||
                (user.phone && prev.customerPhone === user.phone);
              return matches && prev.status !== 'delivered' && prev.status !== 'cancelled' ? prev : null;
            });
          }

          setIsAuthModalOpen(false);
          // Reset auth modal config
          setAuthModalConfig({
            initialMode: 'signin',
            promptTitle: undefined,
            promptSubtitle: undefined,
            hideGuestOption: false,
          });

          setTimeout(() => {
            setIsAuthTransitioning(false);
            showToast(`Welcome, ${user.name}!`);
          }, 600);
        }}
        onLogout={() => {
          setAuthUser({
            id: '',
            name: '',
            email: '',
            role: 'customer',
            isLoggedIn: false,
          });
          showToast('Signed out');
          setCurrentTab('home');
          setIsAuthModalOpen(false);
        }}
      />

      {/* Drink Customization Modal */}
      <CustomizeModal
        drink={customizingDrink}
        allDrinks={drinks}
        onSelectDrink={(d) => setCustomizingDrink(d)}
        onClose={() => setCustomizingDrink(null)}
        onAddToCart={handleAddToCart}
        isFavorite={customizingDrink ? (userProfile.favoriteDrinkIds?.includes(customizingDrink.id) || false) : false}
        onToggleFavorite={() => {
          if (customizingDrink) {
            handleToggleFavorite(customizingDrink.id);
          }
        }}
      />

      {/* Cart Drawer / Checkout Sidebar */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        deliveryAddress={activeAddress}
        savedAddresses={userProfile.savedAddresses}
        onSelectAddress={(addr) => setActiveAddress(addr)}
        paymentMethods={userProfile.savedPaymentMethods}
        userProfile={userProfile}
        onCheckoutComplete={handleCheckoutComplete}
        userRole={authUser.role}
        isGuest={!authUser.isLoggedIn || authUser.id === 'guest'}
        onRequestAuth={(mode = 'signin') => {
          handleOpenAuthModal({
            mode,
            title: 'Sign In or Create Account to Place Your Order',
            subtitle: 'Please log in or create an account so our baristas and courier can confirm your drinks and track live delivery.',
            hideGuest: true,
          });
        }}
        allOrders={orderHistory}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
        onViewReceipt={(ord) => setViewingReceiptOrder(ord)}
      />

      {/* Itemized Receipt Modal */}
      {viewingReceiptOrder && (
        <ReceiptModal
          order={viewingReceiptOrder}
          onClose={() => setViewingReceiptOrder(null)}
          onReorder={handleReorder}
        />
      )}

      {/* Mobile Floating Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        hasActiveOrder={hasActiveDelivery}
        favoritesCount={userProfile.favoriteDrinkIds?.length || 0}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 rounded-2xl bg-amber-500 text-black font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-amber-400">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}
