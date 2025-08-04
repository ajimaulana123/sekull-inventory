'use client';
import { useAuth } from '@/components/auth-provider';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DollarSign, Package, PackageCheck, PackageX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { InventoryItem } from '@/types';
import { getInventoryData } from '@/lib/inventoryService';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/inventory');
    } else if (user) {
       const fetchData = async () => {
        try {
          const data = await getInventoryData();
          setInventoryData(data);
        } catch (error) {
          console.error("Error fetching inventory data for dashboard:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, router]);
  
  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading or access denied. Redirecting...</p>
      </div>
    );
  }

  const totalItems = inventoryData.length;
  const activeItems = inventoryData.filter(item => item.disposalStatus === 'aktif').length;
  const disposedItems = totalItems - activeItems;
  const totalValue = inventoryData.reduce((sum, item) => sum + item.estimatedPrice, 0);

  const dataByYear = inventoryData.reduce((acc, item) => {
    const year = item.procurementYear;
    if (!acc[year]) {
      acc[year] = { year, total: 0 };
    }
    acc[year].total++;
    return acc;
  }, {} as Record<string, { year: number; total: number }>);
  
  const chartData = Object.values(dataByYear).sort((a,b) => a.year - b.year);


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">Selamat datang, {user.name}. Berikut ringkasan data inventaris.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai Inventaris</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Estimasi total nilai dari semua barang</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Jumlah semua barang yang terdata</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barang Aktif</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeItems}</div>
            <p className="text-xs text-muted-foreground">Barang dengan status 'aktif'</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barang Dihapus</CardTitle>
            <PackageX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disposedItems}</div>
            <p className="text-xs text-muted-foreground">Barang dengan status 'dihapus'</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Pengadaan Barang per Tahun</CardTitle>
          <CardDescription>Jumlah barang yang diadakan setiap tahunnya.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                    <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
