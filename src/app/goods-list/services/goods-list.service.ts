import { Injectable } from '@angular/core';
import { kvsIndexedDB, KVSIndexedDB } from '@kvs/indexeddb';
import { AppCacheService } from 'src/app/shared/services/app-cache.service';
import { environment } from 'src/environments/environment';
import { GoodsListItem } from '../interfaces/goods-list-item';

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
      let items = await this.injectStatuses(cache);
      return items;
    }

    const res = await fetch(environment.SHOPPING_LIST_JSON_API_URL);
    if (!res.ok) {
      throw new Error('Failed to fetch goods list');
    }

    const parsed = await res.json();

    let items: GoodsListItem[] = [];
    for (const item of parsed) {
      items.push({
        id: GoodsListService.getValueByMatchedKey(item, 'id'),
        category: GoodsListService.getValueByMatchedKey(item, 'カテゴリ'),
        maker: GoodsListService.getValueByMatchedKey(item, 'メーカー'),
        reservationStartDate: GoodsListService.getValueByMatchedKey(
          item,
          '予約開始日'
        ),
        name: GoodsListService.getValueByMatchedKey(item, '商品名'),
        isArisuAlone: GoodsListService.getValueByMatchedKey(
          item,
          'ありす単独か'
        ),
        releaseDate: GoodsListService.getValueByMatchedKey(item, '発売日'),
        priceWithTax: GoodsListService.getValueByMatchedKey(item, '税込価格'),
        place: GoodsListService.getValueByMatchedKey(item, '場所'),
        url: GoodsListService.getValueByMatchedKey(item, 'URL'),
        isDone: false,
      });
    }
    this.appCacheService.setCachedJson('arisuGoodsList', items);

    items = await this.injectStatuses(items);
    return items;
  }

  async setItemStatus(itemId: number, isDone: boolean) {
    await this.init();
    if (!this.storage) {
      throw new Error('Failed to init storage');
      return;
    }

    this.storage.set(itemId.toString(), {
      note: undefined,
      isDone: isDone,
    });
  }

  private async injectStatuses(items: GoodsListItem[]) {
    for (const item of items) {
      const status = await this.storage?.get(item.id.toString());
      console.log(status);
      const isDone = status ? status['isDone'] : false;
      item.isDone = isDone;
    }
    return items;
  }

  static getValueByMatchedKey(jsonObject: any, key: string) {
    const expectedKey = key.toLowerCase();

    const keys = Object.keys(jsonObject);
    for (const k of keys) {
      if (k.toLowerCase().indexOf(expectedKey) !== -1) {
        console.log(key, k);
        return jsonObject[k];
      }
    }
    return undefined;
  }
}
