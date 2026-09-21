import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Sparkles, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // If already running as an installed PWA, do not render
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else {
      // Fallback instructions if browser prompt is not ready or manual install
      setShowIOSGuide(true);
    }
  };

  // Header mini button variant
  if (variant === 'header') {
    return (
      <>
        <button
          id="pwa-header-install-btn"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
          title="Install Immy Drinks App"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </button>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  // Floating or In-view banner variant
  if (variant === 'banner' && !bannerDismissed) {
    return (
      <>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#181d28] to-[#12151d] border border-amber-500/30 p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Get the Immy Drinks App</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Fast & Offline
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 hidden sm:block">
                  Install on your home screen for 1-tap orders, offline menu access & instant delivery tracking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="pwa-banner-install-action"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalling ? 'Installing...' : 'Install Now'}</span>
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  // Settings / Account view card variant
  if (variant === 'settings') {
    return (
      <>
        <div className="p-4 rounded-2xl bg-[#141722] border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Install Immy Drinks App</p>
              <p className="text-xs text-zinc-400">Add to your home screen for quick launch and gestures</p>
            </div>
          </div>
          <button
            id="pwa-settings-install-btn"
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  return null;
};

// Modal guide for iOS and manual installation
const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#151922] border border-white/15 p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Install Immy Drinks</h3>
              <p className="text-[10px] text-zinc-400">Drink With Distinction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-zinc-300">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
              1
            </div>
            <div>
              <p className="font-semibold text-white">Tap the Share button</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                In Safari or your browser toolbar, tap <Share2 className="w-3.5 h-3.5 text-amber-400 inline" /> <strong>Share</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
              2
            </div>
            <div>
              <p className="font-semibold text-white">Add to Home Screen</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                Scroll down and select <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" /> <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">Enjoy Fullscreen & Offline</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Launch directly from your home screen just like a native mobile app!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
