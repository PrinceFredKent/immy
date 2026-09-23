import React, { useState } from 'react';
import { ImagePickerInput } from './ImagePickerInput';
import { 
  ShieldCheck, 
  PackageCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Phone, 
  MapPin, 
  DollarSign, 
  Search, 
  Check, 
  X, 
  Power, 
  ArrowLeft,
  Leaf,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  Flame,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { Drink, Order, DeliveryStatus, DrinkCategory, HeroSlide, DrinkFlavor } from '../types';
import { CATEGORIES } from '../data/mockDrinks';
import { DEFAULT_HERO_SLIDES } from '../data/mockHeroSlides';
import { formatCurrency } from '../utils/formatters';
import { uploadDrinkImage } from '../lib/storageService';

interface AdminDashboardProps {
  drinks: Drink[];
  orders: Order[];
  heroSlides?: HeroSlide[];
  onUpdateOrderStatus: (orderId: string, status: DeliveryStatus) => void;
  onToggleDrinkStock: (drinkId: string) => void;
  onCreateDrink: (newDrink: Omit<Drink, 'id'>) => void;
  onUpdateDrink: (updatedDrink: Drink) => void;
  onDeleteDrink: (drinkId: string) => void;
  onCreateHeroSlide?: (newSlide: Omit<HeroSlide, 'id'>) => void;
  onUpdateHeroSlide?: (updatedSlide: HeroSlide) => void;
  onDeleteHeroSlide?: (slideId: string) => void;
  onSwitchToCustomerStore?: () => void;
  onLogout: () => void;
  onWipeDatabase?: () => Promise<void>;
  adminEmail?: string;
  adminName?: string;
  storeHotline1?: string;
  storeHotline2?: string;
  themeMode?: any;
  resolvedTheme?: 'dark' | 'light';
  onChangeTheme?: (mode: any) => void;
}

const PRESET_DRINK_IMAGES = [
  { label: 'Tropical Passion', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fresh Mango', url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80' },
  { label: 'Avocado Banana Smoothie', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80' },
  { label: 'Strawberry Delight', url: 'https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&w=800&q=80' },
  { label: 'Yoghurt Shake', url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Energy / Bottled Juice', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bakery Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80' },
  { label: 'Iced Soda / Cola', url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80' },
];

const PRESET_HERO_IMAGES = [
  { label: 'Fresh Juices & Mango', url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85' },
  { label: 'Creamy Smoothies & Bongo', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=85' },
  { label: 'Bakery Desserts & Cakes', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85' },
  { label: 'Passion Fruit Mix', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85' },
];

export const FLAVOR_IMAGE_PRESETS = [
  { label: 'Pepsi / Cola', url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=200&q=80' },
  { label: 'Coca-Cola', url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=200&q=80' },
  { label: 'Mirinda Orange', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=200&q=80' },
  { label: 'Mirinda Fruity / Red', url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=200&q=80' },
  { label: 'Mountain Dew', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=200&q=80' },
  { label: '7UP Crisp Lemon', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80' },
  { label: 'Fanta Orange', url: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=200&q=80' },
  { label: 'Mango Delight', url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=200&q=80' },
  { label: 'Tropical Passion', url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=200&q=80' },
  { label: 'Crisp Apple', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=200&q=80' },
  { label: 'Tropical Blend', url: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=200&q=80' },
  { label: 'Vanilla Sponge Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80' },
  { label: 'Rich Chocolate Cake', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=200&q=80' },
  { label: 'Red Velvet Cake', url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=200&q=80' },
  { label: 'Forest Berry Cake', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=200&q=80' },
];

export const FLAVOR_COLLECTION_PRESETS: { label: string; flavors: DrinkFlavor[] }[] = [
  {
    label: 'Soda Flavors',
    flavors: [
      { id: 'soda-pepsi', name: 'Pepsi Cola', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'soda-mirinda-orange', name: 'Mirinda Orange', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'soda-mirinda-fruity', name: 'Mirinda Fruity', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'soda-mountain-dew', name: 'Mountain Dew', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'soda-7up', name: '7UP Crisp Lemon', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'soda-coca-cola', name: 'Coca-Cola Classic', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'soda-fanta-orange', name: 'Fanta Orange', image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=200&q=80', inStock: true },
    ]
  },
  {
    label: 'Minute Maid Flavors',
    flavors: [
      { id: 'mm-mango', name: 'Mango Delight', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'mm-tropical', name: 'Tropical Blend', image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'mm-apple', name: 'Apple Breeze', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'mm-orange', name: 'Orange Pulpy', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=200&q=80', inStock: true },
    ]
  },
  {
    label: 'Oner Juice Flavors',
    flavors: [
      { id: 'oner-mango', name: 'Rich Mango', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'oner-passion', name: 'Tropical Passion', image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'oner-apple', name: 'Crisp Apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=200&q=80', inStock: true },
    ]
  },
  {
    label: 'Bakery Cake Flavors',
    flavors: [
      { id: 'cake-vanilla', name: 'Vanilla Sponge', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'cake-chocolate', name: 'Rich Chocolate', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'cake-redvelvet', name: 'Red Velvet', image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=200&q=80', inStock: true },
      { id: 'cake-fruit', name: 'Forest Berry Fruit', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=200&q=80', inStock: true },
    ]
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  drinks,
  orders,
  heroSlides,
  onUpdateOrderStatus,
  onToggleDrinkStock,
  onCreateDrink,
  onUpdateDrink,
  onDeleteDrink,
  onCreateHeroSlide,
  onUpdateHeroSlide,
  onDeleteHeroSlide,
  onSwitchToCustomerStore,
  onLogout,
  onWipeDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu_crud' | 'slider' | 'inventory' | 'sales' | 'system'>('orders');
  
  // Orders filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all');

  // Menu CRUD states
  const [menuSearch, setMenuSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Drink Modal State (Add / Edit)
  const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);

  // Form Fields for Drink
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(2000);
  const [formPriceLarge, setFormPriceLarge] = useState<number | string>('');
  const [formCategory, setFormCategory] = useState<DrinkCategory>('blended-juices');
  const [formImage, setFormImage] = useState(PRESET_DRINK_IMAGES[0].url);
  const [formCalories, setFormCalories] = useState<number>(110);
  const [formFlavorNotes, setFormFlavorNotes] = useState<string>('Fresh, Natural, Chilled');
  const [formFlavors, setFormFlavors] = useState<DrinkFlavor[]>([]);
  const [flavorImagePickerIndex, setFlavorImagePickerIndex] = useState<number | null>(null);

  // System wipe states
  const [confirmWipeText, setConfirmWipeText] = useState('');
  const [isWipingDb, setIsWipingDb] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);
  const [wipeError, setWipeError] = useState<string | null>(null);

  // AI Generation States & Handler
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateAI = async () => {
    if (!formName.trim()) {
      setAiError('Please enter a drink name first to generate details.');
      return;
    }
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const res = await fetch('/api/generate-drink-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drinkName: formName,
          drinkCategory: formCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok && data.error) {
        let cleanMsg = data.error;
        try {
          const parsed = JSON.parse(data.error);
          if (parsed?.error?.message) cleanMsg = parsed.error.message;
        } catch {}
        throw new Error(cleanMsg);
      }
      if (data.tagline) setFormTagline(data.tagline);
      if (data.description) setFormDescription(data.description);
      if (data.calories) setFormCalories(Number(data.calories));
      if (data.flavorNotes) setFormFlavorNotes(data.flavorNotes);
    } catch (err: any) {
      console.error(err);
      let errorText = err.message || 'An error occurred during AI generation.';
      try {
        const parsed = JSON.parse(errorText);
        if (parsed?.error?.message) errorText = parsed.error.message;
      } catch {}
      setAiError(errorText);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Hero Slide Modal State (Add / Edit)
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Slide Form Fields
  const [slideTitle, setSlideTitle] = useState('');
  const [slideHighlightWord, setSlideHighlightWord] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideCtaText, setSlideCtaText] = useState('Order Now');
  const [slideTag, setSlideTag] = useState('Fresh & Chilled');
  const [slideCategoryTarget, setSlideCategoryTarget] = useState<DrinkCategory>('blended-juices');
  const [slideImage, setSlideImage] = useState(PRESET_HERO_IMAGES[0].url);
  const [slideIsActive, setSlideIsActive] = useState(true);

  // Delete confirmations
  const [deletingDrinkId, setDeletingDrinkId] = useState<string | null>(null);
  const [deletingSlideId, setDeletingSlideId] = useState<string | null>(null);

  const slidesList = heroSlides && heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES;

  const openCreateSlideModal = () => {
    setEditingSlide(null);
    setSlideTitle('100% Fresh Blends & Cold Juices');
    setSlideHighlightWord('Cold Juices');
    setSlideSubtitle('Sun-ripened Ugandan fruits, ice-chilled to perfection.');
    setSlideCtaText('Explore Juices');
    setSlideTag('Natural & Fresh');
    setSlideCategoryTarget('blended-juices');
    setSlideImage(PRESET_HERO_IMAGES[0].url);
    setSlideIsActive(true);
    setIsSlideModalOpen(true);
  };

  const openEditSlideModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideTitle(slide.title);
    setSlideHighlightWord(slide.highlightWord || '');
    setSlideSubtitle(slide.subtitle || '');
    setSlideCtaText(slide.ctaText || 'Order Now');
    setSlideTag(slide.tag || 'Featured');
    setSlideCategoryTarget(slide.categoryTarget || 'all');
    setSlideImage(slide.image);
    setSlideIsActive(slide.isActive !== false);
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle.trim()) return;

    if (editingSlide) {
      if (onUpdateHeroSlide) {
        onUpdateHeroSlide({
          ...editingSlide,
          title: slideTitle.trim(),
          highlightWord: slideHighlightWord.trim(),
          subtitle: slideSubtitle.trim(),
          ctaText: slideCtaText.trim() || 'Order Now',
          tag: slideTag.trim() || 'Featured',
          categoryTarget: slideCategoryTarget,
          image: slideImage.trim() || PRESET_HERO_IMAGES[0].url,
          isActive: slideIsActive,
        });
      }
    } else {
      if (onCreateHeroSlide) {
        onCreateHeroSlide({
          title: slideTitle.trim(),
          highlightWord: slideHighlightWord.trim(),
          subtitle: slideSubtitle.trim(),
          ctaText: slideCtaText.trim() || 'Order Now',
          tag: slideTag.trim() || 'Featured',
          categoryTarget: slideCategoryTarget,
          image: slideImage.trim() || PRESET_HERO_IMAGES[0].url,
          isActive: slideIsActive,
        });
      }
    }
    setIsSlideModalOpen(false);
  };

  // Calculate statistics
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    const matchesSearch = 
      (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.deliveryAddress?.street || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter drinks for CRUD view
  const filteredDrinks = drinks.filter((drink) => {
    if (!drink) return false;
    const matchesCategory = categoryFilter === 'all' || drink.category === categoryFilter;
    const matchesSearch = 
      (drink.name || '').toLowerCase().includes(menuSearch.toLowerCase()) ||
      (drink.description || '').toLowerCase().includes(menuSearch.toLowerCase()) ||
      (drink.tagline || '').toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Open Create Modal
  const openCreateModal = () => {
    setEditingDrink(null);
    setFormName('');
    setFormTagline('Freshly prepared refreshment from Immy Drinks');
    setFormDescription('Delicious natural ingredients prepared with distinction.');
    setFormPrice(2000);
    setFormPriceLarge('');
    setFormCategory('blended-juices');
    setFormImage(PRESET_DRINK_IMAGES[0].url);
    setFormCalories(110);
    setFormFlavorNotes('Fresh, Natural, Chilled');
    setFormFlavors([]);
    setFlavorImagePickerIndex(null);
    setIsDrinkModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (drink: Drink) => {
    setEditingDrink(drink);
    setFormName(drink.name);
    setFormTagline(drink.tagline || '');
    setFormDescription(drink.description || '');
    setFormPrice(drink.price);
    setFormPriceLarge(drink.priceLarge !== undefined && drink.priceLarge !== null ? drink.priceLarge : '');
    setFormCategory(drink.category);
    setFormImage(drink.image);
    setFormCalories(drink.calories || 110);
    setFormFlavorNotes((drink.flavorNotes || []).join(', ') || 'Fresh, Natural');
    setFormFlavors(drink.flavors && Array.isArray(drink.flavors) ? JSON.parse(JSON.stringify(drink.flavors)) : []);
    setFlavorImagePickerIndex(null);
    setIsDrinkModalOpen(true);
  };

  // Handle Save Drink (Create or Update)
  const handleSaveDrink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) return;

    const notesArray = formFlavorNotes
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean);

    const standardPrice = Number(formPrice);
    const parsedLarge = formPriceLarge !== '' ? Number(formPriceLarge) : undefined;
    const largePrice = typeof parsedLarge === 'number' && !isNaN(parsedLarge) && parsedLarge > 0 ? parsedLarge : undefined;

    // Clean up empty flavors
    const cleanedFlavors = formFlavors
      .map((fl) => ({
        ...fl,
        name: (fl.name || '').trim(),
        image: (fl.image || '').trim(),
        inStock: fl.inStock !== false
      }))
      .filter((fl) => fl.name.length > 0);

    if (editingDrink) {
      // Update existing
      onUpdateDrink({
        ...editingDrink,
        name: formName.trim(),
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        price: standardPrice,
        priceLarge: largePrice,
        category: formCategory,
        image: formImage.trim() || PRESET_DRINK_IMAGES[0].url,
        calories: Number(formCalories) || 100,
        rating: typeof editingDrink.rating === 'number' ? editingDrink.rating : 5.0,
        reviewsCount: typeof editingDrink.reviewsCount === 'number' ? editingDrink.reviewsCount : 1,
        prepTimeMinutes: typeof editingDrink.prepTimeMinutes === 'number' ? editingDrink.prepTimeMinutes : 3,
        flavorNotes: notesArray.length > 0 ? notesArray : ['Natural', 'Chilled'],
        flavors: cleanedFlavors.length > 0 ? cleanedFlavors : undefined,
      });
    } else {
      // Create new
      onCreateDrink({
        name: formName.trim(),
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        price: standardPrice,
        priceLarge: largePrice,
        category: formCategory,
        image: formImage.trim() || PRESET_DRINK_IMAGES[0].url,
        calories: Number(formCalories) || 100,
        rating: 5.0,
        reviewsCount: 1,
        isPopular: false,
        isNew: true,
        createdAt: new Date().toISOString(),
        flavorNotes: notesArray.length > 0 ? notesArray : ['Natural', 'Chilled'],
        prepTimeMinutes: 3,
        flavors: cleanedFlavors.length > 0 ? cleanedFlavors : undefined,
        defaultCustomization: {
          size: 'standard',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
          specialInstructions: '',
        },
      });
    }

    setIsDrinkModalOpen(false);
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'placed':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">New Order</span>;
      case 'brewing':
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">Blending & Crafting</span>;
      case 'packaged':
        return <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-bold">Packaged</span>;
      case 'on_the_way':
        return <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">Scooter On Road</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">Completed</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-white pb-24">
      
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#12151d]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-lg sm:text-xl text-white">
                  Immy Drinks <span className="text-amber-400">Admin Console</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                  Full CRUD Access
                </span>
              </div>
              <p className="text-xs text-zinc-400">Manage Drinks, Real-time Stock & Live Orders · 0752619129</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openCreateModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Drink</span>
            </button>

            <button
              onClick={onSwitchToCustomerStore}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="View Customer Storefront"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">View Public Store</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold transition-colors"
            >
              Sign Out
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#13161c] border border-white/10 space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-display">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live Sales Recorded
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#13161c] border border-white/10 space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Active Pending Orders
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white font-display">
              {activeOrders.length}
            </div>
            <p className="text-[10px] text-amber-300">Requires Kitchen Prep</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#13161c] border border-white/10 space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total Menu Drinks
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-teal-400 font-display">
              {drinks.length}
            </div>
            <p className="text-[10px] text-zinc-400">Available across all categories</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#13161c] border border-white/10 space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Completed Orders
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-display">
              {deliveredOrders.length}
            </div>
            <p className="text-[10px] text-zinc-400">Total lifetime fulfilled</p>
          </div>
        </div>

        {/* Top Control Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Orders Management ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu_crud')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'menu_crud'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>Manage Drinks (CRUD & Menu)</span>
          </button>

          <button
            onClick={() => setActiveTab('slider')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'slider'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Hero Slider ({slidesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>Stock Toggles</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'sales'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'system'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Database Operations</span>
          </button>
        </div>

        {/* ================= TAB 1: LIVE ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#13161c] p-3 rounded-2xl border border-white/10">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by order ID or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                {(['all', 'placed', 'brewing', 'packaged', 'on_the_way', 'delivered'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap transition-colors ${
                      statusFilter === st
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-[#13161c] rounded-3xl border border-white/10">
                <Leaf className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">No matching orders found</h4>
                <p className="text-xs text-zinc-400 mt-1">Orders placed by customers will appear in real-time here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#13161c] border border-white/10 space-y-4 hover:border-amber-500/30 transition-all"
                  >
                    
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-extrabold text-amber-400">
                            {order.orderNumber || order.id}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {order.createdAt || order.estimatedDeliveryTime || 'Recently Placed'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-white font-display">
                          {formatCurrency(order.total)}
                        </span>
                        <span className="block text-[10px] text-amber-400 font-bold uppercase">
                          Paid Order
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                          <img
                            src={item.drink.image}
                            alt={item.drink.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">
                              {item.quantity}x {item.drink.name}
                            </h5>
                            <p className="text-[10px] text-amber-300 font-medium flex items-center gap-1 flex-wrap">
                              <span>Size: {item.customization?.size === 'large' ? 'Large (500mls)' : 'Standard (400mls)'}</span>
                              {item.customization?.selectedFlavor && (
                                <>
                                  <span className="text-zinc-500">•</span>
                                  <span className="text-white font-semibold inline-flex items-center gap-1">
                                    {item.customization?.selectedFlavorImage && (
                                      <img
                                        src={item.customization.selectedFlavorImage}
                                        alt={item.customization.selectedFlavor}
                                        referrerPolicy="no-referrer"
                                        className="w-3.5 h-3.5 rounded object-cover ring-1 ring-white/20"
                                      />
                                    )}
                                    <span>{item.customization.selectedFlavor}</span>
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Address & Delivery Details */}
                    {order.deliveryAddress && (
                      <div className="flex items-center justify-between text-xs text-zinc-300 bg-white/5 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            <strong>{order.deliveryAddress.label}:</strong> {order.deliveryAddress.street}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                          <Phone className="w-3.5 h-3.5" />
                          <span>0752619129</span>
                        </div>
                      </div>
                    )}

                    {/* Action Step Controls to update Order Status */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Update Status:</span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'placed')}
                          disabled={order.status === 'placed'}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 disabled:opacity-30"
                        >
                          Placed
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'brewing')}
                          disabled={order.status === 'brewing'}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 disabled:opacity-30"
                        >
                          Brewing
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'packaged')}
                          disabled={order.status === 'packaged'}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 disabled:opacity-30"
                        >
                          Packaged
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'on_the_way')}
                          disabled={order.status === 'on_the_way'}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 disabled:opacity-30"
                        >
                          On The Way
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                          disabled={order.status === 'delivered'}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 disabled:opacity-30"
                        >
                          Delivered
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 2: MENU CRUD (CREATE / READ / UPDATE / DELETE) ================= */}
        {activeTab === 'menu_crud' && (
          <div className="space-y-4">
            
            {/* Header with Search and Create CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#13161c] p-4 rounded-2xl border border-white/10">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search menu drinks to edit or delete..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                      categoryFilter === cat.id
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <button
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Drink</span>
              </button>
            </div>

            {/* Drinks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrinks.map((drink) => (
                <div
                  key={drink.id}
                  className="p-4 rounded-2xl bg-[#13161c] border border-white/10 flex flex-col justify-between gap-4 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={drink.image}
                      alt={drink.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-white truncate">{drink.name}</h4>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs font-extrabold text-amber-400">
                            {formatCurrency(drink.price)}
                          </span>
                          {drink.priceLarge && drink.priceLarge > drink.price && (
                            <span className="text-[10px] text-zinc-400 font-medium">
                              L: {formatCurrency(drink.priceLarge)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                        {drink.description}
                      </p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 text-[10px] font-medium capitalize">
                          {drink.category.replace(/-/g, ' ')}
                        </span>
                        {drink.flavors && drink.flavors.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{drink.flavors.length} Flavors</span>
                          </span>
                        )}
                        {drink.calories && (
                          <span className="text-[10px] text-zinc-500">
                            {drink.calories} kcal
                          </span>
                        )}
                        {drink.isOutOfStock && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit, Delete, Toggle Stock */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => onToggleDrinkStock(drink.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                        drink.isOutOfStock
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{drink.isOutOfStock ? 'Sold Out' : 'In Stock'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(drink)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeletingDrinkId(drink.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Delete Drink"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 3: INVENTORY STOCK STATUS ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#13161c] p-4 rounded-2xl border border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Quick Live Stock Switcher</h3>
                <p className="text-xs text-zinc-400">Toggle drinks in or out of stock instantly on customer storefront.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {drinks.map((drink) => {
                const isOut = Boolean(drink.isOutOfStock);
                return (
                  <div
                    key={drink.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isOut
                        ? 'bg-rose-500/10 border-rose-500/30 opacity-75'
                        : 'bg-[#13161c] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={drink.image}
                        alt={drink.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{drink.name}</h4>
                        <span className="text-xs font-bold text-amber-400">
                          {formatCurrency(drink.price)}
                        </span>
                        <span className="block text-[10px] text-zinc-400 capitalize">
                          {drink.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleDrinkStock(drink.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all ${
                        isOut
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isOut ? 'Sold Out' : 'In Stock'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SALES ANALYTICS ================= */}
        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#13161c] border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Financial Summary</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-zinc-400">Gross Sales</span>
                  <span className="font-bold text-white">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-zinc-400">Total Fulfilled Deliveries</span>
                  <span className="font-bold text-emerald-400">{deliveredOrders.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-zinc-400">Active Order Queue</span>
                  <span className="font-bold text-amber-400">{activeOrders.length}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#13161c] border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Leaf className="w-4 h-4 text-amber-400" />
                <span>Direct Kitchen Contacts</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct phone lines available for custom catering inquiries or high-volume corporate orders:
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <a 
                  href="tel:0752619129" 
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-amber-300 text-xs font-bold flex items-center justify-between hover:bg-white/10"
                >
                  <span>Primary Dispatch</span>
                  <span>0752619129</span>
                </a>
                <a 
                  href="tel:0760535440" 
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-amber-300 text-xs font-bold flex items-center justify-between hover:bg-white/10"
                >
                  <span>Secondary Hot Line</span>
                  <span>0760535440</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: HERO SLIDER MANAGEMENT ================= */}
        {activeTab === 'slider' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#13161c] border border-white/10">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Homepage Hero Carousel Banners</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Create, edit, or toggle promotional hero banners displayed on the customer home screen.
                </p>
              </div>

              <button
                onClick={openCreateSlideModal}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            {/* Slide Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slidesList.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                    slide.isActive !== false
                      ? 'bg-[#13161c] border-amber-500/30'
                      : 'bg-white/5 border-white/10 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Banner Preview */}
                    <div className="relative h-36 rounded-xl overflow-hidden border border-white/10 bg-black/50 photo-card-overlay">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/80 text-black font-extrabold text-[10px] uppercase tracking-wider">
                            {slide.tag || 'Slide #' + (idx + 1)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              slide.isActive !== false
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40'
                            }`}
                          >
                            {slide.isActive !== false ? 'Active Live' : 'Hidden / Disabled'}
                          </span>
                        </div>

                        <div className="text-white">
                          <p className="text-xs font-extrabold leading-snug line-clamp-1">
                            {slide.title}
                          </p>
                          <p className="text-[10px] text-zinc-300 line-clamp-1 mt-0.5">
                            {slide.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata summary */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-zinc-500">CTA Label</span>
                        <span className="font-bold text-amber-300">{slide.ctaText || 'Order Now'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-zinc-500">Target Category</span>
                        <span className="font-bold text-zinc-200 capitalize">
                          {slide.categoryTarget?.replace('-', ' ') || 'All'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
                    <button
                      onClick={() => {
                        if (onUpdateHeroSlide) {
                          onUpdateHeroSlide({
                            ...slide,
                            isActive: slide.isActive === false ? true : false,
                          });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        slide.isActive !== false
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30 hover:bg-zinc-500/30'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{slide.isActive !== false ? 'Live' : 'Hidden'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditSlideModal(slide)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 transition-colors"
                        title="Edit Banner Content"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingSlideId(slide.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Delete Banner Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: DATABASE OPERATIONS ================= */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#13161c] border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Reset & Clear Database</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Completely wipe all stored data collections from cloud Firestore.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>CRITICAL WARNING: Irreversible Operation</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Executing this operation will permanently and immediately delete <strong>all records</strong> across the following collections in your cloud Firestore database:
                </p>
                <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1">
                  <li><strong>Drinks Catalog</strong> (All beverages, recipes, custom price configurations)</li>
                  <li><strong>Orders Database</strong> (All order history, receipts, dispatch status)</li>
                  <li><strong>Homepage Hero Slides</strong> (Custom carousel banners)</li>
                </ul>
                <p className="text-xs text-zinc-300">
                  Since automatic mock data seeding has been completely removed from this version of the application, the database will remain <strong>completely empty</strong>. You must manually add real drink items from the "Manage Drinks" tab.
                </p>
              </div>

              {/* Safety Confirmation Flow */}
              <div className="space-y-3.5 pt-2">
                <p className="text-xs text-white font-bold">
                  To confirm this deletion, type <span className="text-rose-400 font-mono font-black uppercase">WIPE</span> below:
                </p>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type WIPE to confirm"
                    value={confirmWipeText}
                    onChange={(e) => setConfirmWipeText(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-rose-500 text-sm text-white focus:outline-none placeholder:text-zinc-500 w-full sm:max-w-xs font-mono"
                  />

                  <button
                    disabled={confirmWipeText !== 'WIPE' || isWipingDb}
                    onClick={async () => {
                      if (onWipeDatabase) {
                        setIsWipingDb(true);
                        setWipeError(null);
                        setWipeSuccess(false);
                        try {
                          await onWipeDatabase();
                          setWipeSuccess(true);
                          setConfirmWipeText('');
                        } catch (err: any) {
                          setWipeError(err.message || 'Failed to wipe database.');
                        } finally {
                          setIsWipingDb(false);
                        }
                      }
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      confirmWipeText === 'WIPE' && !isWipingDb
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 cursor-pointer'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {isWipingDb ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Wiping Collections...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Completely Wipe Database</span>
                      </>
                    )}
                  </button>
                </div>

                {wipeSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Success! All collections in the cloud database have been completely and permanently deleted. The app now displays a fresh empty canvas.</span>
                  </div>
                )}

                {wipeError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Error: {wipeError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ================= DRINK CREATE / EDIT MODAL ================= */}
      {isDrinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#12151d] border border-white/10 rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                  {editingDrink ? <Edit2 className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingDrink ? `Edit: ${editingDrink.name}` : 'Create New Menu Drink'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Updates will reflect immediately in the public storefront.</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrinkModalOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDrink} className="space-y-3.5 text-xs">
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-zinc-300">
                    Drink Name *
                  </label>
                  <button
                    type="button"
                    disabled={isGeneratingAI || !formName.trim()}
                    onClick={handleGenerateAI}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 ${
                      isGeneratingAI
                        ? 'bg-amber-500/10 text-amber-400 cursor-not-allowed'
                        : !formName.trim()
                        ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                        : 'bg-amber-500/15 hover:bg-amber-500 hover:text-black text-amber-400 cursor-pointer shadow-sm shadow-amber-500/5'
                    }`}
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-400 group-hover:text-inherit" />
                        <span>AI Fill Details</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Fresh Passion & Ginger Cooler"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
                {aiError && (
                  <p className="text-[10px] text-rose-400 mt-1 font-semibold flex items-center gap-1 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{aiError}</span>
                  </p>
                )}
              </div>

              {/* Dual Portion Pricing: Standard (Required) & Large (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1 text-xs">
                    Standard Price (UGX) *
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={500}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm font-semibold"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Regular cup portion (required)</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-zinc-300 text-xs">
                      Large Price (UGX)
                    </label>
                    <span className="text-[10px] font-medium text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  </div>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    placeholder="e.g. 3000"
                    value={formPriceLarge}
                    onChange={(e) => setFormPriceLarge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 text-sm font-semibold"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Leave blank if single size</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as DrinkCategory)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1c202a] border border-white/10 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="blended-juices">Blended Juices</option>
                  <option value="smoothies-mixtures">Smoothies & Mixtures</option>
                  <option value="artisan-teas">Artisan Botanical Teas</option>
                  <option value="bongo-kitiribita">Bongo & Kitiribita</option>
                  <option value="energy-bottled-juices">Oner, Maid & Energy</option>
                  <option value="water-sodas">Water & Sodas</option>
                  <option value="cakes-pastries">Cakes & Bakery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Short Tagline
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. 100% freshly blended tropical juice"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ingredients, tasting notes, and preparation highlights..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <ImagePickerInput
                  label="Drink Image / Photo *"
                  value={formImage}
                  onChange={setFormImage}
                  presets={PRESET_DRINK_IMAGES}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Flavor Notes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formFlavorNotes}
                    onChange={(e) => setFormFlavorNotes(e.target.value)}
                    placeholder="e.g. Sweet Citrus, Mango, Ice"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* ================= FLAVOR CHOICES WITH INDIVIDUAL PHOTOS ================= */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-sm text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Flavor Options & Individual Small Photos</span>
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      Configure selectable flavors with individual images (for Sodas, Minute Maid, Oner Juice, Cakes, etc.).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newId = `fl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                      setFormFlavors((prev) => [
                        ...prev,
                        {
                          id: newId,
                          name: '',
                          image: FLAVOR_IMAGE_PRESETS[0].url,
                          inStock: true,
                        },
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 self-start shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Flavor</span>
                  </button>
                </div>

                {/* Preset loader quick buttons */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mr-1">
                    Quick Presets:
                  </span>
                  {FLAVOR_COLLECTION_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormFlavors(JSON.parse(JSON.stringify(preset.flavors)))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/30 border border-white/10 text-[11px] font-semibold text-zinc-300 hover:text-amber-300 transition-all"
                    >
                      ⚡ {preset.label}
                    </button>
                  ))}
                  {formFlavors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormFlavors([])}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[11px] font-semibold text-rose-300 transition-all ml-auto"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Flavor list items */}
                {formFlavors.length === 0 ? (
                  <div className="p-3.5 rounded-xl border border-dashed border-white/10 text-center bg-white/[0.01]">
                    <p className="text-xs text-zinc-400">No specific flavor options configured for this drink.</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Customers will order this standard drink, or click &ldquo;Add Flavor&rdquo; / select a quick preset above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {formFlavors.map((flavor, idx) => (
                      <div
                        key={flavor.id || idx}
                        className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Mini Thumbnail with Photo Trigger */}
                          <div className="relative group shrink-0">
                            {flavor.image ? (
                              <img
                                src={flavor.image}
                                alt={flavor.name || 'Flavor'}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/20 bg-black"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold text-amber-400">
                                <ImageIcon className="w-5 h-5 text-zinc-400" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setFlavorImagePickerIndex(flavorImagePickerIndex === idx ? null : idx)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white transition-opacity text-[9px] font-bold"
                              title="Change Photo"
                            >
                              Edit
                            </button>
                          </div>

                          {/* Flavor Name Input */}
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={flavor.name}
                              onChange={(e) => {
                                const newName = e.target.value;
                                setFormFlavors((prev) =>
                                  prev.map((f, i) => (i === idx ? { ...f, name: newName } : f))
                                );
                              }}
                              placeholder="e.g. Pepsi Cola, Rich Mango, Vanilla Sponge"
                              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* In Stock toggle button */}
                          <button
                            type="button"
                            onClick={() => {
                              setFormFlavors((prev) =>
                                prev.map((f, i) =>
                                  i === idx ? { ...f, inStock: f.inStock === false ? true : false } : f
                                )
                              );
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0 transition-colors border ${
                              flavor.inStock !== false
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {flavor.inStock !== false ? 'In Stock' : 'Sold Out'}
                          </button>

                          {/* Toggle Image Picker */}
                          <button
                            type="button"
                            onClick={() => setFlavorImagePickerIndex(flavorImagePickerIndex === idx ? null : idx)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors ${
                              flavorImagePickerIndex === idx
                                ? 'bg-amber-500 text-black border-amber-500'
                                : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                            }`}
                            title="Choose image or photo"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>

                          {/* Delete Flavor */}
                          <button
                            type="button"
                            onClick={() => {
                              setFormFlavors((prev) => prev.filter((_, i) => i !== idx));
                              if (flavorImagePickerIndex === idx) setFlavorImagePickerIndex(null);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shrink-0 transition-colors"
                            title="Remove Flavor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Expandable Image Chooser for this Flavor */}
                        {flavorImagePickerIndex === idx && (
                          <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 space-y-2.5 animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Choose Flavor Photo for &quot;{flavor.name || 'Flavor'}&quot;</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setFlavorImagePickerIndex(null)}
                                className="text-zinc-400 hover:text-white text-xs"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Direct URL input & File upload */}
                            <div>
                              <label className="block text-[10px] text-zinc-400 font-semibold mb-1">
                                Image URL or Upload File:
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="url"
                                  value={flavor.image || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormFlavors((prev) =>
                                      prev.map((f, i) => (i === idx ? { ...f, image: val } : f))
                                    );
                                  }}
                                  placeholder="https://... image link"
                                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                                />

                                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/15 flex items-center gap-1 shrink-0">
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      try {
                                        const url = await uploadDrinkImage(file);
                                        setFormFlavors((prev) =>
                                          prev.map((f, i) => (i === idx ? { ...f, image: url } : f))
                                        );
                                      } catch (err) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                          if (typeof ev.target?.result === 'string') {
                                            const dataUrl = ev.target.result;
                                            setFormFlavors((prev) =>
                                              prev.map((f, i) => (i === idx ? { ...f, image: dataUrl } : f))
                                            );
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Preset Quick Images */}
                            <div>
                              <span className="block text-[10px] text-zinc-400 font-semibold mb-1">
                                Pick from High-Quality Flavor Presets:
                              </span>
                              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                {FLAVOR_IMAGE_PRESETS.map((preset) => (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => {
                                      setFormFlavors((prev) =>
                                        prev.map((f, i) => (i === idx ? { ...f, image: preset.url } : f))
                                      );
                                    }}
                                    className={`relative group rounded-lg overflow-hidden border p-1 transition-all text-left ${
                                      flavor.image === preset.url
                                        ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400/50'
                                        : 'border-white/10 bg-white/5 hover:border-white/30'
                                    }`}
                                    title={preset.label}
                                  >
                                    <img
                                      src={preset.url}
                                      alt={preset.label}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-8 object-cover rounded"
                                    />
                                    <span className="text-[9px] line-clamp-1 text-zinc-300 group-hover:text-white mt-1 font-medium">
                                      {preset.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDrinkModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingDrink ? 'Save Changes' : 'Create Drink'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingDrinkId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#12151d] border border-rose-500/30 rounded-3xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Delete this Drink?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                This item will be permanently removed from the customer menu.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingDrinkId(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDrink(deletingDrinkId);
                  setDeletingDrinkId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Delete Drink
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HERO SLIDE CREATE / EDIT MODAL ================= */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#12151d] border border-white/10 rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingSlide ? 'Edit Hero Banner Slide' : 'Add New Hero Banner Slide'}
                  </h3>
                  <p className="text-xs text-zinc-400">Custom dynamic banner on customer home screen</p>
                </div>
              </div>
              <button
                onClick={() => setIsSlideModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Main Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Your perfect tea, delivered to you"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Highlight Word
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. delivered"
                    value={slideHighlightWord}
                    onChange={(e) => setSlideHighlightWord(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  {slideHighlightWord.trim() ? (
                    slideTitle.toLowerCase().includes(slideHighlightWord.trim().toLowerCase()) ? (
                      <p className="text-[10px] text-emerald-400 mt-1">✓ Found in title — will show in amber</p>
                    ) : (
                      <p className="text-[10px] text-red-400 mt-1">⚠ Word not in title — add it to the headline above</p>
                    )
                  ) : (
                    <p className="text-[10px] text-zinc-500 mt-1">Underlined with amber highlight color</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Tag Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Artisan Brews"
                    value={slideTag}
                    onChange={(e) => setSlideTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Crafted fresh with organic botanical herbs."
                  value={slideSubtitle}
                  onChange={(e) => setSlideSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Button CTA Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Order Now"
                    value={slideCtaText}
                    onChange={(e) => setSlideCtaText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Target Category
                  </label>
                  <select
                    value={slideCategoryTarget}
                    onChange={(e) => setSlideCategoryTarget(e.target.value as DrinkCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1d26] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ImagePickerInput
                label="Banner Showcase Image"
                value={slideImage}
                onChange={setSlideImage}
                presets={PRESET_HERO_IMAGES}
              />

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="slide-is-active"
                  checked={slideIsActive}
                  onChange={(e) => setSlideIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                />
                <label htmlFor="slide-is-active" className="text-xs font-bold text-zinc-200 cursor-pointer">
                  Enable and show this slide live on homepage carousel
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSlide ? 'Save Slide' : 'Create Slide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE SLIDE CONFIRMATION MODAL ================= */}
      {deletingSlideId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#12151d] border border-rose-500/30 rounded-3xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Delete this Hero Banner?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                This banner slide will be permanently removed from the homepage carousel.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingSlideId(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteHeroSlide) {
                    onDeleteHeroSlide(deletingSlideId);
                  }
                  setDeletingSlideId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
