import { Component, Input, OnInit } from '@angular/core';
import { GoodsListService } from '../../services/goods-list.service';
import { GoodsPaymentReportItem } from '../../interfaces/goods-payment-report-item';
import { GoodsListItem } from '../../interfaces/goods-list-item';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-goods-payment-report',
  templateUrl: './goods-payment-report.component.html',
  styleUrls: ['./goods-payment-report.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class GoodsPaymentReportComponent implements OnInit {
  constructor(public goodsListService: GoodsListService) {}

  // レポート
  paymentReports: GoodsPaymentReportItem[] = [];

  // アーカイブしたアイテムも含めるか
  @Input()
  isIncludeArchiveItems = false;

  // 表
  displayedColumns = ['yearMonth', 'price', 'numOfGoods'];
  displayedColumnsExpand = [...this.displayedColumns, 'expand'];
  expandedElement: GoodsPaymentReportItem | null = null;

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const goodsList = await this.goodsListService.getGoodsList();

    // チェックを入れたアイテムのみに絞り込む
    let checkedItems = goodsList.filter((item) => item.isChecked);

    // アーカイブしたアイテムをフィルタ
    if (!this.isIncludeArchiveItems) {
      checkedItems = checkedItems.filter((item) => !item.isArchived);
    }

    // 年月ごとにグループ化
    const groupedByYearMonth: { [key: string]: GoodsListItem[] } = {};
    for (const item of checkedItems) {
      const yearMonth =
        item.selectedPaymentYearMonth ?? item.estimatedPaymentYearMonth;
      if (!groupedByYearMonth[yearMonth]) {
        groupedByYearMonth[yearMonth] = [];
      }
      groupedByYearMonth[yearMonth].push(item);
    }

    // 年月をソート
    let sortedYearMonths = Object.keys(groupedByYearMonth).sort().reverse();

    // 年月ごとの合計金額を計算
    this.paymentReports = [];
    for (const yearMonth of sortedYearMonths) {
      const items = groupedByYearMonth[yearMonth];
      const totalPrice = this.goodsListService.getTotalPriceByGoodsList(
        items,
        this.isIncludeArchiveItems
      );
      this.paymentReports.push({
        yearMonth: yearMonth,
        minPrice: totalPrice.minPrice,
        maxPrice: totalPrice.maxPrice,
        goods: items,
        numOfGoods: items.length,
      });
    }
  }

  ngOnChanges() {
    this.load();
  }
}
