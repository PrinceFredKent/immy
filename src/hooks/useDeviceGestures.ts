import { useEffect, useRef } from 'react';

interface GestureHandlerOptions {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  customizingDrink: any;
  setCustomizingDrink: (drink: any) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  viewingReceiptOrder: any;
  setViewingReceiptOrder: (order: any) => void;
  isFilterDropdownOpen: boolean;
  setIsFilterDropdownOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isLoggedIn: boolean;
}

export function useDeviceGestures({
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
  isLoggedIn,
}: GestureHandlerOptions) {
  // Store latest state in ref to avoid re-binding popstate listener repeatedly
  const stateRef = useRef({
    currentTab,
    customizingDrink,
    isCartOpen,
    viewingReceiptOrder,
    isFilterDropdownOpen,
    isAuthModalOpen,
    isLoggedIn,
  });

  useEffect(() => {
    stateRef.current = {
      currentTab,
      customizingDrink,
      isCartOpen,
      viewingReceiptOrder,
      isFilterDropdownOpen,
      isAuthModalOpen,
      isLoggedIn,
    };
  }, [
    currentTab,
    customizingDrink,
    isCartOpen,
    viewingReceiptOrder,
    isFilterDropdownOpen,
    isAuthModalOpen,
    isLoggedIn,
  ]);

  // Handle browser / system back button & Android back gesture
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const current = stateRef.current;

      // Priority 1: Close top-level modals
      if (current.customizingDrink) {
        setCustomizingDrink(null);
        return;
      }
      if (current.viewingReceiptOrder) {
        setViewingReceiptOrder(null);
        return;
      }
      if (current.isCartOpen) {
        setIsCartOpen(false);
        return;
      }
      if (current.isFilterDropdownOpen) {
        setIsFilterDropdownOpen(false);
        return;
      }
      if (current.isAuthModalOpen && current.isLoggedIn) {
        setIsAuthModalOpen(false);
        return;
      }

      // Priority 2: Navigate back to home tab if in sub-tab
      if (current.currentTab !== 'home') {
        setCurrentTab('home');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    setCurrentTab,
    setCustomizingDrink,
    setIsCartOpen,
    setViewingReceiptOrder,
    setIsFilterDropdownOpen,
    setIsAuthModalOpen,
  ]);

  // Synchronize history state when entering modals or tabs
  useEffect(() => {
    const hasModalOrSubTab = Boolean(
      customizingDrink ||
      isCartOpen ||
      viewingReceiptOrder ||
      isFilterDropdownOpen ||
      (currentTab !== 'home')
    );

    if (hasModalOrSubTab) {
      window.history.pushState({ appNav: true, tab: currentTab }, '');
    }
  }, [
    customizingDrink,
    isCartOpen,
    viewingReceiptOrder,
    isFilterDropdownOpen,
    currentTab,
  ]);

  // Edge-swipe back gesture listener for mobile touch devices
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const timeDiff = Date.now() - touchStartTime;

      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Swiping from the left edge (started within left 40px of screen) towards right (>60px) in <400ms
      if (touchStartX < 40 && deltaX > 60 && deltaY < 50 && timeDiff < 400) {
        const current = stateRef.current;
        if (current.customizingDrink) {
          setCustomizingDrink(null);
        } else if (current.viewingReceiptOrder) {
          setViewingReceiptOrder(null);
        } else if (current.isCartOpen) {
          setIsCartOpen(false);
        } else if (current.isFilterDropdownOpen) {
          setIsFilterDropdownOpen(false);
        } else if (current.currentTab !== 'menu') {
          setCurrentTab('menu');
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    setCurrentTab,
    setCustomizingDrink,
    setIsCartOpen,
    setViewingReceiptOrder,
    setIsFilterDropdownOpen,
  ]);
}
