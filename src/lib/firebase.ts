// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1I7U0wOqRIHporyobQd_jiSh74_HdKKg",
  authDomain: "school-inventory-manager.firebaseapp.com",
  projectId: "school-inventory-manager",
  storageBucket: "school-inventory-manager.appspot.com",
  messagingSenderId: "710462862997",
  appId: "1:710462862997:web:d02c987bb4b635c17a8d9c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
