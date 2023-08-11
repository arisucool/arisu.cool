import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsPaymentReportDialogComponent } from './goods-payment-report-dialog.component';

describe('GoodsPaymentReportDialogComponent', () => {
  let component: GoodsPaymentReportDialogComponent;
  let fixture: ComponentFixture<GoodsPaymentReportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsPaymentReportDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsPaymentReportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
