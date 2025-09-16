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
export const headerMapping: { [key in keyof Partial<InventoryItem>]?: string } = {
    noData: "No. Data",
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
    jumlah: "Jumlah",
    satuan: "Satuan",
    kondisi: "Kondisi",
    keterangan: "Keterangan"
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
            filteredData = filteredData.filter(item => item.statusBarang === 'aktif');
        } else if (reportType === 'disposed') {
            filteredData = filteredData.filter(item => item.statusBarang === 'dihapus');
        }

        if (reportType === 'procurement' && dateRange?.from && dateRange?.to) {
            filteredData = filteredData.filter(item => {
                if (!item.tanggalPengadaan) return false;
                try {
                    const itemDate = new Date(item.tanggalPengadaan);
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
        
        const dataWithIndonesianHeaders = data.map(item => {
            let newObj: Record<string, any> = {};
            (Object.keys(headerMapping) as (keyof InventoryItem)[]).forEach(key => {
                 const newKey = headerMapping[key as keyof typeof headerMapping] || key;
                 const value = item[key as keyof InventoryItem];

                 if (value instanceof Date) {
                     newObj[newKey] = format(value, 'yyyy-MM-dd');
                 } else if (value !== undefined && value !== null) {
                     newObj[newKey] = value;
                 }
            });
            return newObj;
        });


        return { dataWithIndonesianHeaders };
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

        

        try {
            if (fileFormat === 'csv' || fileFormat === 'xlsx') {
                const { dataWithIndonesianHeaders } = transformDataForExport(dataToExport);
                const XLSX = await import('xlsx');
                const worksheet = XLSX.utils.json_to_sheet(dataWithIndonesianHeaders);
                
                if (fileFormat === 'csv') {
                    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
                    const blob = new Blob(["\uFEFF" + csvOutput], { type: 'text/csv;charset=utf-8;' });
                    triggerBrowserDownload(blob, `${fileName}.csv`);
                } else { // xlsx
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaris');
                    XLSX.writeFile(workbook, `${fileName}.xlsx`);
                }
            } else if (fileFormat === 'pdf') {
                const { default: jsPDF } = await import('jspdf');
                const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                
                const reportDate = format(new Date(), "d MMMM yyyy", { locale: id });
                let subTitle = `Per Tanggal: ${reportDate}`;
                if (reportType === 'procurement' && dateRange?.from && dateRange?.to) {
                     subTitle = `Periode: ${format(dateRange.from, "d MMMM yyyy", { locale: id })} - ${format(dateRange.to, "d MMMM yyyy", { locale: id })}`;
                }

                const pageMargin = 15;
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const contentWidth = pageWidth - (pageMargin * 2);
                let yPos = pageMargin;
                let pageNumber = 1;

                const addHeaderFooter = () => {
                    if (pageNumber > 1) doc.addPage();
                    yPos = pageMargin;

                    // Header
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(16);
                    doc.text(reportTitle, pageWidth / 2, yPos, { align: 'center' });
                    yPos += 7;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.text(subTitle, pageWidth / 2, yPos, { align: 'center' });
                    yPos += 10;
                    doc.setDrawColor(180, 180, 180);
                    doc.line(pageMargin, yPos, pageWidth - pageMargin, yPos);
                    yPos += 10;

                    // Footer
                    const footerY = pageHeight - 10;
                    doc.setFontSize(8);
                    doc.text(`Halaman ${pageNumber}`, pageWidth - pageMargin, footerY, { align: 'right' });
                    doc.text(`Dicetak pada: ${reportDate}`, pageMargin, footerY, { align: 'left' });
                };

                addHeaderFooter();

                dataToExport.forEach((item, index) => {
                    const itemStartY = yPos;
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`BARANG #${index + 1}: ${item.jenisBarang} - ${item.merkTipe}`, pageMargin, yPos);
                    yPos += 6;

                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    
                    const itemDetails = Object.entries(item)
                        .map(([key, value]) => {
                            const label = headerMapping[key as keyof typeof headerMapping];
                            if (label && value !== undefined && value !== null && value !== '') {
                                let displayValue: string | number;
                                if (value instanceof Date) {
                                    displayValue = format(value, 'PPP', { locale: id });
                                } else if (key === 'harga') {
                                    displayValue = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value));
                                } else {
                                    displayValue = value as string | number;
                                }
                                return { label, value: displayValue };
                            }
                            return null;
                        })
                        .filter(Boolean);
                    
                    itemDetails.forEach(detail => {
                        if (yPos > pageHeight - 20) {
                           pageNumber++;
                           addHeaderFooter();
                        }
                        doc.text(`${detail!.label}:`, pageMargin + 5, yPos);
                        doc.text(`${detail!.value}`, pageMargin + 55, yPos, { maxWidth: contentWidth - 55 });
                        const textDimensions = doc.getTextDimensions(`${detail!.value}`, { maxWidth: contentWidth - 55, fontSize: 9 });
                        yPos += textDimensions.h + 2; // Adjust spacing based on text height
                    });
                    
                    yPos += 5; 
                    doc.setLineDashPattern([1, 1], 0);
                    doc.line(pageMargin, yPos, contentWidth + pageMargin, yPos);
                    doc.setLineDashPattern([], 0);
                    yPos += 7;

                    if (yPos > pageHeight - 20 && index < dataToExport.length - 1) {
                        pageNumber++;
                        addHeaderFooter();
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
                <CardDescription>Pilih kriteria untuk laporan yang ingin Anda buat. Ditemukan {getFilteredData().length} data barang yang cocok.</CardDescription>
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
                    <DatePickerWithRange onDateChange={setDateRange} disabled={reportType !== 'procurement'} />
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
