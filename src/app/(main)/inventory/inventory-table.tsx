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
import { PlusCircle, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InventoryForm } from './inventory-form';
import { InventoryDetail } from './inventory-detail';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteInventoryItems } from '@/lib/inventoryService';
import { useToast } from '@/hooks/use-toast';

interface InventoryTableProps {
  data: InventoryItem[];
  refreshData: () => void;
}

export function InventoryTable({ data, refreshData }: InventoryTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = React.useState(false);
  const [itemsToDelete, setItemsToDelete] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);


  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };
  
  const handleDeleteRequest = (itemIds: string[]) => {
      setItemsToDelete(itemIds);
      setIsConfirmDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
      setIsDeleting(true);
      try {
          await deleteInventoryItems(itemsToDelete);
          toast({
              title: "Sukses!",
              description: `${itemsToDelete.length} data berhasil dihapus.`
          });
          table.resetRowSelection(); // Deselect all rows after deletion
      } catch (error) {
          console.error("Failed to delete items:", error);
          toast({
              variant: "destructive",
              title: "Gagal!",
              description: "Terjadi kesalahan saat menghapus data."
          });
      } finally {
          setIsDeleting(false);
          setItemsToDelete([]);
          setIsConfirmDeleteDialogOpen(false);
      }
  };

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
      userRole: user?.role,
      viewDetails: handleViewDetails,
      deleteItems: handleDeleteRequest,
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
        {table.getFilteredSelectedRowModel().rows.length > 0 && user?.role === 'admin' && (
             <Button 
                variant="destructive" 
                className="ml-auto"
                onClick={() => {
                    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.noData);
                    handleDeleteRequest(selectedIds);
                }}
             >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className={cn(table.getFilteredSelectedRowModel().rows.length > 0 ? 'ml-2' : 'ml-auto')}>
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
       <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Barang Inventaris</DialogTitle>
          </DialogHeader>
          {selectedItem && <InventoryDetail item={selectedItem} />}
        </DialogContent>
      </Dialog>
      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Tindakan ini akan menghapus {itemsToDelete.length} data barang secara permanen. Data yang sudah dihapus tidak dapat dikembalikan.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsConfirmDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                      {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}