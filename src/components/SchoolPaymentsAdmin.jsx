import React, { useEffect, useState } from 'react';
import { auth } from '@/firebase';

export default function SchoolPaymentsAdmin() {
  const [year, setYear] = useState('2027');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setData(null);
    (async () => {
      const user = auth.currentUser;
      if (!user) throw new Error('Du må logge inn som administrator.');
      const response = await fetch('https://europe-west1-gen-lang-client-0659494185.cloudfunctions.net/studentPayments', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${await user.getIdToken()}` }, body: JSON.stringify({mode:'admin',year}), signal: controller.signal });
      if (!response.ok) throw new Error(response.status === 403 ? 'Bare aktive administratorer kan se skolebetalingene.' : 'Betalingsoversikten kunne ikke hentes. Prøv igjen.');
      const result = await response.json();
      if (!controller.signal.aborted && auth.currentUser?.uid === user.uid) setData(result);
    })().catch(failure => { if (!controller.signal.aborted) setError(failure.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [year,revision]);
  const money = value => new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(value);
  const date = value => value ? new Intl.DateTimeFormat('nb-NO',{dateStyle:'medium'}).format(new Date(value)) : 'Ikke tilgjengelig';
  const accounts = (data?.accounts || []).filter(account => `${account.name} ${account.email}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="rounded-2xl bg-white border border-purple-100 p-5 sm:p-7 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-[#561291]">Skolebetalinger</h2><p className="text-sm text-slate-600 mt-2">Bekreftede betalinger fra HKMs felles betalingssystem. Gaver vises i HKM.</p></div><button type="button" onClick={()=>setRevision(value=>value+1)} disabled={loading} className="rounded-xl border border-purple-200 px-4 py-3 font-semibold disabled:opacity-50">Oppdater</button></div>
    <div className="flex flex-wrap gap-4"><label className="text-sm font-semibold">Skoleår<select value={year} onChange={event=>setYear(event.target.value)} className="block rounded-xl border p-3 mt-1"><option value="2026">2026–2027</option><option value="2027">2027–2028</option></select></label><label className="text-sm font-semibold flex-1">Søk etter elev<input value={search} onChange={event=>setSearch(event.target.value)} className="block rounded-xl border p-3 mt-1 w-full" placeholder="Navn eller e-post"/></label></div>
    {loading ? <p role="status">Henter betalingsoversikt …</p> : error ? <p role="alert" className="text-red-700">{error}</p> : <>
      {data?.limited && <p role="status" className="text-amber-800">Oversikten er begrenset til 100 elevkoblinger og 500 transaksjoner. Bruk HKMs økonomioversikt for videre oppfølging.</p>}
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Elev</th><th className="p-3">Betalt skoleavgift</th><th className="p-3">Gjenstår</th><th className="p-3">Engangsavgift betalt</th><th className="p-3">Trekkavtale / neste trekk</th></tr></thead><tbody>{accounts.map(account=><tr key={account.centralUid} className="border-b align-top"><td className="p-3 font-semibold">{account.name}<span className="block font-normal text-slate-500">{account.email}</span></td><td className="p-3 whitespace-nowrap">{money(account.paid)}</td><td className="p-3 whitespace-nowrap">{money(account.remaining)}</td><td className="p-3 whitespace-nowrap">{money(account.registrationPaid)}</td><td className="p-3">{account.agreements.length ? account.agreements.map((agreement,index)=><div key={index}>{agreement.provider === 'stripe' ? 'Kort' : 'PayPal'} · {({active:'Aktiv',pending:'Venter på godkjenning',past_due:'Betaling mangler',canceled:'Avsluttet',cancelled:'Avsluttet',unavailable:'Status må avklares',suspended:'Stanset'}[agreement.status] || agreement.status)}{agreement.nextDate && <span className="block">{date(agreement.nextDate)} · {money(agreement.nextAmount)}</span>}</div>) : 'Ingen automatisk avtale'}</td></tr>)}</tbody></table></div>
      {!accounts.length && <p>Ingen tilknyttede elevbetalinger for dette skoleåret.</p>}
      <p className="text-sm text-slate-600">Elever uten en godkjent betalingskobling vises ikke med en beregnet saldo. Bankbetalinger teller først etter at de er registrert som mottatt.</p>
      <div className="flex flex-wrap gap-3"><a href="https://app.hkpc.no/betalinger" className="rounded-xl bg-[#561291] text-white px-4 py-3 font-semibold">Knytt betaling til elev i appen</a><a href="https://hiskingdomministry.no/admin/skolebetalinger.html" className="rounded-xl border border-purple-200 px-4 py-3 font-semibold">Åpne HKMs økonomioversikt</a></div>
    </>}
  </section>;
}
