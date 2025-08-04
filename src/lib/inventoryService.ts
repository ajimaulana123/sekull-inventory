import { db } from './firebase';
import { collection, getDocs, writeBatch, doc, getDoc } from 'firebase/firestore';
import type { InventoryItem } from '@/types';
import { inventoryData as staticData } from './data';

const INVENTORY_COLLECTION = 'inventory';
const META_COLLECTION = 'meta';
const DATA_SEEDED_DOC = 'dataSeeded';

/**
 * Fetches inventory data from the Firestore 'inventory' collection.
 * If the collection is empty, it will first seed it with static data.
 * @returns A promise that resolves to an array of inventory items.
 */
export async function getInventoryData(): Promise<InventoryItem[]> {
  // Ensure data is seeded if it's the first run.
  await seedDataIfNotExists();
  
  const inventoryCollection = collection(db, INVENTORY_COLLECTION);
  const snapshot = await getDocs(inventoryCollection);
  
  // If after attempting to seed, the snapshot is still empty, return an empty array.
  if (snapshot.empty) {
    console.log("Firestore 'inventory' collection is empty. Returning empty array.");
    return [];
  }

  // Map the documents from Firestore to the InventoryItem type.
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (InventoryItem & { id: string })[];
  
  return data;
}

/**
 * Checks if data has been seeded into Firestore. If not, it performs the seeding operation
 * using static data from './data'. This is to prevent re-seeding on every data fetch.
 */
export async function seedDataIfNotExists() {
    const metaDocRef = doc(db, META_COLLECTION, DATA_SEEDED_DOC);
    const metaDoc = await getDoc(metaDocRef);

    // If the 'dataSeeded' document exists and is true, don't do anything.
    if (metaDoc.exists() && metaDoc.data().seeded) {
        return;
    }

    console.log("Seeding initial data into Firestore...");
    const batch = writeBatch(db);
    const inventoryCollection = collection(db, INVENTORY_COLLECTION);

    staticData.forEach((item) => {
        // Use the unique 'noData' as the document ID.
        const docRef = doc(inventoryCollection, item.noData);
        // Firestore doesn't support 'undefined' values.
        // We need to clean the object by removing keys with undefined values.
        const cleanedItem = Object.fromEntries(
            Object.entries(item).filter(([_, v]) => v !== undefined)
        );
        batch.set(docRef, cleanedItem);
    });
    
    // After seeding, set the flag so we don't seed again.
    batch.set(metaDocRef, { seeded: true });

    try {
        await batch.commit();
        console.log("Initial data seeding successful.");
    } catch (error) {
        console.error("Error committing batch for data seeding:", error);
    }
}