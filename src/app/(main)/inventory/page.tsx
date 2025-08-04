'use client';
import { listenToInventoryData } from "@/lib/inventoryService";
import { InventoryTable } from "./inventory-table";
import { useEffect, useState, useCallback } from "react";
import type { InventoryItem } from "@/types";

export default function InventoryPage() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // We need a stable refresh function to pass to the table, but the actual data
  // will come from the real-time listener. This function is now a no-op but
  // is kept for prop compatibility if other actions need to trigger a manual refresh.
  const refreshData = useCallback(() => {
    // The listener already handles data updates, so this can be empty
    // or could contain logic for a manual re-fetch if needed in the future.
  }, []);

  useEffect(() => {
    setLoading(true);
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
