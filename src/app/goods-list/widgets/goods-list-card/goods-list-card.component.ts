import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  GoodsListItem,
  GoodsListItemSalesStatus,
} from '../../interfaces/goods-list-item';

@Component({
  selector: 'app-goods-list-card',
  templateUrl: './goods-list-card.component.html',
  styleUrls: ['./goods-list-card.component.scss'],
})
export class GoodsListCardComponent implements OnInit {
  @Input()
  item!: GoodsListItem;

  @Output()
  itemChange: EventEmitter<GoodsListItem> = new EventEmitter();

  // 販売ステータス
  salesStatus: typeof GoodsListItemSalesStatus = GoodsListItemSalesStatus;

  // 支払い時期
  paymentYearMonths: {
    yearMonth: string;
    label: string;
  }[] = [];

  ngOnInit() {
    this.init();
  }

  init() {
    this.paymentYearMonths = [];

    let criteriaYearMonth = new Date().toISOString().slice(0, 7);
    if (this.item.selectedPaymentYearMonth) {
      criteriaYearMonth = this.item.selectedPaymentYearMonth;
    } else if (this.item.estimatedPaymentYearMonth) {
      criteriaYearMonth = this.item.estimatedPaymentYearMonth;
    }

    // 基準となる年月前後の年月を取得
    const criteriaYear = Number(criteriaYearMonth.slice(0, 4));
    const criteriaMonth = Number(criteriaYearMonth.slice(5, 7));
    for (let i = -3; i <= 6; i++) {
      const year = criteriaYear + Math.floor((criteriaMonth + i - 1) / 12);
      const month = ((criteriaMonth + i - 1) % 12) + 1;
      this.paymentYearMonths.push({
        yearMonth: `${year}/${month.toString().padStart(2, '0')}`,
        label: `${year}/${month.toString().padStart(2, '0')}`,
      });
    }
  }

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
