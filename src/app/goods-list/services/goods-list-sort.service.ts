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

  sortItems(
    items: GoodsListItem[],
    now = new Date(),
    preventFallingOff = true
  ) {
    let srcItems = items.concat();

    // グループを取得 - 1. 入手できなくなる可能性があるアイテム
    const mayEndSaleItems = this.getGroupItemsOfMayEndSale(srcItems, now);

    // グループを取得 - 2. まだ入手することができないアイテム
    const notYetAvailableItems = this.getGroupItemsOfNotYetAvailable(srcItems);

    // グループを取得 - 3. いつでも入手できるアイテム
    const highAvailabilityItems =
      this.getGroupItemsOfHighAvailability(srcItems);

    // グループを取得 - 4. もはや入手できないアイテム
    const endOfSaleItems = this.getGroupItemsOfEndOfSale(srcItems);

    // 各グループを並べる
    let groups = [
      mayEndSaleItems,
      notYetAvailableItems,
      highAvailabilityItems,
      endOfSaleItems,
    ];

    // いずれのグループにも属さないアイテムを抽出し、先頭に追加
    // (ただし、そのようなアイテムは、本来は存在しないはず)
    if (preventFallingOff) {
      const otherItems = items.filter((item) => {
        // いずれのグループにも属さないアイテムを抽出
        let isOtherItem = true;
        for (let group of groups) {
          if (group.find((groupItem) => groupItem.id === item.id)) {
            isOtherItem = false;
            break;
          }
        }

        return isOtherItem;
      });
      groups.unshift(otherItems);
    }

    // 結果の配列を初期化し、各グループを順番に展開
    let sortedItems: GoodsListItem[] = [];
    for (let group of groups) {
      sortedItems = sortedItems.concat(group);
    }

    return sortedItems;
  }

  /**
   * グループの取得 - 入手できなくなる可能性があるアイテム
   */
  private getGroupItemsOfMayEndSale(srcItems: GoodsListItem[], now: Date) {
    let items: GoodsListSortItem[] = srcItems
      // アイテムを抽出
      .filter((item) => {
        // 予約受付中のアイテム
        if (item.salesStatus === GoodsListItemSalesStatus.RESERVATION) {
          return true;
        }

        // 販売中または再販中、かつ、市場に流通していない (いつでもどこでも手に入るわけではない) アイテム
        if (
          (item.salesStatus === GoodsListItemSalesStatus.ON_SALE ||
            item.salesStatus === GoodsListItemSalesStatus.ON_RESALE) &&
          item.salesType !== GoodsListItemSalesType.C
        ) {
          return true;
        }

        // その他のアイテムは除外
        return false;
      })
      // ソート基準の日付を取得
      .map((item) => {
        let sortNumber: number = Number.MAX_VALUE;

        if (item.salesStatus === GoodsListItemSalesStatus.RESERVATION) {
          // 予約受付中ならば
          if (
            item.salesType === GoodsListItemSalesType.A ||
            item.salesType === GoodsListItemSalesType.A_B
          ) {
            // 受注生産、または予約時受注生産ならば、予約締切日または発売日を取得
            const date = new Date(
              item.reservationEndDate ?? item.saleDate ?? 0
            ).getTime();
            // 基準日との差を取得
            sortNumber = date - now.getTime();
          } else if (item.salesType === GoodsListItemSalesType.B) {
            // 数量限定ならば、予約開始日を取得
            const date = new Date(item.reservationStartDate ?? 0).getTime();
            // 基準日との差を取得
            sortNumber = date - now.getTime();
          } else if (item.salesType === GoodsListItemSalesType.C) {
            // いつでも入手できるアイテムならば、予約開始日を取得
            const date = new Date(
              item.reservationStartDate ?? item.saleDate ?? 0
            ).getTime();
            // 基準日との差を取得
            sortNumber = date - now.getTime();
          }
        } else if (item.salesStatus === GoodsListItemSalesStatus.ON_SALE) {
          // 販売中ならば
          if (item.salesType === GoodsListItemSalesType.A) {
            // 受注生産ならば、終売日を取得
            const date = new Date(item.endOfSaleDate ?? 0).getTime();
            // 基準日との差を取得
            sortNumber = date - now.getTime();
          } else {
            // それ以外ならば、発売日を取得
            const date = new Date(item.saleDate ?? 0).getTime();
            // 基準日との差を取得
            sortNumber = date - now.getTime();
          }
        } else if (item.salesStatus === GoodsListItemSalesStatus.ON_RESALE) {
          // 再販中ならば
          if (item.salesType === GoodsListItemSalesType.A) {
            // 受注生産ならば、再販終了日を取得
            const date = new Date(item.endOfResaleDate ?? 0).getTime();
            // 基準日との差を取得
            sortNumber = date - now.getTime();
          } else {
            // それ以外ならば、再販日を取得
            const date = new Date(item.resaleDate ?? 0).getTime();
            // 基準日との差を取得
            sortNumber = date - now.getTime();
          }
        }

        // ピックアップならば
        if (item.pickedUpReason) {
          sortNumber *= 0.1;
        }

        return {
          ...item,
          sortNumber: sortNumber,
        };
      });

    // sortNumber を用いて昇順にソート
    items = items.map((item) => {
      item.sortNumber = Math.abs(item.sortNumber);
      return item;
    });
    items = items.sort((a, b) => a.sortNumber - b.sortNumber);

    // sortNumber プロパティを削除して返す
    return items.map((item_) => {
      const { sortNumber, ...item } = item_;
      return item;
    });
  }

  /**
   * グループの取得 - まだ入手することができないアイテム
   */
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

  /**
   * グループの取得 - いつでも入手できるアイテム
   */
  private getGroupItemsOfHighAvailability(srcItems: GoodsListItem[]) {
    let items: GoodsListSortItem[] = srcItems
      // 販売中または再販中かつ、市場に流通している (いつでもどこでも買いやすい) アイテムを抽出
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

  /**
   * グループの取得 - もはや入手できないアイテム
   */
  private getGroupItemsOfEndOfSale(srcItems: GoodsListItem[]): GoodsListItem[] {
    let items: GoodsListSortItem[] = srcItems
      // 終売/終売確認済み/予約締切済み/不明のアイテムを抽出
      .filter((item) => {
        return (
          this.isEndSale(item) ||
          item.salesStatus === GoodsListItemSalesStatus.UNKNOWN
        );
      })
      // 終売日/終売確認日/再販終了日/再販終了確認日/予約締切日のいずれか最も新しい日付を取得
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
        if (item.reservationEndDate) {
          dates.push(new Date(item.reservationEndDate).getTime());
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
   * 現在もしくは近い間に注文できないアイテムかどうかを判定
   */
  private isEndSale(item: GoodsListItem) {
    switch (item.salesStatus) {
      case GoodsListItemSalesStatus.END_OF_SALE:
      case GoodsListItemSalesStatus.END_OF_RESALE:
      case GoodsListItemSalesStatus.END_OF_RESERVATION:
        return true;
    }
    return false;
  }
}
