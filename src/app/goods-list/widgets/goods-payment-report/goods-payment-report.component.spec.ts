import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsPaymentReportComponent } from './goods-payment-report.component';

describe('GoodsPaymentReportComponent', () => {
  let component: GoodsPaymentReportComponent;
  let fixture: ComponentFixture<GoodsPaymentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsPaymentReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsPaymentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
