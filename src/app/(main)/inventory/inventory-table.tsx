'use client';
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InventoryItem } from '@/types';
import { useAuth } from '@/components/auth-provider';
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { columns as columnDefs } from './columns';
import { PlusCircle, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InventoryForm } from './inventory-form';

interface InventoryTableProps {
  data: InventoryItem[];
  refreshData: () => void;
}

export function InventoryTable({ data, refreshData }: InventoryTableProps) {
  const { user } = useAuth();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const columns = React.useMemo<ColumnDef<InventoryItem>[]>(
    () => columnDefs.filter(c => user?.role === 'admin' || c.id !== 'select'),
    [user?.role]
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      userRole: user?.role
    }
  });
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refreshData();
  }


  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Cari berdasarkan jenis barang..."
          value={(table.getColumn('itemType')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('itemType')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Tampilkan Kolom
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === 'itemType' ? 'Jenis Barang' : 
                     column.id === 'brand' ? 'Merk' : 
                     column.id === 'area' ? 'Area/Ruang' : 
                     column.id === 'procurementYear' ? 'Tahun Pengadaan' : 
                     column.id === 'disposalStatus' ? 'Status' : 
                     column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        {user?.role === 'admin' && (
           <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Data Inventaris Baru</DialogTitle>
              </DialogHeader>
              <InventoryForm onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Card className="flex-1">
        <CardContent className="p-0">
        <div className="relative overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className={cn(header.id === 'select' && user?.role !=='admin' && 'hidden')}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn(cell.column.id === 'select' && user?.role !== 'admin' && 'hidden')}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    Tidak ada hasil.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className={cn("flex-1 text-sm text-muted-foreground", user?.role !== 'admin' && 'invisible')}>
          {table.getFilteredSelectedRowModel().rows.length} dari{' '}
          {table.getFilteredRowModel().rows.length} baris terpilih.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
