import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, FolderOpen, RefreshCw, Loader2 } from 'lucide-react';
import { uploadDrinkImage } from '../lib/storageService';

export interface PresetImage {
  label: string;
  url: string;
}

interface ImagePickerInputProps {
  value: string;
  onChange: (url: string) => void;
  presets?: PresetImage[];
  label?: string;
}

export const ImagePickerInput: React.FC<ImagePickerInputProps> = ({
  value = '',
  onChange,
  presets = [],
  label = 'Drink Photo / Image'
}) => {
  const safeValue = typeof value === 'string' ? value : '';
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>(
    safeValue.startsWith('data:') ? 'upload' : 'url'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Image file size must be under 8MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Try uploading to Supabase Storage bucket
      const publicUrl = await uploadDrinkImage(file);
      onChange(publicUrl);
    } catch (uploadErr) {
      console.warn('Supabase storage upload failed, falling back to inline data URL:', uploadErr);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          onChange(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const isUploadedFile = safeValue.startsWith('data:');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
          {label}
        </label>
        {safeValue && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
          >
            <X className="w-3 h-3" /> Clear Image
          </button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'upload'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'url'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Image URL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'presets'
              ? 'bg-amber-500 text-black shadow'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
      </div>

      {/* TAB CONTENT: UPLOAD FROM DEVICE */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10'
              : safeValue && isUploadedFile
              ? 'border-amber-500/50 bg-amber-500/5'
              : 'border-white/15 bg-white/5 hover:border-amber-400/50 hover:bg-white/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FolderOpen className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {isUploading
                  ? 'Uploading to Supabase Storage...'
                  : 'Click to browse device or drag & drop photo'}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {isUploading ? 'Securing image...' : 'PNG, JPG, WEBP, GIF up to 8MB'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEB URL */}
      {activeTab === 'url' && (
        <div className="space-y-1.5">
          <input
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={safeValue.startsWith('data:') ? '' : safeValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <p className="text-[10px] text-zinc-400">
            Paste a direct public image web link (e.g., Unsplash, Cloudinary, Imgur).
          </p>
        </div>
      )}

      {/* TAB CONTENT: PRESETS GALLERY */}
      {activeTab === 'presets' && Array.isArray(presets) && presets.length > 0 && (
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-1">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(preset.url)}
                className={`group relative rounded-xl border overflow-hidden p-1 text-left transition-all ${
                  safeValue === preset.url
                    ? 'border-amber-400 bg-amber-500/20 ring-1 ring-amber-400'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-full h-12 object-cover rounded-lg mb-1"
                />
                <span className="text-[9px] font-bold text-zinc-300 block truncate leading-tight group-hover:text-amber-300">
                  {preset.label}
                </span>
                {safeValue === preset.url && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LIVE IMAGE PREVIEW BOX */}
      {safeValue && (
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 mt-1.5">
          <img
            src={safeValue}
            alt="Drink preview"
            className="w-12 h-12 rounded-lg object-cover bg-black/50 border border-white/10 shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {isUploadedFile ? 'Device Image File' : 'Web Image Link'}
            </span>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
              {isUploadedFile ? 'Loaded from device' : safeValue}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'upload') {
                fileInputRef.current?.click();
              } else {
                setActiveTab('upload');
                setTimeout(() => fileInputRef.current?.click(), 100);
              }
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors text-xs flex items-center gap-1 shrink-0"
            title="Replace Photo"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="text-[10px] font-bold">Replace</span>
          </button>
        </div>
      )}
    </div>
  );
};
