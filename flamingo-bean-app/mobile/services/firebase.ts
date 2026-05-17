import { getApp, getApps, initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";

declare const process: { env: Record<string, string | undefined> } | undefined;

const env = typeof process === "undefined" ? {} : process.env;

const defaultFirebaseConfig = {
  apiKey: "AIzaSyBiJG863W51WmjOqy-1QcssQdxyn97evns",
  appId: "1:107772915296:web:b876abd2a1a2852394dd05",
  authDomain: "flaming-bean-mobile.firebaseapp.com",
  measurementId: "G-VF1H9TQDMY",
  messagingSenderId: "107772915296",
  projectId: "flaming-bean-mobile",
  storageBucket: "flaming-bean-mobile.firebasestorage.app",
};

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY ?? defaultFirebaseConfig.apiKey,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID ?? defaultFirebaseConfig.appId,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? defaultFirebaseConfig.authDomain,
  measurementId: env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? defaultFirebaseConfig.measurementId,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? defaultFirebaseConfig.messagingSenderId,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? defaultFirebaseConfig.projectId,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? defaultFirebaseConfig.storageBucket,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.appId &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId,
);

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const customerAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
