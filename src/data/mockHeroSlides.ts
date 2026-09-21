import { HeroSlide } from '../types';

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Your perfect coffee, delivered to you',
    highlightWord: 'delivered',
    subtitle: 'Crafted fresh by master baristas.',
    ctaText: 'Order Now',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85',
    tag: 'Artisan Brews',
    categoryTarget: 'hot-coffee',
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
