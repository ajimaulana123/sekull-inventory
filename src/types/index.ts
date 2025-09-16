'use client';
import { z } from "zod";

// This is the main schema for the inventory item, used for data from Firestore and for the data table
export const inventoryItemSchema = z.object({
  noData: z.string().optional(),
  itemType: z.string().optional().default('-'),
  mainItemNumber: z.string().optional().default('-'),
  mainItemLetter: z.string().optional().default('-'),
  subItemType: z.string().optional().default('-'),
  brand: z.string().optional().default('-'),
  modelType: z.string().optional().default('-'),
  description: z.string().optional().default('-'),
  quantity: z.coerce.number().optional().default(0),
  unit: z.string().optional().default('-'),
  condition: z.string().optional().default('-'),
  estimatedPrice: z.coerce.number().optional().default(0),
  price: z.coerce.number().optional().default(0),
  subItemTypeCode: z.string().optional().default('-'),
  subItemOrder: z.string().optional().default('-'),
  fundingSource: z.string().optional().default('-'),
  fundingItemOrder: z.string().optional().default('-'),
  area: z.string().optional().default('-'),
  subArea: z.string().optional().default('-'),
  procurementDate: z.date().optional().nullable(),
  supplier: z.string().optional().default('-'),
  procurementStatus: z.string().optional().default('-'),
  disposalStatus: z.string().optional().default('aktif'),
  disposalDate: z.date().optional().nullable(),
  itemVerificationCode: z.string().optional(),
  fundingVerificationCode: z.string().optional(),
  totalRekapCode: z.string().optional(),
  disposalRekapCode: z.string().optional(),
  combinedFundingRekapCode: z.string().optional(),
});


export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const headerMapping: Record<keyof Partial<InventoryItem>, string> = {
    noData: 'No. Data',
    itemType: 'Jenis Barang',
    mainItemNumber: 'Induk No. Barang',
    mainItemLetter: 'Induk Huruf Barang',
    subItemType: 'Sub Jenis Barang',
    brand: 'Merk/Tipe',
    subItemTypeCode: 'Sub Kode Jenis',
    subItemOrder: 'Urut Sub Barang',
    fundingSource: 'Sumber Dana',
    fundingItemOrder: 'Urut Barang Dana',
    area: 'Area/Ruang',
    subArea: 'Sub-Area/Ruang',
    procurementDate: 'Tanggal Pengadaan',
    supplier: 'Supplier',
    estimatedPrice: 'Harga (Rp)',
    procurementStatus: 'Status Pengadaan',
    disposalStatus: 'Status Barang',
    disposalDate: 'Tanggal Hapus',
    itemVerificationCode: 'Kode Verifikasi Barang',
    fundingVerificationCode: 'Kode Verifikasi Dana',
    totalRekapCode: 'Kode Rekap Total',
    disposalRekapCode: 'Kode Rekap Hapus',
    combinedFundingRekapCode: 'Kode Rekap Dana',
    // Fields below are for backwards compatibility or form usage
    modelType: 'Model/Tipe',
    quantity: 'Jumlah',
    unit: 'Satuan',
    condition: 'Kondisi',
    price: 'Harga',
    description: 'Keterangan',
};

export const headerOrder: (keyof InventoryItem)[] = [
    'itemType',
    'mainItemNumber',
    'mainItemLetter',
    'subItemType',
    'brand', // Merk/Tipe
    'subItemTypeCode',
    'subItemOrder',
    'fundingSource',
    'fundingItemOrder',
    'area',
    'subArea',
    'procurementDate',
    'supplier',
    'estimatedPrice',
    'procurementStatus',
    'disposalStatus',
    'disposalDate',
    'itemVerificationCode',
    'fundingVerificationCode',
    'totalRekapCode',
    'disposalRekapCode',
    'combinedFundingRekapCode',
];

// This is a stricter schema specifically for the form validation
export const inventoryFormSchema = z.object({
  itemType: z.string().min(1, "Jenis Barang tidak boleh kosong"),
  brand: z.string().optional(),
  modelType: z.string().optional(),
  quantity: z.coerce.number().min(1, "Jumlah harus lebih dari 0."),
  unit: z.string().min(1, "Satuan harus diisi."),
  condition: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat'], { message: "Pilih kondisi barang." }),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif.").default(0),
  estimatedPrice: z.coerce.number().min(0, "Harga tidak boleh negatif.").optional(),
  area: z.string().min(1, "Area/Ruang tidak boleh kosong"),
  procurementDate: z.date().optional().nullable(),
  procurementStatus: z.string().optional(),
  disposalStatus: z.enum(['aktif', 'dihapus'], { message: "Pilih status barang." }),
  disposalDate: z.date().nullable(),
  // Add optional fields that might be part of the form but not strictly required for every submission
  description: z.string().optional(),
  mainItemNumber: z.string().optional(),
  mainItemLetter: z.string().optional(),
  subItemType: z.string().optional(),
  subItemTypeCode: z.string().optional(),
  subItemOrder: z.string().optional(),
  fundingSource: z.string().optional(),
  fundingItemOrder: z.string().optional(),
  subArea: z.string().optional(),
  supplier: z.string().optional(),
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