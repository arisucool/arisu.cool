export interface GoodsListItemStatus {
  note: undefined;
  isChecked: boolean;
  isArchived: boolean;
  paymentYearMonth: string;
  savedAt: string;
  firstCheckedAt: string;
  customQuantity?: number;
  customPriceWithTax?: number;
}
