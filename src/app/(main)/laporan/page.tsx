'use client';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { InventoryItem } from '@/types';
import { listenToInventoryData } from '@/lib/inventoryService';
import type { DateRange } from 'react-day-picker';

type ReportType = 'all' | 'active' | 'disposed' | 'procurement';
type FileFormat = 'csv' | 'xlsx' | 'pdf';

export default function LaporanPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [reportType, setReportType] = useState<ReportType>('all');
    const [fileFormat, setFileFormat] = useState<FileFormat>('csv');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.replace('/inventory');
        } else if (user) {
            setLoading(true);
            const unsubscribe = listenToInventoryData((data) => {
                setInventoryData(data);
                setLoading(false);
            });
            return () => unsubscribe(); // Cleanup listener
        }
    }, [user, router]);
    
    const handleDownload = () => {
        let filteredData = [...inventoryData];

        // 1. Filter by report type
        if (reportType === 'active') {
            filteredData = filteredData.filter(item => item.disposalStatus === 'aktif');
        } else if (reportType === 'disposed') {
            filteredData = filteredData.filter(item => item.disposalStatus === 'dihapus');
        }

        // 2. Filter by date range (only if 'procurement' report type is selected or date range is set)
        if (dateRange?.from && dateRange?.to) {
            filteredData = filteredData.filter(item => {
                try {
                    // Create a date from procurement year, month, and day. Month is 0-indexed.
                    const itemDate = new Date(item.procurementYear, item.procurementMonth - 1, item.procurementDate);
                    return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
                } catch (e) {
                    return false; // Invalid date in data
                }
            });
        }
        
        // 3. Generate file content (CSV for now)
        if (fileFormat === 'csv') {
            const headers = Object.keys(inventoryData[0] || {}) as (keyof InventoryItem)[];
            const csvContent = [
                headers.join(','),
                ...filteredData.map(item =>
                    headers.map(header => `"${String(item[header] ?? '').replace(/"/g, '""')}"`).join(',')
                )
            ].join('\n');
            
            // 4. Trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `laporan_inventaris_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert(`Format ${fileFormat.toUpperCase()} belum didukung.`);
        }
    };


    if (!user || user.role !== 'admin') {
        return (
            <div className="flex h-full items-center justify-center">
                <p>Access denied. Redirecting...</p>
            </div>
        );
    }
    
    if (loading) {
        return (
             <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Laporan Inventaris</h1>
                    <p className="text-muted-foreground">Buat dan unduh laporan data inventaris sekolah.</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <p>Memuat data untuk laporan...</p>
                </div>
            </div>
        )
    }

  return (
    <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Laporan Inventaris</h1>
            <p className="text-muted-foreground">Buat dan unduh laporan data inventaris sekolah.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Pengaturan Laporan</CardTitle>
                <CardDescription>Pilih kriteria untuk laporan yang ingin Anda buat. Ditemukan {inventoryData.length} data barang.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Jenis Laporan</label>
                        <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis laporan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Laporan Seluruh Inventaris</SelectItem>
                                <SelectItem value="active">Laporan Barang Aktif</SelectItem>
                                <SelectItem value="disposed">Laporan Barang Dihapus</SelectItem>
                                <SelectItem value="procurement">Laporan Pengadaan (berdasarkan tanggal)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Format File</label>
                        <Select value={fileFormat} onValueChange={(value: FileFormat) => setFileFormat(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih format file" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">CSV (.csv)</SelectItem>
                                <SelectItem value="xlsx" disabled>Excel (.xlsx) - Segera Hadir</SelectItem>
                                <SelectItem value="pdf" disabled>PDF (.pdf) - Segera Hadir</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Rentang Tanggal Pengadaan</label>
                    <DatePickerWithRange onDateChange={setDateRange} />
                </div>
                 <Button className="w-full md:w-auto" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Laporan
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
