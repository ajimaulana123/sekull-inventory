'use client';

import type { ColumnDef, CellContext } from '@tanstack/react-table';
import type { InventoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ActionsCell = ({ row, table }: CellContext<InventoryItem, unknown>) => {
  const item = row.original;
  const userRole = table.options.meta?.userRole;
  const { toast } = useToast();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const deleteItems = table.options.meta?.deleteItems;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const editItem = table.options.meta?.editItem;


  if (!userRole) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.noData!);
      toast({
        title: 'Berhasil!',
        description: 'Nomor data berhasil disalin ke clipboard.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Gagal!',
        description: 'Tidak dapat menyalin nomor data.',
      });
    }
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCopy}>
          Salin Nomor Data
        </DropdownMenuItem>
        {userRole === 'admin' && (
          <>
            <DropdownMenuItem onClick={() => editItem(item)}>Ubah Data</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => deleteItems([item.noData!])}
            >
              Hapus Data
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<InventoryItem>[] = [
  {
    id: 'select',
    header: ({ table }) => {
      const userRole = table.options.meta?.userRole;
      if (userRole !== 'admin') return null;
      return (
        <div className="px-4 py-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      )
    },
    cell: ({ row, table }) => {
       const userRole = table.options.meta?.userRole;
       if (userRole !== 'admin') return null;
       return (
        <div className="px-4 py-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: 'noData', header: 'No. Data' },
  { accessorKey: 'jenisBarang', header: 'Jenis Barang' },
  { accessorKey: 'indukNoBarang', header: 'Induk No. Barang' },
  { accessorKey: 'indukHurufBarang', header: 'Induk Huruf Barang' },
  { accessorKey: 'subJenisBarang', header: 'Sub Jenis Barang' },
  { accessorKey: 'merkTipe', header: 'Merk/Tipe' },
  { accessorKey: 'subKodeJenis', header: 'Sub Kode Jenis' },
  { accessorKey: 'urutSubBarang', header: 'Urut Sub Barang' },
  { accessorKey: 'sumberDana', header: 'Sumber Dana' },
  { accessorKey: 'urutBarangDana', header: 'Urut Barang Dana' },
  { accessorKey: 'areaRuang', header: 'Area/Ruang' },
  { accessorKey: 'subAreaRuang', header: 'Sub-Area/Ruang' },
  { 
    accessorKey: 'tanggalPengadaan', 
    header: 'Tanggal Pengadaan',
    cell: ({ row }) => {
        const dateValue = row.getValue('tanggalPengadaan');
        if (!dateValue) return <div className="px-4 py-2">-</div>;
        try {
            const date = new Date(dateValue as string | number | Date);
            if (isNaN(date.getTime())) return <div className="px-4 py-2">-</div>;
            return <div className="px-4 py-2">{format(date, 'yyyy-MM-dd')}</div>;
        } catch (e) {
            return <div className="px-4 py-2">-</div>;
        }
    }, 
  },
  { accessorKey: 'supplier', header: 'Supplier' },
  { 
    accessorKey: 'harga', 
    header: 'Harga (Rp)',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('harga'))
      if (isNaN(amount)) return <div className="px-4 py-2">-</div>;
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount)
      return <div className="font-medium px-4 py-2">{formatted}</div>
    },
  },
  { accessorKey: 'statusPengadaan', header: 'Status Pengadaan' },
  { accessorKey: 'statusBarang', header: 'Status Barang' },
  { 
    accessorKey: 'tanggalHapus', 
    header: 'Tanggal Hapus',
    cell: ({ row }) => {
        const dateValue = row.getValue('tanggalHapus');
        if (!dateValue) return <div className="px-4 py-2">-</div>;
        try {
            const date = new Date(dateValue as string | number | Date);
            if (isNaN(date.getTime())) return <div className="px-4 py-2">-</div>;
            return <div className="px-4 py-2">{format(date, 'yyyy-MM-dd')}</div>;
        } catch (e) {
            return <div className="px-4 py-2">-</div>;
        }
    },
  },
  { accessorKey: 'kodeVerifikasiBarang', header: 'Kode Verifikasi Barang' },
  { accessorKey: 'kodeVerifikasiDana', header: 'Kode Verifikasi Dana' },
  { accessorKey: 'kodeRekapTotal', header: 'Kode Rekap Total' },
  { accessorKey: 'kodeRekapHapus', header: 'Kode Rekap Hapus' },
  { accessorKey: 'kodeRekapDana', header: 'Kode Rekap Dana' },
  // Kolom Tambahan
  {
    accessorKey: 'jumlah',
    header: 'Jumlah',
  },
  {
    accessorKey: 'satuan',
    header: 'Satuan',
  },
  {
    accessorKey: 'kondisi',
    header: 'Kondisi',
    cell: ({ row }) => {
        const kondisi = row.getValue('kondisi') as string;
        let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
        if (kondisi === 'Baik') badgeVariant = 'default';
        if (kondisi === 'Rusak Berat') badgeVariant = 'destructive';
        
        return <div className="px-4 py-2"><Badge variant={badgeVariant} className="capitalize">{kondisi || '-'}</Badge></div>;
    }
  },
  {
    accessorKey: 'keterangan',
    header: 'Keterangan',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ActionsCell,
  },
];
    
