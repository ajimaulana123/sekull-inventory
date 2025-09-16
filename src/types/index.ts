'use client';
import { z } from "zod";

// Skema ini mencerminkan SEMUA kolom yang ada di gambar, ditambah kolom tambahan
export const inventoryItemSchema = z.object({
  noData: z.string().optional(), // 'No.' di gambar, dipakai sebagai ID unik
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
  kodeVerifikasiBarang: z.string().optional().default('-'),
  kodeVerifikasiDana: z.string().optional().default('-'),
  kodeRekapTotal: z.string().optional().default('-'),
  kodeRekapHapus: z.string().optional().default('-'),
  kodeRekapDana: z.string().optional().default('-'),
  // Kolom tambahan yang diminta sebelumnya
  jumlah: z.coerce.number().optional().default(1),
  satuan: z.string().optional().default('buah'),
  kondisi: z.string().optional().default('Baik'),
  keterangan: z.string().optional().default('-'),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;


// Mapping untuk nama field ke header tabel (Bahasa Indonesia)
export const headerMapping: Record<keyof InventoryItem, string> = {
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

// Urutan ini HARUS sama persis dengan urutan kolom di file Excel, *setelah* kolom 'No. Data'.
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
    // Kolom tambahan harus ada di sini juga jika ada di Excel
    'jumlah',
    'satuan',
    'kondisi',
    'keterangan',
];

// Skema untuk validasi form tambah/ubah data
export const inventoryFormSchema = z.object({
  // Wajib diisi di form
  jenisBarang: z.string().min(1, "Jenis Barang tidak boleh kosong"),
  merkTipe: z.string().min(1, "Merk/Tipe tidak boleh kosong"),
  jumlah: z.coerce.number().min(1, "Jumlah harus lebih dari 0."),
  satuan: z.string().min(1, "Satuan harus diisi."),
  harga: z.coerce.number().min(0, "Harga tidak boleh negatif.").default(0),
  kondisi: z.enum(['Baik', 'Rusak Ringan', 'Rusak Berat'], { message: "Pilih kondisi barang." }),
  statusBarang: z.enum(['aktif', 'dihapus'], { message: "Pilih status barang." }),
  
  // Opsional di form
  tanggalPengadaan: z.date().nullable().optional(),
  areaRuang: z.string().optional(),
  keterangan: z.string().optional(),
  
  // Field tanggal hapus, wajib jika status 'dihapus'
  tanggalHapus: z.date().nullable().optional(),
  
  // Field lain yang tidak ada di form tapi perlu ada di skema
  indukNoBarang: z.string().optional(),
  indukHurufBarang: z.string().optional(),
  subJenisBarang: z.string().optional(),
  subKodeJenis: z.string().optional(),
  urutSubBarang: z.string().optional(),
  sumberDana: z.string().optional(),
  urutBarangDana: z.string().optional(),
  subAreaRuang: z.string().optional(),
  supplier: z.string().optional(),
  statusPengadaan: z.string().optional(),

}).refine(data => {
    if (data.statusBarang === 'dihapus') {
        return !!data.tanggalHapus;
    }
    return true;
}, {
    message: "Tanggal penghapusan harus diisi jika status barang 'dihapus'.",
    path: ["tanggalHapus"],
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};
