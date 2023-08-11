import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoodsListRoutingModule } from './goods-list-routing.module';
import { GoodsListPageComponent } from './pages/goods-list-page/goods-list-page.component';
import { SharedModule } from '../shared/shared.module';
import { GoodsListCardComponent } from './widgets/goods-list-card/goods-list-card.component';
import { GoodsPaymentReportComponent } from './widgets/goods-payment-report/goods-payment-report.component';
import { GoodsPaymentReportDialogComponent } from './widgets/goods-payment-report-dialog/goods-payment-report-dialog.component';

@NgModule({
  declarations: [GoodsListPageComponent, GoodsListCardComponent, GoodsPaymentReportComponent, GoodsPaymentReportDialogComponent],
  imports: [CommonModule, GoodsListRoutingModule, SharedModule],
})
export class GoodsListModule {}
