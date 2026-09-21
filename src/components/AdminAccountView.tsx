import React, { useState } from 'react';
import { ImagePickerInput } from './ImagePickerInput';
import { ThemeSelector } from './ThemeSelector';
import { ThemeMode } from '../hooks/useTheme';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Coffee, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  DollarSign, 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  AlertCircle,
  Power,
  ShieldCheck,
  Sparkles,
  LogOut,
  Save,
  Image as ImageIcon,
  Palette
} from 'lucide-react';
import { Drink, Order, DrinkCategory } from '../types';
import { CATEGORIES } from '../data/mockDrinks';
import { formatCurrency, safeLocalStorage } from '../utils/formatters';

interface AdminAccountViewProps {
  drinks: Drink[];
  orders: Order[];
  onCreateDrink: (newDrink: Omit<Drink, 'id'>) => void;
  onUpdateDrink: (updatedDrink: Drink) => void;
  onDeleteDrink: (drinkId: string) => void;
  onToggleDrinkStock: (drinkId: string) => void;
  adminEmail: string;
  adminName: string;
  onLogout: () => void;
  storeHotline1?: string;
  storeHotline2?: string;
  themeMode?: ThemeMode;
  resolvedTheme?: 'dark' | 'light';
  onChangeTheme?: (mode: ThemeMode) => void;
}

const PRESET_DRINK_IMAGES = [
  { label: 'Tropical Passion', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fresh Mango Juice', url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80' },
  { label: 'Avocado Banana Smoothie', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80' },
  { label: 'Strawberry Delight', url: 'https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&w=800&q=80' },
  { label: 'Yoghurt Shake', url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Energy / Bottled Juice', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bakery Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80' },
  { label: 'Iced Coffee', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80' },
];

export const AdminAccountView: React.FC<AdminAccountViewProps> = ({
  drinks,
  orders,
  onCreateDrink,
  onUpdateDrink,
  onDeleteDrink,
  onToggleDrinkStock,
  adminEmail,
  adminName,
  onLogout,
  storeHotline1 = '0752619129',
  storeHotline2 = '0760535440',
  themeMode = 'system',
  resolvedTheme = 'dark',
  onChangeTheme,
}) => {
  const [adminTab, setAdminTab] = useState<'menu' | 'settings' | 'stats'>('menu');

  // Search & Category Filter inside Menu CRUD
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Drink Modal State (Add / Edit)
  const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(2000);
  const [formPriceLarge, setFormPriceLarge] = useState<number | string>('');
  const [formCategory, setFormCategory] = useState<DrinkCategory>('blended-juices');
  const [formImage, setFormImage] = useState(PRESET_DRINK_IMAGES[0].url);
  const [formCalories, setFormCalories] = useState<number>(110);
  const [formFlavorNotes, setFormFlavorNotes] = useState<string>('Fresh, Natural, Chilled');

  // Delete confirmation
  const [deletingDrinkId, setDeletingDrinkId] = useState<string | null>(null);

  // Store settings state
  const [hotline1, setHotline1] = useState(storeHotline1);
  const [hotline2, setHotline2] = useState(storeHotline2);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status !== 'delivered');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  // Filtered Drinks
  const filteredDrinks = drinks.filter((drink) => {
    if (!drink) return false;
    const matchesCategory = selectedCategory === 'all' || drink.category === selectedCategory;
    const matchesSearch = 
      (drink.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (drink.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (drink.tagline || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingDrink(null);
    setFormName('');
    setFormTagline('Freshly crafted refreshment from Immy Drinks');
    setFormDescription('Delicious natural ingredients prepared with distinction.');
    setFormPrice(2000);
    setFormPriceLarge('');
    setFormCategory('blended-juices');
    setFormImage(PRESET_DRINK_IMAGES[0].url);
    setFormCalories(110);
    setFormFlavorNotes('Fresh, Natural, Chilled');
    setIsDrinkModalOpen(true);
  };

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
    setIsDrinkModalOpen(true);
  };

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

    if (editingDrink) {
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
      });
    } else {
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
        flavorNotes: notesArray.length > 0 ? notesArray : ['Natural', 'Chilled'],
        prepTimeMinutes: 3,
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

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    safeLocalStorage.setItem('immy_hotline_1', hotline1);
    safeLocalStorage.setItem('immy_hotline_2', hotline2);
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Admin Profile & Overview Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#161a24] to-[#12141c] border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                {adminName || 'Admin Account'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">
                Menu & App Editor
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{adminEmail || 'princefredkent@gmail.com'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Drink</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setAdminTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            adminTab === 'menu'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Edit Menu & Stock ({drinks.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            adminTab === 'settings'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>App Settings & Hotlines</span>
        </button>

        <button
          onClick={() => setAdminTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            adminTab === 'stats'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Store Stats & Sales</span>
        </button>
      </div>

      {/* TAB 1: MENU & STOCK CRUD EDITOR */}
      {adminTab === 'menu' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#13161f] border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search menu inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all" className="bg-[#13161f] text-white">All Categories ({drinks.length})</option>
                {CATEGORIES.filter(c => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#13161f] text-white">
                    {c.name} ({drinks.filter(d => d.category === c.id).length})
                  </option>
                ))}
              </select>

              <button
                onClick={openCreateModal}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Item</span>
              </button>
            </div>
          </div>

          {/* Drinks Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrinks.map((drink) => {
              const isOut = Boolean(drink.isOutOfStock);

              return (
                <div
                  key={drink.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isOut
                      ? 'bg-rose-950/10 border-rose-500/20 opacity-75'
                      : 'bg-[#12151d] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={drink.image}
                      alt={drink.name}
                      className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-sm text-white truncate">{drink.name}</h3>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs font-extrabold text-amber-400 whitespace-nowrap">
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
                        {drink.tagline || drink.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                          {drink.category.replace(/-/g, ' ')}
                        </span>
                        {isOut && (
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onToggleDrinkStock(drink.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isOut
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isOut ? 'Set In Stock' : 'Set Sold Out'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(drink)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs transition-colors"
                        title="Edit drink details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingDrinkId(drink.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors"
                        title="Delete drink from menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: STORE APP SETTINGS & HOTLINES */}
      {adminTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-[#13161f] border border-white/10 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" />
              <span>App Details & Direct Hotlines</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Customize customer-facing phone order hotlines, operating details, and delivery parameters.
            </p>
          </div>

          <form onSubmit={handleSaveStoreSettings} className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Primary Phone Hotline (Call & WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hotline1}
                  onChange={(e) => setHotline1(e.target.value)}
                  placeholder="e.g. +256 700 000 000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Secondary Backup Hotline
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hotline2}
                  onChange={(e) => setHotline2(e.target.value)}
                  placeholder="e.g. +256 750 000 000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Delivery Coverage Areas
              </label>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 space-y-1">
                <p className="font-semibold text-white">📍 Kampala Central, Kololo, Nakasero, Acacia, Naguru, Bugolobi</p>
                <p className="text-[11px] text-zinc-400">Insulated thermal dispatch with real-time route monitoring.</p>
              </div>
            </div>

            {onChangeTheme && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    App Display Theme
                  </span>
                </div>
                <ThemeSelector
                  themeMode={themeMode}
                  resolvedTheme={resolvedTheme}
                  onChangeTheme={onChangeTheme}
                />
              </div>
            )}

            {savedSettingsSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Store configuration updated and saved!</span>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save App Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: STORE STATS & METRICS */}
      {adminTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#13161f] border border-white/10">
              <span className="text-xs font-bold uppercase text-zinc-400 block tracking-wider">Total Sales</span>
              <div className="text-2xl font-extrabold text-amber-400 font-display mt-1">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Cumulative platform revenue
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#13161f] border border-white/10">
              <span className="text-xs font-bold uppercase text-zinc-400 block tracking-wider">Pending Orders</span>
              <div className="text-2xl font-extrabold text-white font-display mt-1">
                {pendingOrders.length}
              </div>
              <p className="text-[10px] text-amber-300 mt-1">Awaiting kitchen fulfillment</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#13161f] border border-white/10">
              <span className="text-xs font-bold uppercase text-zinc-400 block tracking-wider">Completed Orders</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-display mt-1">
                {completedOrders.length}
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">Successfully delivered</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#13161f] border border-white/10">
              <span className="text-xs font-bold uppercase text-zinc-400 block tracking-wider">Drinks in Menu</span>
              <div className="text-2xl font-extrabold text-teal-400 font-display mt-1">
                {drinks.length}
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">Active inventory count</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DRINK MODAL */}
      {isDrinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141722] border border-white/15 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingDrink ? `Edit "${editingDrink.name}"` : 'Add New Drink To Menu'}
                </h3>
              </div>
              <button
                onClick={() => setIsDrinkModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDrink} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Drink Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tropical Mango Passion Twist"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dual Portion Pricing: Standard (Required) & Large (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Standard Price (UGX) *
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={500}
                    placeholder="2000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Regular cup portion (required)</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Large Price (UGX)
                    </label>
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Leave blank if single size</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as DrinkCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#141722] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  placeholder="e.g. Freshly squeezed sun-ripened mangoes and passion"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Full Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed description of ingredients, texture, and flavor profile..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <ImagePickerInput
                  label="Drink Photo / Image *"
                  value={formImage}
                  onChange={setFormImage}
                  presets={PRESET_DRINK_IMAGES}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="120"
                    value={formCalories}
                    onChange={(e) => setFormCalories(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                    Flavor Notes (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Tropical, Tangy, Sweet"
                    value={formFlavorNotes}
                    onChange={(e) => setFormFlavorNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDrinkModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm shadow-md"
                >
                  {editingDrink ? 'Save Changes' : 'Create Drink'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE DRINK CONFIRMATION MODAL */}
      {deletingDrinkId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161822] border border-rose-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-white">Delete this drink?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                This will permanently remove the drink from customer storefronts and menu listings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeletingDrinkId(null)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDrink(deletingDrinkId);
                  setDeletingDrinkId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
