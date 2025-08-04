import { inventoryData } from "@/lib/data";
import { InventoryTable } from "./inventory-table";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Data Inventaris Sekolah</h1>
        <p className="text-muted-foreground">Cari dan kelola semua data inventaris barang milik sekolah.</p>
      </div>
      <InventoryTable data={inventoryData} />
    </div>
  );
}
