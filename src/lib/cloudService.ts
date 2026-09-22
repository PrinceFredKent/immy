/**
 * cloudService.ts — Supabase-backed data service
 * Replaces Firebase/Firestore with Supabase (PostgreSQL + Realtime + Auth + Storage).
 * All public function signatures are preserved so App.tsx callers require minimal changes.
 */

import { supabase } from './supabase';
import {
  Drink,
  Order,
  UserProfile,
  AuthUser,
  DeliveryStatus,
  HeroSlide,
} from '../types';
import { DEFAULT_HERO_SLIDES } from '../data/mockHeroSlides';
import { INITIAL_USER_PROFILE } from '../data/mockUserData';

// ---------------------------------------------------------------------------
// 0. HELPERS
// ---------------------------------------------------------------------------

/** Strip undefined values so Supabase doesn't complain */
export function sanitizeForDb<T>(data: T): T {
  if (data === null || data === undefined) return null as any;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map((item) => sanitizeForDb(item)) as any;
  const clean: any = {};
  for (const [key, value] of Object.entries(data as any)) {
    if (value !== undefined) {
      clean[key] = sanitizeForDb(value);
    }
  }
  return clean;
}

/** Convert a Drink TypeScript object to a snake_case DB row */
function drinkToRow(drink: Drink) {
  return {
    id: drink.id,
    name: drink.name,
    tagline: drink.tagline,
    description: drink.description,
    price: drink.price,
    price_large: drink.priceLarge ?? null,
    category: drink.category,
    image: drink.image,
    calories: drink.calories,
    rating: drink.rating,
    reviews_count: drink.reviewsCount,
    is_popular: drink.isPopular ?? false,
    is_new: drink.isNew ?? false,
    is_out_of_stock: drink.isOutOfStock ?? false,
    flavor_notes: drink.flavorNotes,
    prep_time_minutes: drink.prepTimeMinutes,
    default_customization: {
      ...drink.defaultCustomization,
      flavors: drink.flavors,
    },
  };
}

/** Convert a DB row to a Drink TypeScript object */
function rowToDrink(row: any): Drink {
  const extractedFlavors = Array.isArray(row.flavors)
    ? row.flavors
    : Array.isArray(row.default_customization?.flavors)
    ? row.default_customization.flavors
    : undefined;

  return {
    id: row.id,
    name: row.name || 'Refreshing Beverage',
    tagline: row.tagline || 'Crafted fresh at Immy Drinks',
    description: row.description || '',
    price: typeof row.price === 'number' ? row.price : 2000,
    priceLarge: row.price_large ?? undefined,
    category: row.category || 'blended-juices',
    image: row.image || 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
    calories: typeof row.calories === 'number' ? row.calories : 110,
    rating: typeof row.rating === 'number' ? row.rating : 4.8,
    reviewsCount: typeof row.reviews_count === 'number' ? row.reviews_count : 1,
    isPopular: !!row.is_popular,
    isNew: row.is_new ?? false,
    isOutOfStock: row.is_out_of_stock ?? false,
    flavorNotes: Array.isArray(row.flavor_notes) && row.flavor_notes.length > 0
      ? row.flavor_notes
      : ['Fresh', 'Natural'],
    prepTimeMinutes: typeof row.prep_time_minutes === 'number' ? row.prep_time_minutes : 3,
    defaultCustomization: row.default_customization || {
      size: 'standard',
      ice: 'Regular Ice (70%)',
      sweetness: 'Standard (100%)',
      milk: 'No Milk / Black',
      selectedAddOns: [],
      specialInstructions: '',
    },
    flavors: extractedFlavors,
  };
}

/** Convert an Order to a DB row */
function orderToRow(order: Order) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName || '',
    customer_phone: order.customerPhone || '',
    customer_email: order.customerEmail || '',
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    tip: order.tip,
    discount: order.discount,
    promo_code: order.promoCode ?? null,
    total: order.total,
    status: order.status,
    progress_percent: order.progressPercent,
    estimated_delivery_time: order.estimatedDeliveryTime,
    courier: order.courier,
    delivery_address: order.deliveryAddress,
    timeline: order.timeline,
    courier_coordinates: order.courierCoordinates ?? null,
  };
}

/** Convert a DB row to an Order TypeScript object */
function rowToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at || 'Recently',
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    items: row.items || [],
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    tip: row.tip,
    discount: row.discount,
    promoCode: row.promo_code ?? undefined,
    total: row.total,
    status: row.status as DeliveryStatus,
    progressPercent: row.progress_percent,
    estimatedDeliveryTime: row.estimated_delivery_time,
    courier: row.courier,
    deliveryAddress: row.delivery_address,
    timeline: row.timeline || [],
    courierCoordinates: row.courier_coordinates ?? undefined,
  };
}

/** Convert a HeroSlide to a DB row */
function slideToRow(slide: HeroSlide) {
  return {
    id: slide.id,
    title: slide.title,
    highlight_word: slide.highlightWord,
    subtitle: slide.subtitle,
    cta_text: slide.ctaText,
    image: slide.image,
    tag: slide.tag,
    category_target: slide.categoryTarget,
    is_active: slide.isActive ?? true,
  };
}

/** Convert a DB row to a HeroSlide */
function rowToSlide(row: any): HeroSlide {
  return {
    id: row.id,
    title: row.title,
    highlightWord: row.highlight_word,
    subtitle: row.subtitle,
    ctaText: row.cta_text,
    image: row.image,
    tag: row.tag,
    categoryTarget: row.category_target,
    isActive: row.is_active ?? true,
  };
}

// ---------------------------------------------------------------------------
// 1. DRINKS
// ---------------------------------------------------------------------------

export async function seedDrinksIfEmpty(): Promise<void> {
  console.log('Automatic database seeding is disabled. Add drinks via the admin panel.');
}

export function subscribeToDrinks(onUpdate: (drinks: Drink[]) => void): () => void {
  // Initial load
  supabase
    .from('drinks')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.warn('Error loading drinks:', error.message);
        onUpdate([]);
        return;
      }
      onUpdate((data || []).map(rowToDrink));
    });

  // Real-time subscription
  const channel = supabase
    .channel('drinks-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'drinks' },
      async () => {
        // Re-fetch the full list on any change for simplicity
        const { data } = await supabase
          .from('drinks')
          .select('*')
          .order('created_at', { ascending: false });
        onUpdate((data || []).map(rowToDrink));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function createDrinkInCloud(newDrink: Omit<Drink, 'id'> & { id?: string }): Promise<Drink> {
  const id = newDrink.id || `drink-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const fullDrink: Drink = {
    ...newDrink,
    id,
    isPopular: newDrink.isPopular ?? false,
    isNew: newDrink.isNew ?? true,
    isOutOfStock: newDrink.isOutOfStock ?? false,
  };

  const { error } = await supabase
    .from('drinks')
    .upsert(sanitizeForDb(drinkToRow(fullDrink)));

  if (error) throw new Error(error.message);
  return fullDrink;
}

export async function updateDrinkInCloud(drink: Drink): Promise<void> {
  const row = sanitizeForDb(drinkToRow(drink));
  const { error } = await supabase
    .from('drinks')
    .update(row)
    .eq('id', drink.id);
  if (error) throw new Error(error.message);
}

export async function deleteDrinkFromCloud(drinkId: string): Promise<void> {
  const { error } = await supabase.from('drinks').delete().eq('id', drinkId);
  if (error) throw new Error(error.message);
}

export async function toggleDrinkStockInCloud(drinkId: string, currentOutOfStock: boolean): Promise<void> {
  const { error } = await supabase
    .from('drinks')
    .update({ is_out_of_stock: !currentOutOfStock })
    .eq('id', drinkId);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// 2. HERO SLIDES
// ---------------------------------------------------------------------------

export async function seedHeroSlidesIfEmpty(): Promise<void> {
  console.log('Automatic hero slide seeding is disabled.');
}

export function subscribeToHeroSlides(onUpdate: (slides: HeroSlide[]) => void): () => void {
  // Initial load
  supabase
    .from('hero_slides')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.warn('Error loading hero slides:', error.message);
        onUpdate(DEFAULT_HERO_SLIDES);
        return;
      }
      if (!data || data.length === 0) {
        onUpdate(DEFAULT_HERO_SLIDES);
      } else {
        onUpdate(data.map(rowToSlide));
      }
    });

  const channel = supabase
    .channel('slides-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'hero_slides' },
      async () => {
        const { data } = await supabase
          .from('hero_slides')
          .select('*')
          .order('created_at', { ascending: false });
        onUpdate(data && data.length > 0 ? data.map(rowToSlide) : DEFAULT_HERO_SLIDES);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function createHeroSlideInCloud(newSlide: Omit<HeroSlide, 'id'>): Promise<HeroSlide> {
  const id = `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const fullSlide: HeroSlide = { ...newSlide, id, isActive: newSlide.isActive ?? true };
  const { error } = await supabase
    .from('hero_slides')
    .insert(sanitizeForDb(slideToRow(fullSlide)));
  if (error) throw new Error(error.message);
  return fullSlide;
}

export async function updateHeroSlideInCloud(slide: HeroSlide): Promise<void> {
  const { error } = await supabase
    .from('hero_slides')
    .update(sanitizeForDb(slideToRow(slide)))
    .eq('id', slide.id);
  if (error) throw new Error(error.message);
}

export async function deleteHeroSlideFromCloud(slideId: string): Promise<void> {
  const { error } = await supabase.from('hero_slides').delete().eq('id', slideId);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// 3. ORDERS
// ---------------------------------------------------------------------------

export function subscribeToOrders(onUpdate: (orders: Order[]) => void): () => void {
  // Initial load
  supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.warn('Error loading orders:', error.message);
        return;
      }
      if (data && data.length > 0) {
        onUpdate(data.map(rowToOrder));
      }
    });

  const channel = supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      async () => {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          onUpdate(data.map(rowToOrder));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function saveOrderToCloud(order: Order): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const row = {
    ...sanitizeForDb(orderToRow(order)),
    user_id: user?.id ?? null,
  };
  const { error } = await supabase.from('orders').upsert(row);
  if (error) throw new Error(error.message);
}

export async function updateOrderStatusInCloud(orderId: string, status: DeliveryStatus): Promise<void> {
  const progressPercent =
    status === 'placed' ? 15 :
    status === 'brewing' ? 40 :
    status === 'packaged' ? 65 :
    status === 'on_the_way' ? 85 :
    status === 'delivered' ? 100 : 0;

  const { error } = await supabase
    .from('orders')
    .update({ status, progress_percent: progressPercent })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// 4. USER PROFILES
// ---------------------------------------------------------------------------

function profileToRow(userId: string, profile: UserProfile) {
  return {
    id: userId,
    name: profile.name,
    phone: profile.phone,
    avatar_url: profile.avatarUrl,
    loyalty_tier: profile.loyaltyTier,
    loyalty_points: profile.loyaltyPoints,
    stamps_count: profile.stampsCount,
    stamps_required_for_free_drink: profile.stampsRequiredForFreeDrink,
    favorite_drink_ids: profile.favoriteDrinkIds,
    notification_preferences: profile.notificationPreferences,
    redeemed_vouchers: profile.redeemedVouchers,
    saved_addresses: profile.savedAddresses,
    saved_payment_methods: profile.savedPaymentMethods,
    phone_confirmed: profile.phoneConfirmed ?? false,
  };
}

function rowToProfile(row: any): UserProfile {
  return {
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    avatarUrl: row.avatar_url || '',
    loyaltyTier: row.loyalty_tier || 'Silver Member',
    loyaltyPoints: row.loyalty_points || 0,
    stampsCount: row.stamps_count || 0,
    stampsRequiredForFreeDrink: row.stamps_required_for_free_drink || 10,
    favoriteDrinkIds: row.favorite_drink_ids || [],
    notificationPreferences: row.notification_preferences || INITIAL_USER_PROFILE.notificationPreferences,
    redeemedVouchers: row.redeemed_vouchers || [],
    savedAddresses: row.saved_addresses || INITIAL_USER_PROFILE.savedAddresses,
    savedPaymentMethods: row.saved_payment_methods || INITIAL_USER_PROFILE.savedPaymentMethods,
    phoneConfirmed: row.phone_confirmed || false,
  };
}

export async function saveUserProfileToCloud(userId: string, profile: UserProfile): Promise<void> {
  if (!userId || userId === 'guest') return;
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(sanitizeForDb(profileToRow(userId, profile)));
    if (error) console.warn('Failed to save user profile:', error.message);
  } catch (err) {
    console.warn('Failed to persist user profile in cloud:', err);
  }
}

export async function loadUserProfileFromCloud(userId: string): Promise<UserProfile | null> {
  if (!userId || userId === 'guest') return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return rowToProfile(data);
  } catch (err) {
    console.warn('Failed to load user profile from cloud:', err);
    return null;
  }
}

export async function loadUserRoleFromCloud(userId: string): Promise<'customer' | 'admin'> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    return (data?.role as 'customer' | 'admin') || 'customer';
  } catch {
    return 'customer';
  }
}

// ---------------------------------------------------------------------------
// 5. AUTHENTICATION (Supabase Auth — email/phone + password)
// ---------------------------------------------------------------------------

/**
 * Sign in with email or phone number + password.
 * Phone numbers are converted to synthetic emails (e.g. 0752619129 → 0752619129@immydrinks.com)
 */
export async function cloudSignIn(emailOrPhone: string, password: string): Promise<AuthUser> {
  const cleanId = emailOrPhone.trim().toLowerCase();
  const digitsOnly = cleanId.replace(/[^0-9]/g, '');

  const email = cleanId.includes('@')
    ? cleanId
    : `${digitsOnly}@immydrinks.com`;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Normalize error codes so AuthModal can display friendly messages
    const err: any = new Error(error.message);
    if (
      error.message.includes('Invalid login credentials') ||
      error.message.includes('invalid_credentials')
    ) {
      err.code = 'auth/invalid-credential';
    } else if (error.message.includes('Email not confirmed')) {
      err.code = 'auth/email-not-confirmed';
    } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
      err.code = 'auth/too-many-requests';
    } else {
      err.code = 'auth/unknown';
    }
    throw err;
  }

  const fbUser = data.user;

  // Determine if this is an admin email
  const ADMIN_EMAILS = ['admin@immydrinks.com', 'princefredkent@gmail.com'];
  const isAdminEmail = ADMIN_EMAILS.includes((fbUser.email || '').toLowerCase());
  const resolvedRole: 'customer' | 'admin' = isAdminEmail ? 'admin' : 'customer';

  // Upsert the profile row to ensure role is correct — fixes cases where the
  // row was created before the DB trigger was set up (role defaulted to 'customer').
  try {
    await supabase.from('profiles').upsert({
      id: fbUser.id,
      name: fbUser.user_metadata?.name || fbUser.email?.split('@')[0] || 'User',
      phone: cleanId.includes('@') ? '' : cleanId,
      role: resolvedRole,
    }, { onConflict: 'id' });
  } catch (upsertErr) {
    console.warn('Profile upsert on sign-in failed (non-fatal):', upsertErr);
  }

  return {
    id: fbUser.id,
    name: fbUser.user_metadata?.name || fbUser.email?.split('@')[0] || 'User',
    email: fbUser.email || email,
    phone: cleanId.includes('@') ? '' : cleanId,
    role: resolvedRole,
    isLoggedIn: true,
    authProvider: 'email',
  };
}

/**
 * Register a new user with name, email/phone, and password.
 */
export async function cloudSignUp(
  name: string,
  emailOrPhone: string,
  password: string,
  phoneInput?: string
): Promise<AuthUser> {
  const cleanId = emailOrPhone.trim().toLowerCase();
  const digitsOnly = cleanId.replace(/[^0-9]/g, '');
  const email = cleanId.includes('@')
    ? cleanId
    : `${digitsOnly}@immydrinks.com`;

  const isAdmin =
    email.toLowerCase() === 'admin@immydrinks.com' ||
    email.toLowerCase() === 'princefredkent@gmail.com';

  const role: 'customer' | 'admin' = isAdmin ? 'admin' : 'customer';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name.trim(),
        phone: phoneInput?.trim() || (!cleanId.includes('@') ? cleanId : ''),
        role,
      },
    },
  });

  if (error) {
    const err: any = new Error(error.message);
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      err.code = 'auth/email-already-in-use';
    } else if (error.message.includes('rate limit') || error.message.includes('too many') || error.message.includes('rate_limit')) {
      // Rate limit hit — account likely already exists, just sign in
      err.code = 'auth/email-already-in-use';
      err.message = 'An account with this email already exists. Please use Sign In instead.';
    } else if (error.message.includes('password')) {
      err.code = 'auth/weak-password';
    } else {
      err.code = 'auth/unknown';
    }
    throw err;
  }

  const fbUser = data.user!;

  // Explicitly create the profile row right after sign-up.
  // The handle_new_user trigger should do this automatically, but we do it
  // here as a reliable fallback in case the trigger didn't fire or failed.
  // We use a short retry loop because the auth session might not be ready instantly.
  const profilePayload = {
    id: fbUser.id,
    name: name.trim(),
    phone: phoneInput?.trim() || (!cleanId.includes('@') ? cleanId : ''),
    role,
    saved_addresses: JSON.stringify([{
      id: 'addr-home',
      label: 'My Address',
      street: '',
      city: 'Kampala, Uganda',
      isDefault: true,
    }]),
    saved_payment_methods: JSON.stringify([{
      id: 'pm-cash',
      type: 'cash',
      label: 'Cash on Delivery',
      subtitle: 'Pay with cash upon delivery',
      isDefault: true,
      comingSoon: false,
    }]),
  };

  // Attempt upsert up to 3 times with a short delay (session propagation lag)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });
      if (!profileError) break;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
    } catch (_) {
      if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
    }
  }

  return {
    id: fbUser.id,
    name: name.trim(),
    email: fbUser.email || email,
    phone: phoneInput?.trim() || (!cleanId.includes('@') ? cleanId : ''),
    role,
    isLoggedIn: true,
    authProvider: 'email',
  };
}

export async function cloudSignOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// 6. WIPE DATABASE (Admin only)
// ---------------------------------------------------------------------------

export async function wipeDatabaseFromCloud(): Promise<void> {
  await supabase.from('drinks').delete().neq('id', '');
  await supabase.from('orders').delete().neq('id', '');
  await supabase.from('hero_slides').delete().neq('id', '');
}
