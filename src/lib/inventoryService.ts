import { db } from './firebase';
import { collection, getDocs, writeBatch, doc, getDoc } from 'firebase/firestore';
import type { InventoryItem } from '@/types';
import { inventoryData as staticData } from './data';

const INVENTORY_COLLECTION = 'inventory';
const META_COLLECTION = 'meta';
const DATA_SEEDED_DOC = 'dataSeeded';

export async function getInventoryData(): Promise<InventoryItem[]> {
  // First, check if data has been seeded.
  await seedDataIfNotExists();
  
  const inventoryCollection = collection(db, INVENTORY_COLLECTION);
  const snapshot = await getDocs(inventoryCollection);
  if (snapshot.empty) {
    return [];
  }
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (InventoryItem & { id: string })[];
  
  // Firestore doesn't guarantee order, so we sort it here if needed.
  // For now, returning as is.
  return data;
}

export async function seedDataIfNotExists() {
    const metaDocRef = doc(db, META_COLLECTION, DATA_SEEDED_DOC);
    const metaDoc = await getDoc(metaDocRef);

    if (metaDoc.exists() && metaDoc.data().seeded) {
        return;
    }

    const batch = writeBatch(db);
    const inventoryCollection = collection(db, INVENTORY_COLLECTION);

    staticData.forEach((item) => {
        const docRef = doc(inventoryCollection, item.noData);
        // Firestore doesn't support 'undefined' values.
        // We need to clean the object before sending it to Firestore.
        const cleanedItem = Object.fromEntries(
            Object.entries(item).filter(([_, v]) => v !== undefined)
        );
        batch.set(docRef, cleanedItem);
    });
    
    batch.set(metaDocRef, { seeded: true });

    await batch.commit();
}
