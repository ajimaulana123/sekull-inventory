'use client';
import { db } from './firebase';
import { collection, doc, setDoc, onSnapshot, Unsubscribe, query } from 'firebase/firestore';
import type { InventoryItem } from '@/types';

const INVENTORY_COLLECTION = 'inventory';

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
    onDataChange([]);
  });

  return unsubscribe;
}


/**
 * Adds a new inventory item to the Firestore 'inventory' collection.
 * The document ID will be the 'noData' field of the item.
 * @param item The inventory item to add.
 * @returns A promise that resolves when the item has been added.
 */
export async function addInventoryItem(item: InventoryItem): Promise<void> {
    const docRef = doc(db, INVENTORY_COLLECTION, item.noData); 
    const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined && v !== null)
    );
    await setDoc(docRef, cleanedItem, { merge: true });
}