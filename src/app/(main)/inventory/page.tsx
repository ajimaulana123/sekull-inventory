'use client';
import { listenToInventoryData } from "@/lib/inventoryService";
import { InventoryTable } from "./inventory-table";
import { useEffect, useState, useCallback } from "react";
import type { InventoryItem } from "@/types";

export default function InventoryPage() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // This function is passed to the form to trigger a re-render/refresh if needed,
  // but the primary data source is the real-time listener.
  const refreshData = useCallback(() => {
    // The listener handles updates, so this can be a no-op.
  }, []);

  useEffect(() => {
    setLoading(true);
    // Subscribe to real-time inventory data
    const unsubscribe = listenToInventoryData((inventoryData) => {
      setData(inventoryData);
      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
       <div className="flex flex-col gap-6 h-full">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Data Inventaris Sekolah</h1>
          <p className="text-muted-foreground">Cari dan kelola semua data inventaris barang milik sekolah.</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
            <p>Memuat data inventaris...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Data Inventaris Sekolah</h1>
        <p className="text-muted-foreground">Cari dan kelola semua data inventaris barang milik sekolah.</p>
      </div>
      <InventoryTable data={data} refreshData={refreshData} />
    </div>
  );
}
