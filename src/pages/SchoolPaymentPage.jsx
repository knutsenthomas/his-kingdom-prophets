import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Heart, GraduationCap, LockKeyhole, CheckCircle2, CreditCard, Smartphone, Landmark, Copy } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import SeoHead from '@/components/SeoHead';
import { SCHOOL_PAYMENTS, loadSchoolPayPal, loadSchoolStripe, paymentPayload, paymentRequest, paymentState, recurringRequestId } from '@/lib/school-payments';
import '@/styles/hkpc-redesign.css';

export default function SchoolPaymentPage({ gift = false }) {
  const { language } = useApp();
  const no = language === 'no';
  const text = (a, b) => no ? a : b;
  const reducedMotion = useReducedMotion();
  const [plan, setPlan] = useState('monthly');
  const [frequency, setFrequency] = useState('once');
  const [consent, setConsent] = useState(false);
  const [schoolYear, setSchoolYear] = useState('2027');
  const recurring = gift ? frequency === 'monthly' : plan === 'monthly';
  const [amount, setAmount] = useState('500');
  const [details, setDetails] = useState({ name: '', email: '', studentName: '', reference: '', message: '' });
  const [method, setMethod] = useState('card');
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const paymentMount = useRef(null);
  const paypalMount = useRef(null);
  const element = useRef(null);
  const inFlight = useRef(false);
  const alive = useRef(true);
  const returnUrl = `${window.location.origin}${gift ? '/gi-gave' : '/betaling'}`;
  const selected = SCHOOL_PAYMENTS.find(item => item.id === plan);
  const value = gift ? Number(amount) : selected.amount;
  const money = number => new Intl.NumberFormat(no ? 'nb-NO' : 'en-GB', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(number);
  const title = text(gift ? 'Gi rom for flere.' : 'Betal skoleavgiften.', gift ? 'Help others grow.' : 'Pay your school fees.');
  const update = event => setDetails(previous => ({ ...previous, [event.target.name]: event.target.value }));

  useEffect(() => {
    alive.current = true;
    const params = new URLSearchParams(window.location.search);
    const secret = params.get('payment_intent_client_secret');
    const reference = params.get('vipps_reference');
    const agreementKey = params.get('agreement_key');
    if (params.get('cancelled') === '1') { setError(no ? 'Avtalen ble avbrutt i PayPal. Ingen ny avtale er bekreftet.' : 'PayPal setup was cancelled. No new agreement is confirmed.'); return; }
    if (agreementKey || secret || (reference && params.get('vipps_return') === '1')) {
      setBusy(true);
      (async () => {
        try {
          if (agreementKey) {
            const response = await paymentRequest('recurringStatus', { key: agreementKey, requestId: params.get('request_id') });
            if (alive.current) setResult(response.status === 'ACTIVE' ? 'agreement-active' : response.status === 'APPROVED' || response.status === 'APPROVAL_PENDING' ? 'pending' : 'unverified');
          } else if (secret) {
            const stripe = await loadSchoolStripe();
            const response = await stripe.retrievePaymentIntent(secret);
            if (response.error || !response.paymentIntent) throw new Error('status-unavailable');
            if (alive.current) setResult(response.paymentIntent.status === 'succeeded' && (response.paymentIntent.metadata?.school_plan || response.paymentIntent.metadata?.donor_plan) ? 'agreement-active' : paymentState(response.paymentIntent.status));
          } else {
            const response = await paymentRequest('vippsStatus', { reference });
            if (alive.current) setResult(paymentState(response.state));
          }
        } catch { if (alive.current) { setResult('unverified'); setError(no ? 'Vi kunne ikke bekrefte betalingsstatus. Kontakt oss før du betaler på nytt.' : 'We could not verify the payment status. Contact us before paying again.'); } }
        finally {
          if (alive.current) {
            setBusy(false);
            if (agreementKey) {
            const response = await paymentRequest('recurringStatus', { key: agreementKey, requestId: params.get('request_id') });
            if (alive.current) setResult(response.status === 'ACTIVE' ? 'agreement-active' : response.status === 'APPROVED' || response.status === 'APPROVAL_PENDING' ? 'pending' : 'unverified');
          } else if (secret) {
              // Remove the Stripe client secret from browser history after verification.
              params.delete('payment_intent_client_secret'); params.delete('payment_intent'); params.delete('redirect_status');
              window.history.replaceState({}, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`);
            }
          }
        }
      })();
    }
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    if (!checkout || checkout.paypal || !paymentMount.current) return;
    const payment = checkout.elements.create('payment', { layout: 'tabs' });
    element.current = payment;
    payment.on('loaderror', () => setError(text('Betalingsfeltet kunne ikke lastes. Prøv igjen.', 'The payment form could not load. Please try again.')));
    payment.mount(paymentMount.current);
    return () => { payment.destroy(); if (element.current === payment) element.current = null; };
  }, [checkout]);

  useEffect(() => {
    if (!checkout?.paypal || !paypalMount.current) return;
    let cancelled = false;
    const buttons = checkout.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
      createOrder: async () => {
        const response = await paymentRequest('paypal', checkout.payload);
        if (!response.orderId) throw new Error('missing-order');
        return response.orderId;
      },
      onApprove: async data => {
        if (cancelled) return;
        setBusy(true); setError('');
        try {
          const response = await paymentRequest('paypalCapture', { orderId: data.orderID });
          if (!cancelled) setResult(response.status === 'success' ? 'success' : 'unverified');
        } catch { if (!cancelled) { setResult('unverified'); setError(text('Vi kunne ikke bekrefte PayPal-betalingen. Kontakt oss før du betaler på nytt.', 'We could not verify the PayPal payment. Contact us before paying again.')); } }
        finally { if (!cancelled) setBusy(false); }
      },
      onCancel: () => { if (!cancelled) setError(text('PayPal-betalingen ble avbrutt.', 'The PayPal payment was cancelled.')); },
      onError: () => { if (!cancelled) setError(text('PayPal kunne ikke fullføre betalingen. Kontakt oss hvis du er usikker på status.', 'PayPal could not complete the payment. Contact us if you are unsure of the status.')); },
    });
    buttons.render(paypalMount.current).catch(() => { if (!cancelled) setError(text('PayPal kunne ikke lastes. Velg en annen betalingsmåte.', 'PayPal could not load. Choose another payment method.')); });
    return () => { cancelled = true; Promise.resolve(buttons.close()).catch(() => {}); };
  }, [checkout]);

  async function start(event) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      const payload = paymentPayload({ gift, plan, amount, ...details });
      if (recurring && method !== 'bank') {
        if (!consent || method === 'vipps') throw new Error('recurring-consent-required');
        const agreement = { ...payload, gift, studentName: details.studentName, schoolYear, reference: details.reference, consent, returnUrl, provider: method === 'card' ? 'stripe' : 'paypal' };
        agreement.requestId = await recurringRequestId(agreement, agreement.provider);
        const response = await paymentRequest('recurring', agreement);
        if (method === 'paypal') {
          const target = new URL(response.redirectUrl);
          if (target.protocol !== 'https:' || !/(^|\.)paypal\.com$/.test(target.hostname)) throw new Error('invalid-redirect');
          window.location.assign(target.href); return;
        }
        if (!response.clientSecret) throw new Error('missing-secret');
        const stripe = await loadSchoolStripe();
        if (!alive.current) return;
        const elements = stripe.elements({ clientSecret: response.clientSecret, locale: no ? 'nb' : 'en', appearance: { theme: 'stripe', variables: { colorPrimary: '#561291', borderRadius: '10px' } } });
        setCheckout({ stripe, elements, amount: payload.amount, name: payload.customerDetails.name, recurring: true });
        return;
      }
      if (method === 'paypal' && gift) {
        const paypal = await loadSchoolPayPal();
        if (alive.current) setCheckout({ paypal, payload, amount: payload.amount, name: payload.customerDetails.name });
        return;
      }
      if (method === 'vipps') {
        const response = await paymentRequest('vipps', { ...payload, returnUrl });
        const target = new URL(response.redirectUrl);
        if (target.protocol !== 'https:' || !/(^|\.)vipps\.no$|(^|\.)vippsmobilepay\.com$/.test(target.hostname)) throw new Error('invalid-redirect');
        window.location.assign(target.href);
        return;
      }
      const stripe = await loadSchoolStripe();
      const response = await paymentRequest('card', { ...payload, paymentMethodPreference: 'card' });
      if (!response.clientSecret) throw new Error('missing-secret');
      if (!alive.current) return;
      const elements = stripe.elements({ clientSecret: response.clientSecret, locale: no ? 'nb' : 'en', appearance: { theme: 'stripe', variables: { colorPrimary: '#561291', colorText: '#271F30', colorBackground: '#ffffff', borderRadius: '10px', fontFamily: 'Arial, sans-serif' } } });
      setCheckout({ stripe, elements, amount: payload.amount, name: payload.customerDetails.name });
    } catch (failure) {
      if (alive.current) setError(failure.message === 'agreement-already-started' ? text('En avtale er allerede startet. Kontakt oss før du oppretter en ny, slik at du unngår dobbelt trekk.', 'An agreement has already been started. Contact us before creating another to avoid duplicate payments.') : ['invalid-amount', 'invalid-contact', 'missing-student'].includes(failure.message) ? text('Sjekk beløp, navn og e-post før du fortsetter.', 'Check the amount, name and email before continuing.') : text('Vi kunne ikke starte betalingen. Prøv igjen eller kontakt oss.', 'We could not start your payment. Please try again or contact us.'));
    } finally { inFlight.current = false; if (alive.current) setBusy(false); }
  }
  async function confirm(event) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      const response = await checkout.stripe.confirmPayment({ elements: checkout.elements, confirmParams: { return_url: returnUrl }, redirect: 'if_required' });
      if (response.error) setError(response.error.message || text('Betalingen kunne ikke fullføres.', 'Payment could not be completed.'));
      else setResult(checkout.recurring && response.paymentIntent?.status === 'succeeded' ? 'agreement-active' : paymentState(response.paymentIntent?.status));
    } catch { setResult('unverified'); setError(text('Vi kunne ikke bekrefte betalingsstatus. Kontakt oss før du betaler på nytt.', 'We could not verify the payment status. Contact us before paying again.')); }
    finally { inFlight.current = false; if (alive.current) setBusy(false); }
  }

  return <div className="hkpc-landing school-payment-page">
    <SeoHead title={text(gift ? 'Gi en gave til skolen | HKPC' : 'Betal skoleavgift | HKPC', gift ? 'Give to the school | HKPC' : 'School payments | HKPC')} description={text('Skolebetaling og gaver til His Kingdom Prophetic Community.', 'School payments and gifts to His Kingdom Prophetic Community.')} canonicalPath={gift ? '/gi-gave' : '/betaling'} />
    <SiteHeader />
    <main>
      <section className="about-page-hero payment-hero"><motion.div className="wrap" initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link className="about-back" to="/"><ArrowLeft size={18} />{text('Tilbake til forsiden', 'Back to home')}</Link>
        <p className="eyebrow">{text(gift ? 'EN GAVE TIL SKOLEN' : 'SKOLEBETALING', gift ? 'GIVE TO THE SCHOOL' : 'SCHOOL PAYMENTS')}</p><h1>{title}</h1>
        <p className="about-page-intro">{text(gift ? 'Din gave støtter skolens arbeid med bibelundervisning, disippelskap og profetisk utrustning.' : 'Betal en termin, hele studieåret eller engangsavgiften på ett sted.', gift ? 'Your gift supports Bible teaching, discipleship and prophetic equipping.' : 'Pay an instalment, the full year or your one-time fee in one place.')}</p>
      </motion.div></section>
      <section className="section payment-section"><div className="wrap payment-layout">
        <aside className="payment-aside"><nav className="payment-page-links" aria-label={text('Betaling og gaver', 'Payments and gifts')}>
          <Link to="/betaling" aria-current={!gift ? 'page' : undefined}><GraduationCap size={21} />{text('Betal skoleavgift', 'Pay school fees')}</Link>
          <Link to="/gi-gave" aria-current={gift ? 'page' : undefined}><Heart size={21} />{text('Gi en gave', 'Give a gift')}</Link>
        </nav><h2>{text(gift ? 'Sammen utruster vi flere.' : 'En enkel vei til betaling.', gift ? 'Together we equip more people.' : 'A simple way to pay.')}</h2>
          <p>{text(gift ? 'Velg et beløp du ønsker å gi. Gaven merkes til HKPC og behandles av His Kingdom Ministry.' : 'Bruk elevens navn og gjerne en referanse fra skolen, slik at vi kan knytte betalingen til riktig elev.', gift ? 'Choose an amount to give. Your gift is designated for HKPC and processed by His Kingdom Ministry.' : 'Use the student’s name and, if available, a reference from the school so we can match the payment.')}</p>
          {!gift && <p>{text('Studieavgiften er 10 000 kr per år. Månedlig delbetaling er 1 000 kr i 10 terminer. Engangsavgiften på 1 000 kr betales separat.', 'Tuition is NOK 10,000 per year, or NOK 1,000 across 10 monthly instalments. The NOK 1,000 one-time fee is paid separately.')}</p>}
          <div className="payment-trust"><LockKeyhole size={20} /><p>{text(gift ? 'Betal med kort, Vipps, PayPal eller bankoverføring. Betalingen behandles i His Kingdom Ministry sitt betalingssystem.' : 'Betal med kort, Vipps, PayPal eller bankoverføring. Betalingen behandles i His Kingdom Ministry sitt betalingssystem.', gift ? 'Pay by card, Vipps, PayPal or bank transfer through His Kingdom Ministry’s payment system.' : 'Pay by card, Vipps, PayPal or bank transfer through His Kingdom Ministry’s payment system.')}</p></div>
          {gift && <a className="payment-help" href="https://buymeacoffee.com/Hiskingdomministry" target="_blank" rel="noopener noreferrer">{text('Støtt HKM via Buy Me a Coffee', 'Support HKM via Buy Me a Coffee')}<ArrowRight size={17}/></a>}
          <Link to="/support" className="payment-help">{text('Spørsmål om betaling?', 'Questions about payment?')}<ArrowRight size={17} /></Link>
        </aside>
        <div className="payment-card">
          {result ? <div className={`payment-result payment-result-${result}`} role="status"><CheckCircle2 size={38} /><h2>{text(result === 'agreement-active' ? 'Avtalen er aktivert.' : result === 'success' ? 'Takk! Betalingen er fullført.' : result === 'pending' ? 'Betalingen behandles.' : result === 'unverified' ? 'Betalingsstatus er ikke bekreftet.' : 'Betalingen ble ikke fullført.', result === 'agreement-active' ? 'Your agreement is active.' : result === 'success' ? 'Thank you! Payment complete.' : result === 'pending' ? 'Your payment is processing.' : result === 'unverified' ? 'Payment status is unconfirmed.' : 'Payment was not completed.')}</h2><p>{text(result === 'agreement-active' ? (gift ? 'Takk for din faste støtte. Hver betaling registreres når den er bekreftet.' : 'Skoleavtalen er opprettet med 10 månedlige terminer. Hver termin registreres når betalingen er bekreftet.') : result === 'success' ? (gift ? 'Takk for at du støtter skolen.' : 'Skolen kan nå følge opp betalingen din.') : result === 'pending' ? 'Vent på bekreftelse før du forsøker å betale igjen.' : result === 'unverified' ? 'Kontakt oss før du betaler på nytt.' : 'Du kan forsøke igjen, eller kontakte oss hvis du er usikker.', result === 'agreement-active' ? 'Your monthly agreement is active. Each payment is recorded after confirmation.' : result === 'success' ? 'Thank you for supporting the school.' : result === 'pending' ? 'Wait for confirmation before trying to pay again.' : result === 'unverified' ? 'Contact us before paying again.' : 'Try again, or contact us if you are unsure.')}</p><Link className="payment-help" to="/support">{text('Kontakt oss', 'Contact us')}<ArrowRight size={17}/></Link>{result === 'failed' && <button className="payment-submit" onClick={() => { setResult(null); setCheckout(null); }}>{text('Prøv igjen', 'Try again')}</button>}</div> : checkout ?
          <form onSubmit={confirm}><p className="eyebrow">{text('FULLFØR BETALINGEN', 'COMPLETE PAYMENT')}</p><h2>{money(checkout.amount)}</h2><p className="payment-summary">{checkout.name} · {text(gift ? 'Gave til HKPC' : selected.no, gift ? 'Gift to HKPC' : selected.en)}</p><div ref={checkout.paypal ? paypalMount : paymentMount} className="payment-element" />{!checkout.paypal && <button className="payment-submit" disabled={busy}>{busy ? text('Behandler …', 'Processing …') : `${text(checkout.recurring ? 'Aktiver avtale · første trekk' : 'Betal', checkout.recurring ? 'Activate agreement · first payment' : 'Pay')} ${money(checkout.amount)}`}<LockKeyhole size={18}/></button>}<button type="button" className="payment-edit" disabled={busy} onClick={() => { setCheckout(null); setError(''); }}>{text('Tilbake og endre', 'Back and edit')}</button></form> :
          <form onSubmit={start}><fieldset disabled={busy}><legend>{text(gift ? 'Velg din gave' : 'Hva vil du betale?', gift ? 'Choose your gift' : 'What would you like to pay?')}</legend>
            {gift ? <><div className="payment-amounts">{[['once', text('Engangsgave', 'One-time gift')], ['monthly', text('Fast månedlig gave', 'Monthly gift')]].map(([id, label]) => <button type="button" key={id} aria-pressed={frequency === id} onClick={() => { setFrequency(id); setConsent(false); if (id === 'monthly' && method === 'vipps') setMethod('card'); }}>{label}</button>)}</div><div className="payment-amounts">{[250, 500, 1000].map(number => <button type="button" key={number} aria-pressed={Number(amount) === number} onClick={() => setAmount(String(number))}>{money(number)}</button>)}</div><label className="payment-field">{text('Beløp i kroner', 'Amount in NOK')}<input type="number" min="1" max="100000" step="0.01" required value={amount} onChange={event => setAmount(event.target.value)} /></label></> :
              <div className="payment-plans">{SCHOOL_PAYMENTS.map(item => <label key={item.id} className={plan === item.id ? 'selected' : ''}><input type="radio" name="plan" value={item.id} checked={plan === item.id} onChange={() => { setPlan(item.id); setConsent(false); if ((item.id === 'monthly' && method === 'vipps') || (item.id !== 'monthly' && method === 'paypal')) setMethod('card'); }} /><span>{no ? item.no : item.en}</span><strong>{money(item.amount)}</strong></label>)}</div>}
            {!gift && <p className="payment-note">{text(recurring ? 'Avtalen trekkes automatisk: 1 000 kr per måned i 10 måneder, totalt 10 000 kr. Engangsavgiften betales separat.' : 'Dette er en enkeltbetaling uten automatiske trekk.', recurring ? 'Automatic payments: NOK 1,000 per month for 10 months, NOK 10,000 in total. The one-time fee is separate.' : 'This is a one-time payment without automatic charges.')}</p>}
            {method !== 'bank' && <div className="payment-fields"><label className="payment-field">{text('Ditt navn', 'Your name')}<input name="name" autoComplete="name" required maxLength="120" value={details.name} onChange={update} /></label><label className="payment-field">{text('E-post', 'Email')}<input name="email" type="email" autoComplete="email" required maxLength="254" value={details.email} onChange={update} /></label>
              {!gift && <><label className="payment-field">{text('Elevens fulle navn', 'Student’s full name')}<input name="studentName" required maxLength="120" value={details.studentName} onChange={update}/></label><label className="payment-field">{text('Referanse fra skolen (valgfritt)', 'School reference (optional)')}<input name="reference" maxLength="120" value={details.reference} onChange={update} /></label></>}
            </div>}
            {gift && method !== 'bank' && <label className="payment-field">{text('En hilsen (valgfritt)', 'A message (optional)')}<textarea name="message" rows="3" maxLength="500" value={details.message} onChange={update}/></label>}
            <fieldset className="payment-methods"><legend>{text('Betalingsmåte', 'Payment method')}</legend>{[['card', text('Kort', 'Card'), CreditCard], ['vipps', 'Vipps', Smartphone], ...((gift || recurring) ? [['paypal', 'PayPal', CreditCard]] : []), ['bank', text('Bankoverføring', 'Bank transfer'), Landmark]].map(([id, label, Icon]) => <label key={id} className={method === id ? 'selected' : ''}><input type="radio" name="method" value={id} checked={method === id} disabled={recurring && id === 'vipps'} onChange={() => { setMethod(id); setConsent(false); }}/><Icon size={20}/>{label}</label>)}</fieldset>
            {recurring && <>
              <p className="payment-note">{text('Vi venter på aktivering av den nye Vipps-avtalen før vi kobler til faste trekk. Velg kort eller PayPal for månedlig betaling.', 'We are awaiting activation of the new Vipps agreement before connecting recurring payments. Choose card or PayPal for monthly payments.')}</p>
              {!gift && method !== 'bank' && <label className="payment-field">{text('Skoleår', 'School year')}<select value={schoolYear} onChange={event => setSchoolYear(event.target.value)}><option value="2026">2026–2027</option><option value="2027">2027–2028</option></select></label>}
              {method !== 'bank' && <label className="payment-consent"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)}/><span>{text(gift ? `Jeg godkjenner ${money(value)} i automatiske månedlige trekk frem til jeg avslutter avtalen.` : 'Jeg godkjenner 10 månedlige trekk à 1 000 kr, totalt 10 000 kr. Første trekk skjer ved oppstart. Avtalen avsluttes automatisk etter de 10 terminene.', gift ? `I authorise automatic monthly payments of ${money(value)} until I cancel.` : 'I authorise 10 monthly payments of NOK 1,000, NOK 10,000 in total. The first payment is due on setup. The plan ends automatically after 10 instalments.')}</span></label>}
              {method !== 'bank' && <p className="payment-note">{text(gift ? 'Avslutt eller endre avtalen ved å kontakte oss. PayPal-avtaler kan også avsluttes i PayPal.' : 'Avslutt eller endre avtalen ved å kontakte oss. PayPal-avtaler kan også avsluttes i PayPal. Ubetalte skoleterminer må avklares med skolen.', gift ? 'Contact us to cancel or change the agreement. PayPal agreements can also be cancelled in PayPal.' : 'Contact us to cancel or change the agreement. PayPal agreements can also be cancelled in PayPal. Outstanding tuition must be resolved with the school.')}</p>}
            </>}
            {method === 'bank' && <div className="payment-bank">
              <h3>{text(recurring ? 'Sett opp fast overføring i nettbanken' : 'Betal fra nettbanken din', recurring ? 'Set up a standing order in your online bank' : 'Pay through your online bank')}</h3>
              {recurring && <p>{text(gift ? `Sett opp ${money(value)} hver måned. Du endrer eller stopper overføringen selv i nettbanken.` : 'Sett opp 1 000 kr hver måned med totalt 10 overføringer. Velg en sluttdato i nettbanken, slik at overføringene stopper etter 10 000 kr.', gift ? `Set up ${money(value)} each month. Change or stop the transfer in your online bank.` : 'Set up NOK 1,000 every month for 10 payments. Set an end date so transfers stop after NOK 10,000.')}</p>}
              <p>{text('Mottaker: His Kingdom Ministry', 'Recipient: His Kingdom Ministry')}</p>
              <div className="payment-bank-account"><div><span>{text('Kontonummer', 'Account number')}</span><strong>3000.66.08759</strong></div><button type="button" onClick={async () => { try { await navigator.clipboard.writeText('30006608759'); setCopiedAccount(true); } catch { setError(text('Kontonummeret kunne ikke kopieres. Du kan markere og kopiere det selv.', 'Could not copy the account number. Select and copy it manually.')); } }} aria-label={text('Kopier kontonummer', 'Copy account number')}><Copy size={18}/>{text(copiedAccount ? 'Kopiert' : 'Kopier', copiedAccount ? 'Copied' : 'Copy')}</button></div>
              <p><strong>{text('Merk betalingen med:', 'Payment message:')}</strong><br/>{gift ? 'Gave til HKPC' : `HKPC – ${selected.no} – ${details.studentName.trim() || text('[Elevens fulle navn]', '[Student’s full name]')}${details.reference.trim() ? ` – ${details.reference.trim()}` : ''}`}</p>
              <details><summary>{text('Betaler du fra utlandet?', 'Paying from abroad?')}</summary><p>IBAN: NO72 3000 6608 759<br/>BIC/SWIFT: SPSONO22</p></details>
              <p className="payment-note">{text('Du gjennomfører overføringen i nettbanken. Skolen registrerer betalingen når den er mottatt.', 'Complete the transfer in your online bank. The school registers the payment once it has been received.')}</p>
            </div>}
            <div className="payment-total"><span>{text(recurring ? (gift ? 'Din gave per måned' : 'Per måned · 10 terminer') : gift ? 'Din gave' : 'Til betaling', recurring ? (gift ? 'Your monthly gift' : 'Per month · 10 instalments') : gift ? 'Your gift' : 'Total')}</span><strong>{Number.isFinite(value) ? money(value) : '–'}</strong></div>
            {method !== 'bank' && <button className="payment-submit" disabled={busy}>{busy ? text('Starter betaling …', 'Starting payment …') : text(`Fortsett til ${method === 'vipps' ? 'Vipps' : method === 'paypal' ? 'PayPal' : 'kortbetaling'}`, `Continue to ${method === 'vipps' ? 'Vipps' : method === 'paypal' ? 'PayPal' : 'card payment'}`)}<ArrowRight size={19}/></button>}
            <p className="payment-legal">{text(method === 'bank' ? 'Les våre ' : 'Ved å fortsette godtar du våre ', method === 'bank' ? 'Read our ' : 'By continuing you agree to our ')}<Link to="/terms">{text('vilkår', 'terms')}</Link>. <Link to="/privacy">{text('Personvern', 'Privacy')}</Link></p>
          </fieldset></form>}
          {error && <p className="payment-error" role="alert">{error}</p>}
          {busy && !checkout && <p className="payment-note" role="status">{text('Vennligst vent …', 'Please wait …')}</p>}
        </div>
      </div></section>
    </main><SiteFooter />
  </div>;
}
