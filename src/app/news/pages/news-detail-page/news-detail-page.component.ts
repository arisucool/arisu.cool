import { Component, OnInit } from '@angular/core';
import { NewsItem } from '../../interfaces/news-item.interface';
import { NewsService } from '../../news.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-news-detail-page',
  templateUrl: './news-detail-page.component.html',
  styleUrls: [
    '../../../shared/styles.scss',
    './news-detail-page.component.scss',
  ],
})
export class NewsDetailPageComponent implements OnInit {
  id?: number;
  newsItem?: NewsItem;

  private urlParamsSubscription?: Subscription;

  tweetEmbedOption = {
    text: 'Tweet from Twitter',
    conversation: 'none',
    align: 'center',
  };

  constructor(
    private newsService: NewsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.urlParamsSubscription = this.activatedRoute.params.subscribe(
      (params) => {
        this.id = parseInt(params['id'], 10);
        this.load();
      }
    );
  }

  ngOnDestory() {
    if (this.urlParamsSubscription) {
      this.urlParamsSubscription.unsubscribe();
    }
  }

  async load() {
    if (!this.id) return;

    this.newsItem = await this.newsService.getNewsItem(this.id);
  }
}
