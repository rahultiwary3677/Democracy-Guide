import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if config is provided
const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

import type { FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";

let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    // Initialize Analytics conditionally (it might not be supported in some environments like tests)
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
        console.log("🔥 Firebase & Analytics initialized successfully!");
      }
    });
  } catch (error) {
    console.error("Firebase initialization error", error);
  }
}

export { app, analytics, isConfigured as isFirebaseConfigured };
