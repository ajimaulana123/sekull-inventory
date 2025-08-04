import { z } from "zod";

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export const inventoryItemSchema = z.object({
  noData: z.string().min(1, "Nomor Data tidak boleh kosong"),
  itemType: z.string().min(1, "Jenis Barang tidak boleh kosong"),
  brand: z.string().min(1, "Merk tidak boleh kosong"),
  area: z.string().min(1, "Area/Ruang tidak boleh kosong"),
  procurementYear: z.coerce.number().min(1900, "Tahun tidak valid").max(new Date().getFullYear(), "Tahun tidak boleh di masa depan"),
  estimatedPrice: z.coerce.number().min(0, "Harga harus positif"),
  procurementStatus: z.enum(['baru', 'second', 'bekas']),
  disposalStatus: z.enum(['aktif', 'dihapus']),
  // These fields are auto-generated or optional, so no need for strict validation here
  mainItemNumber: z.string().optional(),
  mainItemLetter: z.string().optional(),
  subItemType: z.string().optional(),
  subItemTypeCode: z.string().optional(),
  subItemOrder: z.string().optional(),
  fundingSource: z.string().optional(),
  fundingItemOrder: z.string().optional(),
  subArea: z.string().optional(),
  procurementDate: z.coerce.number().optional(),
  procurementMonth: z.coerce.number().optional(),
  supplier: z.string().optional(),
  disposalDate: z.coerce.number().optional(),
  disposalMonth: z.coerce.number().optional(),
  disposalYear: z.coerce.number().optional(),
  itemVerificationCode: z.string().optional(),
  fundingVerificationCode: z.string().optional(),
  totalRekapCode: z.string().optional(),
  disposalRekapCode: z.string().optional(),
  combinedFundingRekapCode: z.string().optional(),
});


export type InventoryItem = z.infer<typeof inventoryItemSchema>;
