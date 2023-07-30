import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsListPageComponent } from './pages/news-list-page/news-list-page.component';
import { NewsRoutingModule } from './news-routing.module';
import { SharedModule } from '../shared/shared.module';
import { NewsDetailPageComponent } from './pages/news-detail-page/news-detail-page.component';
import { NgxTwitterWidgetsModule } from 'ngx-twitter-widgets';

@NgModule({
  declarations: [NewsListPageComponent, NewsDetailPageComponent],
  imports: [
    CommonModule,
    NewsRoutingModule,
    SharedModule,
    NgxTwitterWidgetsModule,
  ],
})
export class NewsModule {}
