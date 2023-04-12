import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GoodsListItem } from '../../interfaces/goods-list-item';

@Component({
  selector: 'app-goods-list-item',
  templateUrl: './goods-list-item.component.html',
  styleUrls: ['./goods-list-item.component.scss'],
})
export class GoodsListItemComponent {
  @Input()
  item!: GoodsListItem;

  @Output()
  itemChange: EventEmitter<GoodsListItem> = new EventEmitter();

  isPastDate(dateString: string) {
    const date = new Date(dateString);
    const isPast = date.getTime() < Date.now();
    return isPast;
  }
}
