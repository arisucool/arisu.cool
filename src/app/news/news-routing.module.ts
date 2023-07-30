import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsListPageComponent } from './pages/news-list-page/news-list-page.component';
import { NewsDetailPageComponent } from './pages/news-detail-page/news-detail-page.component';

const routes: Routes = [
  {
    path: '',
    component: NewsListPageComponent,
    title: 'ニュース・タチバナ',
  },
  {
    path: 'articles',
    redirectTo: '',
  },
  {
    path: 'articles/:id',
    component: NewsDetailPageComponent,
    title: 'ニュース・タチバナ',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewsRoutingModule {}
