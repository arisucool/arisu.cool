import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GoodsListItem } from '../../interfaces/goods-list-item';

export interface GoodsListItemEditDialogData {
  item: GoodsListItem;
}

@Component({
  selector: 'app-goods-list-item-edit-dialog',
  templateUrl: './goods-list-item-edit-dialog.component.html',
  styleUrls: ['./goods-list-item-edit-dialog.component.scss'],
})
export class GoodsListItemEditDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<GoodsListItemEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GoodsListItemEditDialogData
  ) {}

  ngOnInit() {}
}
