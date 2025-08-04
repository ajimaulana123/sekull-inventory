import type { InventoryItem } from '@/types';

export const inventoryData: InventoryItem[] = Array.from({ length: 55 }, (_, i) => {
  const year = 2020 + (i % 4);
  const month = (i % 12) + 1;
  const status = i % 10 === 0 ? 'dihapus' : 'aktif';
  const itemTypes = ['MEJA', 'KURSI', 'LEMARI', 'KOMPUTER', 'PROYEKTOR'];
  const itemType = itemTypes[i % itemTypes.length];
  const areas = ['Kelas A', 'Kelas B', 'Perpustakaan', 'Laboratorium', 'Kantor Guru'];
  const area = areas[i % areas.length];

  return {
    noData: `INV-${String(i + 1).padStart(4, '0')}`,
    itemType: itemType,
    mainItemNumber: `10${i % 9}`,
    mainItemLetter: 'A',
    subItemType: `${itemType} SISWA`,
    brand: `Merek ${String.fromCharCode(65 + (i % 26))}`,
    subItemTypeCode: `S${i % 5}`,
    subItemOrder: `${i + 1}`,
    fundingSource: i % 3 === 0 ? 'KOMITE' : 'BOS',
    fundingItemOrder: `DANA-${i + 1}`,
    area: area,
    subArea: `Ruang ${i % 10 + 1}`,
    procurementDate: (i % 28) + 1,
    procurementMonth: month,
    procurementYear: year,
    supplier: `Supplier ${String.fromCharCode(65 + (i % 5))}`,
    estimatedPrice: 500000 + i * 10000,
    procurementStatus: i % 2 === 0 ? 'baru' : 'second',
    disposalDate: status === 'dihapus' ? (i % 28) + 1 : undefined,
    disposalMonth: status === 'dihapus' ? month : undefined,
    disposalYear: status === 'dihapus' ? year + 1 : undefined,
    disposalStatus: status,
    itemVerificationCode: `V-BRG-${i + 1}`,
    fundingVerificationCode: `V-DANA-${i + 1}`,
    totalRekapCode: `REKAP-TOTAL-${year}`,
    disposalRekapCode: status === 'dihapus' ? `REKAP-HAPUS-${year + 1}` : undefined,
    combinedFundingRekapCode: `${itemType}-S${i % 5}-${i % 3 === 0 ? 'KOMITE' : 'BOS'}`,
  };
});
