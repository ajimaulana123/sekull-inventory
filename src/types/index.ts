'use client';
import { z } from "zod";

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export const headerMapping: { [key: string]: string } = {
    noData: 'No. Data',
    itemType: 'Jenis Barang',
    mainItemNumber: 'Induk No. Barang',
    mainItemLetter: 'Induk Huruf Barang',
    subItemType: 'Sub Jenis Barang',
    brand: 'Merk/Tipe',
    modelType: 'Model/Tipe',
    description: 'Keterangan',
    quantity: 'Jumlah',
    unit: 'Satuan',
    condition: 'Kondisi',
    price: 'Harga (Rp)',
    subItemTypeCode: 'Sub Kode Jenis',
    subItemOrder: 'Urut Sub Barang',
    fundingSource: 'Sumber Dana',
    fundingItemOrder: 'Urut Barang Dana',
    area: 'Area/Ruang',
    subArea: 'Sub-Area/Ruang',
    procurementDate: 'Tanggal Pengadaan',
    supplier: 'Supplier',
    procurementStatus: 'Status Pengadaan',
    disposalStatus: 'Status Barang',
    disposalDate: 'Tanggal Hapus',
    itemVerificationCode: 'Kode Verifikasi Barang',
    fundingVerificationCode: 'Kode Verifikasi Dana',
    totalRekapCode: 'Kode Rekap Total',
    disposalRekapCode: 'Kode Rekap Hapus',
    combinedFundingRekapCode: 'Kode Rekap Dana'
};

export const headerOrder = Object.keys(headerMapping);

export const inventoryItemSchema = z.object({
  noData: z.string().optional(), // No longer strictly min(1) for import flexibility
  itemType: z.string().optional().or(z.literal('')), 
  mainItemNumber: z.string().optional().or(z.literal('')), 
  mainItemLetter: z.string().optional().or(z.literal('')), 
  subItemType: z.string().optional().or(z.literal('')), 
  brand: z.string().optional().or(z.literal('')), 
  modelType: z.string().optional().or(z.literal('')), 
  description: z.string().optional().or(z.literal('')), 
  quantity: z.coerce.number().optional().default(0), // Coerce to number, default to 0
  unit: z.string().optional().or(z.literal('')), 
  condition: z.string().optional().or(z.literal('')), // Allow any string for flexibility
  price: z.coerce.number().optional().default(0), // Coerce to number, default to 0
  subItemTypeCode: z.string().optional().or(z.literal('')), 
  subItemOrder: z.string().optional().or(z.literal('')), 
  fundingSource: z.string().optional().or(z.literal('')), 
  fundingItemOrder: z.string().optional().or(z.literal('')), 
  area: z.string().optional().or(z.literal('')), 
  subArea: z.string().optional().or(z.literal('')), 
  procurementDate: z.date().optional().nullable(), // Keep date nullable and optional
  supplier: z.string().optional().or(z.literal('')), 
  procurementStatus: z.string().optional().or(z.literal('')), // Allow any string for flexibility
  disposalStatus: z.string().optional().or(z.literal('')), // Allow any string for flexibility
  disposalDate: z.date().optional().nullable(), // Keep date nullable and optional
  itemVerificationCode: z.string().optional(),
  fundingVerificationCode: z.string().optional(),
  totalRekapCode: z.string().optional(),
  disposalRekapCode: z.string().optional(),
  combinedFundingRekapCode: z.string().optional(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

// inventoryFormSchema should be stricter, extending from inventoryItemSchema and adding refinements
export const inventoryFormSchema = inventoryItemSchema.extend({
  noData: z.string().min(1, "Nomor Data tidak boleh kosong"),
  itemType: z.string().min(1, "Jenis Barang tidak boleh kosong"),
  brand: z.string().min(1, "Merk harus diisi."),
  modelType: z.string().min(1, "Model/Tipe harus diisi."),
  quantity: z.coerce.number().min(1, "Jumlah harus lebih dari 0."),
  unit: z.string().min(1, "Satuan harus diisi."),
  condition: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat'], { message: "Pilih kondisi barang." }),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif."),
  area: z.string().min(1, "Area/Ruang tidak boleh kosong"),
  procurementDate: z.date({ required_error: "Tanggal Pengadaan harus diisi." }).nullable().refine(date => date !== null, { message: "Tanggal Pengadaan harus diisi." }),
  procurementStatus: z.enum(['baru', 'second', 'bekas'], { message: "Pilih status pengadaan." }),
  disposalStatus: z.enum(['aktif', 'dihapus'], { message: "Pilih status barang." }),
}).refine(data => {
    if (data.disposalStatus === 'dihapus') {
        return !!data.disposalDate;
    }
    return true;
}, {
    message: "Tanggal penghapusan harus diisi jika statusnya 'dihapus'.",
    path: ["disposalDate"],
});


export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;
