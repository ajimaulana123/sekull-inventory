'use client';
import { getFirestore, collection, onSnapshot, Unsubscribe, doc, setDoc, query } from 'firebase/firestore';
import { getFirebaseApp } from './firebase';
import type { InventoryItem } from '@/types';

const INVENTORY_COLLECTION = 'inventory';

// Initialize Firestore on the client-side
const db = getFirestore(getFirebaseApp());

/**
 * Sets up a real-time listener for the inventory data.
 * @param onDataChange A callback function that will be called with the new data whenever it changes.
 * @returns An unsubscribe function to detach the listener.
 */
export function listenToInventoryData(onDataChange: (data: InventoryItem[]) => void): Unsubscribe {
  const inventoryQuery = query(collection(db, INVENTORY_COLLECTION));
  
  const unsubscribe = onSnapshot(inventoryQuery, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data() } as InventoryItem));
    onDataChange(data);
  }, (error) => {
    console.error("Error listening to inventory data:", error);
    // In case of error, return an empty array to avoid showing stale/cached data.
    onDataChange([]);
  });

  return unsubscribe;
}

/**
 * Adds or updates an inventory item in the Firestore 'inventory' collection.
 * The document ID will be the 'noData' field of the item.
 * @param item The inventory item to add or update.
 * @returns A promise that resolves when the item has been written.
 */
export async function addInventoryItem(item: InventoryItem): Promise<void> {
    const docRef = doc(db, INVENTORY_COLLECTION, item.noData);
    // Ensure that any undefined values are not sent to Firestore.
    const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined && v !== null)
    );
    await setDoc(docRef, cleanedItem, { merge: true });
}
