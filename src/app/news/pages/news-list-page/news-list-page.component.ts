import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../news.service';
import { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-list-page',
  templateUrl: './news-list-page.component.html',
  styleUrls: ['../../../shared/styles.scss', './news-list-page.component.scss'],
})
export class NewsListPageComponent implements OnInit {
  newsItems: NewsItem[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.newsItems = await this.newsService.getNewsItems();
  }
}
