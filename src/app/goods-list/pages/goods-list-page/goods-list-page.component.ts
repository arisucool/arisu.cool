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
  public items?: {
    undone: GoodsListItem[];
    done: GoodsListItem[];
  } = undefined;

  constructor(
    public goodsListService: GoodsListService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.load();
  }

  async load() {
    try {
      const items = await this.goodsListService.getGoodsList();
      this.items = {
        undone: items.filter((item) => !item.isDone),
        done: items.filter((item) => item.isDone),
      };
    } catch (e: any) {
      this.snackBar.open(`エラー: ${e.message}`, 'OK');
    }
  }

  async onItemStatusChange(item: GoodsListItem) {
    await this.goodsListService.setItemStatus(item.id, item.isDone);
    this.load();
  }
}
