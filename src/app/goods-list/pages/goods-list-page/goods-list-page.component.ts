import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoodsListItem } from '../../interfaces/goods-list-item';
import { GoodsListService } from '../../services/goods-list.service';
import { GoodsTotalPrice } from '../../interfaces/goods-total-price';

@Component({
  selector: 'app-goods-list-page',
  templateUrl: './goods-list-page.component.html',
  styleUrls: [
    '../../../shared/styles.scss',
    './goods-list-page.component.scss',
  ],
})
export class GoodsListPageComponent implements OnInit {
  // グッズリスト
  items?: GoodsListItem[];

  // アーカイブされたアイテムの数
  numOfArchivedItems = 0;

  // 総額
  isShowingTotalPrice = false;
  totalPrice: GoodsTotalPrice = {
    minPrice: 0,
    maxPrice: 0,
  };

  // アーカイブしたアイテムを表示するか
  isShowingArchivedItems = false;

  constructor(
    public goodsListService: GoodsListService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.load();
  }

  async load() {
    try {
      // グッズリストを取得
      this.items = await this.goodsListService.getGoodsList();
      // 合計額などを計算
      this.calculateStatuses(this.items);
    } catch (e: any) {
      this.snackBar.open(`エラー: ${e.message}`, 'OK');
    }
  }

  async onItemStatusChange(item: GoodsListItem) {
    // 支払い時期の設定
    let paymentYearMonth =
      item.selectedPaymentYearMonth ?? item.estimatedPaymentYearMonth;

    // ステータスを保存
    await this.goodsListService.setItemStatus(
      item.id,
      item.isChecked,
      item.isArchived,
      paymentYearMonth
    );

    if (item.children) {
      for (const child of item.children) {
        await this.goodsListService.setItemStatus(
          child.id,
          child.isChecked,
          false,
          paymentYearMonth
        );
      }
    }

    this.snackBar.open('変更を保存しました', undefined, {
      duration: 1000,
    });

    // 合計額などを再計算
    this.calculateStatuses();
  }

  async calculateStatuses(goodsList?: GoodsListItem[]) {
    if (!goodsList) {
      goodsList = await this.goodsListService.getGoodsList();
    }

    this.totalPrice = this.goodsListService.getTotalPriceByGoodsList(
      goodsList,
      this.isShowingArchivedItems
    );

    this.numOfArchivedItems = goodsList.filter(
      (item) => item.isArchived
    ).length;
  }

  async toggleShowingArchive() {
    this.isShowingArchivedItems = !this.isShowingArchivedItems;

    // 合計額をアップデート
    this.totalPrice = this.goodsListService.getTotalPriceByGoodsList(
      await this.goodsListService.getGoodsList(),
      this.isShowingArchivedItems
    );
  }
}
