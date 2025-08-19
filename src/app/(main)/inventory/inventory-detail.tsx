'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { InventoryItem } from "@/types";

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
                    <DetailRow label="No. Data" value={item.noData} />
                    <DetailRow label="Jenis Barang" value={item.itemType} />
                    <DetailRow label="Merk/Tipe" value={item.brand} />
                    <DetailRow label="Sub Jenis Barang" value={item.subItemType} />
                    <DetailRow label="Induk No. Barang" value={item.mainItemNumber} />
                    <DetailRow label="Induk Huruf Barang" value={item.mainItemLetter} />
                    <DetailRow label="Sub Kode Jenis" value={item.subItemTypeCode} />
                    <DetailRow label="Urut Sub Barang" value={item.subItemOrder} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Lokasi & Pendanaan</CardTitle>
                </CardHeader>
                <CardContent>
                    <DetailRow label="Area/Ruang" value={item.area} />
                    <DetailRow label="Sub-Area/Ruang" value={item.subArea} />
                    <Separator className="my-4" />
                    <DetailRow label="Sumber Pendanaan" value={item.fundingSource} />
                    <DetailRow label="Urut Barang Pendanaan" value={item.fundingItemOrder} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Detail Pengadaan</CardTitle>
                </CardHeader>
                <CardContent>
                    <DetailRow label="Tanggal Pengadaan" value={`${item.procurementDate}/${item.procurementMonth}/${item.procurementYear}`} />
                    <DetailRow label="Status Pengadaan" value={item.procurementStatus} />
                    <DetailRow label="Supplier" value={item.supplier} />
                    <DetailRow label="Perkiraan Harga" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.estimatedPrice)} />
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Status & Kode</CardTitle>
                </CardHeader>
                <CardContent>
                    <DetailRow label="Status Barang" value={item.disposalStatus} />
                    {item.disposalStatus === 'dihapus' && (
                         <DetailRow label="Tanggal Penghapusan" value={`${item.disposalDate}/${item.disposalMonth}/${item.disposalYear}`} />
                    )}
                     <Separator className="my-4" />
                    <DetailRow label="Kode Verifikasi Barang" value={item.itemVerificationCode} />
                    <DetailRow label="Kode Verifikasi Dana" value={item.fundingVerificationCode} />
                    <DetailRow label="Kode Rekap Total" value={item.totalRekapCode} />
                    <DetailRow label="Kode Rekap Dana" value={item.combinedFundingRekapCode} />
                    {item.disposalRekapCode && <DetailRow label="Kode Rekap Hapus" value={item.disposalRekapCode} />}
                </CardContent>
            </Card>
        </div>
    );
}
