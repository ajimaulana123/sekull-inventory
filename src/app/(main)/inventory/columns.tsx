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
      await navigator.clipboard.writeText(item.noData);
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
        {userRole === 'admin' && (
          <>
            <DropdownMenuItem onClick={handleCopy}>
              Salin Nomor Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editItem(item)}>Ubah Data</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => deleteItems([item.noData])}
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
    accessorKey: 'noData',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        No. Data
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('noData')}</div>,
  },
  {
    accessorKey: 'itemType',
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
    cell: ({ row }) => <div className="capitalize px-4 py-2">{row.getValue('itemType')}</div>,
  },
  {
    accessorKey: 'mainItemNumber',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Induk No. Barang
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('mainItemNumber')}</div>,
  },
  {
    accessorKey: 'mainItemLetter',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Induk Huruf Barang
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('mainItemLetter')}</div>,
  },
  {
    accessorKey: 'subItemType',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Sub Jenis Barang
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('subItemType')}</div>,
  },
  {
    accessorKey: 'brand',
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
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('brand')}</div>,
  },
  {
    accessorKey: 'subItemTypeCode',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Sub Kode Jenis
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('subItemTypeCode')}</div>,
  },
  {
    accessorKey: 'subItemOrder',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Urut Sub Barang
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('subItemOrder')}</div>,
  },
  {
    accessorKey: 'fundingSource',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Sumber Pendanaan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('fundingSource')}</div>,
  },
  {
    accessorKey: 'fundingItemOrder',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Urut Barang Pendanaan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('fundingItemOrder')}</div>,
  },
  {
    accessorKey: 'area',
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
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('area')}</div>,
  },
  {
    accessorKey: 'subArea',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Sub-Area/Ruang
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('subArea')}</div>,
  },
  {
    accessorKey: 'procurementDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="px-4 py-2"
        >
          Tanggal Pengadaan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const date = row.getValue('procurementDate') as Date;
        if (!date) return '-';
        return <div className="px-4 py-2">{format(date, 'PPP')}</div>;
    },
    sortingFn: 'datetime'
  },
  {
    accessorKey: 'supplier',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Supplier
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('supplier')}</div>,
  },
  {
    accessorKey: 'estimatedPrice',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Perkiraan Harga (Rp)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('estimatedPrice'))
      if (isNaN(amount)) return '-';
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
      }).format(amount)
      return <div className="px-4 py-2">{formatted}</div>
    },
  },
  {
    accessorKey: 'procurementStatus',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Status Pengadaan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('procurementStatus')}</div>,
  },
  {
    accessorKey: 'disposalStatus',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Status Barang
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue('disposalStatus') as string;
      return <div className="px-4 py-2"><Badge variant={status === 'aktif' ? 'default' : 'destructive'} className="capitalize">{status}</Badge></div>;
    }
  },
  {
    accessorKey: 'disposalDate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Tanggal Hapus
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('disposalDate') as Date;
      if (!date) return '-';
      return <div className="px-4 py-2">{format(date, 'PPP')}</div>;
    },
  },
  {
    accessorKey: 'itemVerificationCode',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Kode Verifikasi Barang
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('itemVerificationCode')}</div>,
  },
  {
    accessorKey: 'fundingVerificationCode',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Kode Verifikasi Dana
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('fundingVerificationCode')}</div>,
  },
  {
    accessorKey: 'totalRekapCode',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Kode Rekap Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('totalRekapCode')}</div>,
  },
  {
    accessorKey: 'disposalRekapCode',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Kode Rekap Hapus
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className className="px-4 py-2">{row.getValue('disposalRekapCode')}</div>,
  },
  {
    accessorKey: 'combinedFundingRekapCode',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="px-4 py-2"
      >
        Kode Rekap Dana
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="px-4 py-2">{row.getValue('combinedFundingRekapCode')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ActionsCell,
  },
];
