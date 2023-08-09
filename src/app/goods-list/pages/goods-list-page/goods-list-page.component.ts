import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoodsListItem } from '../../interfaces/goods-list-item';
import { GoodsListService } from '../../services/goods-list.service';

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
  public items?: GoodsListItem[];

  // 総額
  public isShowingTotalPrice = false;
  public totalPrice = 0;

  // アーカイブしたアイテムを表示するか
  public isShowingArchivedItems = false;

  constructor(
    public goodsListService: GoodsListService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.load();
  }

  async load() {
    try {
      this.items = await this.goodsListService.getGoodsList();
      this.totalPrice = this.goodsListService.getTotalPriceByGoodsList(
        this.items
      );
    } catch (e: any) {
      this.snackBar.open(`エラー: ${e.message}`, 'OK');
    }
  }

  async onItemStatusChange(item: GoodsListItem) {
    await this.goodsListService.setItemStatus(
      item.id,
      item.isChecked,
      item.isArchived
    );
    if (item.children) {
      for (const child of item.children) {
        await this.goodsListService.setItemStatus(
          child.id,
          child.isChecked,
          false
        );
      }
    }

    this.totalPrice = this.goodsListService.getTotalPriceByGoodsList(
      await this.goodsListService.getGoodsList()
    );

    this.snackBar.open('変更を保存しました', undefined, {
      duration: 1500,
    });
  }
}
