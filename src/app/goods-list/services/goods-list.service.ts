import { Injectable } from '@angular/core';
import { kvsIndexedDB, KVSIndexedDB } from '@kvs/indexeddb';
import { AppCacheService } from 'src/app/shared/services/app-cache.service';
import { environment } from 'src/environments/environment';
import {
  GoodsListItem,
  GoodsListItemSalesStatus,
} from '../interfaces/goods-list-item';

@Injectable({
  providedIn: 'root',
})
export class GoodsListService {
  private readonly GOODS_LIST_STORAGE_VERSION = 1;
  private storage?: KVSIndexedDB<any>;

  static readonly GOODS_LIST_JSON_CACHE_EXPIRES = 1000 * 60 * 30; // 30 minutes

  constructor(private appCacheService: AppCacheService) {}

  private async init() {
    if (this.storage) return;

    this.storage = await kvsIndexedDB<any>({
      name: 'arisucoolGoodsListItemStatus',
      version: this.GOODS_LIST_STORAGE_VERSION,
    });
  }

  async getGoodsList() {
    await this.init();

    const cache = await this.appCacheService.getCachedJson(
      'arisuGoodsList',
      GoodsListService.GOODS_LIST_JSON_CACHE_EXPIRES
    );

    if (cache) {
      return await this.injectStatuses(cache);
    }

    const res = await fetch(environment.SHOPPING_LIST_JSON_API_URL);
    if (!res.ok) {
      throw new Error('Failed to fetch goods list');
    }

    const parsed = await res.json();
    this.appCacheService.setCachedJson('arisuGoodsList', parsed);

    return await this.injectStatuses(parsed);
  }

  getTotalPriceByGoodsList(items: GoodsListItem[]) {
    let totalPrice = 0;
    for (const item of items) {
      if (item.children) {
        totalPrice += this.getTotalPriceByGoodsList(item.children);
      } else {
        if (!item.isChecked) continue;
        totalPrice += item.priceWithTax ?? 0;
      }
    }
    return totalPrice;
  }

  private isItemEndOfSale(item: GoodsListItem) {
    if (!item.endOfSaleDate && !item.confirmedEndOfSaleDate) return false;

    const now = new Date();
    const endOfSaleDate = item.endOfSaleDate
      ? new Date(item.endOfSaleDate)
      : undefined;
    const confirmedEndOfSaleDate = item.confirmedEndOfSaleDate
      ? new Date(item.confirmedEndOfSaleDate)
      : undefined;

    if (endOfSaleDate && endOfSaleDate < now) return true;
    if (confirmedEndOfSaleDate && confirmedEndOfSaleDate < now) return true;

    return false;
  }

  async setItemStatus(itemId: number, isChecked: boolean, isArchived: boolean) {
    await this.init();
    if (!this.storage) {
      throw new Error('Failed to init storage');
      return;
    }

    this.storage.set(itemId.toString(), {
      note: undefined,
      isChecked: isChecked,
      isArchived: isArchived,
    });
  }

  getItemSalesStatus(item: GoodsListItem): GoodsListItemSalesStatus {
    let isEndOfSale = this.isItemEndOfSale(item);

    let salesStatus = GoodsListItemSalesStatus.UNKNOWN;

    if (isEndOfSale) {
      // 終売とする
      salesStatus = GoodsListItemSalesStatus.END_OF_SALE;
    } else {
      const now = new Date();

      // 予約開始日を取得
      const reservationStartDate = item.reservationStartDate;
      if (reservationStartDate) {
        const reservationStartDateDate = new Date(reservationStartDate);
        if (reservationStartDateDate > now) {
          // 予約開始前
          salesStatus = GoodsListItemSalesStatus.BEFORE_RESERVATION;
        } else {
          // 予約受付中
          salesStatus = GoodsListItemSalesStatus.RESERVATION;
        }
      }

      // 予約締切日を取得
      const reservationEndDate = item.reservationEndDate;
      if (reservationEndDate) {
        const reservationEndDateDate = new Date(reservationEndDate);
        if (reservationEndDateDate < now) {
          // 予約終了
          salesStatus = GoodsListItemSalesStatus.END_OF_RESERVATION;
        }
      }

      // 発売日を取得
      const saleDate = item.saleDate;
      if (saleDate) {
        const saleDateDate = new Date(saleDate);
        if (saleDateDate > now) {
          // 発売前
          salesStatus = GoodsListItemSalesStatus.BEFORE_SALE;
        } else {
          // 販売中
          salesStatus = GoodsListItemSalesStatus.ON_SALE;
        }
      }

      // 終売日を取得
      const endOfSaleDate = item.endOfSaleDate;
      if (endOfSaleDate) {
        const endOfSaleDateDate = new Date(endOfSaleDate);
        if (endOfSaleDateDate < now) {
          // 終売
          salesStatus = GoodsListItemSalesStatus.END_OF_SALE;
        }
      }
    }

    return salesStatus;
  }

  private async injectStatuses(rawItems: GoodsListItem[]) {
    let items: GoodsListItem[] = [];

    for (const rawItem of rawItems) {
      if (!rawItem || isNaN(rawItem.id)) {
        continue;
      }

      // 子項目を処理
      if (rawItem.children) {
        rawItem.children = await this.injectStatuses(rawItem.children);
      }

      // 項目を追加
      items.push({
        ...rawItem,
        salesStatus: this.getItemSalesStatus(rawItem),
        isChecked: false,
        isArchived: false,
      });
    }

    for (const item of items) {
      const status = await this.storage?.get(item.id.toString());

      const isChecked = status ? status['isChecked'] : false;
      item.isChecked = isChecked;

      const isArchived = status ? status['isArchived'] : false;
      item.isArchived = isArchived;
    }

    // 予約開始日順にソート
    items = items.sort((a, b) => {
      if (a.reservationStartDate === undefined) return 1;
      if (b.reservationStartDate === undefined) return -1;
      return (
        new Date(b.reservationStartDate).getTime() -
        new Date(a.reservationStartDate).getTime()
      );
    });

    // 発売日順にソート
    items = items.sort((a, b) => {
      if (a.saleDate === undefined) return 1;
      if (b.saleDate === undefined) return -1;
      return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();
    });

    return items;
  }

  static getValueByMatchedKey(jsonObject: any, key: string) {
    const expectedKey = key.toLowerCase();

    const keys = Object.keys(jsonObject);
    for (const k of keys) {
      if (k.toLowerCase().indexOf(expectedKey) === 0) {
        let v = jsonObject[k];
        if (v === undefined || v.trim() === '' || v === '-') {
          return undefined;
        }
        return jsonObject[k];
      }
    }
    return undefined;
  }
}