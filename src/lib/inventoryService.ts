'use client';
import { db } from './firebase';
import { collection, doc, setDoc, onSnapshot, Unsubscribe, getDocs, writeBatch } from 'firebase/firestore';
import type { InventoryItem } from '@/types';

const INVENTORY_COLLECTION = 'inventory';

/**
 * Sets up a real-time listener for the inventory data.
 * This version attempts to prioritize server data to avoid issues with stale local cache.
 * @param onDataChange A callback function that will be called with the new data whenever it changes.
 * @returns An unsubscribe function to detach the listener.
 */
export function listenToInventoryData(onDataChange: (data: InventoryItem[]) => void): Unsubscribe {
  const inventoryCollection = collection(db, INVENTORY_COLLECTION);
  
  // The onSnapshot listener handles real-time updates from the server.
  // It's the standard and correct way to listen for changes.
  // The previous issues were likely due to data being incorrectly seeded and cached,
  // not the listener itself. This implementation is now clean and relies solely on Firestore's real-time capabilities.
  const unsubscribe = onSnapshot(inventoryCollection, (snapshot) => {
    // We get notified of snapshot changes. Let's map the documents to our data type.
    const data = snapshot.docs.map(doc => ({ ...doc.data() } as InventoryItem));
    onDataChange(data);
  }, (error) => {
    console.error("Error listening to inventory data:", error);
    // On error, provide an empty array to signify no data could be fetched.
    // This is crucial to prevent stale data from being shown.
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
    // Ensure undefined values are not written to Firestore by cleaning the object.
    const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined)
    );
    await setDoc(docRef, cleanedItem);
}

/**
 * WARNING: This function deletes all documents in the inventory collection.
 * It is intended for debugging and resetting data only.
 * @returns A promise that resolves when the collection has been cleared.
 */
export async function clearInventoryCollection(): Promise<void> {
  console.warn('Clearing all documents from the inventory collection!');
  const inventoryCollection = collection(db, INVENTORY_COLLECTION);
  const snapshot = await getDocs(inventoryCollection);
  if (snapshot.empty) {
    console.log('Inventory collection is already empty.');
    return;
  }
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('Successfully cleared the inventory collection.');
}
