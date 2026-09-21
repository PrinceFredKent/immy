import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Check, 
  Plus, 
  Trash2, 
  LogOut,
  Sparkles,
  Shield,
  X,
  Palette
} from 'lucide-react';
import { UserProfile, DeliveryAddress } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeSelector } from './ThemeSelector';
import { ThemeMode } from '../hooks/useTheme';

interface CustomerAccountViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onAddNewAddress: (address: DeliveryAddress) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  onLogout: () => void;
  onDeleteAccount?: () => void;
  themeMode: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  onChangeTheme: (mode: ThemeMode) => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  userProfile,
  onUpdateProfile,
  onAddNewAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onLogout,
  onDeleteAccount,
  themeMode,
  resolvedTheme,
  onChangeTheme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);

  // New address modal/form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('Kampala, Uganda');
  const [notes, setNotes] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || userProfile.name,
      email: email.trim() || userProfile.email,
      phone: phone.trim() || userProfile.phone,
    });
    setIsEditing(false);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) return;

    const newAddress: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      label: label.trim() || 'Custom Spot',
      street: street.trim(),
      unit: unit.trim() || undefined,
      city: city.trim() || 'Kampala, Uganda',
      notes: notes.trim() || undefined,
      isDefault: userProfile.savedAddresses.length === 0,
    };

    onAddNewAddress(newAddress);
    setShowAddAddress(false);
    setLabel('');
    setStreet('');
    setUnit('');
    setNotes('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Manage your personal profile details and doorstep delivery addresses
          </p>
        </div>

        <button
          id="account-signout-btn"
          onClick={onLogout}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Profile Details Card */}
      <div className="p-6 rounded-3xl bg-[#13161e] border border-white/10 shadow-2xl space-y-5 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-600/20 to-amber-700/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 shrink-0">
              {userProfile.avatarUrl && !userProfile.avatarUrl.includes('unsplash.com') ? (
                <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User className="w-8 h-8 text-amber-400 stroke-[2]" />
              )}
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-white">
                {userProfile.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">{userProfile.email}</p>
              <p className="text-xs text-amber-400/90 font-medium mt-0.5">{userProfile.phone}</p>
            </div>
          </div>

          <button
            id="toggle-edit-profile-btn"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? 'Cancel editing' : 'Edit profile details'}
            aria-label={isEditing ? 'Cancel editing' : 'Edit profile details'}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center transition-all shrink-0"
          >
            {isEditing ? (
              <X className="w-4 h-4 text-zinc-400" />
            ) : (
              <Edit3 className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="pt-4 border-t border-white/10 space-y-3.5 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-colors"
            >
              Save Profile Changes
            </button>
          </form>
        )}
      </div>

      {/* App Theme Auto Detect & Preferences */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#13161e] border border-white/10 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-amber-400" />
          <h3 className="font-display font-bold text-base text-white">
            App Theme & Display
          </h3>
        </div>
        <ThemeSelector
          themeMode={themeMode}
          resolvedTheme={resolvedTheme}
          onChangeTheme={onChangeTheme}
        />
        <p className="text-[11px] text-zinc-400 pt-1">
          When set to <strong className="text-amber-400">System</strong>, Immy Drinks automatically syncs with your phone or device light and dark mode preferences.
        </p>
      </div>

      {/* Saved Delivery Addresses Section */}
      <div className="p-6 rounded-3xl bg-[#13161e] border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-bold text-base text-white">
              Saved Delivery Addresses
            </h3>
          </div>

          <button
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddAddress ? 'Close' : 'Add Address'}</span>
          </button>
        </div>

        {/* Add Address Form */}
        {showAddAddress && (
          <form onSubmit={handleCreateAddress} className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-amber-300">Add New Destination Spot</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                placeholder="Label (e.g. Home, Office)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                required
                placeholder="Street / Plot (e.g. Acacia Avenue Plot 14)"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Unit / Gate / Floor"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <input
              type="text"
              placeholder="Delivery Instructions / Notes (e.g. Ring bell at reception)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Save Address Spot
            </button>
          </form>
        )}

        {/* Addresses List */}
        <div className="space-y-2.5">
          {userProfile.savedAddresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-3.5 rounded-2xl bg-black/30 border transition-all flex items-start justify-between gap-3 ${
                addr.isDefault ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/5 hover:border-white/15'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Default Delivery
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-300 mt-0.5">{addr.street}</p>
                {addr.unit && <p className="text-[11px] text-zinc-400">{addr.unit}</p>}
                <p className="text-[11px] text-zinc-400">{addr.city}</p>
                {addr.notes && (
                  <p className="text-[11px] text-amber-300/80 mt-1 italic">Note: {addr.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!addr.isDefault && (
                  <button
                    onClick={() => onSetDefaultAddress(addr.id)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] font-medium transition-colors"
                  >
                    Set Default
                  </button>
                )}

                {userProfile.savedAddresses.length > 1 && (
                  <button
                    onClick={() => onDeleteAddress(addr.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Installability Card */}
      <PWAInstallButton variant="settings" />

      {/* Account Management & Danger Zone */}
      {onDeleteAccount && (
        <div className="bg-[#13161e] border border-rose-500/20 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-rose-300 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Account Management & Data Removal
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Permanently delete your profile, saved delivery addresses, and customer data.
              </p>
            </div>
            <button
              id="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && onDeleteAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#181c25] border border-rose-500/30 rounded-3xl p-6 w-full max-w-md text-white shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-display font-bold text-lg text-white">
                Delete Your Account?
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                This action is permanent and cannot be undone. All your saved addresses, order history, and account preferences will be completely wiped.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-account-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteAccount();
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
