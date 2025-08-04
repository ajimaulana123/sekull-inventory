import { db } from './firebase';
import { collection, getDocs, writeBatch, doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { InventoryItem } from '@/types';
import { inventoryData as staticData } from './data';

const INVENTORY_COLLECTION = 'inventory';
const META_COLLECTION = 'meta';
const DATA_SEEDED_DOC = 'dataSeeded';

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
    const docRef = doc(inventoryCollection, item.noData);
    const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined)
    );
    await setDoc(docRef, cleanedItem);
}


/**
 * Checks if data has been seeded into Firestore. If not, it performs the seeding operation
 * using static data from './data'. This is to prevent re-seeding on every data fetch.
 */
export async function seedDataIfNotExists() {
    const metaDocRef = doc(db, META_COLLECTION, DATA_SEEDED_DOC);
    const metaDoc = await getDoc(metaDocRef);

    if (metaDoc.exists() && metaDoc.data().seeded) {
        return;
    }
    
    const inventoryCollection = collection(db, INVENTORY_COLLECTION);
    const snapshot = await getDocs(inventoryCollection);
    if (!snapshot.empty) {
        if (!metaDoc.exists()) {
             await setDoc(metaDocRef, { seeded: true });
        }
        return;
    }

    console.log("Seeding initial data into Firestore...");
    const batch = writeBatch(db);

    staticData.forEach((item) => {
        const docRef = doc(inventoryCollection, item.noData);
        const cleanedItem = Object.fromEntries(
            Object.entries(item).filter(([_, v]) => v !== undefined)
        );
        batch.set(docRef, cleanedItem);
    });
    
    batch.set(metaDocRef, { seeded: true });

    try {
        await batch.commit();
        console.log("Initial data seeding successful.");
    } catch (error) {
        console.error("Error committing batch for data seeding:", error);
    }
}
