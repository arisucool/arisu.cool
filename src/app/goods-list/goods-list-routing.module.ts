import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoodsListPageComponent } from './pages/goods-list-page/goods-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: GoodsListPageComponent,
    title: 'ありすグッズリスト',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoodsListRoutingModule {}
