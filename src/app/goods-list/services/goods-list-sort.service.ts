import { Injectable } from '@angular/core';
import {
  GoodsListItem,
  GoodsListItemSalesStatus,
  GoodsListItemSalesType,
} from '../interfaces/goods-list-item';

interface GoodsListSortItem extends GoodsListItem {
  sortNumber: number;
}

@Injectable({
  providedIn: 'root',
})
export class GoodsListSortService {
  constructor() {}

  sortItems(items: GoodsListItem[], now = new Date()) {
    let srcItems = items.concat();

    // グループを処理 - 1. 入手できなくなる可能性があるアイテム

    // グループを処理 - 2. まだ入手することができないアイテム
    const notYetAvailableItems = this.getGroupItemsOfNotYetAvailable(srcItems);

    // グループを処理 - 3. いつでも入手できるアイテム
    const highAvailabilityItems =
      this.getGroupItemsOfHighAvailability(srcItems);

    // グループを処理 - 4. もはや入手できないアイテム
    const endOfSaleItems = this.getGroupItemsOfEndOfSale(srcItems);

    // 各グループを並べる
    let groups = [notYetAvailableItems, highAvailabilityItems, endOfSaleItems];

    // 結果の配列を初期化し、各グループを順番に展開
    let sortedItems: GoodsListItem[] = [];
    for (let group of groups) {
      sortedItems = sortedItems.concat(group);
    }

    return sortedItems;
  }

  private getGroupItemsOfNotYetAvailable(srcItems: GoodsListItem[]) {
    let items: GoodsListSortItem[] = srcItems
      // まだ入手することができないアイテムを抽出
      .filter((item) => {
        return (
          item.salesStatus === GoodsListItemSalesStatus.BEFORE_RESERVATION ||
          item.salesStatus === GoodsListItemSalesStatus.BEFORE_SALE ||
          item.salesStatus === GoodsListItemSalesStatus.BEFORE_RESALE
        );
      })
      // 予約開始日/発売日/再販日のいずれか最も新しい日付を取得
      .map((item) => {
        let dates: number[] = [];
        if (item.reservationStartDate) {
          dates.push(new Date(item.reservationStartDate).getTime());
        }
        if (item.saleDate) {
          dates.push(new Date(item.saleDate).getTime());
        }
        if (item.resaleDate) {
          dates.push(new Date(item.resaleDate).getTime());
        }
        const latestDate = Math.max(...dates);

        return {
          ...item,
          sortNumber: latestDate,
        };
      });

    // 数量限定かそうでないかで分けて、sortNumber を用いて昇順にソート
    const limitedItems = items
      .filter(
        (item) =>
          item.salesType === GoodsListItemSalesType.B ||
          item.salesType === GoodsListItemSalesType.A_B
      )
      .sort((a, b) => a.sortNumber - b.sortNumber);
    const otherItems = items
      .filter(
        (item) =>
          item.salesType !== GoodsListItemSalesType.B &&
          item.salesType !== GoodsListItemSalesType.A_B
      )
      .sort((a, b) => a.sortNumber - b.sortNumber);

    // 数量限定を優先して並べる
    items = [...limitedItems, ...otherItems];

    // sortNumber プロパティを削除して返す
    return items.map((item_) => {
      const { sortNumber, ...item } = item_;
      return item;
    });
  }

  private getGroupItemsOfHighAvailability(srcItems: GoodsListItem[]) {
    let items: GoodsListSortItem[] = srcItems
      // 販売中または再販中かつ、市場に流通しているアイテムを抽出
      .filter((item) => {
        return (
          (item.salesStatus === GoodsListItemSalesStatus.ON_SALE ||
            item.salesStatus === GoodsListItemSalesStatus.ON_RESALE) &&
          item.salesType === GoodsListItemSalesType.C
        );
      })
      // 発売日または再販開始日のいずれか最も新しい日付を取得
      .map((item) => {
        let dates: number[] = [];
        if (item.saleDate) {
          dates.push(new Date(item.saleDate).getTime());
        }
        if (item.resaleDate) {
          dates.push(new Date(item.resaleDate).getTime());
        }
        const latestDate = Math.max(...dates);

        return {
          ...item,
          sortNumber: latestDate,
        };
      });

    // sortNumber を用いて降順にソート
    items = items.sort((a, b) => b.sortNumber - a.sortNumber);

    // sortNumber プロパティを削除して返す
    return items.map((item_) => {
      const { sortNumber, ...item } = item_;
      return item;
    });
  }

  private getGroupItemsOfEndOfSale(srcItems: GoodsListItem[]): GoodsListItem[] {
    let items: GoodsListSortItem[] = srcItems
      // 終売または終売確認済みのアイテムを抽出
      .filter((item) => {
        return this.isEndSale(item);
      })
      // 終売日/終売確認日/再販終了日/再販終了確認日のいずれか最も新しい日付を取得
      .map((item) => {
        let dates: number[] = [];
        if (item.endOfSaleDate) {
          dates.push(new Date(item.endOfSaleDate).getTime());
        }
        if (item.confirmedEndOfSaleDate) {
          dates.push(new Date(item.confirmedEndOfSaleDate).getTime());
        }
        if (item.endOfResaleDate) {
          dates.push(new Date(item.endOfResaleDate).getTime());
        }
        if (item.confirmedEndOfResaleDate) {
          dates.push(new Date(item.confirmedEndOfResaleDate).getTime());
        }
        const latestDate = Math.max(...dates);

        return {
          ...item,
          sortNumber: latestDate,
        };
      });

    // sortNumber を用いて降順にソート
    items = items.sort((a, b) => b.sortNumber - a.sortNumber);

    // sortNumber プロパティを削除して返す
    return items.map((item_) => {
      const { sortNumber, ...item } = item_;
      return item;
    });
  }

  /**
   * もはや入手できないアイテムか否かを返す
   */
  private isEndSale(item: GoodsListItem) {
    switch (item.salesStatus) {
      case GoodsListItemSalesStatus.END_OF_SALE:
      case GoodsListItemSalesStatus.END_OF_RESALE:
        return true;
    }
    return false;
  }
}
