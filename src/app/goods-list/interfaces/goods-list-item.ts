export enum GoodsListItemSalesStatus {
  // 予約開始前
  BEFORE_RESERVATION,
  // 予約受付中
  RESERVATION,
  // 予約終了
  END_OF_RESERVATION,
  // 発売前
  BEFORE_SALE,
  // 販売中
  ON_SALE,
  // 終売
  END_OF_SALE,
  // 不明
  UNKNOWN,
}

export interface GoodsListItem {
  // ID
  id: number;
  // カテゴリ
  category: string;
  // メーカー
  maker: string;
  // 商品名
  name: string;

  // 予約開始日
  reservationStartDate?: string;
  // 予約締切日
  reservationEndDate?: string;

  // 発売日
  saleDate?: string;
  // 終売日
  endOfSaleDate?: string;
  // 終売確認日
  confirmedEndOfSaleDate?: string;

  // 再販開始日
  resaleDate?: string;
  // 再販終了日
  endOfResaleDate?: string;
  // 再販終了日
  confirmedEndOfResaleDate?: string;

  // 税込価格
  priceWithTax?: number;
  boxPriceWithTax?: number;

  // 推定支払い時期
  estimatedPaymentYearMonth: string;

  // 選択された支払い時期
  selectedPaymentYearMonth?: string;

  // 場所
  place?: string;
  // 補足情報
  note?: string;
  // URL
  url?: string;

  // 販売ステータス
  salesStatus: GoodsListItemSalesStatus;

  // 購入フラグ
  isChecked: boolean;

  // アーカイブフラグ
  isArchived: boolean;

  // 子項目
  children?: GoodsListItem[];
}
