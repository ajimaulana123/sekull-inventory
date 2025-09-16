'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveInventoryItem } from '@/lib/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { inventoryFormSchema, type InventoryItem, type InventoryFormValues } from '@/types';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';


interface InventoryFormProps {
  onSuccess: () => void;
  initialData?: InventoryItem | null;
}

const defaultFormValues: InventoryFormValues = {
  noData: '',
  itemType: '-',
  mainItemNumber: '-',
  mainItemLetter: '-',
  subItemType: '-',
  brand: '-',
  subItemTypeCode: '-',
  subItemOrder: '-',
  fundingSource: '-',
  fundingItemOrder: '-',
  area: '-',
  subArea: '-',
  procurementDate: null,
  supplier: '-',
  estimatedPrice: 0,
  procurementStatus: '-',
  disposalStatus: 'aktif',
  disposalDate: null
};

// Function to generate a unique ID
const generateUniqueId = () => {
    return `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
};


export function InventoryForm({ onSuccess, initialData }: InventoryFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;
  const [displayPrice, setDisplayPrice] = useState('');
  
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: initialData || defaultFormValues,
  });

  useEffect(() => {
     if (initialData) {
      form.reset({
        ...initialData,
        procurementDate: initialData.procurementDate ? new Date(initialData.procurementDate) : null,
        disposalDate: initialData.disposalDate ? new Date(initialData.disposalDate) : null,
      });
      // Set initial formatted price for editing
      if (initialData.estimatedPrice) {
        setDisplayPrice(new Intl.NumberFormat('id-ID').format(initialData.estimatedPrice));
      } else {
        setDisplayPrice('');
      }
    } else {
      form.reset(defaultFormValues);
      setDisplayPrice('');
    }
  }, [initialData, form]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;

    // Update the form's internal state with the raw number
    form.setValue('estimatedPrice', numericValue, { shouldValidate: true });

    // Update the display state with the formatted number
    if (value) {
      setDisplayPrice(new Intl.NumberFormat('id-ID').format(numericValue));
    } else {
      setDisplayPrice('');
    }
  };


  async function onSubmit(values: InventoryFormValues) {
    setIsLoading(true);
    try {
        const itemToSave: InventoryItem = {
            ...values,
            noData: isEditing ? values.noData! : generateUniqueId(),
            itemVerificationCode: `${values.mainItemLetter}.${values.subItemTypeCode}.${values.subItemOrder}`,
            fundingVerificationCode: `${values.fundingSource}.${values.fundingItemOrder}.${values.mainItemLetter}${values.subItemTypeCode}`,
            totalRekapCode: `${values.mainItemLetter}${values.subItemTypeCode}`,
            combinedFundingRekapCode: `${values.mainItemLetter}${values.subItemTypeCode}${values.fundingSource}`,
            disposalRekapCode: values.disposalStatus === 'dihapus' ? `${values.mainItemLetter}${values.subItemTypeCode}-HAPUS` : undefined,
        };
      
      await saveInventoryItem(itemToSave);
      
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
                 <FormField control={form.control} name="procurementDate" render={({ field }) => ( <FormItem><FormLabel>Tanggal Pengadaan</FormLabel><FormControl><DatePicker value={field.value ?? undefined} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="supplier" render={({ field }) => ( <FormItem><FormLabel>Supplier/Distributor</FormLabel><FormControl><Input placeholder="-" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="estimatedPrice" render={({ field }) => ( <FormItem><FormLabel>Perkiraan Harga (Rp)</FormLabel><FormControl><Input placeholder="500.000" value={displayPrice} onChange={handlePriceChange} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="procurementStatus" render={({ field }) => ( <FormItem><FormLabel>Status Pengadaan</FormLabel><FormControl><Input placeholder="Baru" {...field} /></FormControl><FormMessage /></FormItem> )} />
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
                        <FormField control={form.control} name="disposalDate" render={({ field }) => ( <FormItem><FormLabel>Tanggal Penghapusan</FormLabel><FormControl><DatePicker value={field.value ?? undefined} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )} />
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
