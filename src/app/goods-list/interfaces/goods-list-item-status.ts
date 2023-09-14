export interface GoodsListItemStatus {
  isChecked: boolean;
  isArchived: boolean;
  paymentYearMonth: string;
  savedAt: string;
  firstCheckedAt: string;
  customQuantity?: number;
  customPriceWithTax?: number;
  customMemo?: string;
}
