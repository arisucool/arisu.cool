export interface GoodsListItem {
  // ID
  id: number;
  // カテゴリ
  category: string;
  // メーカー
  maker: string;
  // 予約開始日
  reservationStartDate?: string;
  // 商品名
  name: string;
  // ありす単独か
  isArisuAlone?: boolean;
  // 発売日
  releaseDate?: string;
  // 税込価格
  priceWithTax?: number;
  // 場所
  place?: string;
  // URL
  url?: string;
  // ステータス
  isDone: boolean;
}
