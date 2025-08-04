'use client';

import type { ColumnDef, CellContext } from '@tanstack/react-table';
import type { InventoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const ActionsCell = ({ row, table }: CellContext<InventoryItem, unknown>) => {
  const item = row.original;
  const userRole = table.options.meta?.userRole;

  if (!userRole) {
    return null;
  }

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
        {userRole === 'admin' ? (
          <>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item.noData)}
            >
              Salin Nomor Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
            <DropdownMenuItem>Ubah Data</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">Hapus Data</DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
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
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      )
    },
    cell: ({ row, table }) => {
       const userRole = table.options.meta?.userRole;
       if (userRole !== 'admin') return null;
       return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'itemType',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Jenis Barang
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue('itemType')}</div>,
  },
  {
    accessorKey: 'brand',
    header: 'Merk',
    cell: ({ row }) => <div>{row.getValue('brand')}</div>,
  },
  {
    accessorKey: 'area',
    header: 'Area/Ruang',
    cell: ({ row }) => <div>{row.getValue('area')}</div>,
  },
  {
    accessorKey: 'procurementYear',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tahun Pengadaan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.getValue('procurementYear')}</div>,
  },
  {
    accessorKey: 'disposalStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('disposalStatus') as string;
      return <Badge variant={status === 'aktif' ? 'default' : 'destructive'} className="capitalize bg-primary/20 text-primary-foreground hover:bg-primary/30">{status}</Badge>;
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ActionsCell,
  },
];
