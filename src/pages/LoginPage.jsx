import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    login(email, password);

    // Dynamic routing depending on who logs in
    if (email.includes('teacher')) {
      navigate('/teacher/dashboard');
    } else if (email.includes('admin')) {
      navigate('/admin/cms');
    } else {
      navigate('/interests');
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('pass123');
    login(roleEmail, 'pass123');
    
    setTimeout(() => {
      if (roleEmail.includes('teacher')) {
        navigate('/teacher/dashboard');
      } else if (roleEmail.includes('admin')) {
        navigate('/admin/cms');
      } else {
        navigate('/interests');
      }
    }, 400);
  };

  return (
    <div className="bg-background text-on-background font-sans min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-outline-variant shadow-lg overflow-hidden flex flex-col p-6 sm:p-8">
        
        {/* Title */}
        <div className="text-center mb-8">
          <div 
            onClick={() => navigate('/')} 
            className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-2 cursor-pointer"
          >
            Scholastic Premium
          </div>
          <p className="text-sm text-on-surface-variant">Logg inn på din akademiske portal</p>
        </div>

        {/* Quick login helper profiles */}
        <div className="mb-6 bg-surface-container-low border border-outline-variant p-4 rounded-xl">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3 text-center">Hurtigpålogging (Demo)</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('student@scholastic.com')}
              className="px-2 py-2 bg-primary text-white text-xs rounded hover:opacity-90 active:scale-[0.98] transition-all font-semibold"
            >
              Student
            </button>
            <button
              onClick={() => handleQuickLogin('teacher@scholastic.com')}
              className="px-2 py-2 bg-secondary-container text-primary text-xs rounded hover:opacity-90 active:scale-[0.98] transition-all font-semibold"
            >
              Lærer
            </button>
            <button
              onClick={() => handleQuickLogin('admin@scholastic.com')}
              className="px-2 py-2 bg-tertiary-container text-white text-xs rounded hover:opacity-90 active:scale-[0.98] transition-all font-semibold"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-field-stable">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">E-postadresse</label>
            <input
              type="email"
              placeholder="navn@scholastic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container border border-outline rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
              required
            />
          </div>

          <div className="form-field-stable">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Passord</label>
              <a href="#" className="text-xs text-primary hover:underline">Glemt passord?</a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container border border-outline rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 rounded text-primary focus:ring-primary border-outline"
            />
            <label htmlFor="remember" className="text-xs text-on-surface-variant cursor-pointer select-none">Husk meg på denne enheten</label>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-on-primary py-3 rounded-lg hover:opacity-90 transition-all font-semibold text-sm active:scale-[0.98] shadow mt-4 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">login</span>
            Logg inn nå
          </button>
        </form>

        {/* Bottom helper info */}
        <div className="mt-8 text-center text-xs text-on-surface-variant">
          <span>Har du ikke en konto? </span>
          <button onClick={() => navigate('/register')} className="text-primary hover:underline font-semibold">Opprett profil her</button>
        </div>

      </div>
    </div>
  );
}
