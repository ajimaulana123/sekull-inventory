'use client';
import { z } from "zod";

// This is the main schema for the inventory item, used for data from Firestore and for the data table
export const inventoryItemSchema = z.object({
  noData: z.string().optional(),
  jenisBarang: z.string().optional().default('-'),
  indukNoBarang: z.string().optional().default('-'),
  indukHurufBarang: z.string().optional().default('-'),
  subJenisBarang: z.string().optional().default('-'),
  merkTipe: z.string().optional().default('-'),
  subKodeJenis: z.string().optional().default('-'),
  urutSubBarang: z.string().optional().default('-'),
  sumberDana: z.string().optional().default('-'),
  urutBarangDana: z.string().optional().default('-'),
  areaRuang: z.string().optional().default('-'),
  subAreaRuang: z.string().optional().default('-'),
  tanggalPengadaan: z.date().optional().nullable(),
  supplier: z.string().optional().default('-'),
  harga: z.coerce.number().optional().default(0),
  statusPengadaan: z.string().optional().default('-'),
  statusBarang: z.string().optional().default('aktif'),
  tanggalHapus: z.date().optional().nullable(),
  kodeVerifikasiBarang: z.string().optional(),
  kodeVerifikasiDana: z.string().optional(),
  kodeRekapTotal: z.string().optional(),
  kodeRekapHapus: z.string().optional(),
  kodeRekapDana: z.string().optional(),
  // Kolom tambahan yang mungkin tidak ada di gambar utama tapi dibutuhkan di form/tabel
  jumlah: z.coerce.number().optional().default(1),
  satuan: z.string().optional().default('buah'),
  kondisi: z.string().optional().default('Baik'),
  keterangan: z.string().optional().default('-'),
  // Kolom lama untuk kompatibilitas sementara, akan dihapus nanti
  estimatedPrice: z.coerce.number().optional().default(0),
});


export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const headerMapping: Record<keyof Partial<InventoryItem>, string> = {
    noData: 'No. Data',
    jenisBarang: "Jenis Barang",
    indukNoBarang: "Induk No. Barang",
    indukHurufBarang: "Induk Huruf Barang",
    subJenisBarang: "Sub Jenis Barang",
    merkTipe: "Merk/Tipe",
    subKodeJenis: "Sub Kode Jenis",
    urutSubBarang: "Urut Sub Barang",
    sumberDana: "Sumber Dana",
    urutBarangDana: "Urut Barang Dana",
    areaRuang: "Area/Ruang",
    subAreaRuang: "Sub-Area/Ruang",
    tanggalPengadaan: "Tanggal Pengadaan",
    supplier: "Supplier",
    harga: "Harga (Rp)",
    statusPengadaan: "Status Pengadaan",
    statusBarang: "Status Barang",
    tanggalHapus: "Tanggal Hapus",
    kodeVerifikasiBarang: "Kode Verifikasi Barang",
    kodeVerifikasiDana: "Kode Verifikasi Dana",
    kodeRekapTotal: "Kode Rekap Total",
    kodeRekapHapus: "Kode Rekap Hapus",
    kodeRekapDana: "Kode Rekap Dana",
    jumlah: 'Jumlah',
    satuan: 'Satuan',
    kondisi: 'Kondisi',
    keterangan: 'Keterangan',
};

// Urutan ini HARUS sama persis dengan urutan kolom di file Excel
export const headerOrder: (keyof InventoryItem)[] = [
    'jenisBarang',
    'indukNoBarang',
    'indukHurufBarang',
    'subJenisBarang',
    'merkTipe',
    'subKodeJenis',
    'urutSubBarang',
    'sumberDana',
    'urutBarangDana',
    'areaRuang',
    'subAreaRuang',
    'tanggalPengadaan',
    'supplier',
    'harga',
    'statusPengadaan',
    'statusBarang',
    'tanggalHapus',
    'kodeVerifikasiBarang',
    'kodeVerifikasiDana',
    'kodeRekapTotal',
    'kodeRekapHapus',
    'kodeRekapDana',
];


// This is a stricter schema specifically for the form validation
export const inventoryFormSchema = z.object({
  jenisBarang: z.string().min(1, "Jenis Barang tidak boleh kosong"),
  merkTipe: z.string().optional(),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0."),
  satuan: z.string().min(1, "Satuan harus diisi."),
  kondisi: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat'], { message: "Pilih kondisi barang." }),
  harga: z.coerce.number().min(0, "Harga tidak boleh negatif.").default(0),
  areaRuang: z.string().min(1, "Area/Ruang tidak boleh kosong"),
  tanggalPengadaan: z.date().optional().nullable(),
  statusPengadaan: z.string().optional(),
  statusBarang: z.enum(['aktif', 'dihapus'], { message: "Pilih status barang." }),
  tanggalHapus: z.date().nullable(),
  // Add optional fields that might be part of the form but not strictly required for every submission
  keterangan: z.string().optional(),
  indukNoBarang: z.string().optional(),
  indukHurufBarang: z.string().optional(),
  subJenisBarang: z.string().optional(),
  subKodeJenis: z.string().optional(),
  urutSubBarang: z.string().optional(),
  sumberDana: z.string().optional(),
  urutBarangDana: z.string().optional(),
  subAreaRuang: z.string().optional(),
  supplier: z.string().optional(),
}).refine(data => {
    if (data.statusBarang === 'dihapus') {
        return !!data.tanggalHapus;
    }
    return true;
}, {
    message: "Tanggal penghapusan harus diisi jika statusnya 'dihapus'.",
    path: ["tanggalHapus"],
});


export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;
