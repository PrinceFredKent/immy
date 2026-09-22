import { HeroSlide } from '../types';

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Your perfect tea, brewed to perfection',
    highlightWord: 'brewed',
    subtitle: 'Infused with local spices and organic honey.',
    ctaText: 'Order Now',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=85',
    tag: 'Artisan Teas',
    categoryTarget: 'artisan-teas',
    isActive: true,
  },
  {
    id: 'slide-2',
    title: '100% Fresh Blends & Cold Juices',
    highlightWord: 'Cold Juices',
    subtitle: 'Sun-ripened Ugandan fruits, ice-chilled.',
    ctaText: 'Explore Juices',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85',
    tag: 'Natural & Fresh',
    categoryTarget: 'blended-juices',
    isActive: true,
  },
  {
    id: 'slide-3',
    title: 'Creamy Smoothies & Fresh Bongo',
    highlightWord: 'Fresh Bongo',
    subtitle: 'Rich blended fruits & farm dairy.',
    ctaText: 'View Specials',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=85',
    tag: 'Creamy Mixes',
    categoryTarget: 'smoothies-mixtures',
    isActive: true,
  },
];
