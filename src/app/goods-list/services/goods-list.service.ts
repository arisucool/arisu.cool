import { Injectable } from '@angular/core';
import { kvsIndexedDB, KVSIndexedDB } from '@kvs/indexeddb';
import { AppCacheService } from 'src/app/shared/services/app-cache.service';
import { environment } from 'src/environments/environment';
import {
  GoodsListItem,
  GoodsListItemSalesStatus,
  GoodsListItemSalesType,
  GoodsListRawItem,
} from '../interfaces/goods-list-item';
import { GoodsListItemStatus } from '../interfaces/goods-list-item-status';
import { GoodsTotalPrice } from '../interfaces/goods-total-price';
import * as PapaParse from 'papaparse';
import { GoodsListSortService } from './goods-list-sort.service';

@Injectable({
  providedIn: 'root',
})
export class GoodsListService {
  private readonly GOODS_LIST_STORAGE_VERSION = 1;
  private storage?: KVSIndexedDB<any>;

  static readonly GOODS_LIST_JSON_CACHE_EXPIRES = 1000 * 60 * 30; // 30 minutes

  constructor(
    private appCacheService: AppCacheService,
    private goodsListSortService: GoodsListSortService
  ) {}

  private async init() {
    if (this.storage) return;

    this.storage = await kvsIndexedDB<any>({
      name: 'arisucoolGoodsListItemStatus',
      version: this.GOODS_LIST_STORAGE_VERSION,
    });
  }

  async getGoodsList(enableSort = true): Promise<GoodsListItem[]> {
    await this.init();

    const cache = await this.appCacheService.getCachedJson(
      'arisuGoodsList',
      GoodsListService.GOODS_LIST_JSON_CACHE_EXPIRES
    );

    if (cache) {
      let items = await this.injectStatuses(cache);
      if (enableSort) {
        items = this.goodsListSortService.sortItems(items);
      }
      return items;
    }

    const res = await fetch(environment.SHOPPING_LIST_JSON_API_URL);
    if (!res.ok) {
      throw new Error('Failed to fetch goods list');
    }

    const parsed = await res.json();
    this.appCacheService.setCachedJson('arisuGoodsList', parsed);

    let items = await this.injectStatuses(parsed);
    if (enableSort) {
      items = this.goodsListSortService.sortItems(items);
    }
    return items;
  }

  async getGoodsListAsCsv() {
    // グッズリストを取得
    const items = await this.getGoodsList(false);

    // ID順にソート
    items.sort((a, b) => {
      if (a.id < b.id) return -1;
      if (a.id === b.id) return 0;
      return 1;
    });

    // CSV用にオブジェクトを変換
    type GoodsListCsvItem = Omit<GoodsListItem, 'salesStatus'> & {
      // 販売ステータス (文字列)
      salesStatus: string;
      // 親項目のID
      parentId: number | undefined;
      // 支払い時期
      paymentYearMonth: string | undefined;
    };

    const csvItems = items.map((item) => {
      const csvItem: GoodsListCsvItem = {
        ...item,
        // 販売ステータスを文字列に変換
        salesStatus: GoodsListItemSalesStatus[item.salesStatus],
        // 支払い時期を設定
        paymentYearMonth:
          item.selectedPaymentYearMonth && item.selectedPaymentYearMonth !== ''
            ? item.selectedPaymentYearMonth
            : item.estimatedPaymentYearMonth,
        // 親項目のIDを空に設定
        parentId: undefined,
      };
      return csvItem;
    });

    // 子項目を展開
    for (const csvItem of csvItems) {
      if (csvItem.children) {
        for (const child of csvItem.children) {
          const csvChild: GoodsListCsvItem = {
            ...child,
            // 販売ステータスを文字列に変換
            salesStatus: GoodsListItemSalesStatus[child.salesStatus],
            // 支払い時期を設定
            paymentYearMonth: csvItem.paymentYearMonth,
            // 親項目のIDを設定
            parentId: csvItem.id,
          };
          // 親項目の次の行に子項目を挿入
          const index = csvItems.findIndex((item) => item.id === csvItem.id);
          csvItems.splice(index + 1, 0, csvChild);
        }
        delete csvItem.children;
      }
    }

    // CSV を生成
    const csv = PapaParse.unparse(
      {
        fields: [
          'id',
          'category',
          'maker',
          'name',
          'priceWithTax',
          'boxPriceWithTax',
          'customPriceWithTax',
          'customQuantity',
          'paymentYearMonth',
          'salesStatus',
          'isChecked',
          'isArchived',
          'parentId',
        ],
        data: csvItems,
      },
      {
        header: true,
        delimiter: ',',
      }
    );
    return csv;
  }

  getTotalPriceByGoodsList(
    items: GoodsListItem[],
    isIncludesArchivedItems = false
  ): GoodsTotalPrice {
    let minTotalPrice = 0,
      maxTotalPrice = 0;
    for (const item of items) {
      if (!isIncludesArchivedItems && item.isArchived) continue;

      if (item.children) {
        let r = this.getTotalPriceByGoodsList(
          item.children,
          isIncludesArchivedItems
        );
        minTotalPrice += r.minPrice;
        maxTotalPrice += r.maxPrice;
      } else {
        if (!item.isChecked) continue;

        if (item.customPriceWithTax !== undefined) {
          minTotalPrice += item.customPriceWithTax * (item.customQuantity ?? 1);
          maxTotalPrice += item.customPriceWithTax * (item.customQuantity ?? 1);
        } else {
          minTotalPrice += item.priceWithTax ?? 0;
          maxTotalPrice += item.boxPriceWithTax ?? item.priceWithTax ?? 0;
        }
      }
    }
    return {
      minPrice: minTotalPrice,
      maxPrice: maxTotalPrice,
    };
  }

  private getEndSaleReason(
    item: GoodsListItem | GoodsListRawItem,
    now = new Date()
  ): 'END_OF_SALE' | 'END_OF_RESALE' | undefined {
    const endOfResaleDate = item.endOfResaleDate
      ? new Date(item.endOfResaleDate)
      : undefined;
    const confirmedEndOfResaleDate = item.confirmedEndOfResaleDate
      ? new Date(item.confirmedEndOfResaleDate)
      : undefined;

    if (endOfResaleDate || confirmedEndOfResaleDate) {
      if (endOfResaleDate && endOfResaleDate < now) {
        // 再販終了日を過ぎている場合は、再販が終了したとする
        return 'END_OF_RESALE';
      }
      if (confirmedEndOfResaleDate && confirmedEndOfResaleDate < now) {
        // 再販終了確認済みの場合は、再販が終了したとする
        return 'END_OF_RESALE';
      }

      // 再販はまだ終了していない
      return undefined;
    }

    const endOfSaleDate = item.endOfSaleDate
      ? new Date(item.endOfSaleDate)
      : undefined;
    const confirmedEndOfSaleDate = item.confirmedEndOfSaleDate
      ? new Date(item.confirmedEndOfSaleDate)
      : undefined;

    if (!item.endOfSaleDate && !item.confirmedEndOfSaleDate) {
      // 終売日または終売確認日のどちらもない場合は、販売はまだ終了していないとみなす
      return undefined;
    }

    if (endOfSaleDate && endOfSaleDate < now) {
      // 終売日を過ぎている場合は、販売が終了したとする
      return 'END_OF_SALE';
    }
    if (confirmedEndOfSaleDate && confirmedEndOfSaleDate < now) {
      // 終売確認済みの場合は、販売が終了したとする
      return 'END_OF_SALE';
    }

    // 販売はまだ終了していない
    return undefined;
  }

  async setItemStatus(
    itemId: number,
    isChecked: boolean,
    isArchived: boolean,
    paymentYearMonth: string,
    customQuantity: number = 1,
    customPriceWithTax?: number,
    customMemo?: string
  ) {
    await this.init();
    if (!this.storage) {
      throw new Error('Failed to init storage');
      return;
    }

    const prevStatus: GoodsListItemStatus | undefined = await this.storage.get(
      itemId.toString()
    );
    const firstCheckedAt = prevStatus
      ? prevStatus['firstCheckedAt']
      : new Date().toISOString();

    const status: GoodsListItemStatus = {
      isChecked: isChecked,
      isArchived: isArchived,
      paymentYearMonth: paymentYearMonth,
      savedAt: new Date().toISOString(),
      firstCheckedAt: firstCheckedAt,
      customPriceWithTax: customPriceWithTax,
      customQuantity: customQuantity,
      customMemo: customMemo,
    };

    this.storage.set(itemId.toString(), status);
  }

  private async injectStatuses(
    rawItems: GoodsListRawItem[],
    parentItem?: GoodsListItem
  ) {
    let items: GoodsListItem[] = [];

    for (const rawItem of rawItems) {
      if (!rawItem || isNaN(rawItem.id)) {
        continue;
      }

      // 販売ステータスを取得
      let salesStatus = this.getItemSalesStatus(rawItem);
      if (salesStatus === GoodsListItemSalesStatus.UNKNOWN && parentItem) {
        // 子項目 かつ 販売ステータスがなければ、親項目の販売ステータスを引き継ぐ
        salesStatus = parentItem.salesStatus;
      }

      // 販売種別を取得
      let salesType: GoodsListItemSalesType = GoodsListItemSalesType.C;
      switch (rawItem.salesType as any) {
        case 'A':
          salesType = GoodsListItemSalesType.A;
          break;
        case 'A/B':
          salesType = GoodsListItemSalesType.A_B;
          break;
        case 'B':
          salesType = GoodsListItemSalesType.B;
          break;
        case 'C':
          salesType = GoodsListItemSalesType.C;
          break;
      }

      // 推定支払い時期を取得
      let estimatedPaymentYearMonth = this.getEstimatedPaymentYearMonth(
        rawItem,
        salesStatus
      );

      // 項目を生成
      const item: GoodsListItem = {
        ...rawItem,
        salesStatus: salesStatus,
        salesType: salesType,
        estimatedPaymentYearMonth: estimatedPaymentYearMonth,
        isChecked: false,
        isArchived: false,
      };

      // 子項目を処理
      if (item.children) {
        item.children = await this.injectStatuses(item.children, item);
      }

      // 項目を追加
      items.push(item);
    }

    for (const item of items) {
      const status: GoodsListItemStatus | undefined = await this.storage?.get(
        item.id.toString()
      );

      const customPriceWithTax = status
        ? status['customPriceWithTax']
        : undefined;
      item.customPriceWithTax = customPriceWithTax;

      const customQuantity = status ? status['customQuantity'] : undefined;
      item.customQuantity = customQuantity;

      const customMemo = status ? status['customMemo'] : item.note;
      item.customMemo = customMemo;

      const isChecked = status ? status['isChecked'] : false;
      item.isChecked = isChecked;

      const isArchived = status ? status['isArchived'] : false;
      item.isArchived = isArchived;

      const selectedPaymentYearMonth = status ? status['paymentYearMonth'] : '';
      item.selectedPaymentYearMonth = selectedPaymentYearMonth;
    }

    return items;
  }

  private getItemSalesStatus(
    rawItem: GoodsListRawItem,
    now = new Date()
  ): GoodsListItemSalesStatus {
    const endSaleReason = this.getEndSaleReason(rawItem, now);
    if (endSaleReason === 'END_OF_SALE') {
      // 終売とする
      return GoodsListItemSalesStatus.END_OF_SALE;
    } else if (endSaleReason === 'END_OF_RESALE') {
      // 再販終了とする
      return GoodsListItemSalesStatus.END_OF_RESALE;
    }

    // 販売ステータスを初期化
    let salesStatus = GoodsListItemSalesStatus.UNKNOWN;

    // 予約開始日を取得
    const reservationStartDate = rawItem.reservationStartDate;
    if (reservationStartDate) {
      const reservationStartDateDate = new Date(reservationStartDate);
      if (reservationStartDateDate > now) {
        // 予約開始前
        salesStatus = GoodsListItemSalesStatus.BEFORE_RESERVATION;
        return salesStatus;
      } else {
        // 予約受付中
        salesStatus = GoodsListItemSalesStatus.RESERVATION;
      }
    }

    // 予約締切日を取得
    const reservationEndDate = rawItem.reservationEndDate;
    if (reservationEndDate) {
      const reservationEndDateDate = new Date(reservationEndDate);
      if (
        salesStatus === GoodsListItemSalesStatus.RESERVATION &&
        reservationEndDateDate > now
      ) {
        // 予約受付中で確定
        return salesStatus;
      } else if (reservationEndDateDate < now) {
        // 予約終了
        salesStatus = GoodsListItemSalesStatus.END_OF_RESERVATION;
      }
    }

    // 発売日を取得
    const saleDate = rawItem.saleDate;
    if (saleDate) {
      const saleDateDate = new Date(saleDate);
      if (saleDateDate > now) {
        if (salesStatus === GoodsListItemSalesStatus.RESERVATION) {
          // 予約受付中で確定
          return salesStatus;
        } else {
          // 発売前
          salesStatus = GoodsListItemSalesStatus.BEFORE_SALE;
        }
      } else {
        // 販売中
        salesStatus = GoodsListItemSalesStatus.ON_SALE;
      }
    }

    // 終売日を取得
    const endOfSaleDate = rawItem.endOfSaleDate;
    if (endOfSaleDate) {
      const endOfSaleDateDate = new Date(endOfSaleDate);
      if (endOfSaleDateDate < now) {
        // 終売
        salesStatus = GoodsListItemSalesStatus.END_OF_SALE;
      }
    }

    // 再販日を取得
    const resaleDate = rawItem.resaleDate;
    if (resaleDate) {
      const resaleDateDate = new Date(resaleDate);
      if (resaleDateDate > now) {
        // 再販前
        salesStatus = GoodsListItemSalesStatus.BEFORE_RESALE;
      } else {
        // 再販中
        salesStatus = GoodsListItemSalesStatus.ON_RESALE;
      }
    }

    return salesStatus;
  }

  private getEstimatedPaymentYearMonth(
    rawItem: GoodsListRawItem,
    salesStatus: GoodsListItemSalesStatus
  ): string {
    let estimatedPaymentYearMonth: string | undefined =
      rawItem.estimatedPaymentYearMonth;

    if (!estimatedPaymentYearMonth) {
      // 推定支払い時期が不明ならば

      if (salesStatus === undefined) {
        console.warn(
          `[GoodsListService] getEstimatedPaymentYearMonth - salesStatus is undefined`,
          rawItem
        );
      }

      if (
        salesStatus === GoodsListItemSalesStatus.BEFORE_RESERVATION &&
        rawItem.reservationEndDate
      ) {
        // 予約開始前、かつ、予約締切日があるなら、予約締切日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(
          rawItem.reservationEndDate
        );
      } else if (
        salesStatus === GoodsListItemSalesStatus.BEFORE_RESERVATION &&
        rawItem.saleDate
      ) {
        // 予約開始前、かつ、発売日があるなら、発売日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(rawItem.saleDate);
      } else if (
        salesStatus === GoodsListItemSalesStatus.BEFORE_RESERVATION &&
        rawItem.reservationStartDate
      ) {
        // 予約開始前、かつ、予約開始日があるなら、予約開始日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(
          rawItem.reservationStartDate
        );
      } else if (
        salesStatus === GoodsListItemSalesStatus.RESERVATION &&
        rawItem.reservationEndDate
      ) {
        // 予約受付中、かつ、予約締切日があるなら、予約締切日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(
          rawItem.reservationEndDate
        );
      } else if (
        salesStatus === GoodsListItemSalesStatus.RESERVATION &&
        rawItem.saleDate
      ) {
        // 予約受付中、かつ、発売日があるなら、発売日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(rawItem.saleDate);
      } else if (
        salesStatus === GoodsListItemSalesStatus.END_OF_RESERVATION &&
        rawItem.reservationEndDate
      ) {
        // 予約終了、かつ、予約締切日があるなら、予約終了日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(
          rawItem.reservationEndDate
        );
      } else if (
        salesStatus === GoodsListItemSalesStatus.END_OF_RESERVATION &&
        rawItem.saleDate
      ) {
        // 予約終了、かつ、発売日があるなら、発売日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(rawItem.saleDate);
      } else if (
        salesStatus === GoodsListItemSalesStatus.BEFORE_SALE &&
        rawItem.saleDate
      ) {
        // 発売前なら、発売日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(rawItem.saleDate);
      } else if (
        salesStatus === GoodsListItemSalesStatus.END_OF_SALE &&
        rawItem.endOfSaleDate
      ) {
        // 終売、かつ終売日があれば、終売日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(rawItem.endOfSaleDate);
      } else if (
        salesStatus === GoodsListItemSalesStatus.END_OF_SALE &&
        rawItem.confirmedEndOfSaleDate
      ) {
        // 終売、かつ終売確認日があれば、終売日を設定
        estimatedPaymentYearMonth = this.dateToYearMonth(
          rawItem.confirmedEndOfSaleDate
        );
      }
    }

    if (!estimatedPaymentYearMonth) {
      // 推定支払い時期をまだ特定できなかった場合は、現在の年月を設定
      estimatedPaymentYearMonth = this.dateToYearMonth(new Date());
    }

    return estimatedPaymentYearMonth as string;
  }

  private dateToYearMonth(date: string | Date) {
    let dateObj: Date;
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return undefined;
      dateObj = date;
    } else {
      dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return undefined;
    }

    const month = dateObj.getMonth() + 1;
    return `${dateObj.getFullYear()}/${month.toString().padStart(2, '0')}`;
  }
}
