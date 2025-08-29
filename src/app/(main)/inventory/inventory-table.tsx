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
import * as XLSX from 'xlsx';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InventoryItem } from '@/types';
import { useAuth } from '@/components/auth-provider';
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { columns as columnDefs } from './columns';
import { PlusCircle, SlidersHorizontal, Trash2, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InventoryForm } from './inventory-form';
import { InventoryDetail } from './inventory-detail';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteInventoryItems, saveInventoryItemsBatch } from '@/lib/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { inventoryItemSchema } from '@/types';
import { headerMapping } from '../laporan/page';


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
  const [isImporting, setIsImporting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };
  
  const handleAddNewItem = () => {
    setSelectedItem(null); // Clear selected item for new entry
    setIsFormOpen(true);
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { defval: "", cellDates: true });

            const reverseHeaderMapping = Object.fromEntries(
                Object.entries(headerMapping).map(([key, value]) => [value, key])
            );
            
            const importedItems: InventoryItem[] = [];
            let failedCount = 0;
            const errorLogs: string[] = [];


            for (const [index, row] of json.entries()) {
                const mappedRow: { [key: string]: any } = {};
                for (const key in row) {
                    const mappedKey = reverseHeaderMapping[key];
                    if (mappedKey) {
                        const value = row[key as keyof typeof row];
                        // Trim strings to remove leading/trailing whitespace
                        mappedRow[mappedKey] = typeof value === 'string' ? value.trim() : value;
                    }
                }
                
                const parsed = inventoryItemSchema.safeParse(mappedRow);
                
                if (parsed.success) {
                    const values = parsed.data;
                    const fullItem: InventoryItem = {
                        ...values,
                        itemVerificationCode: `${values.mainItemLetter}.${values.subItemTypeCode}.${values.subItemOrder}`,
                        fundingVerificationCode: `${values.fundingSource}.${values.fundingItemOrder}.${values.mainItemLetter}${values.subItemTypeCode}`,
                        totalRekapCode: `${values.mainItemLetter}${values.subItemTypeCode}`,
                        combinedFundingRekapCode: `${values.mainItemLetter}${values.subItemTypeCode}${values.fundingSource}`,
                        disposalRekapCode: values.disposalStatus === 'dihapus' ? `${values.mainItemLetter}${values.subItemTypeCode}-HAPUS` : undefined,
                    };
                    importedItems.push(fullItem);
                } else {
                    failedCount++;
                    const formattedErrors = Object.entries(parsed.error.flatten().fieldErrors)
                        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                        .join('; ');
                    errorLogs.push(`Baris ${index + 2}: Gagal validasi - ${formattedErrors}`);
                    console.warn(`Invalid row at Excel index ${index + 2}:`, parsed.error.format());
                }
            }
            
            if (importedItems.length > 0) {
              await saveInventoryItemsBatch(importedItems);
            }

            toast({
                title: "Impor Selesai",
                description: `${importedItems.length} data berhasil diimpor. ${failedCount} data gagal/dilewati.`,
            });

            if (errorLogs.length > 0) {
              console.error("Detail Kegagalan Impor:\n" + errorLogs.join('\n'));
               toast({
                variant: 'destructive',
                title: 'Beberapa Data Gagal Impor',
                description: 'Silakan periksa konsol browser (F12) untuk melihat detail error.',
                duration: 10000,
              });
            }
            
        } catch (error) {
            console.error("Failed to import file:", error);
            toast({
                variant: 'destructive',
                title: 'Gagal Impor',
                description: 'Terjadi kesalahan saat memproses file Excel.',
            });
        } finally {
            setIsImporting(false);
            // Reset file input
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    reader.readAsArrayBuffer(file);
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
      editItem: handleEditItem,
    }
  });
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
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
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              className="hidden"
              accept=".xlsx, .xls, .csv"
            />
            <Button onClick={handleImportClick} variant="outline" disabled={isImporting}>
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? 'Mengimpor...' : 'Impor Data'}
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNewItem}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedItem ? 'Ubah Data Inventaris' : 'Tambah Data Inventaris Baru'}</DialogTitle>
                </DialogHeader>
                <InventoryForm onSuccess={handleFormSuccess} initialData={selectedItem} />
              </DialogContent>
            </Dialog>
          </div>
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

    