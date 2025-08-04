// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// This is a fallback for client-side initialization
// In a real-world scenario with proper setup, this part might not be needed
// if the config is always available via another mechanism on the client.
const fallbackConfig = {
  apiKey: "AIzaSyA1I7U0wOqRIHporyobQd_jiSh74_HdKKg",
  authDomain: "school-inventory-manager.firebaseapp.com",
  projectId: "school-inventory-manager",
  storageBucket: "school-inventory-manager.appspot.com",
  messagingSenderId: "710462862997",
  appId: "1:710462862997:web:d02c987bb4b635c17a8d9c"
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(fallbackConfig);

const db = getFirestore(app);

// Function to get the initialized app, useful for client components
export function getFirebaseApp() {
    if (getApps().length) {
        return getApp();
    }
    
    // In a real app, you would likely fetch this config from a secure endpoint
    // or have it injected during the build process.
    return initializeApp(fallbackConfig);
}

export { app, db };
