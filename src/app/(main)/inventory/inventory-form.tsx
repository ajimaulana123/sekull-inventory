'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addInventoryItem } from '@/lib/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { inventoryItemSchema, type InventoryItem } from '@/types';
import { useState } from 'react';

interface InventoryFormProps {
  onSuccess: () => void;
  initialData?: InventoryItem;
}

// We only need a subset of fields for the form
const formSchema = inventoryItemSchema.pick({
    noData: true,
    itemType: true,
    brand: true,
    area: true,
    procurementYear: true,
    estimatedPrice: true,
    procurementStatus: true,
    disposalStatus: true,
});

type InventoryFormValues = z.infer<typeof formSchema>;


export function InventoryForm({ onSuccess, initialData }: InventoryFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      noData: '',
      itemType: '',
      brand: '',
      area: '',
      procurementYear: new Date().getFullYear(),
      estimatedPrice: 0,
      procurementStatus: 'baru',
      disposalStatus: 'aktif',
    },
  });

  async function onSubmit(values: InventoryFormValues) {
    setIsLoading(true);
    try {
      // Create a complete InventoryItem object before sending to service
      const fullItem: InventoryItem = {
          ...values,
          // Generate other required fields with default/dummy values
          mainItemNumber: '100', // Example
          mainItemLetter: 'A', // Example
          subItemType: `${values.itemType} SUB`, // Example
          subItemTypeCode: 'S1', // Example
          subItemOrder: '1', // Example
          fundingSource: 'BOS', // Example
          fundingItemOrder: 'DANA-1', // Example
          subArea: 'Sub ' + values.area, // Example
          procurementDate: 1, // Example
          procurementMonth: 1, // Example
          supplier: 'Supplier X', // Example
          itemVerificationCode: `V-BRG-${values.noData}`,
          fundingVerificationCode: `V-DANA-${values.noData}`,
          totalRekapCode: `REKAP-TOTAL-${values.procurementYear}`,
          combinedFundingRekapCode: `${values.itemType}-S1-BOS`,
      };
      
      await addInventoryItem(fullItem);
      
      toast({
        title: 'Sukses!',
        description: 'Data inventaris berhasil ditambahkan.',
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal!',
        description: 'Gagal menambahkan data. Silakan coba lagi.',
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="noData"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nomor Data</FormLabel>
                <FormControl>
                    <Input placeholder="INV-00XX" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="itemType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Jenis Barang</FormLabel>
                <FormControl>
                    <Input placeholder="Contoh: Meja, Kursi" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Merk/Tipe</FormLabel>
                <FormControl>
                    <Input placeholder="Contoh: Olympic" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Area/Ruang</FormLabel>
                <FormControl>
                    <Input placeholder="Contoh: Kelas A, Perpustakaan" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="procurementYear"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Tahun Pengadaan</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="YYYY" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="estimatedPrice"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Harga Perkiraan (Rp)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="500000" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="procurementStatus"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status Pengadaan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="baru">Baru</SelectItem>
                        <SelectItem value="second">Second</SelectItem>
                        <SelectItem value="bekas">Bekas</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="disposalStatus"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status Barang</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="dihapus">Dihapus</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Menyimpan..." : "Simpan Data"}
        </Button>
      </form>
    </Form>
  );
}
