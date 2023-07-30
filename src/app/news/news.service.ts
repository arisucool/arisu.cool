import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NewsItem } from './interfaces/news-item.interface';
import { AppCacheService } from '../shared/services/app-cache.service';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  readonly CACHE_KEY = 'arisuNewsList';
  readonly CACHE_EXPIRES = 1000 * 60 * 15; // 15 minutes

  constructor(private appCacheService: AppCacheService) {}

  async getNewsItems(lastId?: number): Promise<NewsItem[]> {
    const cached = await this.appCacheService.getCachedJson(
      this.CACHE_KEY,
      this.CACHE_EXPIRES
    );
    if (cached) return cached;

    const req = await fetch(environment.NEWS_LIST_JSON_API_URL);
    const items = await req.json();

    this.appCacheService.setCachedJson(this.CACHE_KEY, items);

    return items;
  }

  async getNewsItem(id: number) {
    const items = await this.getNewsItems();
    const item = items.find((item) => item.id === id);
    if (!item) return undefined;

    item.tweetId = item.tweetUrl
      ? this.getTweetIdByUrl(item.tweetUrl)
      : undefined;

    if (item.children) {
      item.children.map((child) => {
        child.tweetId = child.tweetUrl
          ? this.getTweetIdByUrl(child.tweetUrl)
          : undefined;
        return child;
      });
    }

    return item;
  }

  getTweetIdByUrl(url: string) {
    // URL の最後の数字がツイート ID なので、それを取得する
    const match = url.match(/\/(\d+)$/);
    if (!match) return undefined;

    return match[1];
  }
}
