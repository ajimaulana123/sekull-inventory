import type { InventoryItem } from '@/types';

// This data is now more complex to match the new schema.
// It can be used for initial seeding if required.
export const inventoryData: InventoryItem[] = Array.from({ length: 55 }, (_, i) => {
  const year = 2020 + (i % 4);
  const month = (i % 12) + 1;
  const date = (i % 28) + 1;
  const status = i % 10 === 0 ? 'dihapus' : 'aktif';
  const itemTypes = ['MEJA', 'KURSI', 'LEMARI', 'KOMPUTER', 'PROYEKTOR'];
  const itemType = itemTypes[i % itemTypes.length];
  const areas = ['KELAS', 'PERPUSTAKAAN', 'LABORATORIUM', 'KANTOR', 'AULA'];
  const area = areas[i % areas.length];
  const mainItemLetter = String.fromCharCode(65 + (i % 5)); // A, B, C, D, E

  return {
    noData: `${i + 1}`,
    itemType: itemType,
    mainItemNumber: `${i % 9 + 1}`,
    mainItemLetter: mainItemLetter,
    subItemType: `${itemType} SISWA`,
    brand: `Merek ${String.fromCharCode(65 + (i % 26))}`,
    subItemTypeCode: `0${i % 5 + 1}`,
    subItemOrder: `${1000 + i}`,
    fundingSource: i % 3 === 0 ? 'KOMITE' : 'BOS',
    fundingItemOrder: `${1000 + i}`,
    area: area,
    subArea: `${area} GEDUNG ${mainItemLetter} 01.0${i%9+1}`,
    procurementDate: date,
    procurementMonth: month,
    procurementYear: year,
    supplier: `Supplier ${String.fromCharCode(88 + (i % 3))}`, // X, Y, Z
    estimatedPrice: 500000 + i * 10000,
    procurementStatus: i % 2 === 0 ? 'baru' : 'second',
    disposalStatus: status,
    disposalDate: status === 'dihapus' ? date : undefined,
    disposalMonth: status === 'dihapus' ? month : undefined,
    disposalYear: status === 'dihapus' ? year + 1 : undefined,
    itemVerificationCode: `${mainItemLetter}.0${i % 5 + 1}.${1000 + i}`,
    fundingVerificationCode: `${i % 3 === 0 ? 'KOMITE' : 'BOS'}.${1000 + i}.${mainItemLetter}0${i % 5 + 1}`,
    totalRekapCode: `${mainItemLetter}0${i % 5 + 1}`,
    disposalRekapCode: status === 'dihapus' ? `${mainItemLetter}0${i % 5 + 1}-HAPUS` : undefined,
    combinedFundingRekapCode: `${mainItemLetter}0${i % 5 + 1}${i % 3 === 0 ? 'KOMITE' : 'BOS'}`,
  };
});
