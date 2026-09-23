import { UserProfile, Order, CourierInfo } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
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
      id: 'addr-home',
      label: 'Nasser Road (Default)',
      street: 'Plot 42, Nasser Road',
      unit: 'Commercial Plaza, Central Division',
      city: 'Kampala, Uganda',
      notes: 'Please call driver upon arrival',
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
    {
      id: 'pm-momo',
      type: 'mobile_money',
      label: 'Mobile Money',
      subtitle: 'MTN MoMo, AirtelTigo, Telecel & M-Pesa',
      cardBrand: 'Mobile Money',
      last4: 'MOMO',
      expiry: 'Coming Soon',
      isDefault: false,
      comingSoon: true,
    },
  ],
};

function parseJsonIfString<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return val;
}

export function normalizeUserProfile(raw: any): UserProfile {
  if (!raw || typeof raw !== 'object') {
    return { ...INITIAL_USER_PROFILE };
  }

  // Parse savedAddresses if it is a JSON string, object, or array
  let rawAddresses = parseJsonIfString(raw.savedAddresses ?? raw.saved_addresses, INITIAL_USER_PROFILE.savedAddresses);
  if (!Array.isArray(rawAddresses)) {
    if (rawAddresses && typeof rawAddresses === 'object') {
      rawAddresses = [rawAddresses];
    } else {
      rawAddresses = INITIAL_USER_PROFILE.savedAddresses;
    }
  }
  if (rawAddresses.length === 0) {
    rawAddresses = INITIAL_USER_PROFILE.savedAddresses;
  } else {
    // If existing address was the old default Acacia Avenue, upgrade to Nasser Road
    rawAddresses = rawAddresses.map((addr: any) => {
      if (addr && (addr.street === 'Acacia Avenue, Plot 14' || addr.street === 'Plot 14, Acacia Avenue, Kololo' || addr.street === 'Acacia Avenue, Plot 14, Kololo')) {
        return {
          ...addr,
          label: 'Nasser Road (Default)',
          street: 'Plot 42, Nasser Road',
          unit: addr.unit || 'Commercial Plaza, Central Division',
          city: 'Kampala, Uganda',
        };
      }
      return addr;
    });
  }

  // Parse savedPaymentMethods
  let rawPaymentMethods = parseJsonIfString(raw.savedPaymentMethods ?? raw.saved_payment_methods, INITIAL_USER_PROFILE.savedPaymentMethods);
  if (!Array.isArray(rawPaymentMethods) || rawPaymentMethods.length === 0) {
    rawPaymentMethods = INITIAL_USER_PROFILE.savedPaymentMethods;
  }

  // Parse favoriteDrinkIds
  let rawFavorites = parseJsonIfString(raw.favoriteDrinkIds ?? raw.favorite_drink_ids, []);
  if (!Array.isArray(rawFavorites)) {
    rawFavorites = [];
  }

  // Parse redeemedVouchers
  let rawVouchers = parseJsonIfString(raw.redeemedVouchers ?? raw.redeemed_vouchers, []);
  if (!Array.isArray(rawVouchers)) {
    rawVouchers = [];
  }

  // Parse notificationPreferences
  let rawNotifs = parseJsonIfString(raw.notificationPreferences ?? raw.notification_preferences, INITIAL_USER_PROFILE.notificationPreferences);
  if (!rawNotifs || typeof rawNotifs !== 'object' || Array.isArray(rawNotifs)) {
    rawNotifs = INITIAL_USER_PROFILE.notificationPreferences;
  }

  const rawAvatar = raw.avatarUrl ?? raw.avatar_url ?? '';
  const cleanAvatar = typeof rawAvatar === 'string' && !rawAvatar.includes('unsplash.com') ? rawAvatar : '';

  return {
    name: typeof raw.name === 'string' ? raw.name : '',
    email: typeof raw.email === 'string' ? raw.email : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    avatarUrl: cleanAvatar,
    loyaltyTier: raw.loyaltyTier || raw.loyalty_tier || 'Silver Member',
    loyaltyPoints: typeof (raw.loyaltyPoints ?? raw.loyalty_points) === 'number' ? (raw.loyaltyPoints ?? raw.loyalty_points) : 0,
    stampsCount: typeof (raw.stampsCount ?? raw.stamps_count) === 'number' ? (raw.stampsCount ?? raw.stamps_count) : 0,
    stampsRequiredForFreeDrink: typeof (raw.stampsRequiredForFreeDrink ?? raw.stamps_required_for_free_drink) === 'number' ? (raw.stampsRequiredForFreeDrink ?? raw.stamps_required_for_free_drink) : 10,
    favoriteDrinkIds: rawFavorites,
    notificationPreferences: {
      ...INITIAL_USER_PROFILE.notificationPreferences,
      ...rawNotifs,
    },
    redeemedVouchers: rawVouchers,
    savedAddresses: rawAddresses,
    savedPaymentMethods: rawPaymentMethods,
    phoneConfirmed: Boolean(raw.phoneConfirmed ?? raw.phone_confirmed),
  };
}

export const DEFAULT_COURIER: CourierInfo = {
  name: 'Julian Vance',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  vehicle: 'Vespa Sprint 150 (Matte Emerald)',
  phone: '0752619129',
  rating: 4.96,
  deliveredCount: 1420,
};

// Pure real data: No mock or demo orders
export const INITIAL_ORDER_HISTORY: Order[] = [];
