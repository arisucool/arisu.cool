export enum GoodsListItemSalesStatus {
  // 予約開始前 (0)
  BEFORE_RESERVATION,
  // 予約受付中 (1)
  RESERVATION,
  // 予約終了 (2)
  END_OF_RESERVATION,
  // 発売前 (3)
  BEFORE_SALE,
  // 販売中 (4)
  ON_SALE,
  // 終売 (5)
  END_OF_SALE,
  // 再販前 (6)
  BEFORE_RESALE,
  // 再販中 (7)
  ON_RESALE,
  // 再販終了 (8)
  END_OF_RESALE,
  // 不明 (9)
  UNKNOWN,
}

export enum GoodsListItemSalesType {
  // 受注生産
  A,
  // 先着販売
  B,
  // 予約時受注生産、発売後は先着販売
  A_B,
  // 流注品
  C,
}

export interface GoodsListRawItem {
  // ID
  id: number;
  // カテゴリ
  category: string;
  // メーカー
  maker?: string;
  // 商品名
  name: string;

  // 販売種別
  salesType: GoodsListItemSalesType;

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
  estimatedPaymentYearMonth?: string;

  // 場所
  place?: string;
  // 補足情報
  note?: string;
  // URL
  url?: string;

  // 子項目
  children?: GoodsListItem[];
}

export interface GoodsListItem extends GoodsListRawItem {
  // 販売種別
  salesType: GoodsListItemSalesType;

  // 税込価格 (カスタム)
  customPriceWithTax?: number;

  // 購入個数 (カスタム)
  customQuantity?: number;

  // 推定支払い時期
  estimatedPaymentYearMonth: string;

  // 選択された支払い時期
  selectedPaymentYearMonth?: string;

  // メモ (カスタム)
  customMemo?: string;

  // 販売ステータス
  salesStatus: GoodsListItemSalesStatus;

  // 購入フラグ
  isChecked: boolean;

  // アーカイブフラグ
  isArchived: boolean;
}
