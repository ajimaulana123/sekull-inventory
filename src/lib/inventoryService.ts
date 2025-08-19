'use client';
import { getFirestore, collection, onSnapshot, Unsubscribe, doc, setDoc, query, writeBatch, deleteDoc } from 'firebase/firestore';
import { getFirebaseApp } from './firebase';
import type { InventoryItem } from '@/types';

const INVENTORY_COLLECTION = 'inventory';

const db = getFirestore(getFirebaseApp());

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

export async function addInventoryItem(item: InventoryItem): Promise<void> {
    const docRef = doc(db, INVENTORY_COLLECTION, item.noData);
    const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined && v !== null)
    );
    await setDoc(docRef, cleanedItem, { merge: true });
}

/**
 * Deletes one or more inventory items from Firestore.
 * @param noDataIds An array of document IDs ('noData' field) to delete.
 * @returns A promise that resolves when the items have been deleted.
 */
export async function deleteInventoryItems(noDataIds: string[]): Promise<void> {
    if (noDataIds.length === 0) {
        return;
    }

    if (noDataIds.length === 1) {
        // Simple delete for a single item
        await deleteDoc(doc(db, INVENTORY_COLLECTION, noDataIds[0]));
    } else {
        // Batched delete for multiple items
        const batch = writeBatch(db);
        noDataIds.forEach(id => {
            const docRef = doc(db, INVENTORY_COLLECTION, id);
            batch.delete(docRef);
        });
        await batch.commit();
    }
}