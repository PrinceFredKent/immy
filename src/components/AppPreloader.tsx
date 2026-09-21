import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface AppPreloaderProps {
  isLoading: boolean;
  type?: 'launch' | 'auth';
  customTitle?: string;
  customSubtitle?: string;
  onFinish?: () => void;
}

export const AppPreloader: React.FC<AppPreloaderProps> = ({
  isLoading,
  type = 'launch',
  customTitle,
  customSubtitle,
  onFinish,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 400);
      return () => clearTimeout(timer);
    }

    setProgress(10);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 95;
        }
        const jump = type === 'auth' ? 20 : 12;
        return Math.min(95, prev + Math.floor(Math.random() * jump) + 4);
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isLoading, type, onFinish]);

  if (!isLoading && progress === 100 && !isFadingOut) {
    return null;
  }

  // Dynamic status text based on progress
  const getPourStatus = () => {
    if (type === 'auth') {
      if (progress < 40) return 'Connecting securely...';
      if (progress < 80) return 'Syncing your favorites & profile...';
      return 'Welcome back!';
    }
    if (progress < 30) return 'Chilling the glass with fresh ice...';
    if (progress < 65) return 'Pouring artisan signature blend...';
    if (progress < 90) return 'Infusing fresh botanicals & garnish...';
    return 'Ready to serve!';
  };

  const title = customTitle || (type === 'auth' ? 'Authenticating & Syncing' : 'Immy Drinks');
  const subtitle = customSubtitle || (type === 'auth' 
    ? 'Preparing your personalized beverage menu & favorites...'
    : 'Drink With Distinction · Kampala Doorstep Delivery'
  );

  // Calculate liquid fill level (from bottom y=170 to y=50)
  // At 0% progress: liquid y is 170 (height 0)
  // At 100% progress: liquid y is 50 (height 120)
  const maxLiquidHeight = 125;
  const currentLiquidHeight = Math.min(maxLiquidHeight, (progress / 100) * maxLiquidHeight);
  const liquidY = 175 - currentLiquidHeight;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0c10] text-white px-6 select-none transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient warm background glow */}
      <div className="absolute w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full bg-amber-600/10 blur-2xl pointer-events-none -bottom-10" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
        
        {/* Animated Drink Pouring In Glass Visualization */}
        <div className="relative w-48 h-56 mb-4 flex items-center justify-center">
          
          {/* Pouring stream droplets / glowing splash */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              viewBox="0 0 200 220"
              className="w-full h-full overflow-visible drop-shadow-[0_10px_25px_rgba(245,158,11,0.25)]"
            >
              <defs>
                {/* Glass Mask interior */}
                <clipPath id="glass-interior">
                  <path d="M 52 45 L 62 170 Q 64 182, 100 182 Q 136 182, 138 170 L 148 45 Z" />
                </clipPath>

                {/* Liquid Gradient */}
                <linearGradient id="amber-liquid-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="35%" stopColor="#f59e0b" />
                  <stop offset="75%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>

                {/* Liquid Stream Gradient */}
                <linearGradient id="stream-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.85" />
                </linearGradient>

                {/* Glass Reflection Gradient */}
                <linearGradient id="glass-glare" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                  <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* 1. Straw angled in glass */}
              <motion.g
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Straw body */}
                <line
                  x1="128"
                  y1="25"
                  x2="90"
                  y2="170"
                  stroke="#fbbf24"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                {/* Straw stripes */}
                <line
                  x1="128"
                  y1="25"
                  x2="90"
                  y2="170"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </motion.g>

              {/* 2. Glass Outline / Base */}
              {/* Outer Glass Back Rim */}
              <ellipse cx="100" cy="45" rx="48" ry="7" fill="#1e222e" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

              {/* Glass Interior Clapped Area (Liquid, Ice, Bubbles) */}
              <g clipPath="url(#glass-interior)">
                {/* Empty glass background */}
                <rect x="40" y="35" width="120" height="155" fill="#131722" fillOpacity="0.6" />

                {/* Rising Liquid Body */}
                <motion.rect
                  x="40"
                  y={liquidY}
                  width="120"
                  height={currentLiquidHeight + 15}
                  fill="url(#amber-liquid-grad)"
                  transition={{ ease: 'easeOut', duration: 0.15 }}
                />

                {/* Liquid Surface Ripple / Wave */}
                {currentLiquidHeight > 3 && (
                  <motion.ellipse
                    cx="100"
                    cy={liquidY}
                    rx="44"
                    ry="6"
                    fill="#fef08a"
                    fillOpacity="0.8"
                    animate={{
                      scaleY: [1, 1.25, 0.9, 1],
                      scaleX: [1, 0.98, 1.02, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Floating Ice Cubes */}
                {/* Ice Cube 1 */}
                <motion.rect
                  x="80"
                  y={Math.max(60, liquidY + 12)}
                  width="22"
                  height="22"
                  rx="5"
                  fill="rgba(255,255,255,0.25)"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.5"
                  animate={{
                    y: [Math.max(60, liquidY + 12) - 3, Math.max(60, liquidY + 12) + 3, Math.max(60, liquidY + 12) - 3],
                    rotate: [12, 18, 12],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeInOut',
                  }}
                />

                {/* Ice Cube 2 */}
                <motion.rect
                  x="105"
                  y={Math.max(75, liquidY + 28)}
                  width="18"
                  height="18"
                  rx="4"
                  fill="rgba(255,255,255,0.2)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.5"
                  animate={{
                    y: [Math.max(75, liquidY + 28) + 2, Math.max(75, liquidY + 28) - 2, Math.max(75, liquidY + 28) + 2],
                    rotate: [-15, -8, -15],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: 'easeInOut',
                  }}
                />

                {/* Rising Sparkling Bubbles */}
                <circle cx="75" cy="150" r="2" fill="#fff" opacity="0.6">
                  <animate attributeName="cy" from="170" to="60" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.8;0" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="118" cy="160" r="2.5" fill="#fff" opacity="0.7">
                  <animate attributeName="cy" from="170" to="70" dur="1.4s" begin="0.3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.9;0" dur="1.4s" begin="0.3s" repeatCount="indefinite" />
                </circle>
                <circle cx="95" cy="140" r="1.5" fill="#fff" opacity="0.5">
                  <animate attributeName="cy" from="165" to="50" dur="2.1s" begin="0.7s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.7;0" dur="2.1s" begin="0.7s" repeatCount="indefinite" />
                </circle>

                {/* Glass Light Reflection Sheen */}
                <path
                  d="M 56 46 L 64 168 L 74 168 L 68 46 Z"
                  fill="url(#glass-glare)"
                />
              </g>

              {/* 3. Outer Glass Walls & Rounded Base (Realistic outline) */}
              <path
                d="M 52 45 L 62 170 Q 64 182, 100 182 Q 136 182, 138 170 L 148 45"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Glass Front Rim Top Curve */}
              <ellipse
                cx="100"
                cy="45"
                rx="48"
                ry="7"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
              />

              {/* Bottom Glass Thickness Base Plate */}
              <path
                d="M 64 172 Q 100 188, 136 172 Q 100 184, 64 172 Z"
                fill="rgba(255,255,255,0.2)"
              />

              {/* 4. Actively Pouring Liquid Stream (From Top into Glass) */}
              {progress < 98 && (
                <g>
                  {/* Stream Main Path */}
                  <motion.path
                    d={`M 96 0 Q 98 25, 99 ${liquidY + 4} Q 102 ${liquidY + 4}, 104 0 Z`}
                    fill="url(#stream-grad)"
                    animate={{
                      d: [
                        `M 97 0 Q 95 25, 99 ${liquidY + 4} Q 103 ${liquidY + 4}, 103 0 Z`,
                        `M 95 0 Q 101 25, 100 ${liquidY + 4} Q 104 ${liquidY + 4}, 105 0 Z`,
                        `M 97 0 Q 95 25, 99 ${liquidY + 4} Q 103 ${liquidY + 4}, 103 0 Z`,
                      ],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.35,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Impact Splash Droplets at Contact Point */}
                  <motion.circle
                    cx="94"
                    cy={liquidY}
                    r="2.5"
                    fill="#fef08a"
                    animate={{
                      cy: [liquidY, liquidY - 12, liquidY],
                      cx: [94, 88, 94],
                      opacity: [1, 0.8, 0],
                      scale: [0.8, 1.2, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      ease: 'easeOut',
                    }}
                  />
                  <motion.circle
                    cx="106"
                    cy={liquidY}
                    r="2.5"
                    fill="#fbbf24"
                    animate={{
                      cy: [liquidY, liquidY - 14, liquidY],
                      cx: [106, 114, 106],
                      opacity: [1, 0.8, 0],
                      scale: [0.8, 1.2, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.55,
                      delay: 0.15,
                      ease: 'easeOut',
                    }}
                  />
                </g>
              )}

              {/* Citrus Garnish Accent on Rim */}
              <motion.g
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, delay: 0.3 }}
                transform="translate(48, 38)"
              >
                {/* Orange Wheel Slice */}
                <circle cx="0" cy="0" r="14" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                <circle cx="0" cy="0" r="11" fill="#ea580c" />
                <circle cx="0" cy="0" r="3" fill="#fef08a" />
                {/* Segments */}
                <line x1="0" y1="-11" x2="0" y2="11" stroke="#fef08a" strokeWidth="1" opacity="0.7" />
                <line x1="-11" y1="0" x2="11" y2="0" stroke="#fef08a" strokeWidth="1" opacity="0.7" />
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="#fef08a" strokeWidth="1" opacity="0.7" />
                <line x1="-8" y1="8" x2="8" y2="-8" stroke="#fef08a" strokeWidth="1" opacity="0.7" />
              </motion.g>

            </svg>
          </div>
        </div>

        {/* Brand Header */}
        <div className="space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{type === 'auth' ? 'Securing Session' : 'Crafting Fresh Pour'}</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            {type === 'auth' ? (
              title
            ) : (
              <>
                Immy <span className="text-amber-400">Drinks</span>
              </>
            )}
          </h2>

          <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Dynamic Progress Bar & Pour Stage Status */}
        <div className="w-full max-w-xs space-y-2.5">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shadow-lg shadow-amber-500/50"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.15 }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-400/90 font-medium animate-pulse">{getPourStatus()}</span>
            <span className="text-amber-400 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Direct Hotline Footer */}
        <div className="mt-8 text-[11px] text-zinc-500">
          Direct Customer Line: <span className="text-zinc-300 font-semibold">0752619129 · 0760535440</span>
        </div>

      </div>
    </div>
  );
};
