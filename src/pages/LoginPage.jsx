import React, { useEffect } from 'react';
import logo from '@/assets/logo.png';

export default function LoginPage() {
  useEffect(() => {
    window.location.replace('https://app.hkpc.no');
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#3c096c]/10 flex items-center justify-center mb-4">
        <img src={logo} alt="HKP Logo" className="w-10 h-10 object-contain" />
      </div>
      <h1 className="text-xl font-bold text-[#240046] mb-2">
        Videresender til HKP Community …
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Føres til den nye innloggingsportalen på app.hkpc.no
      </p>
      <a 
        href="https://app.hkpc.no" 
        className="px-6 py-2.5 rounded-xl bg-[#3c096c] text-white text-xs font-semibold shadow-sm hover:bg-[#240046] transition-all"
      >
        Klikk her hvis du ikke videresendes automatisk
      </a>
    </div>
  );
}
