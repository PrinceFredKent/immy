export const formatCurrency = (amount?: number | null): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `UGX ${Math.round(num).toLocaleString('en-US')}`;
};

export const formatRating = (rating?: number | null): string => {
  const num = typeof rating === 'number' && !isNaN(rating) ? rating : 4.8;
  return num.toFixed(1);
};

export const calculateItemPrice = (
  basePrice: number = 0,
  size: 'standard' | 'regular' | 'large' | string = 'standard',
  milk: string = '',
  selectedAddOns: string[] = [],
  availableAddOns: Array<{ id: string; price: number }> = [],
  largePrice?: number
): number => {
  let total = typeof basePrice === 'number' && !isNaN(basePrice) ? basePrice : 0;

  if (size === 'large') {
    if (typeof largePrice === 'number' && !isNaN(largePrice) && largePrice > 0) {
      total = largePrice;
    } else {
      total += 1000;
    }
  }

  if (typeof milk === 'string' && milk) {
    if (milk.includes('2,500')) total += 2500;
    if (milk.includes('3,000')) total += 3000;
    if (milk.includes('2,000')) total += 2000;
  }

  if (Array.isArray(selectedAddOns)) {
    for (const addOnId of selectedAddOns) {
      const item = (availableAddOns || []).find((a) => a && a.id === addOnId);
      if (item && typeof item.price === 'number') {
        total += item.price;
      }
    }
  }

  return Math.round(total);
};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Failed to write to localStorage:', e);
      if (e instanceof Error && (e.name === 'QuotaExceededError' || e.message?.includes('quota'))) {
        console.warn('Quota exceeded! Clearing large non-critical cache and retrying...');
        try {
          localStorage.removeItem('immy_drinks_inventory'); // clear large inventory cache
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.error('Failed retry setting item even after clearing drinks:', retryError);
        }
      }
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to remove from localStorage:', e);
    }
  }
};

