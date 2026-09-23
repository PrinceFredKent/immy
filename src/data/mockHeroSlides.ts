import { HeroSlide } from '../types';

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: '100% Fresh Blends & Cold Juices',
    highlightWord: 'Cold Juices',
    subtitle: 'Sun-ripened Ugandan fruits, ice-chilled to perfection.',
    ctaText: 'Explore Juices',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85',
    tag: 'Natural & Fresh',
    categoryTarget: 'blended-juices',
    isActive: true,
  },
  {
    id: 'slide-2',
    title: 'Creamy Smoothies & Fresh Bongo',
    highlightWord: 'Fresh Bongo',
    subtitle: 'Rich blended fruits & fresh farm dairy.',
    ctaText: 'View Specials',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=85',
    tag: 'Creamy Mixes',
    categoryTarget: 'smoothies-mixtures',
    isActive: true,
  },
  {
    id: 'slide-3',
    title: 'Delicious Cakes & Chilled Drinks',
    highlightWord: 'Cakes & Pastries',
    subtitle: 'Freshly baked pastries & energy refreshments.',
    ctaText: 'Order Desserts',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85',
    tag: 'Sweet Treats',
    categoryTarget: 'cakes-pastries',
    isActive: true,
  },
];
