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
  procurementDate: z.date({ required_error: "Tanggal Pengadaan harus diisi." }),
  supplier: z.coerce.string().min(1, "Supplier/Distributor tidak boleh kosong"),
  estimatedPrice: z.coerce.number().min(0, "Harga harus positif"),
  procurementStatus: z.enum(['baru', 'second', 'bekas']),
  
  // Penghapusan
  disposalStatus: z.enum(['aktif', 'dihapus']),
  disposalDate: z.date().optional(),

  // Kode Verifikasi & Rekapitulasi (dibuat otomatis)
  itemVerificationCode: z.string().optional(),
  fundingVerificationCode: z.string().optional(),
  totalRekapCode: z.string().optional(),
  disposalRekapCode: z.string().optional(),
  combinedFundingRekapCode: z.string().optional(),
}).refine(data => {
    if (data.disposalStatus === 'dihapus') {
        return !!data.disposalDate;
    }
    return true;
}, {
    message: "Tanggal penghapusan harus diisi jika statusnya 'dihapus'.",
    path: ["disposalDate"],
});


export type InventoryItem = z.infer<typeof inventoryItemSchema>;

// Exclude auto-generated fields for form validation
export const inventoryFormSchema = inventoryItemSchema.omit({
    itemVerificationCode: true,
    fundingVerificationCode: true,
    totalRekapCode: true,
    disposalRekapCode: true,
    combinedFundingRekapCode: true,
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;
