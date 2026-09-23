import { UserProfile, Order, CartItem, DeliveryAddress, CourierInfo } from '../types';
import { MOCK_DRINKS } from './mockDrinks';

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

const DEFAULT_COURIER: CourierInfo = {
  name: 'Julian Vance',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  vehicle: 'Vespa Sprint 150 (Matte Emerald)',
  phone: '0752619129',
  rating: 4.96,
  deliveredCount: 1420,
};

const getDrink = (id: string) => MOCK_DRINKS.find(d => d.id === id) || MOCK_DRINKS[0];

export const INITIAL_ORDER_HISTORY: Order[] = [
  // ----------------------------------------------------
  // CUSTOMER 1: Prince Fred Kent (3 orders)
  // ----------------------------------------------------
  {
    id: 'ord-pfk-01',
    orderNumber: 'IMMY-4920',
    createdAt: 'Today, 09:42 AM',
    customerName: 'Prince Fred Kent',
    customerPhone: '0752619129',
    customerEmail: 'princefredkent@gmail.com',
    items: [
      {
        cartItemId: 'item-pfk-1',
        drink: getDrink('blended-passion-juice'),
        customization: {
          size: 'large',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
          specialInstructions: 'Very cold please',
        },
        quantity: 2,
        unitPrice: 2000,
        totalPrice: 4000,
      },
      {
        cartItemId: 'item-pfk-2',
        drink: getDrink('yoghurt-mango-mixture'),
        customization: {
          size: 'regular',
          ice: 'Light Ice (30%)',
          sweetness: 'Standard (100%)',
          milk: 'Whole Dairy Milk',
          selectedAddOns: ['extra-yoghurt-layer'],
          specialInstructions: 'Extra thick layer',
        },
        quantity: 1,
        unitPrice: 3000,
        totalPrice: 3000,
      },
    ],
    subtotal: 7000,
    deliveryFee: 0,
    tip: 0,
    discount: 0,
    total: 7000,
    status: 'delivered',
    progressPercent: 100,
    estimatedDeliveryTime: 'Delivered',
    courier: DEFAULT_COURIER,
    deliveryAddress: {
      id: 'addr-pfk-home',
      label: 'Nasser Road',
      street: 'Plot 42, Nasser Road',
      unit: 'Commercial Plaza, Central Division',
      city: 'Kampala, Uganda',
      notes: 'Please call when at gate',
      isDefault: true,
    },
    timeline: [
      {
        status: 'placed',
        title: 'Order Confirmed',
        time: '09:42 AM',
        description: 'Immy Drinks received your order',
        completed: true,
        current: false,
      },
      {
        status: 'packaged',
        title: 'Packaged & Sealed',
        time: '09:48 AM',
        description: 'Placed in temperature-safe beverage bag',
        completed: true,
        current: false,
      },
      {
        status: 'on_the_way',
        title: 'On The Way',
        time: '10:05 AM',
        description: 'Courier en route to Nasser Road',
        completed: true,
        current: false,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        time: '10:18 AM',
        description: 'Handed to customer',
        completed: true,
        current: true,
      },
    ],
  },
  {
    id: 'ord-pfk-02',
    orderNumber: 'IMMY-4615',
    createdAt: 'Yesterday, 02:15 PM',
    customerName: 'Prince Fred Kent',
    customerPhone: '0752619129',
    customerEmail: 'princefredkent@gmail.com',
    items: [
      {
        cartItemId: 'item-pfk-3',
        drink: getDrink('smoothie-fruit-mix'),
        customization: {
          size: 'large',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 2,
        unitPrice: 3000,
        totalPrice: 6000,
      },
      {
        cartItemId: 'item-pfk-4',
        drink: getDrink('bongo-cultured-milk'),
        customization: {
          size: 'regular',
          ice: 'Light Ice (30%)',
          sweetness: 'Standard (100%)',
          milk: 'Whole Dairy Milk',
          selectedAddOns: [],
        },
        quantity: 1,
        unitPrice: 2000,
        totalPrice: 2000,
      },
    ],
    subtotal: 8000,
    deliveryFee: 0,
    tip: 0,
    discount: 0,
    total: 8000,
    status: 'delivered',
    progressPercent: 100,
    estimatedDeliveryTime: 'Delivered',
    courier: DEFAULT_COURIER,
    deliveryAddress: {
      id: 'addr-pfk-home',
      label: 'Nasser Road',
      street: 'Plot 42, Nasser Road',
      unit: 'Commercial Plaza, Central Division',
      city: 'Kampala, Uganda',
      notes: 'Call on arrival',
      isDefault: true,
    },
    timeline: [
      {
        status: 'placed',
        title: 'Order Confirmed',
        time: '02:15 PM',
        description: 'Order received',
        completed: true,
        current: false,
      },
      {
        status: 'packaged',
        title: 'Packaged & Sealed',
        time: '02:22 PM',
        description: 'Prepared fresh',
        completed: true,
        current: false,
      },
      {
        status: 'on_the_way',
        title: 'Dispatched',
        time: '02:30 PM',
        description: 'Courier en route',
        completed: true,
        current: false,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        time: '02:44 PM',
        description: 'Successfully delivered',
        completed: true,
        current: true,
      },
    ],
  },
  {
    id: 'ord-pfk-03',
    orderNumber: 'IMMY-3980',
    createdAt: '3 days ago, 04:30 PM',
    customerName: 'Prince Fred Kent',
    customerPhone: '0752619129',
    customerEmail: 'princefredkent@gmail.com',
    items: [
      {
        cartItemId: 'item-pfk-5',
        drink: getDrink('blended-beetroot-juice'),
        customization: {
          size: 'regular',
          ice: 'Light Ice (30%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: ['extra-ginger-honey'],
        },
        quantity: 2,
        unitPrice: 2000,
        totalPrice: 4000,
      },
      {
        cartItemId: 'item-pfk-6',
        drink: getDrink('cakes-all-flavors'),
        customization: {
          size: 'regular',
          ice: 'No Ice (0%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
          specialInstructions: 'Vanilla and chocolate mix',
        },
        quantity: 2,
        unitPrice: 1000,
        totalPrice: 2000,
      },
    ],
    subtotal: 6000,
    deliveryFee: 0,
    tip: 0,
    discount: 0,
    total: 6000,
    status: 'delivered',
    progressPercent: 100,
    estimatedDeliveryTime: 'Delivered',
    courier: DEFAULT_COURIER,
    deliveryAddress: {
      id: 'addr-pfk-home',
      label: 'Nasser Road',
      street: 'Plot 42, Nasser Road',
      unit: 'Commercial Plaza, Central Division',
      city: 'Kampala, Uganda',
      isDefault: true,
    },
    timeline: [],
  },

  // ----------------------------------------------------
  // CUSTOMER 2: Sarah Nabukenya (3 orders)
  // ----------------------------------------------------
  {
    id: 'ord-sn-01',
    orderNumber: 'IMMY-4882',
    createdAt: 'Today, 08:30 AM',
    customerName: 'Sarah Nabukenya',
    customerPhone: '0760535440',
    customerEmail: 'sarah.nabukenya@gmail.com',
    items: [
      {
        cartItemId: 'item-sn-1',
        drink: getDrink('smoothie-fruit-mix'),
        customization: {
          size: 'regular',
          ice: 'Light Ice (30%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 2,
        unitPrice: 3000,
        totalPrice: 6000,
      },
      {
        cartItemId: 'item-sn-2',
        drink: getDrink('soda-all-types'),
        customization: {
          size: 'regular',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
          specialInstructions: 'Mirinda Fruity please',
        },
        quantity: 1,
        unitPrice: 1000,
        totalPrice: 1000,
      },
    ],
    subtotal: 7000,
    deliveryFee: 0,
    tip: 0,
    discount: 0,
    total: 7000,
    status: 'on_the_way',
    progressPercent: 80,
    estimatedDeliveryTime: '10 mins',
    courier: DEFAULT_COURIER,
    deliveryAddress: {
      id: 'addr-sn-1',
      label: 'Nakasero Hill Road',
      street: 'Nakasero Hill Road, Plot 22, Tower B',
      unit: 'Floor 4, Suite 12',
      city: 'Kampala, Uganda',
      notes: 'Leave at reception desk',
      isDefault: true,
    },
    timeline: [],
  },
  {
    id: 'ord-sn-02',
    orderNumber: 'IMMY-4410',
    createdAt: '2 days ago, 11:20 AM',
    customerName: 'Sarah Nabukenya',
    customerPhone: '0760535440',
    customerEmail: 'sarah.nabukenya@gmail.com',
    items: [
      {
        cartItemId: 'item-sn-3',
        drink: getDrink('blended-passion-juice'),
        customization: {
          size: 'large',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 2,
        unitPrice: 2000,
        totalPrice: 4000,
      },
      {
        cartItemId: 'item-sn-4',
        drink: getDrink('cakes-all-flavors'),
        customization: {
          size: 'regular',
          ice: 'No Ice (0%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 2,
        unitPrice: 1000,
        totalPrice: 2000,
      },
    ],
    subtotal: 6000,
    deliveryFee: 0,
    tip: 0,
    discount: 0,
    total: 6000,
    status: 'delivered',
    progressPercent: 100,
    estimatedDeliveryTime: 'Delivered',
    courier: DEFAULT_COURIER,
    deliveryAddress: {
      id: 'addr-sn-1',
      label: 'Nakasero Hill Road',
      street: 'Nakasero Hill Road, Plot 22, Tower B',
      unit: 'Floor 4, Suite 12',
      city: 'Kampala, Uganda',
      isDefault: true,
    },
    timeline: [],
  },
  {
    id: 'ord-sn-03',
    orderNumber: 'IMMY-3820',
    createdAt: '5 days ago, 01:10 PM',
    customerName: 'Sarah Nabukenya',
    customerPhone: '0760535440',
    customerEmail: 'sarah.nabukenya@gmail.com',
    items: [
      {
        cartItemId: 'item-sn-5',
        drink: getDrink('yoghurt-mango-mixture'),
        customization: {
          size: 'regular',
          ice: 'Light Ice (30%)',
          sweetness: 'Standard (100%)',
          milk: 'Whole Dairy Milk',
          selectedAddOns: [],
        },
        quantity: 2,
        unitPrice: 3000,
        totalPrice: 6000,
      },
      {
        cartItemId: 'item-sn-6',
        drink: getDrink('minute-maid-all-flavors'),
        customization: {
          size: 'regular',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 1,
        unitPrice: 2500,
        totalPrice: 2500,
      },
    ],
    subtotal: 8500,
    deliveryFee: 0,
    tip: 0,
    discount: 0,
    total: 8500,
    status: 'delivered',
    progressPercent: 100,
    estimatedDeliveryTime: 'Delivered',
    courier: DEFAULT_COURIER,
    deliveryAddress: {
      id: 'addr-sn-1',
      label: 'Nakasero Hill Road',
      street: 'Nakasero Hill Road, Plot 22, Tower B',
      unit: 'Floor 4, Suite 12',
      city: 'Kampala, Uganda',
      isDefault: true,
    },
    timeline: [],
  },

  // ----------------------------------------------------
  // CUSTOMER 3: David Mugisha (3 orders)
  // ----------------------------------------------------
  {
    id: 'ord-dm-01',
    orderNumber: 'IMMY-4905',
    createdAt: 'Today, 07:15 AM',
    customerName: 'David Mugisha',
    customerPhone: '0772184920',
    customerEmail: 'david.mugisha@gmail.com',
    items: [
      {
        cartItemId: 'item-dm-1',
        drink: getDrink('blended-orange-juice'),
        customization: {
          size: 'regular',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 2,
        unitPrice: 2000,
        totalPrice: 4000,
      },
      {
        cartItemId: 'item-dm-2',
        drink: getDrink('rock-boom-energy'),
        customization: {
          size: 'regular',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 1,
        unitPrice: 2000,
        totalPrice: 2000,
      },
    ],
    subtotal: 6000,
    deliveryFee: 0,
    tip: 0,
    discount: 0,
    total: 6000,
    status: 'placed',
    progressPercent: 25,
    estimatedDeliveryTime: '25 mins',
    courier: DEFAULT_COURIER,
    deliveryAddress: {
      id: 'addr-dm-1',
      label: 'Bukoto Heights',
      street: 'Bukoto Heights, Plot 88, Near Kadic',
      unit: 'Block C, Apt 14',
      city: 'Kampala, Uganda',
      notes: 'Ring bell on left gate pillar',
      isDefault: true,
    },
    timeline: [],
  },
  {
    id: 'ord-dm-02',
    orderNumber: 'IMMY-4530',
    createdAt: '4 days ago, 03:40 PM',
    customerName: 'David Mugisha',
    customerPhone: '0772184920',
    customerEmail: 'david.mugisha@gmail.com',
    items: [
      {
        cartItemId: 'item-dm-3',
        drink: getDrink('blended-mango-juice'),
        customization: {
          size: 'large',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 2,
        unitPrice: 2000,
        totalPrice: 4000,
      },
      {
        cartItemId: 'item-dm-4',
        drink: getDrink('bongo-cultured-milk'),
        customization: {
          size: 'regular',
          ice: 'Light Ice (30%)',
          sweetness: 'Standard (100%)',
          milk: 'Whole Dairy Milk',
          selectedAddOns: [],
        },
        quantity: 2,
        unitPrice: 2000,
        totalPrice: 4000,
      },
    ],
    subtotal: 8000,
    deliveryFee: 0,
    tip: 0,
    discount: 0,
    total: 8000,
    status: 'delivered',
    progressPercent: 100,
    estimatedDeliveryTime: 'Delivered',
    courier: DEFAULT_COURIER,
    deliveryAddress: {
      id: 'addr-dm-1',
      label: 'Bukoto Heights',
      street: 'Bukoto Heights, Plot 88, Near Kadic',
      unit: 'Block C, Apt 14',
      city: 'Kampala, Uganda',
      isDefault: true,
    },
    timeline: [],
  },
  {
    id: 'ord-dm-03',
    orderNumber: 'IMMY-3672',
    createdAt: '1 week ago, 10:15 AM',
    customerName: 'David Mugisha',
    customerPhone: '0772184920',
    customerEmail: 'david.mugisha@gmail.com',
    items: [
      {
        cartItemId: 'item-dm-5',
        drink: getDrink('oner-juice-flavors'),
        customization: {
          size: 'regular',
          ice: 'Regular Ice (70%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 2,
        unitPrice: 2500,
        totalPrice: 5000,
      },
      {
        cartItemId: 'item-dm-6',
        drink: getDrink('cakes-all-flavors'),
        customization: {
          size: 'regular',
          ice: 'No Ice (0%)',
          sweetness: 'Standard (100%)',
          milk: 'No Milk / Black',
          selectedAddOns: [],
        },
        quantity: 1,
        unitPrice: 1000,
        totalPrice: 1000,
      },
    ],
    subtotal: 6000,
    deliveryFee: 0,
    tip: 0,
    discount: 0,
    total: 6000,
    status: 'delivered',
    progressPercent: 100,
    estimatedDeliveryTime: 'Delivered',
    courier: DEFAULT_COURIER,
    deliveryAddress: {
      id: 'addr-dm-1',
      label: 'Bukoto Heights',
      street: 'Bukoto Heights, Plot 88, Near Kadic',
      unit: 'Block C, Apt 14',
      city: 'Kampala, Uganda',
      isDefault: true,
    },
    timeline: [],
  },
];
