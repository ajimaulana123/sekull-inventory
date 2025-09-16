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
  jenisBarang: '',
  merkTipe: '',
  jumlah: 1,
  satuan: 'buah',
  kondisi: 'Baik',
  harga: 0,
  areaRuang: '',
  tanggalPengadaan: new Date(),
  statusPengadaan: 'baru',
  statusBarang: 'aktif',
  tanggalHapus: null,
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
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
     if (initialData) {
      const dataForForm: Partial<InventoryFormValues> & { noData?: string } = {
        ...initialData,
        tanggalPengadaan: initialData.tanggalPengadaan ? new Date(initialData.tanggalPengadaan) : null,
        tanggalHapus: initialData.tanggalHapus ? new Date(initialData.tanggalHapus) : null,
      };
      
      form.reset(dataForForm as InventoryFormValues);
      
      if (initialData.harga) {
        setDisplayPrice(new Intl.NumberFormat('id-ID').format(initialData.harga));
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
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;

    form.setValue('harga', numericValue, { shouldValidate: true });

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
            ...initialData,
            ...values,
            noData: isEditing && initialData?.noData ? initialData.noData : generateUniqueId(),
            estimatedPrice: values.harga, // Mapping harga to estimatedPrice for compatibility
            kodeVerifikasiBarang: `${values.indukHurufBarang || ''}.${values.subKodeJenis || ''}.${values.urutSubBarang || ''}`.replace(/^\.+|\.+$/g, ''),
            kodeVerifikasiDana: `${values.sumberDana || ''}.${values.urutBarangDana || ''}.${values.indukHurufBarang || ''}${values.subKodeJenis || ''}`.replace(/^\.+|\.+$/g, ''),
            kodeRekapTotal: `${values.indukHurufBarang || ''}${values.subKodeJenis || ''}`,
            kodeRekapDana: `${values.indukHurufBarang || ''}${values.subKodeJenis || ''}${values.sumberDana || ''}`,
            kodeRekapHapus: values.statusBarang === 'dihapus' ? `${values.indukHurufBarang || ''}${values.subKodeJenis || ''}-HAPUS` : undefined,
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
  
  const disposalStatus = form.watch('statusBarang');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="jenisBarang" render={({ field }) => ( <FormItem><FormLabel>Jenis Barang</FormLabel><FormControl><Input placeholder="Contoh: Meja Siswa" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="merkTipe" render={({ field }) => ( <FormItem><FormLabel>Merk/Tipe</FormLabel><FormControl><Input placeholder="Contoh: Olympic" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="areaRuang" render={({ field }) => ( <FormItem><FormLabel>Area/Ruang</FormLabel><FormControl><Input placeholder="Contoh: Kelas 1A" {...field} value={field.value || ''} /></FormControl><FormItem /></FormItem> )} />
            <FormField control={form.control} name="keterangan" render={({ field }) => ( <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Input placeholder="Keterangan tambahan" {...field} value={field.value || ''} /></FormControl><FormItem /></FormItem> )} />
        </div>
        
        <Separator />

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="jumlah" render={({ field }) => ( <FormItem><FormLabel>Jumlah</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="satuan" render={({ field }) => ( <FormItem><FormLabel>Satuan</FormLabel><FormControl><Input placeholder="Contoh: Buah" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="harga" render={({ field }) => ( <FormItem><FormLabel>Harga (Rp)</FormLabel><FormControl><Input placeholder="500.000" value={displayPrice} onChange={handlePriceChange} /></FormControl><FormMessage /></FormItem> )} />
        </div>

        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="kondisi" render={({ field }) => ( <FormItem><FormLabel>Kondisi Barang</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kondisi" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Baik">Baik</SelectItem><SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem><SelectItem value="Rusak Berat">Rusak Berat</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="statusPengadaan" render={({ field }) => ( <FormItem><FormLabel>Status Pengadaan</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="baru">Baru</SelectItem><SelectItem value="bekas">Bekas</SelectItem><SelectItem value="second">Second</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="tanggalPengadaan" render={({ field }) => ( <FormItem><FormLabel>Tanggal Pengadaan</FormLabel><FormControl><DatePicker value={field.value ?? undefined} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )} />
        </div>
        
        <Separator />
        
         <div>
            <h3 className="text-base font-medium mb-2">Status & Penghapusan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <FormField control={form.control} name="statusBarang" render={({ field }) => ( <FormItem><FormLabel>Status Barang</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="aktif">Aktif</SelectItem><SelectItem value="dihapus">Dihapus</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                {disposalStatus === 'dihapus' && (
                    <>
                        <FormField control={form.control} name="tanggalHapus" render={({ field }) => ( <FormItem><FormLabel>Tanggal Penghapusan</FormLabel><FormControl><DatePicker value={field.value ?? undefined} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )} />
                    </>
                )}
            </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading ? "Menyimpan..." : (isEditing ? "Simpan Perubahan" : "Simpan Data")}
        </Button>
      </form>
    </Form>
  );
}
