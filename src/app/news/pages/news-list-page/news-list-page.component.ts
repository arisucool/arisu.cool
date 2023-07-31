import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../news.service';
import { NewsItem } from '../../interfaces/news-item.interface';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-news-list-page',
  templateUrl: './news-list-page.component.html',
  styleUrls: ['../../../shared/styles.scss', './news-list-page.component.scss'],
})
export class NewsListPageComponent implements OnInit {
  newsItems: NewsItem[] = [];
  numOfShowingItems = 5;

  // フィルタ条件
  filterCategoryOrTag?: string;

  // クエリパラメータの変更を監視する Subscription
  private queryParamSubscription?: Subscription;

  constructor(
    private newsService: NewsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.queryParamSubscription = this.activatedRoute.queryParamMap.subscribe(
      (params) => {
        this.filterCategoryOrTag = params.get('categoryOrTag') ?? undefined;
        this.load();
      }
    );
  }

  ngOdDestroy() {
    this.queryParamSubscription?.unsubscribe();
  }

  async load() {
    this.newsItems = await this.newsService.getNewsItems(
      this.filterCategoryOrTag
    );
  }

  async loadMore() {
    this.numOfShowingItems += 20;
  }
}
