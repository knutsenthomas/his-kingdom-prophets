import { getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence, browserPopupRedirectResolver, GoogleAuthProvider, signInWithPopup, signInWithCredential, signInWithCustomToken, signOut } from 'firebase/auth';
import { auth, firebaseConfig } from '../firebase';

const endpoint = 'https://europe-west1-his-kingdom-ministry.cloudfunctions.net/communitySso';
const encode = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const existingApp = name => getApps().find(app => app.name === name);

// An isolated popup keeps the website session intact if verification fails.
export async function signInWebsiteAdministrator() {
  const popupName = 'website-google-login';
  const popupAuth = existingApp(popupName) ? getAuth(existingApp(popupName)) : initializeAuth(initializeApp(firebaseConfig, popupName), {
    persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver,
  });
  const centralName = 'website-ministry-login';
  const centralAuth = existingApp(centralName) ? getAuth(existingApp(centralName)) : initializeAuth(initializeApp({
    apiKey: 'AIzaSyAelVsZnTU5xjQsjewWG7RjYEsQSHH-bkE',
    authDomain: 'his-kingdom-ministry.firebaseapp.com',
    projectId: 'his-kingdom-ministry',
    appId: '1:791237361706:web:63516ba3d74436f23ac353',
  }, centralName), { persistence: inMemoryPersistence });
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(popupAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) throw new Error('Google-innloggingen kunne ikke bekreftes.');
    const central = await signInWithCredential(centralAuth, credential);
    const verifier = encode(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = encode(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
    const authorization = await fetch(endpoint + '/authorize', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await central.user.getIdToken()}` }, body: JSON.stringify({ challenge }),
    });
    const handoff = await authorization.json();
    if (!authorization.ok) throw new Error('Skolens tilgang kunne ikke bekreftes. Logg inn med administratorkontoen din.');
    const exchange = await fetch(endpoint + '/exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: handoff.code, verifier }) });
    const session = await exchange.json();
    if (!exchange.ok || typeof session.customToken !== 'string') throw new Error('Innloggingen kunne ikke fullføres. Prøv igjen.');
    await signInWithCustomToken(auth, session.customToken);
  } finally {
    await Promise.allSettled([signOut(popupAuth), signOut(centralAuth)]);
  }
}

export async function ensureWebsiteSession() {
  const token = await auth.currentUser?.getIdTokenResult();
  if (token?.claims.hkm_uid && token.signInProvider === 'custom') return;
  await signInWebsiteAdministrator();
}
