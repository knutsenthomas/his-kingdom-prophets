import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { auth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, LogIn, LogOut, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const params = new URLSearchParams(location.search);
  const redirectTarget = params.get('redirect') || '/admin/cms';

  const ADMIN_EMAILS = ['knutsenthomas@gmail.com', 'thomas@tk-design.no', 'thomas@hiskingdomministry.no'];
  const cleanEmail = user?.email?.toLowerCase();
  const isAdmin = Boolean(user && (user.role === 'admin' || user.role === 'superadmin' || ADMIN_EMAILS.includes(cleanEmail)));

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
      setErrorMessage(err?.message || 'Ugyldig e-post eller passord.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      localStorage.setItem('hkm-cms-authorized', 'true');
      showToast('Innlogget med Google!');
      navigate(redirectTarget);
    } catch (err) {
      console.error('Google innloggingsfeil:', err);
      setErrorMessage('Google-innlogging ble avbrutt eller mislyktes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4F8] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white border border-[#ded7e4] rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="w-16 h-16 rounded-2xl bg-[#561291]/10 flex items-center justify-center mb-3 shadow-inner hover:scale-105 transition-transform">
            <img src={logo} alt="HKPC Logo" className="w-10 h-10 object-contain" />
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#561291] bg-[#561291]/10 px-2.5 py-0.5 rounded-full mb-1">
            His Kingdom Prophetic Community
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#271f30] font-serif">
            {isAdmin ? 'Du er innlogget' : 'Administrator Innlogging'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {isAdmin 
              ? 'Du har aktive administratorrettigheter til å redigere nettsiden.'
              : 'Logg inn med din adminkonto for å aktivere direkte tekstredigering og CMS-panelet.'}
          </p>
        </div>

        {/* If already logged in */}
        {isAdmin ? (
          <div className="space-y-4">
            <div className="bg-[#561291]/5 border border-[#561291]/20 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-[#561291] text-white rounded-lg">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#271f30]">{user?.name || user?.email}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#561291] bg-[#561291]/15 px-2 py-0.5 rounded">
                  Administrator
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/cms')}
              className="w-full bg-[#561291] hover:bg-[#430d70] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Gå til Admin CMS</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => navigate('/?edit=1')}
              className="w-full bg-white hover:bg-slate-50 border border-[#561291]/30 text-[#561291] py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Gå til Forsiden med redigering</span>
              <Sparkles size={14} />
            </button>

            <button
              onClick={() => {
                logout();
                localStorage.removeItem('hkm-cms-authorized');
                showToast('Du er nå logget ut.');
              }}
              className="w-full text-slate-400 hover:text-red-600 text-xs font-semibold py-2 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Logg ut</span>
            </button>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                E-postadresse
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="thomas@hiskingdomministry.no"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#561291] focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Passord
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#561291] focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#561291] hover:bg-[#430d70] disabled:opacity-60 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <span>Logger inn...</span>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Logg inn som Admin</span>
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-semibold">eller</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Logg inn med Google</span>
            </button>
          </form>
        )}

        {/* Link to Student Portal */}
        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500 mb-2">Er du student eller elev?</p>
          <a
            href="https://app.hkpc.no"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#561291] hover:underline"
          >
            <span>Gå til HKP Community App (app.hkpc.no)</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
