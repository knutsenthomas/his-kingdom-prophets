import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD8MG3pJebYkckJxHejDSN7zda1aufAiQU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "auth.hkpc.no",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0659494185",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0659494185.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "578298544771",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:578298544771:web:98a223cd755ba2326591b6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-03629NPBTY",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-990e7216-ac37-4c55-8e56-9d69fdf28c7f"
};

const app = initializeApp(firebaseConfig);
const dbId = firebaseConfig.firestoreDatabaseId;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
export const auth = getAuth(app);
auth.useDeviceLanguage();
export const storage = getStorage(app);
export default app;

