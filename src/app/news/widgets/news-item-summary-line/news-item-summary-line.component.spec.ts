import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsItemSummaryLineComponent } from './news-item-summary-line.component';

describe('NewsItemSummaryLineComponent', () => {
  let component: NewsItemSummaryLineComponent;
  let fixture: ComponentFixture<NewsItemSummaryLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewsItemSummaryLineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsItemSummaryLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
