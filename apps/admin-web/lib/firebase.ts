import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Production Firebase Web Client Configuration for OneStay360
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAe5GzgR_h_OX1bR94JTqZMb3Tc2BNSGWA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "onestay360-1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "onestay360-1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "onestay360-1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "153465579640",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:153465579640:web:6486857909c792d678258d"
};

// Initialize Firebase Client
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Authenticate session if client side
if (typeof window !== "undefined") {
  signInAnonymously(auth).catch((err) => {
    // Non-fatal if anonymous auth disabled on project, rules permit public reads
    console.debug("Anonymous auth notice:", err?.message || err);
  });
}

export { app, db, auth };
