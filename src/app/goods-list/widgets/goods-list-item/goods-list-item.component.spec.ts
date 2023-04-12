import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsListItemComponent } from './goods-list-item.component';

describe('GoodsListItemComponent', () => {
  let component: GoodsListItemComponent;
  let fixture: ComponentFixture<GoodsListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsListItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
