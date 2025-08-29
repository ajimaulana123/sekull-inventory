'use client';
import { z } from "zod";

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export const inventoryItemSchema = z.object({
  // Data Utama
  noData: z.coerce.string().min(1, "Nomor Data tidak boleh kosong"),
  itemType: z.coerce.string().min(1, "Jenis Barang tidak boleh kosong"),
  mainItemNumber: z.coerce.string().min(1, "Nomor Induk Barang tidak boleh kosong"),
  mainItemLetter: z.coerce.string().min(1, "Huruf Induk Barang tidak boleh kosong"),
  subItemType: z.coerce.string().min(1, "Sub Jenis Barang tidak boleh kosong"),
  brand: z.coerce.string().min(1, "Merk/Tipe tidak boleh kosong"),
  subItemTypeCode: z.coerce.string().min(1, "Kode Sub Jenis Barang tidak boleh kosong"),
  subItemOrder: z.coerce.string().min(1, "Nomor Urut Sub Barang tidak boleh kosong"),

  // Pendanaan
  fundingSource: z.coerce.string().min(1, "Sumber Pendanaan tidak boleh kosong"),
  fundingItemOrder: z.coerce.string().min(1, "Nomor Urut Barang Pendanaan tidak boleh kosong"),
  
  // Lokasi
  area: z.coerce.string().min(1, "Area/Ruang tidak boleh kosong"),
  subArea: z.coerce.string().min(1, "Sub-Area/Ruang tidak boleh kosong"),

  // Pengadaan
  procurementDate: z.coerce.number().min(1).max(31),
  procurementMonth: z.coerce.number().min(1).max(12),
  procurementYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 5),
  supplier: z.coerce.string().min(1, "Supplier/Distributor tidak boleh kosong"),
  estimatedPrice: z.coerce.number().min(0, "Harga harus positif"),
  procurementStatus: z.enum(['baru', 'second', 'bekas']),
  
  // Penghapusan
  disposalStatus: z.enum(['aktif', 'dihapus']),
  disposalDate: z.coerce.number().optional(),
  disposalMonth: z.coerce.number().optional(),
  disposalYear: z.coerce.number().optional(),

  // Kode Verifikasi & Rekapitulasi (dibuat otomatis)
  itemVerificationCode: z.string().optional(),
  fundingVerificationCode: z.string().optional(),
  totalRekapCode: z.string().optional(),
  disposalRekapCode: z.string().optional(),
  combinedFundingRekapCode: z.string().optional(),
});


export type InventoryItem = z.infer<typeof inventoryItemSchema>;
