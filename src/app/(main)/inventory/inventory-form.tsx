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
import { Textarea } from '@/components/ui/textarea';


interface InventoryFormProps {
  onSuccess: () => void;
  initialData?: InventoryItem | null;
}

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
    defaultValues: {
      // Set default values for all fields in the form
      jenisBarang: '',
      merkTipe: '',
      jumlah: 1,
      satuan: 'buah',
      harga: 0,
      kondisi: 'Baik',
      statusBarang: 'aktif',
      tanggalPengadaan: undefined,
      areaRuang: '',
      keterangan: '',
      tanggalHapus: null,
      indukNoBarang: '',
      indukHurufBarang: '',
      subJenisBarang: '',
      subKodeJenis: '',
      urutSubBarang: '',
      sumberDana: '',
      urutBarangDana: '',
      subAreaRuang: '',
      supplier: '',
      statusPengadaan: '',
    },
  });

  useEffect(() => {
     if (initialData) {
      // Convert date strings/timestamps from Firestore to Date objects for the form
      const dataForForm: Partial<InventoryFormValues> & { noData?: string } = {
        ...initialData,
        tanggalPengadaan: initialData.tanggalPengadaan ? new Date(initialData.tanggalPengadaan) : undefined,
        tanggalHapus: initialData.tanggalHapus ? new Date(initialData.tanggalHapus) : null,
      };
      
      form.reset(dataForForm as InventoryFormValues);
      
      if (initialData.harga) {
        setDisplayPrice(new Intl.NumberFormat('id-ID').format(initialData.harga));
      } else {
        setDisplayPrice('');
      }
    } else {
      form.reset(); // Reset to defaultValues defined above
      setDisplayPrice('');
    }
  }, [initialData, form]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove non-numeric characters
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;

    // Set the numeric value for the form state
    form.setValue('harga', numericValue, { shouldValidate: true });

    // Format the value for display
    if (value) {
      setDisplayPrice(new Intl.NumberFormat('id-ID').format(numericValue));
    } else {
      setDisplayPrice('');
    }
  };


  async function onSubmit(values: InventoryFormValues) {
    setIsLoading(true);
    try {
      // Get the existing noData or generate a new one
      const noData = isEditing && initialData?.noData ? initialData.noData : generateUniqueId();
      
      const itemToSave: InventoryItem = {
          ...initialData, // Keep all original data not in the form
          noData: noData,
          // Overwrite with form values
          ...values, 
          // Generate codes based on form values
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
        
        <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">Data Utama</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="jenisBarang" render={({ field }) => ( <FormItem><FormLabel>Jenis Barang</FormLabel><FormControl><Input placeholder="Contoh: Meja Siswa" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="subJenisBarang" render={({ field }) => ( <FormItem><FormLabel>Sub Jenis Barang</FormLabel><FormControl><Input placeholder="Opsional" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="merkTipe" render={({ field }) => ( <FormItem><FormLabel>Merk/Tipe</FormLabel><FormControl><Input placeholder="Contoh: Olympic" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name="indukNoBarang" render={({ field }) => ( <FormItem><FormLabel>Induk No.</FormLabel><FormControl><Input placeholder="No." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="indukHurufBarang" render={({ field }) => ( <FormItem><FormLabel>Induk Huruf</FormLabel><FormControl><Input placeholder="Huruf" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name="subKodeJenis" render={({ field }) => ( <FormItem><FormLabel>Sub Kode</FormLabel><FormControl><Input placeholder="Kode" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="urutSubBarang" render={({ field }) => ( <FormItem><FormLabel>Urut Sub</FormLabel><FormControl><Input placeholder="Urutan" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                </div>
            </div>
        </div>

        <Separator />

        <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">Lokasi & Pendanaan</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="areaRuang" render={({ field }) => ( <FormItem><FormLabel>Area/Ruang</FormLabel><FormControl><Input placeholder="Contoh: Kelas 1A" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="subAreaRuang" render={({ field }) => ( <FormItem><FormLabel>Sub-Area/Ruang</FormLabel><FormControl><Input placeholder="Opsional" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                 <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name="sumberDana" render={({ field }) => ( <FormItem><FormLabel>Sumber Dana</FormLabel><FormControl><Input placeholder="Contoh: BOS" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="urutBarangDana" render={({ field }) => ( <FormItem><FormLabel>Urut Dana</FormLabel><FormControl><Input placeholder="Urutan" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                </div>
             </div>
        </div>
        
        <Separator />

        <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">Detail & Kondisi</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="jumlah" render={({ field }) => ( <FormItem><FormLabel>Jumlah</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="satuan" render={({ field }) => ( <FormItem><FormLabel>Satuan</FormLabel><FormControl><Input placeholder="Contoh: Buah" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="harga" render={({ field }) => ( <FormItem><FormLabel>Harga (Rp)</FormLabel><FormControl><Input placeholder="500.000" value={displayPrice} onChange={handlePriceChange} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="kondisi" render={({ field }) => ( <FormItem><FormLabel>Kondisi Barang</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih kondisi" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Baik">Baik</SelectItem><SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem><SelectItem value="Rusak Berat">Rusak Berat</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="keterangan" render={({ field }) => ( <FormItem><FormLabel>Keterangan</FormLabel><FormControl><Textarea placeholder="Keterangan tambahan" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
            </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">Pengadaan & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <FormField control={form.control} name="tanggalPengadaan" render={({ field }) => ( <FormItem><FormLabel>Tanggal Pengadaan</FormLabel><FormControl><DatePicker value={field.value ?? undefined} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="supplier" render={({ field }) => ( <FormItem><FormLabel>Supplier</FormLabel><FormControl><Input placeholder="Nama Toko" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="statusPengadaan" render={({ field }) => ( <FormItem><FormLabel>Status Pengadaan</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="baru">Baru</SelectItem><SelectItem value="bekas">Bekas</SelectItem><SelectItem value="second">Second</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="statusBarang" render={({ field }) => ( <FormItem><FormLabel>Status Barang</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="aktif">Aktif</SelectItem><SelectItem value="dihapus">Dihapus</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                {disposalStatus === 'dihapus' && (
                    <FormField control={form.control} name="tanggalHapus" render={({ field }) => ( <FormItem><FormLabel>Tgl. Penghapusan</FormLabel><FormControl><DatePicker value={field.value ?? undefined} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )} />
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
