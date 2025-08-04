export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type InventoryItem = {
  noData: string;
  itemType: string;
  mainItemNumber: string;
  mainItemLetter: string;
  subItemType: string;
  brand: string;
  subItemTypeCode: string;
  subItemOrder: string;
  fundingSource: string;
  fundingItemOrder: string;
  area: string;
  subArea: string;
  procurementDate: number;
  procurementMonth: number;
  procurementYear: number;
  supplier: string;
  estimatedPrice: number;
  procurementStatus: 'baru' | 'second' | 'bekas';
  disposalDate?: number;
  disposalMonth?: number;
  disposalYear?: number;
  disposalStatus: 'aktif' | 'dihapus';
  itemVerificationCode: string;
  fundingVerificationCode: string;
  totalRekapCode: string;
  disposalRekapCode?: string;
  combinedFundingRekapCode: string;
};
