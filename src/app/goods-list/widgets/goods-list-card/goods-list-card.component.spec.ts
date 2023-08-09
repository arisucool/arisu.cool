import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsListCardComponent } from './goods-list-card.component';

describe('GoodsListCardComponent', () => {
  let component: GoodsListCardComponent;
  let fixture: ComponentFixture<GoodsListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsListCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsListCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
