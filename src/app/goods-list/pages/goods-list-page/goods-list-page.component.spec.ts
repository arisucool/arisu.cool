import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsListPageComponent } from './goods-list-page.component';

describe('GoodsListPageComponent', () => {
  let component: GoodsListPageComponent;
  let fixture: ComponentFixture<GoodsListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoodsListPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoodsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
