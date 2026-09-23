export type DrinkCategory = 
  | 'all' 
  | 'blended-juices' 
  | 'smoothies-mixtures' 
  | 'bongo-kitiribita' 
  | 'energy-bottled-juices' 
  | 'water-sodas' 
  | 'cakes-pastries';

export type DrinkSize = 'standard' | 'large' | 'regular';

export type IceLevel = 'No Ice (0%)' | 'Light Ice (30%)' | 'Regular Ice (70%)' | 'Extra Chill (100%)';

export type SweetnessLevel = 'Unsweetened (0%)' | 'Light (25%)' | 'Half Sweet (50%)' | 'Less Sweet (75%)' | 'Standard (100%)';

export type MilkOption = 'Whole Dairy Milk' | 'Oat Milk (+ UGX 2,500)' | 'Almond Silk (+ UGX 2,500)' | 'Coconut Cream (+ UGX 3,000)' | 'No Milk / Black';

export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: 'toppings' | 'boosters' | 'foam';
}

export interface DrinkFlavor {
  id: string;
  name: string;
  image?: string; // Small individual image for each flavor
  inStock?: boolean;
  subFlavors?: DrinkFlavor[];
}

export interface Drink {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // Standard Cup Price in UGX
  priceLarge?: number; // Large Cup Price in UGX
  category: DrinkCategory;
  image: string;
  calories?: number;
  rating: number;
  reviewsCount: number;
  isPopular?: boolean;
  isNew?: boolean;
  createdAt?: string; // ISO date string to auto-expire 'New' badge after 3 days
  isOutOfStock?: boolean;
  flavorNotes: string[];
  prepTimeMinutes: number;
  defaultCustomization: CustomizationOptions;
  flavors?: DrinkFlavor[]; // Admin-editable individual flavors with small images
}

export interface CustomizationOptions {
  size: DrinkSize;
  ice: IceLevel;
  sweetness: SweetnessLevel;
  milk: MilkOption;
  selectedAddOns: string[];
  specialInstructions?: string;
  selectedFlavor?: string;
  selectedFlavorImage?: string;
}

export interface CartItem {
  cartItemId: string;
  drink: Drink;
  customization: CustomizationOptions;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type DeliveryStatus = 
  | 'placed' 
  | 'brewing' 
  | 'packaged' 
  | 'on_the_way' 
  | 'delivered'
  | 'cancelled';

export interface DeliveryAddress {
  id: string;
  label: string;
  street: string;
  unit?: string;
  city: string;
  zip?: string;
  notes?: string;
  isDefault: boolean;
}

export type PaymentMethodType = 'cash' | 'mobile_money' | 'card' | 'apple_pay' | 'google_pay';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label?: string;
  subtitle?: string;
  comingSoon?: boolean;
  last4?: string;
  cardBrand?: string;
  expiry?: string;
  isDefault: boolean;
}

export interface CourierInfo {
  name: string;
  avatar: string;
  vehicle: string;
  phone: string;
  rating: number;
  deliveredCount: number;
}

export interface OrderTimelineStep {
  status: DeliveryStatus;
  title: string;
  time: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tip: number;
  discount: number;
  promoCode?: string;
  total: number;
  status: DeliveryStatus;
  progressPercent: number; // 0 - 100 for tracking animation
  estimatedDeliveryTime: string;
  courier: CourierInfo;
  deliveryAddress: DeliveryAddress;
  timeline: OrderTimelineStep[];
  courierCoordinates?: {
    x: number; // 0 to 100 on map
    y: number;
  };
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  orderUpdates: boolean;
  brewingAlerts: boolean;
  outForDelivery: boolean;
  deliveredAlert: boolean;
  promotionsAndRewards: boolean;
  soundEnabled: boolean;
}

export interface PushNotificationEvent {
  id: string;
  title: string;
  message: string;
  status: DeliveryStatus;
  timestamp: string;
  orderNumber?: string;
  orderId?: string;
}

export interface LoyaltyRewardOption {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountAmount: number;
  discountType: 'fixed' | 'percent' | 'free_drink' | 'free_topping';
  badge?: string;
  iconName: string;
  isExclusive?: boolean;
}

export interface RedeemedVoucher {
  id: string;
  rewardId: string;
  code: string;
  title: string;
  discountAmount: number;
  discountType: 'fixed' | 'percent' | 'free_drink' | 'free_topping';
  redeemedAt: string;
  isUsed: boolean;
}

export type UserRole = 'customer' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isLoggedIn: boolean;
  authProvider?: 'google' | 'email' | 'guest';
  phoneConfirmed?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  loyaltyTier: 'Silver Member' | 'Gold Member' | 'Obsidian Elite';
  loyaltyPoints: number;
  stampsCount: number;
  stampsRequiredForFreeDrink: number;
  favoriteDrinkIds: string[];
  notificationPreferences: NotificationPreferences;
  redeemedVouchers: RedeemedVoucher[];
  savedAddresses: DeliveryAddress[];
  savedPaymentMethods: PaymentMethod[];
  authProvider?: 'google' | 'email' | 'guest';
  phoneConfirmed?: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  highlightWord: string;
  subtitle: string;
  ctaText: string;
  image: string;
  tag: string;
  categoryTarget: DrinkCategory;
  isActive?: boolean;
}
