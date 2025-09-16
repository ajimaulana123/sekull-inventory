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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteInventoryItems, saveInventoryItemsBatch } from '@/lib/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { inventoryItemSchema, headerMapping, headerOrder } from '@/types';


interface InventoryTableProps {
  data: InventoryItem[];
  refreshData: () => void;
}

const parseFlexibleDate = (value: any): Date | null => {
    if (!value || value === '-') return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

    if (typeof value === 'number' && value > 0) { // Excel date serial number
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const jsDate = new Date(excelEpoch.getTime() + value * 86400000);
        return isNaN(jsDate.getTime()) ? null : jsDate;
    }

    if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) return date;
    }

    return null;
};


export function InventoryTable({ data, refreshData }: InventoryTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = React.useState(false);
  const [itemsToDelete, setItemsToDelete] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };
  
  const handleAddNewItem = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (itemIds: string[]) => {
      if (!itemIds || itemIds.length === 0) return;
      setItemsToDelete(itemIds.filter(id => id));
      setIsConfirmDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
      setIsDeleting(true);
      try {
          if (itemsToDelete.length > 0) {
              await deleteInventoryItems(itemsToDelete);
              toast({
                  title: "Sukses!",
                  description: `${itemsToDelete.length} data berhasil dihapus.`
              });
              table.resetRowSelection();
          }
      } catch (error) {
          console.error("Gagal menghapus data:", error);
          toast({
              variant: "destructive",
              title: "Gagal!",
              description: "Terjadi kesalahan saat menghapus data."
          });
      } finally {
          setIsDeleting(false);
          setItemsToDelete([]);
          setIsConfirmDeleteDialogOpen(false);
          refreshData();
      }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const processAndSaveExcelData = async (fileData: ArrayBuffer) => {
    let importedItemsCount = 0;
    const errorLogs: string[] = [];
    try {
        const data = new Uint8Array(fileData);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error("File Excel tidak memiliki sheet yang valid.");

        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as (string | number | null)[][];
        
        const fileHeaders = json[0] as string[];
        const fileDataRows = json.slice(1);

        if (fileDataRows.length === 0) {
            toast({ title: "File Kosong", description: "File Excel tidak berisi data." });
            return;
        }
        
        const itemsToSave: InventoryItem[] = [];

        for (const [index, row] of fileDataRows.entries()) {
            const rowIndex = index + 2;
            let mappedRow: Partial<InventoryItem> = {};

            headerOrder.forEach((key, colIndex) => {
                const rawValue = row[colIndex];
                let value: any = (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') ? '-' : rawValue;
                
                if (key === 'estimatedPrice') {
                    value = (value === '-') ? 0 : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
                    if (isNaN(value)) value = 0;
                } else if (key !== 'procurementDate' && key !== 'disposalDate') { // Handle all other fields as strings
                    value = String(value);
                }

                mappedRow[key as keyof InventoryItem] = value;
            });
            
            const noData = mappedRow.noData && mappedRow.noData !== '-' ? mappedRow.noData : `INV-${Date.now()}-${index}`;
            mappedRow.noData = noData;

            const sanitized = {
                ...mappedRow,
                procurementDate: parseFlexibleDate(mappedRow.procurementDate),
                disposalDate: parseFlexibleDate(mappedRow.disposalDate),
            }

            const parsed = inventoryItemSchema.safeParse(sanitized);

            if (parsed.success) {
                const { data: values } = parsed;
                itemsToSave.push({
                    ...values,
                    itemVerificationCode: `${values.mainItemLetter || ''}.${values.subItemTypeCode || ''}.${values.subItemOrder || ''}`.replace(/^\.+|\.+$/g, ''),
                    fundingVerificationCode: `${values.fundingSource || ''}.${values.fundingItemOrder || ''}.${values.mainItemLetter || ''}${values.subItemTypeCode || ''}`.replace(/^\.+|\.+$/g, ''),
                    totalRekapCode: `${values.mainItemLetter || ''}${values.subItemTypeCode || ''}`,
                    combinedFundingRekapCode: `${values.mainItemLetter || ''}${values.subItemTypeCode || ''}${values.fundingSource || ''}`,
                    disposalRekapCode: values.disposalStatus === 'dihapus' ? `${values.mainItemLetter || ''}${values.subItemTypeCode || ''}-HAPUS` : undefined,
                });
            } else {
                const flatErrors = parsed.error.flatten();
                const errorMessages = Object.entries(flatErrors.fieldErrors).map(([field, messages]) => `${field}: ${messages.join(', ')}`).join('; ');
                errorLogs.push(`Baris ${rowIndex}: Gagal validasi - ${errorMessages}`);
            }
        }

        if (itemsToSave.length > 0) {
            await saveInventoryItemsBatch(itemsToSave);
            importedItemsCount = itemsToSave.length;
        }

        if (errorLogs.length > 0) {
              console.error("Detail Kegagalan Impor:\n" + errorLogs.join('\n'));
               toast({
                variant: 'destructive',
                title: 'Beberapa Data Gagal Impor',
                description: `Lihat konsol browser (F12) untuk detail ${errorLogs.length} kegagalan.`,
                duration: 10000,
            });
        }
        
        toast({
            title: "Impor Selesai",
            description: `${importedItemsCount} dari ${fileDataRows.length} data berhasil diimpor.`,
        });

    } catch (error: any) {
        console.error("Gagal memproses file:", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Impor',
            description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
        });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'Gagal Membaca File',
            description: 'File mungkin rusak atau tidak dapat diakses.',
        });
        setIsImporting(false);
    };

    reader.onload = async (e) => {
        const fileData = e.target?.result;
        if (fileData instanceof ArrayBuffer) {
            await processAndSaveExcelData(fileData);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal membaca data file.' });
        }
        if(fileInputRef.current) fileInputRef.current.value = "";
        setIsImporting(false);
        refreshData();
    };
    
    reader.readAsArrayBuffer(file);
  };

  const columns = React.useMemo<ColumnDef<InventoryItem>[]>(
    () => columnDefs,
    []
  );

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
      deleteItems: handleDeleteRequest,
      editItem: handleEditItem,
    }
  });
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
    refreshData();
  };

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
                    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.noData).filter(id => id);
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
                    {(headerMapping as Record<string, string>)[column.id] || column.id}
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
                      <TableHead key={header.id} className={cn("whitespace-nowrap px-4 py-2", header.id === 'select' && user?.role !=='admin' && 'hidden')}>
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
                      <TableCell key={cell.id} className={cn("whitespace-nowrap px-4 py-2", cell.column.id === 'select' && user?.role !== 'admin' && 'hidden')}>
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
