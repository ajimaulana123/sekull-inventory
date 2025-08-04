'use client';
import { getInventoryData } from "@/lib/inventoryService";
import { InventoryTable } from "./inventory-table";
import { useCallback, useEffect, useState } from "react";
import type { InventoryItem } from "@/types";

export default function InventoryPage() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const inventoryData = await getInventoryData();
      setData(inventoryData);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <InventoryTable data={data} refreshData={fetchData} />
    </div>
  );
}
