import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoodsListItemEditDialogComponent } from './goods-list-item-edit-dialog.component';

describe('GoodsListItemEditDialogComponent', () => {
  let component: GoodsListItemEditDialogComponent;
  let fixture: ComponentFixture<GoodsListItemEditDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GoodsListItemEditDialogComponent]
    });
    fixture = TestBed.createComponent(GoodsListItemEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
