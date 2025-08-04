'use client';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LaporanPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.replace('/inventory');
        }
    }, [user, router]);

    if (!user || user.role !== 'admin') {
        return (
            <div className="flex h-full items-center justify-center">
                <p>Access denied. Redirecting...</p>
            </div>
        );
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
                <CardDescription>Pilih kriteria untuk laporan yang ingin Anda buat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Jenis Laporan</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis laporan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Laporan Seluruh Inventaris</SelectItem>
                                <SelectItem value="active">Laporan Barang Aktif</SelectItem>
                                <SelectItem value="disposed">Laporan Barang Dihapus</SelectItem>
                                <SelectItem value="procurement">Laporan Pengadaan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Format File</label>
                        <Select defaultValue="xlsx">
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih format file" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                                <SelectItem value="csv">CSV (.csv)</SelectItem>
                                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Rentang Tanggal Pengadaan</label>
                    <DatePickerWithRange />
                </div>
                 <Button className="w-full md:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Laporan
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
