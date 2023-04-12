import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoodsListRoutingModule } from './goods-list-routing.module';
import { GoodsListPageComponent } from './pages/goods-list-page/goods-list-page.component';
import { SharedModule } from '../shared/shared.module';
import { GoodsListItemComponent } from './widgets/goods-list-item/goods-list-item.component';

@NgModule({
  declarations: [GoodsListPageComponent, GoodsListItemComponent],
  imports: [CommonModule, GoodsListRoutingModule, SharedModule],
})
export class GoodsListModule {}
