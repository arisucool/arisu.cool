import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  GoodsListItem,
  GoodsListItemSalesStatus,
} from '../../interfaces/goods-list-item';

@Component({
  selector: 'app-goods-list-card',
  templateUrl: './goods-list-card.component.html',
  styleUrls: ['./goods-list-card.component.scss'],
})
export class GoodsListCardComponent {
  @Input()
  item!: GoodsListItem;

  @Output()
  itemChange: EventEmitter<GoodsListItem> = new EventEmitter();

  public salesStatus: typeof GoodsListItemSalesStatus =
    GoodsListItemSalesStatus;

  toggleAllChecks() {
    const isAllChecked = this.isAllChecked();
    this.item.isChecked = !isAllChecked;

    if (this.item.children) {
      for (const child of this.item.children) {
        child.isChecked = !isAllChecked;
      }
    }
  }

  isAllChecked() {
    if (!this.item.children) {
      return this.item.isChecked;
    }
    return this.item.children.every((item) => item.isChecked);
  }

  isPastDate(dateString: string) {
    const date = new Date(dateString);
    const isPast = date.getTime() < Date.now();
    return isPast;
  }
}
