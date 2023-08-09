import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoodsListRoutingModule } from './goods-list-routing.module';
import { GoodsListPageComponent } from './pages/goods-list-page/goods-list-page.component';
import { SharedModule } from '../shared/shared.module';
import { GoodsListCardComponent } from './widgets/goods-list-card/goods-list-card.component';

@NgModule({
  declarations: [GoodsListPageComponent, GoodsListCardComponent],
  imports: [CommonModule, GoodsListRoutingModule, SharedModule],
})
export class GoodsListModule {}
