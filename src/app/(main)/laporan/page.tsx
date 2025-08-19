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
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type ReportType = 'all' | 'active' | 'disposed' | 'procurement';
type FileFormat = 'csv' | 'xlsx' | 'pdf';

// Mapping untuk header kolom ke Bahasa Indonesia
const headerMapping: { [key in keyof Required<InventoryItem>]: string } = {
    noData: "No. Data",
    itemType: "Jenis Barang",
    mainItemNumber: "Induk No. Barang",
    mainItemLetter: "Induk Huruf Barang",
    subItemType: "Sub Jenis Barang",
    brand: "Merk/Tipe",
    subItemTypeCode: "Sub Kode Jenis",
    subItemOrder: "Urut Sub Barang",
    fundingSource: "Sumber Dana",
    fundingItemOrder: "Urut Barang Dana",
    area: "Area/Ruang",
    subArea: "Sub-Area/Ruang",
    procurementDate: "Tgl Pengadaan",
    procurementMonth: "Bln Pengadaan",
    procurementYear: "Thn Pengadaan",
    supplier: "Supplier",
    estimatedPrice: "Harga (Rp)",
    procurementStatus: "Status Pengadaan",
    disposalStatus: "Status Barang",
    disposalDate: "Tgl Hapus",
    disposalMonth: "Bln Hapus",
    disposalYear: "Thn Hapus",
    itemVerificationCode: "Kode Verifikasi Barang",
    fundingVerificationCode: "Kode Verifikasi Dana",
    totalRekapCode: "Kode Rekap Total",
    disposalRekapCode: "Kode Rekap Hapus",
    combinedFundingRekapCode: "Kode Rekap Dana"
};


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

        if (reportType === 'procurement' && dateRange?.from && dateRange?.to) {
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
    
    const getReportTitle = () => {
        switch(reportType) {
            case 'all': return 'Laporan Seluruh Inventaris';
            case 'active': return 'Laporan Barang Aktif';
            case 'disposed': return 'Laporan Barang Dihapus';
            case 'procurement': return 'Laporan Pengadaan Barang';
            default: return 'Laporan Inventaris';
        }
    }
    
    const transformDataForExport = (data: InventoryItem[]) => {
        // Tentukan header yang akan diekspor (semua kecuali yang opsional & kosong)
        const headers = (Object.keys(headerMapping) as (keyof InventoryItem)[]).filter(key => {
            if (reportType !== 'disposed' && key.startsWith('disposal')) {
                if (key !== 'disposalStatus') return false;
            }
            // Optional: Exclude certain complex codes if not needed
            // if (key.toLowerCase().includes('code')) return false;
            return true;
        });

        const translatedHeaders = headers.map(key => headerMapping[key]);
        const body = data.map(item => {
            return headers.map(header => {
                const value = item[header];
                 if (header === 'estimatedPrice') {
                    return new Intl.NumberFormat('id-ID').format(Number(value) || 0);
                }
                return value ?? ''; // Berikan string kosong jika nilainya null atau undefined
            });
        });

        return { translatedHeaders, body };
    };


    const handleDownload = async () => {
        setIsDownloading(true);
        const dataToExport = getFilteredData();
        const reportTitle = getReportTitle();
        const fileName = `${reportTitle.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}`;
        
        if (dataToExport.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Tidak Ada Data',
                description: 'Tidak ada data yang ditemukan untuk kriteria laporan yang Anda pilih.',
            });
            setIsDownloading(false);
            return;
        }

        const { translatedHeaders, body: mappedBody } = transformDataForExport(dataToExport);

        try {
            if (fileFormat === 'csv' || fileFormat === 'xlsx') {
                 const dataWithIndonesianHeaders = dataToExport.map(item => {
                    let newObj: Record<string, any> = {};
                    (Object.keys(item) as (keyof InventoryItem)[]).forEach(key => {
                        const newKey = headerMapping[key] || key;
                        newObj[newKey] = item[key];
                    });
                    return newObj;
                });

                if (fileFormat === 'csv') {
                    const XLSX = await import('xlsx');
                    const worksheet = XLSX.utils.json_to_sheet(dataWithIndonesianHeaders);
                    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
                    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
                    triggerBrowserDownload(blob, `${fileName}.csv`);
                } else { // xlsx
                    const XLSX = await import('xlsx');
                    const worksheet = XLSX.utils.json_to_sheet(dataWithIndonesianHeaders);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaris');
                    XLSX.writeFile(workbook, `${fileName}.xlsx`);
                }
            } else if (fileFormat === 'pdf') {
                const { default: jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');
                const doc = new jsPDF({ orientation: 'landscape' });
                
                const reportDate = format(new Date(), "d MMMM yyyy", { locale: id });
                let subTitle = `Per Tanggal: ${reportDate}`;
                if (reportType === 'procurement' && dateRange?.from && dateRange?.to) {
                     subTitle = `Periode: ${format(dateRange.from, "d MMM yyyy", { locale: id })} - ${format(dateRange.to, "d MMM yyyy", { locale: id })}`;
                }

                autoTable(doc, {
                    head: [translatedHeaders],
                    body: mappedBody,
                    startY: 28,
                    theme: 'grid',
                    headStyles: { fillColor: [52, 124, 51], textColor: 255 },
                    styles: { fontSize: 8 },
                    didDrawPage: (data) => {
                         // Header
                         doc.setFontSize(16);
                         doc.setFont('helvetica', 'bold');
                         doc.text(reportTitle, data.settings.margin.left, 15);
                         doc.setFontSize(10);
                         doc.setFont('helvetica', 'normal');
                         doc.text(subTitle, data.settings.margin.left, 22);

                         // Footer
                         const pageCount = doc.getNumberOfPages();
                         doc.setFontSize(8);
                         doc.text(
                            `Halaman ${data.pageNumber} dari ${pageCount}`,
                            data.settings.margin.left,
                            doc.internal.pageSize.height - 10
                         );
                         doc.text(
                            `Dicetak pada: ${reportDate}`,
                            doc.internal.pageSize.width - data.settings.margin.right,
                            doc.internal.pageSize.height - 10,
                            { align: 'right' }
                         );
                    }
                });

                doc.save(`${fileName}.pdf`);
            }
             toast({
                title: 'Unduhan Dimulai',
                description: `File ${fileName}.${fileFormat} sedang dibuat.`,
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
