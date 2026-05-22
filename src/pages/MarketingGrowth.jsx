import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Percent, Gift, Users, Plus, 
  Trash2, Copy, Check, Calendar, ArrowUpRight, Megaphone,
  Sparkles, Info, DollarSign
} from 'lucide-react';

const DEFAULT_COUPONS = [
  { id: "c1", code: "PROPHET20", type: "percent", value: 20, active: true, limit: 150, used: 84 },
  { id: "c2", code: "BIBELSTUDIE50", type: "flat", value: 500, active: true, limit: 50, used: 12 },
  { id: "c3", code: "SUMMERSEMESTER", type: "percent", value: 15, active: false, limit: 200, used: 184 },
  { id: "c4", code: "MANDALREGNSKAP", type: "percent", value: 30, active: true, limit: 100, used: 41 }
];

const DEFAULT_CAMPAIGNS = [
  { id: "ca1", name: "Høstutrustning 2026", desc: "Spesialkampanje for nye teologistudenter som starter høstsemesteret.", link: "/register?ref=host2026", start: "2026-08-01", end: "2026-09-15", status: "Planlagt" },
  { id: "ca2", name: "Sosial Medievekst", desc: "Målrettet vervekampanje via sosiale kanaler og Instagram.", link: "/register?ref=socialgrowth", start: "2026-05-01", end: "2026-06-30", status: "Aktiv" }
];

const DEFAULT_REFERRALS = [
  { id: "r1", referrer: "Erik Johansen", referee: "Thomas Hansen", date: "15. Mai 2026", points: 100, status: "Godkjent" },
  { id: "r2", referrer: "Dr. Maria Berg", referee: "Anders Larsen", date: "02. Feb 2026", points: 100, status: "Godkjent" },
  { id: "r3", referrer: "Ingrid Olsen", referee: "Julie Mikkelsen", date: "22. Mai 2026", points: 100, status: "Venter" }
];

export default function MarketingGrowth() {
  const { showToast } = useApp();
  const [copiedId, setCopiedId] = useState(null);

  // --- STATE FOR COUPONS ---
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('hkm-marketing-coupons');
    return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
  });
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('percent');
  const [newValue, setNewValue] = useState('');
  const [newLimit, setNewLimit] = useState(100);

  // --- STATE FOR CAMPAIGNS ---
  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('hkm-marketing-campaigns');
    return saved ? JSON.parse(saved) : DEFAULT_CAMPAIGNS;
  });
  const [newCampName, setNewCampName] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampStart, setNewCampStart] = useState('');
  const [newCampEnd, setNewCampEnd] = useState('');

  // --- STATE FOR REFERRALS ---
  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem('hkm-marketing-referrals');
    return saved ? JSON.parse(saved) : DEFAULT_REFERRALS;
  });

  useEffect(() => {
    localStorage.setItem('hkm-marketing-coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('hkm-marketing-campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('hkm-marketing-referrals', JSON.stringify(referrals));
  }, [referrals]);

  // Actions
  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCode || !newValue) return;

    const couponObj = {
      id: "c-" + Date.now(),
      code: newCode.toUpperCase().trim(),
      type: newType,
      value: Number(newValue),
      active: true,
      limit: Number(newLimit) || 100,
      used: 0
    };

    setCoupons([couponObj, ...coupons]);
    showToast(`Rabattkoden ${couponObj.code} ble opprettet!`);
    setNewCode('');
    setNewValue('');
    setNewLimit(100);
  };

  const handleToggleCoupon = (id) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    showToast("Status for rabattkode ble endret.");
  };

  const handleDeleteCoupon = (id, code) => {
    if (!window.confirm(`Vil du slette rabattkoden ${code}?`)) return;
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast(`Rabattkoden ${code} ble slettet.`);
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!newCampName || !newCampStart) return;

    const campObj = {
      id: "ca-" + Date.now(),
      name: newCampName,
      desc: newCampDesc,
      link: `/register?ref=${newCampName.toLowerCase().replace(/\s+/g, '')}`,
      start: newCampStart,
      end: newCampEnd || "Ikke satt",
      status: new Date(newCampStart) > new Date() ? "Planlagt" : "Aktiv"
    };

    setCampaigns([campObj, ...campaigns]);
    showToast(`Kampanjen "${newCampName}" ble opprettet!`);
    setNewCampName('');
    setNewCampDesc('');
    setNewCampStart('');
    setNewCampEnd('');
  };

  const handleDeleteCampaign = (id, name) => {
    if (!window.confirm(`Vil du slette kampanjen "${name}"?`)) return;
    setCampaigns(prev => prev.filter(c => c.id !== id));
    showToast(`Kampanjen "${name}" ble slettet.`);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Lenke kopiert til utklippstavle ✓");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col gap-6 md:gap-8 font-sans text-on-surface">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-4xl font-bold text-primary">Markedsføring og vekst</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium">
            Administrer aktive kampanjer, rabattkoder og henvisninger for å tiltrekke flere studenter.
          </p>
        </div>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Totalt Vervet</p>
            <h3 className="text-3xl font-serif font-bold text-primary">3,284</h3>
            <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> +18% økning i studenter
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Aktive kampanjer</p>
            <h3 className="text-3xl font-serif font-bold text-primary">
              {campaigns.filter(c => c.status === 'Aktiv').length}
            </h3>
            <p className="text-[10px] text-outline font-semibold">Utrulling på sosiale medier</p>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
            <Megaphone size={22} />
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Rabattkoder utstedt</p>
            <h3 className="text-3xl font-serif font-bold text-primary">
              {coupons.filter(c => c.active).length}
            </h3>
            <p className="text-[10px] text-outline font-semibold">Aktive og gyldige koder</p>
          </div>
          <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
            <Percent size={22} />
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-outline">Gjensidige vervepoeng</p>
            <h3 className="text-3xl font-serif font-bold text-[#c5a059]">24,500</h3>
            <p className="text-[10px] text-[#c5a059] font-semibold">Tildelt trofaste studenter</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-[#c5a059]">
            <Gift size={22} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Coupons Management (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Coupon Codes Panel */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Percent size={18} className="text-[#c5a059]" /> Administrere rabattkoder (Coupons)
            </h3>

            {/* Quick Generator form */}
            <form onSubmit={handleCreateCoupon} className="bg-[#f0f4f8] rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-1 space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Rabattkode</label>
                <input 
                  type="text" 
                  placeholder="f.eks. NÅDE30" 
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-white border border-outline-variant/60 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                  style={{ transform: 'translateZ(0) !important', display: 'block' }}
                />
              </div>

              <div className="sm:col-span-1 space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Type</label>
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-white border border-outline-variant/60 rounded-lg px-2 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="percent">Prosent (%)</option>
                  <option value="flat">Kroner (NOK)</option>
                </select>
              </div>

              <div className="sm:col-span-1 space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Verdi</label>
                <input 
                  type="number" 
                  placeholder="f.eks. 30" 
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-white border border-outline-variant/60 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                  style={{ transform: 'translateZ(0) !important', display: 'block' }}
                />
              </div>

              <div className="sm:col-span-1">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1 bg-primary hover:opacity-95 text-white py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] shadow-sm"
                >
                  <Plus size={14} />
                  Lag Kode
                </button>
              </div>
            </form>

            {/* Coupons List */}
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div 
                  key={coupon.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 gap-4 ${
                    coupon.active 
                      ? 'bg-white border-outline-variant/50 hover:border-primary' 
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${coupon.active ? 'bg-primary/5 text-primary' : 'bg-slate-200 text-outline'}`}>
                      <Percent size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-primary tracking-wider">{coupon.code}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          coupon.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.active ? 'AKTIV' : 'INAKTIV'}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                        Verdi: {coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value} NOK`} rabatt • Brukt {coupon.used} / {coupon.limit} ganger
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleToggleCoupon(coupon.id)}
                      className="px-2.5 py-1.5 border border-[#c1c7ce] hover:bg-slate-50 text-[10px] font-bold uppercase rounded-lg transition-colors"
                    >
                      {coupon.active ? 'Deaktiver' : 'Aktiver'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(coupon.code, coupon.id)}
                      className="p-1.5 hover:text-primary text-outline hover:bg-slate-100 rounded-lg transition-colors"
                      title="Kopier Kode"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                      className="p-1.5 hover:text-red-600 text-outline hover:bg-red-50 rounded-lg transition-colors"
                      title="Slett rabattkode"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral system tracking */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Gift size={18} className="text-[#c5a059]" /> Gjensidig henvisningsprogram (Referrals)
            </h3>
            
            <div className="bg-[#f6fafe] border-l-4 border-[#00324b] p-4 rounded-r-xl text-xs font-semibold text-[#46617b] mb-6 flex gap-2.5 items-start">
              <Info size={16} className="text-primary shrink-0 mt-0.5" />
              <p>
                Studenter som deler sin personlige henvisningslenke belønnes med 100 vekstpoeng. Den inviterte studenten får automatisk 20% rabatt på sitt første semester.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eaeef2]/60 border-b border-[#c1c7ce]/30">
                    <th className="px-4 py-3 text-xs font-bold text-[#72787e] uppercase tracking-wider">Vervet av</th>
                    <th className="px-4 py-3 text-xs font-bold text-[#72787e] uppercase tracking-wider">Ny Student</th>
                    <th className="px-4 py-3 text-xs font-bold text-[#72787e] uppercase tracking-wider">Dato</th>
                    <th className="px-4 py-3 text-xs font-bold text-[#72787e] uppercase tracking-wider">Poeng</th>
                    <th className="px-4 py-3 text-xs font-bold text-[#72787e] uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c1c7ce]/20 text-xs font-semibold text-[#41474d]">
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-[#f6fafe]/60 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#00324b]">{ref.referrer}</td>
                      <td className="px-4 py-3">{ref.referee}</td>
                      <td className="px-4 py-3 text-outline">{ref.date}</td>
                      <td className="px-4 py-3 text-[#c5a059] font-bold">+{ref.points}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          ref.status === 'Godkjent' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ref.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Campaigns Management (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Active Campaigns Panel */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Megaphone size={18} className="text-[#c5a059]" /> Markedsføringskampanjer
            </h3>

            {/* Campaign creation form */}
            <form onSubmit={handleCreateCampaign} className="space-y-4 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#72787e] uppercase tracking-widest">Start ny kampanje</p>
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Kampanjenavn</label>
                <input 
                  type="text" 
                  placeholder="f.eks. Sommerkampanje" 
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  className="w-full bg-white border border-outline-variant/60 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                  style={{ transform: 'translateZ(0) !important', display: 'block' }}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Beskrivelse</label>
                <textarea 
                  placeholder="Kort forklaring om kampanjens formål..." 
                  value={newCampDesc}
                  onChange={(e) => setNewCampDesc(e.target.value)}
                  className="w-full bg-white border border-outline-variant/60 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none h-16"
                  style={{ transform: 'translateZ(0) !important', display: 'block' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Startdato</label>
                  <input 
                    type="date" 
                    value={newCampStart}
                    onChange={(e) => setNewCampStart(e.target.value)}
                    className="w-full bg-white border border-outline-variant/60 rounded-lg px-2 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    style={{ transform: 'translateZ(0) !important', display: 'block' }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider">Sluttdato</label>
                  <input 
                    type="date" 
                    value={newCampEnd}
                    onChange={(e) => setNewCampEnd(e.target.value)}
                    className="w-full bg-white border border-outline-variant/60 rounded-lg px-2 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    style={{ transform: 'translateZ(0) !important', display: 'block' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-[#00324b] hover:opacity-95 text-white py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] shadow"
              >
                <Plus size={14} />
                Aktiver Kampanje
              </button>
            </form>

            {/* Campaigns List */}
            <div className="space-y-4">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-4 border border-outline-variant/40 rounded-xl hover:border-primary/50 hover:bg-[#f6fafe]/30 transition-all duration-300">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#00324b] flex items-center gap-1.5">
                        {camp.name}
                        <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          camp.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {camp.status}
                        </span>
                      </h4>
                      <p className="text-xs text-on-surface-variant font-medium mt-1">{camp.desc}</p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                      className="p-1 text-outline hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Campaign links copy block */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    <span className="font-mono text-[9px] text-outline font-semibold select-all truncate bg-slate-50 px-2 py-1.5 rounded border border-slate-100 flex-grow">
                      {window.location.origin}{camp.link}
                    </span>
                    <button
                      onClick={() => copyToClipboard(window.location.origin + camp.link, camp.id)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[#00324b]/10 text-[#00324b] hover:bg-[#00324b] hover:text-white rounded-lg text-[10px] font-bold transition-colors"
                    >
                      {copiedId === camp.id ? <Check size={10} /> : <Copy size={10} />}
                      Kopier
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-outline pt-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {camp.start} til {camp.end}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
