'use client';
import { db } from './firebase';
import { collection, getDocs, writeBatch, doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { InventoryItem } from '@/types';

const INVENTORY_COLLECTION = 'inventory';

/**
 * Sets up a real-time listener for the inventory data.
 * @param onDataChange A callback function that will be called with the new data whenever it changes.
 * @returns An unsubscribe function to detach the listener.
 */
export function listenToInventoryData(onDataChange: (data: InventoryItem[]) => void): Unsubscribe {
  const inventoryCollection = collection(db, INVENTORY_COLLECTION);
  
  const unsubscribe = onSnapshot(inventoryCollection, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data() } as InventoryItem));
    onDataChange(data);
  }, (error) => {
    console.error("Error listening to inventory data:", error);
    // Handle error appropriately, maybe call onDataChange with an empty array or an error state
    onDataChange([]);
  });

  return unsubscribe;
}


/**
 * Fetches inventory data from the Firestore 'inventory' collection once.
 * It will return an empty array if the collection is empty.
 * @returns A promise that resolves to an array of inventory items.
 */
export async function getInventoryData(): Promise<InventoryItem[]> {
  const inventoryCollection = collection(db, INVENTORY_COLLECTION);
  const snapshot = await getDocs(inventoryCollection);
  
  if (snapshot.empty) {
    return [];
  }

  const data = snapshot.docs.map(doc => ({ ...doc.data() } as InventoryItem));
  
  return data;
}

/**
 * Adds a new inventory item to the Firestore 'inventory' collection.
 * @param item The inventory item to add.
 * @returns A promise that resolves when the item has been added.
 */
export async function addInventoryItem(item: InventoryItem): Promise<void> {
    const inventoryCollection = collection(db, INVENTORY_COLLECTION);
    // Use a unique ID for the document, for example, combining noData and a timestamp or a generated UUID
    // For simplicity, we're still using noData but this could be risky if not unique.
    const docRef = doc(inventoryCollection, item.noData); 
    const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined)
    );
    await setDoc(docRef, cleanedItem);
}
