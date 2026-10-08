// Uses the same public payment endpoints and publishable key as knutsenthomas/hkm.
export const STRIPE_PUBLIC_KEY = 'pk_live_51Pab8rAL393JGrO9bTUitYflDKlHGpLiqZCCBp0dCzBEV3ZFxARFfK6MgWraehq7i79tJHPIEzlpMwPiT2K3HsiZ00gJ1TQ71Y';
const endpoints = {
  schoolQuote: 'https://us-central1-his-kingdom-ministry.cloudfunctions.net/schoolCheckoutDetails',
  recurring: 'https://us-central1-his-kingdom-ministry.cloudfunctions.net/createRecurringPayment',
  recurringStatus: 'https://us-central1-his-kingdom-ministry.cloudfunctions.net/verifyRecurringPayment',
  card: 'https://createpaymentintent-42bhgdjkcq-uc.a.run.app',
  vipps: 'https://createvippspayment-42bhgdjkcq-uc.a.run.app',
  paypal: 'https://createpaypalorder-42bhgdjkcq-uc.a.run.app',
  paypalCapture: 'https://capturepaypalorder-42bhgdjkcq-uc.a.run.app',
  vippsStatus: 'https://finalizevippspayment-42bhgdjkcq-uc.a.run.app',
};
export const SCHOOL_PAYMENTS = [
  { id: 'monthly', amount: 1000, no: 'Månedlig avtale · 10 trekk', en: 'Monthly plan · 10 payments' },
  { id: 'instalment', amount: 1000, no: 'Betal én enkelttermin', en: 'Pay one instalment' },
  { id: 'semester', amount: 5000, no: 'Ett halvår', en: 'One semester' },
  { id: 'annual', amount: 10000, no: 'Hele studieåret', en: 'Full school year' },
  { id: 'registration', amount: 1000, no: 'Registreringsavgift', en: 'Registration fee' },
];
export function paymentPayload({ gift, plan, amount, name, email, studentName, reference, message }) {
  const selected = SCHOOL_PAYMENTS.find(item => item.id === plan);
  const value = gift ? Number(amount) : selected?.amount;
  if (!Number.isFinite(value) || value < 1 || value > 100000 || Math.abs(Math.round(value * 100) - value * 100) > 0.000001) throw new Error('invalid-amount');
  if (!name?.trim() || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email?.trim() || '')) throw new Error('invalid-contact');
  if (!gift && !studentName?.trim()) throw new Error('missing-student');
  return {
    amount: value,
    currency: 'NOK',
    customerDetails: {
      name: name.trim(), email: email.trim(), fund: 'hkpc',
      // HKM treats Course payments separately from gifts; never grant admission here.
      ...(gift ? {} : { type: 'Course', courseId: `hkpc-${plan}`, courseTitle: `HKPC – ${selected.no}` }),
      message: gift ? `Gave til HKPC${message?.trim() ? `\n${message.trim()}` : ''}` : `Skolebetaling HKPC\nElev: ${studentName.trim()}\nBetaling: ${selected.no}${reference?.trim() ? `\nReferanse: ${reference.trim()}` : ''}`,
    },
  };
}
export async function paymentRequest(method, payload) {
  const response = await fetch(endpoints[method], {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(response.status === 409 ? 'agreement-already-started' : 'payment-service-unavailable');
  return data;
}
let stripeLoader;
export function loadSchoolStripe() {
  if (window.Stripe) return Promise.resolve(window.Stripe(STRIPE_PUBLIC_KEY));
  if (!stripeLoader) stripeLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/'; script.async = true;
    script.onload = () => window.Stripe ? resolve(window.Stripe(STRIPE_PUBLIC_KEY)) : reject(new Error('stripe-unavailable'));
    script.onerror = () => { script.remove(); stripeLoader = undefined; reject(new Error('stripe-unavailable')); };
    document.head.appendChild(script);
  });
  return stripeLoader;
}
export function paymentState(state) {
  if (state === 'succeeded' || state === 'CAPTURED') return 'success';
  if (['processing', 'requires_action', 'requires_confirmation', 'AUTHORIZED', 'CREATED'].includes(state)) return 'pending';
  if (['ABORTED', 'EXPIRED', 'CANCELLED', 'TERMINATED', 'requires_payment_method', 'canceled'].includes(state)) return 'failed';
  return 'unverified';
}

let paypalLoader;
export function loadSchoolPayPal() {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (!paypalLoader) paypalLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=Adja3K8kDYk5_GUz10nBkwlYMgHNNXwiiwfGdGD7wkU354Z-qf9UJApOfD_YfV98t-SuzjXJZg2kPp-a&currency=NOK&intent=capture';
    script.async = true;
    script.onload = () => window.paypal ? resolve(window.paypal) : reject(new Error('paypal-unavailable'));
    script.onerror = () => { script.remove(); paypalLoader = undefined; reject(new Error('paypal-unavailable')); };
    document.head.appendChild(script);
  });
  return paypalLoader;
}

// Only a hash and random request identifier are kept in browser session storage.
export async function recurringRequestId(payload, provider) {
  const identity = JSON.stringify([provider, payload.gift, payload.schoolYear, payload.customerDetails.email.trim().toLowerCase(), payload.studentName?.trim().toLowerCase(), payload.amount, payload.customerDetails.name, payload.reference]);
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity));
  const key = `hkpc-recurring-v1-${Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')}`;
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID(); sessionStorage.setItem(key, id); return id;
}
