import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import CmsText from '@/components/CmsText';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shield, Check, Key, GraduationCap, Users, ShieldAlert } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { 
    user,
    login, 
    registerWithEmail, 
    loginWithGoogle, 
    loginWithApple, 
    loginPasswordless,
    showToast 
  } = useApp();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'passwordless'
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'teacher' | 'admin' | 'superadmin'

  const handleAuthSuccess = (emailAddress, role, onboardingCompleted) => {
    const checkEmail = emailAddress ? emailAddress.toLowerCase() : '';
    
    if (['thomas@tk-design.no', 'knutsenthomas@gmail.com'].includes(checkEmail) || role === 'superadmin') {
      navigate('/teacher/profile');
      return;
    }
    
    const checkRole = role || 'student';
    
    if (checkRole === 'teacher' || checkEmail.includes('teacher') || checkEmail.includes('david')) {
      navigate('/teacher/profile');
    } else if (checkRole === 'admin' || checkEmail.includes('admin') || checkEmail.includes('siri')) {
      navigate('/teacher/profile');
    } else {
      if (onboardingCompleted) {
        navigate('/student/profile');
      } else {
        navigate('/interests');
      }
    }
  };

  // Reactive redirect observer - triggers immediately once user context changes (Google, email, Apple)
  useEffect(() => {
    if (user && user.email) {
      handleAuthSuccess(user.email, user.role, user.onboardingCompleted);
    }
  }, [user]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    if (isSignUp) {
      // Sign Up
      await registerWithEmail(email, password || 'pass123', name || 'Ny Bruker', selectedRole);
    } else {
      // Sign In
      if (loginMethod === 'passwordless') {
        await loginPasswordless(email, selectedRole);
      } else {
        await login(email, password);
      }
    }
  };

  const handleQuickLogin = (roleEmail, chosenRole) => {
    setEmail(roleEmail);
    setPassword('pass123');
    login(roleEmail, 'pass123');
  };

  const handleSocialLogin = async (platform) => {
    if (platform === 'google') {
      await loginWithGoogle(selectedRole);
    } else {
      await loginWithApple(selectedRole);
    }
  };

  return (
    <div className="bg-[#f6fafe] text-[#171c1f] font-sans min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background blobs for premium glassmorphic effect */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1b4965]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#cee5ff]/30 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl border border-[#c1c7ce]/50 shadow-2xl overflow-hidden flex flex-col p-6 sm:p-10 relative z-10"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="His Kingdom Prophets Logo" 
              className="w-16 h-16 object-contain cursor-pointer hover:scale-105 active:scale-95 transition-all"
              onClick={() => navigate('/')} 
            />
          </div>
          <div 
            onClick={() => navigate('/')} 
            className="font-serif text-3xl sm:text-4xl font-bold text-[#00324b] mb-2 cursor-pointer tracking-tight hover:opacity-90 active:scale-[0.99] transition-all"
          >
            <CmsText slug="login-title" fallback="His Kingdom Prophets" />
          </div>
          <p className="text-sm text-[#46617b] max-w-md mx-auto">
            {isSignUp 
              ? 'Opprett en ny profil på vår åpenbaringsportal for å starte din åndelige og profetiske utrustning.' 
              : 'Logg inn for å få tilgang til dine kurs, studieguider og administrative verktøy.'}
          </p>
        </div>

        {/* Tab Selector: Sign In vs Sign Up */}
        <div className="flex bg-[#eaeef2] p-1 rounded-full mb-8 max-w-sm mx-auto w-full relative">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all relative z-10 ${
              !isSignUp ? 'text-[#00324b] font-bold' : 'text-[#41474d] hover:text-[#171c1f]'
            }`}
          >
            Logg inn
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all relative z-10 ${
              isSignUp ? 'text-[#00324b] font-bold' : 'text-[#41474d] hover:text-[#171c1f]'
            }`}
          >
            Registrer deg
          </button>
          
          {/* Animated Tab Background Indicator */}
          <motion.div
            className="absolute top-1 bottom-1 left-1 bg-white rounded-full shadow-sm"
            layoutId="activeTabIndicator"
            style={{ width: 'calc(50% - 4px)' }}
            animate={{ x: isSignUp ? '100%' : '0%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Social Authentication Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#c1c7ce] rounded-xl hover:bg-[#f6fafe] active:scale-[0.98] transition-all font-semibold text-sm text-[#41474d] shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>
          
          <button
            onClick={() => handleSocialLogin('apple')}
            className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[#c1c7ce] rounded-xl hover:bg-[#f6fafe] active:scale-[0.98] transition-all font-semibold text-sm text-[#41474d] shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.73-1.16 1.87-1.01 2.98 1.1.09 2.22-.55 2.96-1.43z" />
            </svg>
            Apple
          </button>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-[1px] bg-[#c1c7ce]/50" />
          <span className="text-xs text-[#72787e] uppercase tracking-wider font-bold">Eller med e-post</span>
          <div className="flex-1 h-[1px] bg-[#c1c7ce]/50" />
        </div>

        {/* Main Authentication Flow */}
        <AnimatePresence mode="wait">
          {!isSignUp ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Login Method Toggle: Password vs Passwordless */}
              <div className="flex gap-4 border-b border-[#c1c7ce]/40 mb-6">
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`pb-2.5 text-xs uppercase tracking-wider font-bold transition-all relative ${
                    loginMethod === 'password' ? 'text-[#00324b]' : 'text-[#72787e] hover:text-[#41474d]'
                  }`}
                >
                  Passord
                  {loginMethod === 'password' && (
                    <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00324b]" layoutId="loginMethodLine" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('passwordless')}
                  className={`pb-2.5 text-xs uppercase tracking-wider font-bold transition-all relative ${
                    loginMethod === 'passwordless' ? 'text-[#00324b]' : 'text-[#72787e] hover:text-[#41474d]'
                  }`}
                >
                  Løsinnlogging (Uten Passord)
                  {loginMethod === 'passwordless' && (
                    <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00324b]" layoutId="loginMethodLine" />
                  )}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="form-field-stable">
                  <label className="block text-xs font-bold text-[#41474d] uppercase tracking-wider mb-2">E-postadresse</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72787e]" />
                    <input
                      type="email"
                      placeholder="knutsenthomas@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f6fafe] border border-[#c1c7ce] rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1b4965] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {loginMethod === 'password' && (
                  <div className="form-field-stable">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-[#41474d] uppercase tracking-wider">Passord</label>
                      <button 
                        type="button" 
                        onClick={() => showToast('Passordgjenoppretting er sendt til din e-post!')}
                        className="text-xs text-[#00324b] hover:underline font-semibold"
                      >
                        Glemt passord?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72787e]" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#f6fafe] border border-[#c1c7ce] rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1b4965] focus:outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#00324b] text-white py-3.5 rounded-xl hover:opacity-95 transition-all font-bold text-sm active:scale-[0.99] shadow-md mt-6 flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {loginMethod === 'password' ? 'Logg inn med passord' : 'Send meg magisk lenke'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="form-field-stable">
                  <label className="block text-xs font-bold text-[#41474d] uppercase tracking-wider mb-2">Fullt Navn</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72787e]" />
                    <input
                      type="text"
                      placeholder="Erik Johansen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#f6fafe] border border-[#c1c7ce] rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1b4965] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="form-field-stable">
                  <label className="block text-xs font-bold text-[#41474d] uppercase tracking-wider mb-2">E-postadresse</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72787e]" />
                    <input
                      type="email"
                      placeholder="knutsenthomas@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f6fafe] border border-[#c1c7ce] rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1b4965] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="form-field-stable">
                  <label className="block text-xs font-bold text-[#41474d] uppercase tracking-wider mb-2">Passord</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#72787e]" />
                    <input
                      type="password"
                      placeholder="Min. 8 tegn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#f6fafe] border border-[#c1c7ce] rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#1b4965] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Granular 4-Card Role Selector */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-[#41474d] uppercase tracking-wider">Velg din rolle på plattformen</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Card 1: Student */}
                    <div
                      onClick={() => setSelectedRole('student')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 hover:bg-[#f6fafe] ${
                        selectedRole === 'student'
                          ? 'border-[#00324b] bg-[#cee5ff]/20'
                          : 'border-[#c1c7ce]/50 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedRole === 'student' ? 'bg-[#00324b] text-white' : 'bg-[#eaeef2] text-[#41474d]'}`}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#00324b] flex items-center justify-between">
                          Student
                          {selectedRole === 'student' && <Check className="w-4 h-4 text-[#00324b]" />}
                        </p>
                        <p className="text-[11px] text-[#72787e] mt-1 leading-normal">
                          Tilgang til kursleksjoner, oppgaver og studentfellesskap.
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Lærer */}
                    <div
                      onClick={() => setSelectedRole('teacher')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 hover:bg-[#f6fafe] ${
                        selectedRole === 'teacher'
                          ? 'border-[#00324b] bg-[#cee5ff]/20'
                          : 'border-[#c1c7ce]/50 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedRole === 'teacher' ? 'bg-[#00324b] text-white' : 'bg-[#eaeef2] text-[#41474d]'}`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#00324b] flex items-center justify-between">
                          Lærer / Mentor
                          {selectedRole === 'teacher' && <Check className="w-4 h-4 text-[#00324b]" />}
                        </p>
                        <p className="text-[11px] text-[#72787e] mt-1 leading-normal">
                          Veilede studenter, rette oppgaver og godkjenne moduler.
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Admin */}
                    <div
                      onClick={() => setSelectedRole('admin')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 hover:bg-[#f6fafe] ${
                        selectedRole === 'admin'
                          ? 'border-[#00324b] bg-[#cee5ff]/20'
                          : 'border-[#c1c7ce]/50 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedRole === 'admin' ? 'bg-[#00324b] text-white' : 'bg-[#eaeef2] text-[#41474d]'}`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#00324b] flex items-center justify-between">
                          Administrator
                          {selectedRole === 'admin' && <Check className="w-4 h-4 text-[#00324b]" />}
                        </p>
                        <p className="text-[11px] text-[#72787e] mt-1 leading-normal">
                          Administrere sider (CMS), administrere studenter og systemet.
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Super Admin */}
                    <div
                      onClick={() => setSelectedRole('superadmin')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 hover:bg-[#f6fafe] ${
                        selectedRole === 'superadmin'
                          ? 'border-[#00324b] bg-[#cee5ff]/20'
                          : 'border-[#c1c7ce]/50 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedRole === 'superadmin' ? 'bg-[#00324b] text-white' : 'bg-[#eaeef2] text-[#41474d]'}`}>
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#00324b] flex items-center justify-between">
                          Super Admin
                          {selectedRole === 'superadmin' && <Check className="w-4 h-4 text-[#00324b]" />}
                        </p>
                        <p className="text-[11px] text-[#72787e] mt-1 leading-normal">
                          Full systemkontroll, global rettighetsstyring og lisensinnstillinger.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00324b] text-white py-3.5 rounded-xl hover:opacity-95 transition-all font-bold text-sm active:scale-[0.99] shadow-md mt-6 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Opprett profil nå
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>



      </motion.div>
    </div>
  );
}
