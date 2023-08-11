import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-goods-payment-report-dialog',
  templateUrl: './goods-payment-report-dialog.component.html',
  styleUrls: ['./goods-payment-report-dialog.component.scss'],
})
export class GoodsPaymentReportDialogComponent {
  isIncludeArchiveItems = false;

  constructor(
    public dialogRef: MatDialogRef<GoodsPaymentReportDialogComponent>
  ) {}
}
