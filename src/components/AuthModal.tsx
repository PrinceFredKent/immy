import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Lock, 
  Leaf, 
  AlertCircle, 
  X,
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Mail,
  Phone,
  UserCheck,
  Sparkles,
  Loader2
} from 'lucide-react';
import { AuthUser } from '../types';
import { cloudSignIn, cloudSignUp } from '../lib/cloudService';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: AuthUser;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  initialMode?: 'signin' | 'signup';
  promptTitle?: string;
  promptSubtitle?: string;
  hideGuestOption?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  initialMode,
  promptTitle,
  promptSubtitle,
  hideGuestOption = false,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode || 'signin');

  // Synchronize authMode if initialMode changes
  React.useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode, isOpen]);

  // Sign In inputs
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // Sign In handler using real cloud auth with fallback
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setAuthError('Please enter both your email or phone and password.');
      setIsLoading(false);
      return;
    }

    try {
      // Authenticate via Firebase Cloud Auth
      const user = await cloudSignIn(cleanIdentifier, cleanPassword);
      onLogin(user);
      if (onClose) onClose();
    } catch (err: any) {
      console.warn('Sign-in notice:', err?.message || err);
      const code = err.code || '';
      if (code === 'auth/wrong-password') {
        setAuthError('Incorrect password. Please verify your password and try again.');
      } else if (code === 'auth/user-not-found') {
        setAuthError('Account not found. Please click "Sign Up" to create an account.');
      } else if (code === 'auth/invalid-credential') {
        setAuthError('Invalid credentials. Please verify your email/phone and password.');
      } else if (code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setAuthError('Access temporarily disabled due to many failed login attempts. Please reset password or try again later.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up handler using real cloud auth
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    if (!signUpName.trim()) {
      setAuthError('Please enter your full name.');
      setIsLoading(false);
      return;
    }
    if (!signUpPhone.trim()) {
      setAuthError('Please enter your phone number.');
      setIsLoading(false);
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    const cleanEmail = signUpEmail.trim().toLowerCase();
    const cleanPhone = signUpPhone.trim();
    const emailOrPhone = cleanEmail || cleanPhone;

    try {
      const user = await cloudSignUp(
        signUpName.trim(),
        emailOrPhone,
        signUpPassword.trim(),
        cleanPhone
      );
      onLogin(user);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Sign-up error:', err);
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') {
        setAuthError('This email or phone number is already registered. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setAuthError('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address format.');
      } else {
        setAuthError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Continue as Guest handler
  const handleGuestContinue = () => {
    onLogin({
      id: 'guest',
      name: 'Guest Customer',
      email: 'guest@immydrinks.com',
      phone: '',
      role: 'customer',
      isLoggedIn: true,
    });
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop with smooth blur and fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-md bg-[#12151d] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10"
          >
            {/* Top decorative ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/15 blur-2xl pointer-events-none rounded-full" />

            {/* Top Branding Header */}
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.05 }}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-xl shadow-amber-500/25"
                >
                  <Leaf className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white tracking-tight flex items-center gap-1.5">
                    <span>Immy</span>
                    <span className="text-amber-400">Drinks</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">Drink With Distinction • Cloud Portal</p>
                </div>
              </div>

              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Custom Prompt Banner */}
            {promptTitle && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300">{promptTitle}</h4>
                  {promptSubtitle && (
                    <p className="text-[11px] text-zinc-300 leading-relaxed mt-0.5">{promptSubtitle}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Signed in user notice if already logged in */}
            {currentUser.isLoggedIn && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-zinc-300">Active session:</span>
                  <span className="font-bold text-amber-300 capitalize">{currentUser.name} ({currentUser.role})</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:underline transition-colors"
                >
                  Sign Out
                </button>
              </motion.div>
            )}

            {/* Authentication Mode Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/10 mb-4 relative">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                }}
                className={`relative py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all z-10 ${
                  authMode === 'signin' ? 'text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {authMode === 'signin' && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                className={`relative py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all z-10 ${
                  authMode === 'signup' ? 'text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {authMode === 'signup' && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </span>
              </button>
            </div>

            {/* Animated Form Container */}
            <AnimatePresence mode="wait">
              {authMode === 'signin' ? (
                <motion.form
                  key="signin-form"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignIn}
                  className="space-y-3.5"
                >
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Email Address or Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="e.g. name@example.com or phone number"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                      />
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                      />
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 overflow-hidden"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all mt-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUp}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Full Name <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => {
                          setSignUpName(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="Enter your full name"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                      />
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Phone Number <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={signUpPhone}
                        onChange={(e) => {
                          setSignUpPhone(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="Enter your phone number"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                      />
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Email Address
                      </label>
                      <span className="text-[10px] text-zinc-500 font-medium">Optional</span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => {
                          setSignUpEmail(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="Enter your email address"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
                      />
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Create Password <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => {
                          setSignUpPassword(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-9 pr-10 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono"
                      />
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-zinc-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 overflow-hidden"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all mt-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Create Account & Start Ordering</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* CONTINUE AS GUEST OPTION */}
            {!hideGuestOption && (
              <div className="mt-5 pt-4 border-t border-white/10 text-center">
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGuestContinue}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Continue as Guest Customer</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </motion.button>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
