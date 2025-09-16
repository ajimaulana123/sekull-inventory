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
  {
    accessorKey: 'jenisBarang',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="px-4 py-2"
        >
          Jenis Barang
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize px-4 py-2">{row.getValue('jenisBarang')}</div>,
  },
  {
    accessorKey: 'merkTipe',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Merk/Tipe
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('merkTipe')}</div>,
  },
   {
    accessorKey: 'jumlah',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Jumlah
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('jumlah')}</div>,
  },
  {
    accessorKey: 'satuan',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Satuan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('satuan')}</div>,
  },
  {
    accessorKey: 'tanggalPengadaan',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="px-4 py-2"
        >
          Tahun Pengadaan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const date = row.getValue('tanggalPengadaan') as Date;
        if (!date) return '-';
        return <div className="px-4 py-2">{format(date, 'yyyy')}</div>;
    },
    sortingFn: 'datetime'
  },
  {
    accessorKey: 'harga',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Harga (Rp)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('harga'))
      if (isNaN(amount)) return '-';
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(amount)
      return <div className="px-4 py-2">{formatted}</div>
    },
  },
  {
    accessorKey: 'areaRuang',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Area/Ruang
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('areaRuang')}</div>,
  },
   {
    accessorKey: 'kondisi',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Kondisi
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
        const kondisi = row.getValue('kondisi') as string;
        let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
        if (kondisi === 'Baik') badgeVariant = 'default';
        if (kondisi === 'Rusak Berat') badgeVariant = 'destructive';
        
        return <div className="px-4 py-2"><Badge variant={badgeVariant} className="capitalize">{kondisi}</Badge></div>;
    }
  },
  {
    accessorKey: 'keterangan',
    header: 'Keterangan',
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('keterangan')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ActionsCell,
  },
];
    