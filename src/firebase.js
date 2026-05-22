import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "his-kingdom-prophets",
  appId: "1:973892579910:web:967aa3d67d2b73efea1047",
  storageBucket: "his-kingdom-prophets.firebasestorage.app",
  apiKey: "AIzaSyDUv86gVYtLM37PJ2-Fab8rHX3EeSjFQpc",
  authDomain: "his-kingdom-prophets.firebaseapp.com",
  messagingSenderId: "973892579910",
  measurementId: "G-03629NPBTY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
