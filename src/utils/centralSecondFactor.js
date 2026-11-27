import { getMultiFactorResolver, TotpMultiFactorGenerator } from 'firebase/auth';

// Every HKM account signs in with a second factor: the code from an authenticator app.
// The website asks for the code here; accounts set it up on hiskingdomministry.no.

const STYLE = `
.hkm2f-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:10000;padding:16px}
.hkm2f{background:#fff;color:#1f2937;border-radius:16px;max-width:400px;width:100%;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.25);font:15px/1.5 system-ui,sans-serif}
.hkm2f h2{margin:0 0 6px;font-size:20px;text-align:center}.hkm2f p{margin:0 0 14px;color:#4b5563;font-size:14px;text-align:center}
.hkm2f label{display:block;font-weight:600;font-size:13px;margin:12px 0 6px}
.hkm2f input{width:100%;box-sizing:border-box;height:48px;border:1px solid #d1d5db;border-radius:10px;padding:0 14px;font-size:18px;letter-spacing:.15em}
.hkm2f button{width:100%;min-height:48px;border-radius:10px;border:1px solid #d1d5db;background:#fff;font:inherit;font-weight:600;cursor:pointer;margin-top:10px;color:#1f2937}
.hkm2f button.primary{background:#5b3a8c;border-color:#5b3a8c;color:#fff}.hkm2f button.link{border:0;background:none;color:#5b3a8c;min-height:36px;font-size:13px}
.hkm2f .error{background:#fee2e2;color:#b91c1c;border-radius:8px;padding:10px;font-size:13px;margin:10px 0}`;

export const isSecondFactorChallenge = error => error?.code === 'auth/multi-factor-auth-required';

export function secondFactorMessage(error) {
  switch (error?.code) {
    case 'auth/invalid-verification-code':
    case 'auth/invalid-totp-code': return 'Koden stemmer ikke. Sjekk at klokken på telefonen er riktig, og prøv en ny kode.';
    case 'auth/too-many-requests': return 'For mange forsøk. Vent litt og prøv igjen.';
    default: return error?.message || 'Noe gikk galt. Prøv igjen.';
  }
}

function openDialog() {
  if (!document.getElementById('hkm2f-style')) {
    const style = document.createElement('style'); style.id = 'hkm2f-style'; style.textContent = STYLE; document.head.appendChild(style);
  }
  const backdrop = document.createElement('div');
  backdrop.className = 'hkm2f-backdrop';
  backdrop.innerHTML = '<div class="hkm2f" role="dialog" aria-modal="true" aria-labelledby="hkm2f-title"></div>';
  document.body.appendChild(backdrop);
  return { box: backdrop.querySelector('.hkm2f'), close: () => backdrop.remove() };
}

function showError(box, error) {
  box.querySelector('.error')?.remove();
  const div = document.createElement('div'); div.className = 'error'; div.setAttribute('role', 'alert'); div.textContent = secondFactorMessage(error);
  box.querySelector('p')?.after(div);
}

async function busy(button, work) {
  const label = button.textContent; button.disabled = true; button.textContent = 'Vent litt …';
  try { return await work(); } finally { button.disabled = false; button.textContent = label; }
}

function codeForm(box, onSubmit) {
  const form = document.createElement('form'); form.noValidate = true;
  form.innerHTML = '<label for="hkm2f-code">Sekssifret kode</label><input id="hkm2f-code" autocomplete="one-time-code" inputmode="numeric" maxlength="6"><button class="primary" type="submit">Bekreft og logg inn</button>';
  const input = form.querySelector('input');
  input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, ''); });
  form.addEventListener('submit', event => { event.preventDefault(); onSubmit(input.value.trim(), form.querySelector('button')); });
  box.appendChild(form);
  setTimeout(() => input.focus(), 50);
}

/** Asks for the authenticator code and resolves with the completed sign-in. */
export function resolveSecondFactor(auth, error) {
  const resolver = getMultiFactorResolver(auth, error);
  const totpHint = resolver.hints.find(hint => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID);
  // Accounts set up with SMS before it was removed have no app code; an administrator resets them.
  if (!totpHint) return Promise.reject(new Error('Kontoen din har en tofaktormetode som ikke lenger brukes. Be en administrator om å nullstille tofaktor, så kan du sette opp en autentiseringsapp på hiskingdomministry.no/minside.'));
  return new Promise((resolve, reject) => {
    const dialog = openDialog();
    dialog.box.innerHTML = '<h2 id="hkm2f-title">Bekreft at det er deg</h2><p>Skriv inn koden fra autentiseringsappen.</p>';
    codeForm(dialog.box, (code, button) => busy(button, async () => {
      try { const credential = await resolver.resolveSignIn(TotpMultiFactorGenerator.assertionForSignIn(totpHint.uid, code)); dialog.close(); resolve(credential); }
      catch (err) { showError(dialog.box, err); }
    }));
    const cancel = document.createElement('button'); cancel.className = 'link'; cancel.type = 'button'; cancel.textContent = 'Avbryt';
    cancel.onclick = () => { dialog.close(); reject(new Error('Innloggingen ble avbrutt.')); };
    dialog.box.appendChild(cancel);
  });
}
