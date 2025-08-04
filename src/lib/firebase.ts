// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { headers } from "next/headers";

let app: FirebaseApp;
const firebaseConfigStr = process.env.FIREBASE_CONFIG;

if (firebaseConfigStr) {
    const firebaseConfig = JSON.parse(firebaseConfigStr);
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} else {
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
    app = getApps().length ? getApp() : initializeApp(fallbackConfig);
}

const db = getFirestore(app);

// Function to get the initialized app, useful for client components
export function getFirebaseApp() {
    return getApps().length ? getApp() : initializeApp(JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!));
}

export { app, db };
