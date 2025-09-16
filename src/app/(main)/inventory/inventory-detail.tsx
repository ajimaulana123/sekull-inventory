'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { InventoryItem } from "@/types";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface InventoryDetailProps {
    item: InventoryItem;
}

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="flex justify-between text-sm py-2 border-b border-dashed">
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium text-right">{value}</p>
        </div>
    );
};


export function InventoryDetail({ item }: InventoryDetailProps) {
    if (!item) return null;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Data Utama</CardTitle>
                </CardHeader>
                <CardContent>
                    <DetailRow label="Jenis Barang" value={item.jenisBarang} />
                    <DetailRow label="Merk/Tipe" value={item.merkTipe} />
                    <DetailRow label="Sub Jenis Barang" value={item.subJenisBarang} />
                    <DetailRow label="Induk No. Barang" value={item.indukNoBarang} />
                    <DetailRow label="Induk Huruf Barang" value={item.indukHurufBarang} />
                    <DetailRow label="Sub Kode Jenis" value={item.subKodeJenis} />
                    <DetailRow label="Urut Sub Barang" value={item.urutSubBarang} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Lokasi & Pendanaan</CardTitle>
                </CardHeader>
                <CardContent>
                    <DetailRow label="Area/Ruang" value={item.areaRuang} />
                    <DetailRow label="Sub-Area/Ruang" value={item.subAreaRuang} />
                    <Separator className="my-4" />
                    <DetailRow label="Sumber Pendanaan" value={item.sumberDana} />
                    <DetailRow label="Urut Barang Pendanaan" value={item.urutBarangDana} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Detail Pengadaan & Kondisi</CardTitle>
                </CardHeader>
                <CardContent>
                    <DetailRow label="Tanggal Pengadaan" value={item.tanggalPengadaan ? format(new Date(item.tanggalPengadaan), 'PPP', { locale: id }) : '-'} />
                    <DetailRow label="Status Pengadaan" value={item.statusPengadaan} />
                    <DetailRow label="Supplier" value={item.supplier} />
                    <DetailRow label="Harga" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.harga || 0)} />
                     <Separator className="my-4" />
                    <DetailRow label="Jumlah" value={item.jumlah} />
                    <DetailRow label="Satuan" value={item.satuan} />
                    <DetailRow label="Kondisi" value={item.kondisi} />
                    <DetailRow label="Keterangan" value={item.keterangan} />
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Status & Kode</CardTitle>
                </CardHeader>
                <CardContent>
                    <DetailRow label="Status Barang" value={item.statusBarang} />
                    {item.statusBarang === 'dihapus' && (
                         <DetailRow label="Tanggal Penghapusan" value={item.tanggalHapus ? format(new Date(item.tanggalHapus), 'PPP', { locale: id }) : '-'} />
                    )}
                     <Separator className="my-4" />
                    <DetailRow label="Kode Verifikasi Barang" value={item.kodeVerifikasiBarang} />
                    <DetailRow label="Kode Verifikasi Dana" value={item.kodeVerifikasiDana} />
                    <DetailRow label="Kode Rekap Total" value={item.kodeRekapTotal} />
                    <DetailRow label="Kode Rekap Dana" value={item.kodeRekapDana} />
                    {item.kodeRekapHapus && <DetailRow label="Kode Rekap Hapus" value={item.kodeRekapHapus} />}
                </CardContent>
            </Card>
        </div>
    );
}
