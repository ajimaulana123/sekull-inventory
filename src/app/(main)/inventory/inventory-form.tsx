'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveInventoryItem } from '@/lib/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { inventoryItemSchema, type InventoryItem } from '@/types';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';

interface InventoryFormProps {
  onSuccess: () => void;
  initialData?: InventoryItem | null;
}

const formSchema = inventoryItemSchema;
type InventoryFormValues = z.infer<typeof formSchema>;

export function InventoryForm({ onSuccess, initialData }: InventoryFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;
  
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      noData: '',
      itemType: '',
      mainItemNumber: '',
      mainItemLetter: '',
      subItemType: '',
      brand: '',
      subItemTypeCode: '',
      subItemOrder: '',
      fundingSource: '',
      fundingItemOrder: '',
      area: '',
      subArea: '',
      procurementDate: new Date().getDate(),
      procurementMonth: new Date().getMonth() + 1,
      procurementYear: new Date().getFullYear(),
      supplier: '',
      estimatedPrice: 0,
      procurementStatus: 'baru',
      disposalStatus: 'aktif',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  async function onSubmit(values: InventoryFormValues) {
    setIsLoading(true);
    try {
      const fullItem: InventoryItem = {
          ...values,
          // Generate verification and rekap codes
          itemVerificationCode: `${values.mainItemLetter}.${values.subItemTypeCode}.${values.subItemOrder}`,
          fundingVerificationCode: `${values.fundingSource}.${values.fundingItemOrder}.${values.mainItemLetter}${values.subItemTypeCode}`,
          totalRekapCode: `${values.mainItemLetter}${values.subItemTypeCode}`,
          combinedFundingRekapCode: `${values.mainItemLetter}${values.subItemTypeCode}${values.fundingSource}`,
          disposalRekapCode: values.disposalStatus === 'dihapus' ? `${values.mainItemLetter}${values.subItemTypeCode}-HAPUS` : undefined,
      };
      
      await saveInventoryItem(fullItem);
      
      toast({
        title: 'Sukses!',
        description: `Data inventaris berhasil ${isEditing ? 'diperbarui' : 'ditambahkan'}.`,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to save inventory item:', error);
      toast({
        variant: 'destructive',
        title: 'Gagal!',
        description: `Gagal menyimpan data. Silakan periksa kembali isian Anda.`,
      });
    } finally {
        setIsLoading(false);
    }
  }
  
  const disposalStatus = form.watch('disposalStatus');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Data Utama */}
        <div>
            <h3 className="text-lg font-medium mb-4">Data Utama Barang</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="noData" render={({ field }) => ( <FormItem><FormLabel>Nomor Data</FormLabel><FormControl><Input placeholder="1" {...field} disabled={isEditing} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="itemType" render={({ field }) => ( <FormItem><FormLabel>Jenis Barang</FormLabel><FormControl><Input placeholder="MEJA" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="mainItemNumber" render={({ field }) => ( <FormItem><FormLabel>Induk No. Barang</FormLabel><FormControl><Input placeholder="1" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="mainItemLetter" render={({ field }) => ( <FormItem><FormLabel>Induk Huruf Barang</FormLabel><FormControl><Input placeholder="A" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="subItemType" render={({ field }) => ( <FormItem><FormLabel>Sub Jenis Barang</FormLabel><FormControl><Input placeholder="MEJA SISWA" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem><FormLabel>Merk/Tipe</FormLabel><FormControl><Input placeholder="-" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="subItemTypeCode" render={({ field }) => ( <FormItem><FormLabel>Sub Kode Jenis Barang</FormLabel><FormControl><Input placeholder="01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="subItemOrder" render={({ field }) => ( <FormItem><FormLabel>Urut Sub Barang</FormLabel><FormControl><Input placeholder="1021" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
        </div>
        
        <Separator />

        {/* Section 2: Pendanaan & Lokasi */}
        <div>
            <h3 className="text-lg font-medium mb-4">Pendanaan & Lokasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="fundingSource" render={({ field }) => ( <FormItem><FormLabel>Sumber Pendanaan</FormLabel><FormControl><Input placeholder="KOMITE" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="fundingItemOrder" render={({ field }) => ( <FormItem><FormLabel>Urut Barang Pendanaan</FormLabel><FormControl><Input placeholder="1021" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="area" render={({ field }) => ( <FormItem><FormLabel>Area/Ruang</FormLabel><FormControl><Input placeholder="KELAS" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="subArea" render={({ field }) => ( <FormItem><FormLabel>Sub-Area/Ruang</FormLabel><FormControl><Input placeholder="KELAS GEDUNG E 03.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
        </div>

        <Separator />

        {/* Section 3: Pengadaan */}
        <div>
            <h3 className="text-lg font-medium mb-4">Detail Pengadaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <FormField control={form.control} name="procurementDate" render={({ field }) => ( <FormItem><FormLabel>Tgl Pengadaan</FormLabel><FormControl><Input type="number" placeholder="11" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="procurementMonth" render={({ field }) => ( <FormItem><FormLabel>Bulan Pengadaan</FormLabel><FormControl><Input type="number" placeholder="12" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="procurementYear" render={({ field }) => ( <FormItem><FormLabel>Tahun Pengadaan</FormLabel><FormControl><Input type="number" placeholder="2022" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="supplier" render={({ field }) => ( <FormItem><FormLabel>Supplier/Distributor</FormLabel><FormControl><Input placeholder="-" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="estimatedPrice" render={({ field }) => ( <FormItem><FormLabel>Perkiraan Harga (Rp)</FormLabel><FormControl><Input type="number" placeholder="500000" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="procurementStatus" render={({ field }) => ( <FormItem><FormLabel>Status Pengadaan</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="baru">Baru</SelectItem><SelectItem value="second">Second</SelectItem><SelectItem value="bekas">Bekas</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
            </div>
        </div>
        
        <Separator />

        {/* Section 4: Status & Penghapusan */}
         <div>
            <h3 className="text-lg font-medium mb-4">Status & Penghapusan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="disposalStatus" render={({ field }) => ( <FormItem><FormLabel>Status Barang</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="aktif">Aktif</SelectItem><SelectItem value="dihapus">Dihapus</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                {disposalStatus === 'dihapus' && (
                    <>
                        <FormField control={form.control} name="disposalDate" render={({ field }) => ( <FormItem><FormLabel>Tgl Penghapusan</FormLabel><FormControl><Input type="number" placeholder="DD" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="disposalMonth" render={({ field }) => ( <FormItem><FormLabel>Bulan Penghapusan</FormLabel><FormControl><Input type="number" placeholder="MM" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="disposalYear" render={({ field }) => ( <FormItem><FormLabel>Tahun Penghapusan</FormLabel><FormControl><Input type="number" placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </>
                )}
            </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full mt-8">
            {isLoading ? "Menyimpan..." : (isEditing ? "Simpan Perubahan" : "Simpan Data Inventaris")}
        </Button>
      </form>
    </Form>
  );
}
