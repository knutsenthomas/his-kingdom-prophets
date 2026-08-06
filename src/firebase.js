import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || atob("QUl6YVN5QWVsVnNablRVNXhqUXNqZXdXRzdSallFc1FTSEgtYmtF"),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "his-kingdom-ministry.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "his-kingdom-ministry",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "his-kingdom-ministry.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "791237361706",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:791237361706:web:63516ba3d74436f23ac353",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-28GVKTMCZE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
