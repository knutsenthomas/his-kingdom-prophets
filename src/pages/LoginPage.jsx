import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { auth } from '@/firebase';
import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  LogOut 
} from 'lucide-react';
import logo from '@/assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const params = new URLSearchParams(location.search);
  const redirectTarget = params.get('redirect') || '/teacher/dashboard';

  const ADMIN_EMAILS = [
    'knutsenthomas@gmail.com', 
    'thomas@tk-design.no', 
    'thomas@hiskingdomministry.no',
    'hildekarin@hiskingdomministry.no'
  ];
  const cleanEmail = user?.email?.toLowerCase();
  const isAdmin = Boolean(user && (user.role === 'admin' || user.role === 'superadmin' || ADMIN_EMAILS.includes(cleanEmail)));

  const formatAuthError = (err) => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'Ugyldig e-postadresse.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Feil e-postadresse eller passord.';
      case 'auth/email-already-in-use':
        return 'Denne e-postadressen er allerede i bruk.';
      case 'auth/weak-password':
        return 'Passordet må ha minst 6 tegn.';
      case 'auth/popup-closed-by-user':
        return 'Innloggingsvinduet ble lukket før fullføring.';
      case 'auth/unauthorized-domain':
        return 'Uautorisert domene for pålogging. Kontroller Firebase-innstillinger.';
      default:
        return err?.message || 'Det oppstod en feil under innlogging. Prøv igjen.';
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Vennligst fyll ut både e-post og passord.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await login(email.trim(), password);
      localStorage.setItem('hkm-cms-authorized', 'true');
      showToast('Innlogging vellykket!');
      navigate(redirectTarget);
    } catch (err) {
      console.error('Innloggingsfeil:', err);
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      localStorage.setItem('hkm-cms-authorized', 'true');
      showToast('Innlogget med Google!');
      navigate(redirectTarget);
    } catch (err) {
      console.error('Google innloggingsfeil:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(formatAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      await signInWithPopup(auth, provider);
      localStorage.setItem('hkm-cms-authorized', 'true');
      showToast('Innlogget med Apple!');
      navigate(redirectTarget);
    } catch (err) {
      console.error('Apple innloggingsfeil:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(formatAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-[460px] bg-white border border-slate-200/80 rounded-[24px] shadow-xl shadow-purple-950/5 p-6 sm:p-10 space-y-6"
      >
        {/* HKP Round Logo */}
        <div className="flex justify-center">
          <Link to="/" title="Gå til forsiden">
            <img 
              src={logo} 
              alt="His Kingdom Prophetic Community" 
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-contain shadow-md shadow-purple-950/20 transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#240046] font-serif">
            His Kingdom Prophetic<br />Community
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 max-w-sm mx-auto leading-relaxed">
            {isAdmin 
              ? 'Du er innlogget med administratorrettigheter på hkpc.no.' 
              : 'Logg inn for å få tilgang til administrative verktøy og redigering av nettsiden.'}
          </p>
        </div>

        {/* If already logged in as Admin */}
        {isAdmin ? (
          <div className="space-y-4 pt-2">
            <div className="bg-[#561291]/5 border border-[#561291]/20 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-2.5 bg-[#561291] text-white rounded-xl shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#271f30]">{user?.name || user?.email}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#561291] bg-[#561291]/15 px-2.5 py-0.5 rounded-full">
                  Administrator
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="w-full h-12 rounded-xl bg-[#3c096c] hover:bg-[#240046] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Gå til Admin Dashbord</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => navigate('/?edit=1')}
              className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#3c096c] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <Sparkles size={15} />
              <span>Gå til Forsiden med redigering</span>
            </button>

            <button
              onClick={() => {
                logout();
                localStorage.removeItem('hkm-cms-authorized');
                showToast('Du er nå logget ut.');
              }}
              className="w-full text-slate-400 hover:text-rose-600 text-xs font-semibold py-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Logg ut</span>
            </button>
          </div>
        ) : (
          /* Login Mode matching app */
          <div className="space-y-4">
            {/* OAuth Buttons (Google & Apple) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="h-12 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-xs text-slate-700 shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-60 select-none"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={isLoading}
                className="h-12 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-xs text-slate-700 shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-60 select-none"
              >
                <svg className="w-4 h-4 shrink-0 fill-current text-slate-900" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.71-13.98-5.33-8.15-9.63-17.75-12.89-28.81-3.26-11.06-4.9-21.78-4.9-32.16 0-14.89 3.86-27.17 11.59-36.85 7.73-9.68 17.5-14.58 29.3-14.71 4.79 0 10.23 1.25 16.32 3.75 6.09 2.5 10.05 3.81 11.88 3.93 1.41-.12 5.54-1.49 12.39-4.11 6.86-2.62 12.56-3.81 17.1-3.58 12.53.65 22.48 5.48 29.86 14.5-10.99 6.64-16.38 15.62-16.18 26.96.22 8.81 3.59 16.27 10.12 22.38 6.53 6.11 14.36 9.69 23.5 10.74-2.18 6.53-4.68 12.53-7.51 18.01zm-32.74-120.2c0 6.74-2.45 13.23-7.36 19.46-5.87 7.29-13.06 11.55-21.57 12.79-.11-1.09-.16-2.07-.16-2.94 0-6.63 2.61-13.24 7.84-19.82 5.23-6.58 12.31-10.75 21.25-12.51.21 1.09.32 2.1.32 3.02z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-slate-200"></div>
              <span className="absolute bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Eller med e-post og passord
              </span>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div role="alert" className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-rose-500" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  E-postadresse
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din.epost@eksempel.no"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:border-[#3c096c] focus:outline-none focus:ring-0 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Passord
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:border-[#3c096c] focus:outline-none focus:ring-0 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#3c096c] hover:bg-[#240046] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                <KeyRound size={16} />
                <span>{isLoading ? 'Logger inn …' : 'Logg inn som Admin'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Sub-footer note */}
        <div className="pt-3 text-center space-y-2 border-t border-slate-100 mt-2">
          <p className="text-[11px] text-slate-400">
            Er du student eller elev?{' '}
            <a 
              href="https://app.hkpc.no" 
              className="text-[#3c096c] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Gå til HKP Community App (app.hkpc.no)</span>
              <ExternalLink size={11} />
            </a>
          </p>
          <div>
            <Link 
              to="/" 
              className="text-xs text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Tilbake til forsiden</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

