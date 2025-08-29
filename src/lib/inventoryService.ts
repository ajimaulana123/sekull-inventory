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

export async function saveInventoryItem(item: InventoryItem): Promise<void> {
    const docRef = doc(db, INVENTORY_COLLECTION, item.noData);
    const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined && v !== null)
    );
    await setDoc(docRef, cleanedItem, { merge: true });
}


export async function saveInventoryItemsBatch(items: InventoryItem[]): Promise<void> {
    if (items.length === 0) return;
    
    const batch = writeBatch(db);
    items.forEach(item => {
        const docRef = doc(db, INVENTORY_COLLECTION, item.noData);
         const cleanedItem = Object.fromEntries(
            Object.entries(item).filter(([_, v]) => v !== undefined && v !== null)
        );
        batch.set(docRef, cleanedItem, { merge: true });
    });
    
    await batch.commit();
}


export async function deleteInventoryItems(noDataIds: string[]): Promise<void> {
    if (noDataIds.length === 0) {
        return;
    }

    const batch = writeBatch(db);
    noDataIds.forEach(id => {
        const docRef = doc(db, INVENTORY_COLLECTION, id);
        batch.delete(docRef);
    });
    await batch.commit();
}
