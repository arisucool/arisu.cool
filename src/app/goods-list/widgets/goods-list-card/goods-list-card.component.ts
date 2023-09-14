import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  GoodsListItem,
  GoodsListItemSalesStatus,
} from '../../interfaces/goods-list-item';
import { MatDialog } from '@angular/material/dialog';
import { GoodsListItemEditDialogComponent } from '../goods-list-item-edit-dialog/goods-list-item-edit-dialog.component';
import { lastValueFrom } from 'rxjs';

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

  // 小計
  subtotalPrice = {
    min: 0,
    max: 0,
  };

  // 支払い時期
  paymentYearMonths: {
    yearMonth: string;
    label: string;
    subLabel?: string;
  }[] = [];

  constructor(private matDialog: MatDialog) {}

  ngOnInit() {
    this.init();
  }

  onChange() {
    // 親コンポーネントへ変更を通知
    this.itemChange.emit(this.item);

    // 小計を計算
    this.updateSubtotalPrice();
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

  async openEditDialog(item: GoodsListItem, isChild = false) {
    const item_ = { ...item };

    if (item_.customQuantity === undefined) {
      item_.customQuantity = 1;
    }
    if (item_.customPriceWithTax === undefined) {
      item_.customPriceWithTax = item_.priceWithTax;
    }

    const dialogRef = this.matDialog.open(GoodsListItemEditDialogComponent, {
      data: {
        item: item_,
      },
    });
    const result = await lastValueFrom(dialogRef.afterClosed());
    if (result && result === 'OK') {
      if (isChild && this.item.children) {
        this.item.children = this.item.children.map((child) => {
          if (child.id === item.id) {
            return item_;
          }
          return child;
        });
        this.itemChange.emit(this.item);
      } else {
        if (item_.customQuantity !== undefined) {
          this.item.customQuantity = item_.customQuantity;
        }
        if (item_.customPriceWithTax !== undefined) {
          this.item.customPriceWithTax = item_.customPriceWithTax;
        }
        this.itemChange.emit(this.item);
      }
    }
  }

  private init() {
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
    for (let i = -5; i <= 5; i++) {
      const year = criteriaYear + Math.floor((criteriaMonth + i - 1) / 12);
      const month = ((criteriaMonth + i - 1) % 12) + 1;

      // ラベルを設定
      let subLabel: string | undefined;
      if (this.item.reservationEndDate) {
        const date_ = new Date(this.item.reservationEndDate);
        const year_ = date_.getFullYear();
        const month_ = date_.getMonth() + 1;
        if (year == year_ && month == month_) {
          subLabel = ' (予約締切)';
        }
      }
      if (this.item.saleDate) {
        const saleDate = new Date(this.item.saleDate);
        const saleYear = saleDate.getFullYear();
        const saleMonth = saleDate.getMonth() + 1;
        if (year == saleYear && month == saleMonth) {
          subLabel = ' (発売)';
        }
      }

      // 選択肢へ追加
      this.paymentYearMonths.push({
        yearMonth: `${year}/${month.toString().padStart(2, '0')}`,
        label: `${year}/${month.toString().padStart(2, '0')}`,
        subLabel: subLabel,
      });
    }

    // 小計を計算
    this.updateSubtotalPrice();
  }

  private updateSubtotalPrice() {
    let subtotalMin = 0,
      subtotalMax = 0;

    // 小計を計算 - 親アイテム
    if (this.item.isChecked) {
      if (this.item.customPriceWithTax && this.item.customQuantity) {
        subtotalMin += this.item.customPriceWithTax * this.item.customQuantity;
        subtotalMax += this.item.customPriceWithTax * this.item.customQuantity;
      } else if (this.item.priceWithTax) {
        if (this.item.boxPriceWithTax) {
          subtotalMin += this.item.priceWithTax;
          subtotalMax += this.item.boxPriceWithTax;
        } else {
          subtotalMin += this.item.priceWithTax;
          subtotalMax += this.item.priceWithTax;
        }
      }
    }

    // 小計を計算 - 子アイテム
    if (this.item.children) {
      for (const child of this.item.children) {
        if (!child.isChecked) {
          continue;
        }

        if (child.customPriceWithTax && child.customQuantity) {
          subtotalMin += child.customPriceWithTax * child.customQuantity;
          subtotalMax += child.customPriceWithTax * child.customQuantity;
        } else if (child.priceWithTax) {
          if (child.boxPriceWithTax) {
            subtotalMin += child.priceWithTax;
            subtotalMax += child.boxPriceWithTax;
          } else {
            subtotalMin += child.priceWithTax;
            subtotalMax += child.priceWithTax;
          }
        }
      }
    }

    // 小計を設定
    this.subtotalPrice.min = subtotalMin;
    this.subtotalPrice.max = subtotalMax;
  }
}
