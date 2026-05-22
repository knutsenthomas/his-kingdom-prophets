import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, DollarSign, Eye, Copy, Check,
  ChevronRight, Award, Megaphone, Link as LinkIcon, Gift,
  Calendar, CheckCircle, ExternalLink, HelpCircle
} from 'lucide-react';

const INITIAL_CREATIVES = [
  {
    id: 'creative-1',
    channel: 'Sosiale Medier (Insta/FB)',
    text: 'Søker du dypere åpenbaring og teologisk ballast? Bli med på His Kingdom Prophets! En åpenbaringsskole for profetisk utrustning, eskatologi og grundig bibellære. Bruk min personlige lenke for registrering: {link}'
  },
  {
    id: 'creative-2',
    channel: 'E-post invitasjon',
    text: 'Hei!\n\nJeg ønsker å tipse deg om His Kingdom Prophets, en fantastisk nettbasert bibelskole som forener solid akademisk hermeneutikk med den profetiske gaverollen. Jeg har selv lært enormt mye her.\n\nSjekk det ut og registrer deg i dag via min invitasjonslenke: {link}'
  }
];

const TRANSACTION_DATA = [
  { id: 'txn-1', date: '2026-05-18', name: 'Andreas Moen', course: 'MIN 201: Sjelesorg', price: '4 500 kr', commission: '675 kr', status: 'Godkjent' },
  { id: 'txn-2', date: '2026-05-12', name: 'Karoline Vik', course: 'PROP 101: Profetisk Karakter', price: '3 200 kr', commission: '480 kr', status: 'Godkjent' },
  { id: 'txn-3', date: '2026-05-02', name: 'Daniel Berg', course: 'BIBLE 301: Hermeneutikk', price: '5 900 kr', commission: '885 kr', status: 'Overført' },
  { id: 'txn-4', date: '2026-04-28', name: 'Sara Jensen', course: 'MIN 201: Sjelesorg', price: '4 500 kr', commission: '675 kr', status: 'Overført' },
];

export default function AffiliatePortal() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();

  const [promoCode, setPromoCode] = useState('PROFET' + (user?.name ? user.name.split(' ')[0].toUpperCase() : '2026'));
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCreativeId, setCopiedCreativeId] = useState(null);

  const generatedLink = `https://hiskingdomprophets.com/join?ref=${promoCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    showToast('Vervelenke kopiert til utklippstavlen!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCreative = (creative) => {
    const customizedText = creative.text.replace('{link}', generatedLink);
    navigator.clipboard.writeText(customizedText);
    setCopiedCreativeId(creative.id);
    showToast('Promo-tekst kopiert!');
    setTimeout(() => setCopiedCreativeId(null), 2000);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 flex flex-col gap-6 md:gap-8 font-sans max-w-5xl bg-[#f8fafc]/30">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-outline">
        <span 
          className="hover:text-primary cursor-pointer transition-colors" 
          onClick={() => navigate(user?.role === 'student' ? '/student/dashboard' : '/teacher/dashboard')}
        >
          Hjem
        </span>
        <ChevronRight size={12} />
        <span className="text-primary font-bold">Partnerportal</span>
      </div>

      {/* Header Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-primary flex items-center gap-2">
            <Gift className="text-[#c5a059]" size={26} /> Affiliate & Partnerportal
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium">
            Promoter våre bibelstudier og tjen 15% provisjon for hver student du verver til skolen.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          label="Samlet provisjon" 
          value="2 715 kr" 
          desc="Utbetales månedlig"
          icon={<DollarSign size={20} className="text-[#c5a059]" />} 
        />
        <StatCard 
          label="Vervede studenter" 
          value="4 godkjente" 
          desc="Siste signup: 18. mai"
          icon={<Users size={20} className="text-primary" />} 
        />
        <StatCard 
          label="Lenkeklikk" 
          value="184 klikk" 
          desc="Konverteringsrate: 2.1%"
          icon={<TrendingUp size={20} className="text-[#10b981]" />} 
        />
        <StatCard 
          label="Utbetalt til nå" 
          value="1 560 kr" 
          desc="Siste overføring: 5. mai"
          icon={<CheckCircle size={20} className="text-blue-500" />} 
        />
      </div>

      {/* Link Builder and Creative Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Link Generator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-base font-bold text-primary flex items-center gap-2">
              <LinkIcon size={16} className="text-[#c5a059]" /> Generer din vervelenke
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              Skriv inn en unik kode under (f.eks. ditt navn eller kampanjenavn) for å skreddersy vervelenken din.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Skreddersy kode</label>
                <div className="flex bg-slate-50 border border-outline-variant/30 rounded-xl overflow-hidden px-3.5 py-2 group focus-within:ring-2 focus-within:ring-[#c5a059]/30 transition-all">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="F.EKS. PROFET2026"
                    className="bg-transparent border-none focus:ring-0 text-xs w-full font-bold text-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Din unike affiliate-lenke</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow bg-slate-100/75 border border-outline-variant/20 rounded-xl px-4 py-3 flex items-center text-xs font-mono text-primary font-bold overflow-x-auto">
                    {generatedLink}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-2 px-5 py-3 rounded-xl shadow font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.97] shrink-0"
                  >
                    {copiedLink ? (
                      <><Check size={14} /><span>Kopiert!</span></>
                    ) : (
                      <><Copy size={14} /><span>Kopier</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sales History list */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-primary flex items-center gap-2">
              <Award size={16} className="text-[#c5a059]" /> Provisjonshistorikk
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold text-on-surface">
                <thead>
                  <tr className="border-b border-outline-variant/25 text-outline text-[10px] uppercase tracking-wider">
                    <th className="pb-3 pr-2">Dato</th>
                    <th className="pb-3 pr-2">Student</th>
                    <th className="pb-3 pr-2">Kurs</th>
                    <th className="pb-3 pr-2">Beløp</th>
                    <th className="pb-3 pr-2">Din Provisjon</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TRANSACTION_DATA.map(txn => (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pr-2 font-mono text-outline font-medium">{txn.date}</td>
                      <td className="py-3.5 pr-2 font-bold text-primary">{txn.name}</td>
                      <td className="py-3.5 pr-2 text-on-surface-variant font-medium">{txn.course}</td>
                      <td className="py-3.5 pr-2 font-medium">{txn.price}</td>
                      <td className="py-3.5 pr-2 font-bold text-[#c5a059]">{txn.commission}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          txn.status === 'Overført' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Creatives templates */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-primary flex items-center gap-2">
              <Megaphone size={16} className="text-[#c5a059]" /> Markedsføringsmateriell
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              Kopier ferdigskrevne innlegg til sosiale medier eller e-poster og send dem ut direkte til dine nettverk.
            </p>

            <div className="space-y-4 pt-2">
              {INITIAL_CREATIVES.map(creative => {
                const isCopied = copiedCreativeId === creative.id;
                return (
                  <div key={creative.id} className="border border-outline-variant/35 rounded-xl p-4 bg-slate-50 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{creative.channel}</span>
                      <button
                        onClick={() => handleCopyCreative(creative)}
                        className="p-1.5 rounded hover:bg-slate-200 transition-colors text-outline hover:text-primary flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                        title="Kopier maltekst"
                      >
                        {isCopied ? (
                          <><Check size={11} className="text-green-600" /><span>Kopiert!</span></>
                        ) : (
                          <><Copy size={11} /><span>Kopier mal</span></>
                        )}
                      </button>
                    </div>
                    <div className="text-[10px] font-medium text-on-surface-variant leading-relaxed whitespace-pre-line bg-white border border-outline-variant/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {creative.text.replace('{link}', generatedLink)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#1B4965]/5 border border-[#1B4965]/10 rounded-2xl p-6 space-y-3.5">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle size={14} className="text-[#c5a059]" /> Slik fungerer det
            </h3>
            <ol className="text-xs font-medium text-on-surface-variant space-y-2 list-decimal list-inside pl-1 leading-relaxed">
              <li>Del din personlige vervelenke med andre.</li>
              <li>Når de klikker på lenken og melder seg på et kurs, spores det automatisk.</li>
              <li>Du mottar 15% provisjon som beregnes og betales ut den 5. i hver måned.</li>
            </ol>
          </div>
        </div>

      </div>

    </div>
  );
}

// Reusable stat card widget
function StatCard({ label, value, desc, icon }) {
  return (
    <div className="bg-white border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-outline">{label}</p>
        <h3 className="text-lg font-bold font-serif text-[#00324b]">{value}</h3>
        <p className="text-[9px] text-[#8a682d] font-semibold">{desc}</p>
      </div>
      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
        {icon}
      </div>
    </div>
  );
}
