import React from 'react';

interface MenuCardSkeletonProps {
  className?: string;
}

export const MenuCardSkeleton: React.FC<MenuCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative h-[460px] sm:h-[500px] w-full rounded-3xl overflow-hidden bg-[#12151d] border border-white/10 shadow-2xl flex flex-col justify-between p-4 sm:p-5 ${className}`}
    >
      {/* Gliding Shimmer Beam */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none z-20" />

      {/* Top Action Bar Skeletons */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-16 rounded-full bg-white/10 skeleton-pulse animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-white/10 skeleton-pulse animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-white/10 skeleton-pulse animate-pulse" />
          <div className="h-6 w-14 rounded-full bg-white/10 skeleton-pulse animate-pulse" />
        </div>
      </div>

      {/* Center Subtle Beverage Silhouette */}
      <div className="relative z-0 my-auto flex flex-col items-center justify-center opacity-40">
        <div className="w-20 sm:w-24 h-40 sm:h-44 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 skeleton-pulse animate-pulse flex flex-col items-center justify-start p-2">
          <div className="w-8 h-4 rounded-full bg-white/15 skeleton-pulse-deep mb-2" />
          <div className="w-12 h-14 rounded-xl bg-white/10 skeleton-pulse mt-6" />
        </div>
      </div>

      {/* Bottom Information Skeletons */}
      <div className="relative z-10 space-y-2.5">
        {/* Flavor Chips Skeletons */}
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-12 rounded-md bg-white/10 skeleton-pulse animate-pulse" />
          <div className="h-4 w-14 rounded-md bg-white/10 skeleton-pulse animate-pulse" />
          <div className="h-4 w-16 rounded-md bg-white/10 skeleton-pulse animate-pulse" />
        </div>

        {/* Title & Tagline Skeletons */}
        <div className="space-y-1.5">
          <div className="h-6 w-44 rounded-lg bg-white/15 skeleton-pulse-deep animate-pulse" />
          <div className="h-3.5 w-64 rounded bg-white/10 skeleton-pulse animate-pulse" />
        </div>

        {/* Price & Action Row Skeletons */}
        <div className="pt-2.5 border-t border-white/10 menu-card-divider flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="h-2.5 w-8 rounded bg-white/10 skeleton-pulse animate-pulse" />
            <div className="h-6 w-24 rounded-lg bg-white/15 skeleton-pulse-deep animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-white/10 skeleton-pulse animate-pulse" />
            <div className="h-9 w-24 rounded-2xl bg-white/15 skeleton-pulse-deep animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const MenuGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <MenuCardSkeleton key={`menu-skeleton-${index}`} />
      ))}
    </div>
  );
};
