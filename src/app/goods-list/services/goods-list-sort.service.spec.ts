import { TestBed } from '@angular/core/testing';

import { GoodsListSortService } from './goods-list-sort.service';
import {
  GoodsListItem,
  GoodsListItemSalesStatus,
  GoodsListItemSalesType,
} from '../interfaces/goods-list-item';

describe('GoodsListSortService', () => {
  let service: GoodsListSortService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoodsListSortService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sortItems', () => {
    // テストデータの基準日時
    const testDate = new Date('2023-07-31T00:00:00+0900');

    // テストデータ
    let testItems: GoodsListItem[] = [
      // --- 1. 入手できなくなる可能性があるアイテム ---
      {
        id: 10,
        name: '再販中だが、まもなく終了するアイテム (予約時: 受注生産, 販売時: 数量限定)',
        salesStatus: GoodsListItemSalesStatus.ON_RESALE,
        salesType: GoodsListItemSalesType.A_B,
        reservationStartDate: '2023-07-201T09:00:00',
        reservationEndDate: '2023-07-31T23:59:59',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 11,
        name: '予約を受け付けているが、まもなく終了するアイテム (予約時: 受注生産, 販売時: 数量限定)',
        salesStatus: GoodsListItemSalesStatus.ON_SALE,
        salesType: GoodsListItemSalesType.A_B,
        reservationStartDate: '2023-07-201T09:00:00',
        reservationEndDate: '2023-08-01T23:59:59',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 15,
        name: '予約を受け付けていて、期間に余裕があるアイテム (予約時: 受注生産, 販売時: 数量限定)',
        salesStatus: GoodsListItemSalesStatus.RESERVATION,
        salesType: GoodsListItemSalesType.A_B,
        reservationStartDate: '2023-07-101T09:00:00',
        reservationEndDate: '2023-08-20T23:59:59',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },

      // --- 2. まだ入手することができないアイテム ---
      {
        id: 20,
        name: '【2】 7日後に発売され、急いで入手すべきアイテム (数量限定で発売)',
        salesStatus: GoodsListItemSalesStatus.BEFORE_SALE,
        salesType: GoodsListItemSalesType.B,
        saleDate: '2023-08-07T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 21,
        name: '【2】 10日後に予約開始され、急いで入手すべきアイテム (数量限定で予約)',
        salesStatus: GoodsListItemSalesStatus.BEFORE_SALE,
        salesType: GoodsListItemSalesType.B,
        reservationStartDate: '2023-08-10T00:00:00',
        reservationEndDate: '2023-08-20T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 22,
        name: '【2】 14日後に再販され、急いで入手すべきアイテム (数量限定で再販)',
        salesStatus: GoodsListItemSalesStatus.BEFORE_SALE,
        salesType: GoodsListItemSalesType.B,
        resaleDate: '2023-08-14T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 23,
        name: '【2】 3日後に予約開始され、期間中は確実に予約できるアイテム (受注生産で予約)',
        salesStatus: GoodsListItemSalesStatus.BEFORE_RESERVATION,
        salesType: GoodsListItemSalesType.A,
        reservationStartDate: '2023-08-03T00:00:00',
        reservationEndDate: '2023-08-20T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 24,
        name: '【2】 10日後に発売され、期間中は確実に購入できるアイテム (受注生産で発売)',
        salesStatus: GoodsListItemSalesStatus.BEFORE_SALE,
        salesType: GoodsListItemSalesType.A,
        saleDate: '2023-08-10T00:00:00',
        endOfSaleDate: '2023-08-20T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 25,
        name: '【2】 12日後に再販され、期間中は確実に購入できるアイテム (受注生産で再販)',
        salesStatus: GoodsListItemSalesStatus.BEFORE_SALE,
        salesType: GoodsListItemSalesType.A,
        resaleDate: '2023-08-12T00:00:00',
        endOfResaleDate: '2023-08-22T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },

      // --- 3. いつでも入手できるアイテム ---
      {
        id: 30,
        name: '【3】 すでに発売済みで入手性の高いアイテム (A)',
        salesStatus: GoodsListItemSalesStatus.ON_SALE,
        salesType: GoodsListItemSalesType.C,
        // 2023/07/10〜
        saleDate: '2023-07-10T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 31,
        name: '【3】 すでに発売済みで入手性の高いアイテム (B)',
        salesStatus: GoodsListItemSalesStatus.ON_SALE,
        salesType: GoodsListItemSalesType.C,
        // 2023/07/01〜
        saleDate: '2023-07-01T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },

      // --- 4. すでに入手できなくなったアイテム ---
      {
        id: 40,
        name: '【4】 予約は締め切られたが、発売時期が不明なアイテム',
        salesStatus: GoodsListItemSalesStatus.END_OF_RESERVATION,
        salesType: GoodsListItemSalesType.A,
        // 〜2023/07/20
        reservationStartDate: '2023-07-01T00:00:00',
        reservationEndDate: '2023-07-20T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 41,
        name: '【4】 再販終了したアイテム (先着順であり、終売日はないが、最近に終売を確認した)',
        salesStatus: GoodsListItemSalesStatus.END_OF_RESALE,
        salesType: GoodsListItemSalesType.B,
        // 〜2023/07/10
        resaleDate: '2023-07-01T00:00:00',
        confirmedEndOfResaleDate: '2023-07-10T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 42,
        name: '【4】 終売したアイテム (終売日を過ぎた)',
        salesStatus: GoodsListItemSalesStatus.END_OF_SALE,
        salesType: GoodsListItemSalesType.A,
        // 〜2023/06/31
        saleDate: '2023-06-01T00:00:00',
        endOfSaleDate: '2023-06-31T23:59:59',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 43,
        name: '【4】 再販終了したアイテム (再販終了日を過ぎた)',
        salesStatus: GoodsListItemSalesStatus.END_OF_RESALE,
        salesType: GoodsListItemSalesType.A,
        // 〜2023/06/30
        resaleDate: '2023-06-01T00:00:00',
        endOfResaleDate: '2023-06-30T23:59:59',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 44,
        name: '【4】 終売したアイテム (先着順であり、終売日はないが、終売を確認した)',
        salesStatus: GoodsListItemSalesStatus.END_OF_SALE,
        salesType: GoodsListItemSalesType.B,
        // 〜2023/06/10
        saleDate: '2023-06-01T00:00:00',
        confirmedEndOfSaleDate: '2023-06-10T00:00:00',
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
      {
        id: 45,
        name: '【4】 不明なアイテム',
        salesStatus: GoodsListItemSalesStatus.UNKNOWN,
        salesType: GoodsListItemSalesType.A,
        estimatedPaymentYearMonth: 'XXXX-XX',
        category: '',
        isArchived: false,
        isChecked: false,
      },
    ];

    // テストデータに ID の重複がないことを確認
    const idSet = new Set<number>();
    for (const testItem of testItems) {
      expect(idSet.has(testItem.id)).toBe(false);
      idSet.add(testItem.id);
    }

    // アイテムをシャッフル
    const shuffledItems: GoodsListItem[] = testItems
      .concat()
      .sort(() => Math.random() - 0.5);

    // ソート関数を実行
    const resultItems: GoodsListItem[] = (service as any).sortItems(
      shuffledItems,
      testDate,
      false
    );

    // 結果に ID の重複がないことを確認
    const resultIdSet = new Set<number>();
    for (const resultItem of resultItems) {
      expect(resultIdSet.has(resultItem.id)).toBe(false);
      resultIdSet.add(resultItem.id);
    }

    // 結果を確認
    expect(resultItems).toStrictEqual(testItems);
  });
});
