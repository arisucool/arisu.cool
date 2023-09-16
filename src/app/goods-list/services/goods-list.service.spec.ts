import { TestBed } from '@angular/core/testing';

import { GoodsListService } from './goods-list.service';
import { AppCacheService } from 'src/app/shared/services/app-cache.service';
import {
  GoodsListItem,
  GoodsListItemSalesStatus,
  GoodsListItemSalesType,
  GoodsListRawItem,
} from '../interfaces/goods-list-item';
import { GoodsListSortService } from './goods-list-sort.service';

jest.mock('src/app/shared/services/app-cache.service');

describe('GoodsListService', () => {
  let service: GoodsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppCacheService, GoodsListSortService],
    });
    service = TestBed.inject(GoodsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getItemSalesStatus', () => {
    // テストデータの基準日時
    const testDate = new Date('2023-07-31T00:00:00+0900');

    // テストデータ
    let testItems: {
      expectedStatus: GoodsListItemSalesStatus;
      rawItem: GoodsListRawItem;
    }[] = [
      // まもなく予約開始になるアイテム
      {
        expectedStatus: GoodsListItemSalesStatus.BEFORE_RESERVATION,
        rawItem: {
          id: 10,
          maker: '',
          name: 'まもなく予約開始になるアイテム',
          category: '',
          salesType: GoodsListItemSalesType.A,
          reservationStartDate: '2023-08-01T10:00:00+0900',
        },
      },

      // 予約受付中のアイテム
      {
        expectedStatus: GoodsListItemSalesStatus.RESERVATION,
        rawItem: {
          id: 20,
          maker: '',
          name: '予約受付中のアイテム',
          category: '',
          salesType: GoodsListItemSalesType.A,
          reservationStartDate: '2022-07-01T00:00:00+0900',
          reservationEndDate: '2023-08-31T23:59:59+0900',
        },
      },

      // 予約締切されたアイテム
      {
        expectedStatus: GoodsListItemSalesStatus.END_OF_RESERVATION,
        rawItem: {
          id: 30,
          maker: '',
          name: '予約締切されたアイテム',
          category: '',
          salesType: GoodsListItemSalesType.A,
          reservationStartDate: '2022-07-01T00:00:00+0900',
          reservationEndDate: '2023-07-30T23:59:59+0900',
        },
      },

      // 発売前のアイテム
      {
        expectedStatus: GoodsListItemSalesStatus.BEFORE_SALE,
        rawItem: {
          id: 40,
          maker: '',
          name: '発売前のアイテム',
          category: '',
          salesType: GoodsListItemSalesType.A,
          saleDate: '2023-08-01T00:00:00+0900',
        },
      },

      // 販売中のアイテム
      {
        expectedStatus: GoodsListItemSalesStatus.ON_SALE,
        rawItem: {
          id: 50,
          maker: '',
          name: '販売中のアイテム',
          category: '',
          salesType: GoodsListItemSalesType.A,
          saleDate: '2023-07-01T00:00:00+0900',
          endOfSaleDate: '2023-08-31T23:59:59+0900',
        },
      },

      // 終売したアイテム (終売日を過ぎた)
      {
        expectedStatus: GoodsListItemSalesStatus.END_OF_SALE,
        rawItem: {
          id: 60,
          maker: '',
          name: '終売したアイテム',
          category: '',
          salesType: GoodsListItemSalesType.A,
          saleDate: '2023-07-01T00:00:00+0900',
          endOfSaleDate: '2023-07-30T23:59:59+0900',
        },
      },

      // 終売したアイテム (先着順であり、終売日はないが、終売を確認した)
      {
        expectedStatus: GoodsListItemSalesStatus.END_OF_SALE,
        rawItem: {
          id: 61,
          maker: '',
          name: '終売したアイテム',
          category: '',
          salesType: GoodsListItemSalesType.B,
          saleDate: '2023-07-01T00:00:00+0900',
          confirmedEndOfSaleDate: '2023-07-30T23:59:59+0900',
        },
      },

      // 再販前のアイテム
      {
        expectedStatus: GoodsListItemSalesStatus.BEFORE_RESALE,
        rawItem: {
          id: 70,
          maker: '',
          name: '再販前のアイテム',
          category: '',
          salesType: GoodsListItemSalesType.A,
          resaleDate: '2023-08-01T00:00:00+0900',
        },
      },

      // 再販中のアイテム
      {
        expectedStatus: GoodsListItemSalesStatus.ON_RESALE,
        rawItem: {
          id: 80,
          maker: '',
          name: '再販中のアイテム',
          category: '',
          salesType: GoodsListItemSalesType.A,
          resaleDate: '2023-07-01T00:00:00+0900',
          endOfResaleDate: '2023-08-31T23:59:59+0900',
        },
      },

      // 再販終了したアイテム (再販終了日を過ぎた)
      {
        expectedStatus: GoodsListItemSalesStatus.END_OF_RESALE,
        rawItem: {
          id: 90,
          maker: '',
          name: '再販終了したアイテム',
          category: '',
          salesType: GoodsListItemSalesType.A,
          resaleDate: '2023-07-01T00:00:00+0900',
          endOfResaleDate: '2023-07-30T23:59:59+0900',
        },
      },

      // 再販終了したアイテム (再販終了日はないが、再販終了を確認した)
      {
        expectedStatus: GoodsListItemSalesStatus.END_OF_RESALE,
        rawItem: {
          id: 91,
          maker: '',
          name: '再販終了したアイテム',
          category: '',
          salesType: GoodsListItemSalesType.B,
          resaleDate: '2023-07-01T00:00:00+0900',
          confirmedEndOfResaleDate: '2023-07-30T23:59:59+0900',
        },
      },
    ];

    for (const testItem of testItems) {
      const result = (service as any).getItemSalesStatus(
        testItem.rawItem,
        testDate
      );
      expect(result).toBe(testItem.expectedStatus);
    }
  });
});
