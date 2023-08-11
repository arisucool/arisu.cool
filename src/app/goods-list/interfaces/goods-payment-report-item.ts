import { GoodsListItem } from './goods-list-item';

export interface GoodsPaymentReportItem {
  // 年月
  yearMonth: string;

  // 合計金額
  minPrice: number;
  maxPrice: number;

  // グッズ
  goods: GoodsListItem[];
  numOfGoods: number;
}
