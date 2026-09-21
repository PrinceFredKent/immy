import React from 'react';
import { Monitor, Moon, Sun, Check } from 'lucide-react';
import { ThemeMode } from '../hooks/useTheme';

interface ThemeSelectorProps {
  themeMode: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  onChangeTheme: (mode: ThemeMode) => void;
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themeMode,
  resolvedTheme,
  onChangeTheme,
  compact = false,
}) => {
  return (
    <div className="space-y-1.5">
      {!compact && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            App Appearance
          </span>
          <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            {themeMode === 'system' ? `Auto Detect (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})` : `${themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs">
        {/* System Auto Button */}
        <button
          type="button"
          onClick={() => onChangeTheme('system')}
          className={`py-2 px-2 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-all ${
            themeMode === 'system'
              ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="Auto detect system dark or light preference"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="truncate">System</span>
          {themeMode === 'system' && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
        </button>

        {/* Dark Mode Button */}
        <button
          type="button"
          onClick={() => onChangeTheme('dark')}
          className={`py-2 px-2 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-all ${
            themeMode === 'dark'
              ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="Force Dark theme"
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="truncate">Dark</span>
          {themeMode === 'dark' && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
        </button>

        {/* Light Mode Button */}
        <button
          type="button"
          onClick={() => onChangeTheme('light')}
          className={`py-2 px-2 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-all ${
            themeMode === 'light'
              ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="Force Light theme"
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="truncate">Light</span>
          {themeMode === 'light' && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
        </button>
      </div>
    </div>
  );
};
