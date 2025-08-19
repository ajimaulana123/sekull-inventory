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
import { useToast } from '@/hooks/use-toast';


type ReportType = 'all' | 'active' | 'disposed' | 'procurement';
type FileFormat = 'csv' | 'xlsx' | 'pdf';

export default function LaporanPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

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
    
    const getFilteredData = () => {
        let filteredData = [...inventoryData];

        if (reportType === 'active') {
            filteredData = filteredData.filter(item => item.disposalStatus === 'aktif');
        } else if (reportType === 'disposed') {
            filteredData = filteredData.filter(item => item.disposalStatus === 'dihapus');
        }

        if (dateRange?.from && dateRange?.to) {
             if (reportType !== 'procurement') {
                toast({
                    variant: 'destructive',
                    title: 'Peringatan',
                    description: 'Rentang tanggal hanya berlaku untuk jenis laporan "Laporan Pengadaan".',
                });
            }
            filteredData = filteredData.filter(item => {
                try {
                    const itemDate = new Date(item.procurementYear, item.procurementMonth - 1, item.procurementDate);
                    return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
                } catch (e) {
                    return false;
                }
            });
        }
        return filteredData;
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        const dataToExport = getFilteredData();
        const fileName = `laporan_inventaris_${reportType}_${new Date().toISOString().split('T')[0]}`;
        
        if (dataToExport.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Tidak Ada Data',
                description: 'Tidak ada data yang ditemukan untuk kriteria laporan yang Anda pilih.',
            });
            setIsDownloading(false);
            return;
        }

        try {
            if (fileFormat === 'csv') {
                const headers = Object.keys(dataToExport[0]) as (keyof InventoryItem)[];
                const csvContent = [
                    headers.join(','),
                    ...dataToExport.map(item =>
                        headers.map(header => `"${String(item[header] ?? '').replace(/"/g, '""')}"`).join(',')
                    )
                ].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                triggerBrowserDownload(blob, `${fileName}.csv`);
            } else if (fileFormat === 'xlsx') {
                const XLSX = await import('xlsx');
                const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaris');
                XLSX.writeFile(workbook, `${fileName}.xlsx`);
            } else if (fileFormat === 'pdf') {
                const { default: jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');
                const doc = new jsPDF();
                
                const tableHeaders = Object.keys(dataToExport[0]);
                const tableBody = dataToExport.map(item => Object.values(item).map(val => String(val ?? '')));

                autoTable(doc, {
                    head: [tableHeaders],
                    body: tableBody,
                    didDrawPage: (data) => {
                         doc.setFontSize(18);
                         doc.text('Laporan Inventaris', data.settings.margin.left, 15);
                    }
                });

                doc.save(`${fileName}.pdf`);
            }
             toast({
                title: 'Unduhan Dimulai',
                description: `File ${fileName}.${fileFormat} sedang diunduh.`,
            });
        } catch (error) {
             console.error("Download error:", error);
             toast({
                variant: "destructive",
                title: "Gagal Mengunduh",
                description: "Terjadi kesalahan saat membuat file laporan.",
             });
        } finally {
            setIsDownloading(false);
        }
    };
    
    const triggerBrowserDownload = (blob: Blob, fileName: string) => {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

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
                                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Rentang Tanggal Pengadaan</label>
                     <p className="text-xs text-muted-foreground">
                        Pilih rentang tanggal untuk memfilter laporan berdasarkan tanggal pengadaan. Hanya efektif untuk jenis "Laporan Pengadaan".
                    </p>
                    <DatePickerWithRange onDateChange={setDateRange} />
                </div>
                 <Button className="w-full md:w-auto" onClick={handleDownload} disabled={isDownloading}>
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? 'Membuat Laporan...' : 'Unduh Laporan'}
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
