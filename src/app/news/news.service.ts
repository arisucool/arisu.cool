import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NewsItem } from './interfaces/news-item.interface';
import { AppCacheService } from '../shared/services/app-cache.service';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  readonly CACHE_KEY = 'arisuNewsList';
  readonly CACHE_EXPIRES = 1000 * 60 * 5; // 5 minutes

  constructor(private appCacheService: AppCacheService) {}

  async getNewsItems(lastId?: number): Promise<NewsItem[]> {
    let cached = await this.appCacheService.getCachedJson(
      this.CACHE_KEY,
      this.CACHE_EXPIRES
    );
    if (cached) {
      cached = cached.map((item: NewsItem) => this.formatNewsItem(item));
      cached = this.sortNewsItems(cached);
      return cached;
    }

    const req = await fetch(environment.NEWS_LIST_JSON_API_URL);
    let items = await req.json();
    this.appCacheService.setCachedJson(this.CACHE_KEY, items);

    // データを整形
    items = items.map((item: NewsItem) => this.formatNewsItem(item));
    items = this.sortNewsItems(items);

    return items;
  }

  sortNewsItems(items: NewsItem[]) {
    // 整形後の情報でソート
    items = items.sort((a: any, b: any) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return items;
  }

  async getNewsItem(id: number) {
    const items = await this.getNewsItems();
    const item = items.find((item) => item.id === id);

    if (!item) {
      return undefined;
    }

    // データを整形して返す
    return this.formatNewsItem(item);
  }

  /**
   * データの整形処理
   * @param newsItem
   * @returns
   */
  private formatNewsItem(item: NewsItem) {
    if (!item) return undefined;

    item.tweetId = item.tweetUrl
      ? this.getTweetIdByUrl(item.tweetUrl)
      : undefined;

    if (item.children) {
      // 子記事のツイート ID を取得
      item.children.map((child) => {
        child.tweetId = child.tweetUrl
          ? this.getTweetIdByUrl(child.tweetUrl)
          : undefined;
        return child;
      });

      // 子記事から日付を取得
      const createdAts: Date[] = [];
      item.children.forEach((child) => {
        if (child.createdAt) {
          createdAts.push(new Date(child.createdAt));
        }
      });

      // 最も新しい日付を親記事の日付とする
      if (createdAts.length >= 1) {
        const newestDate = createdAts.reduce((a, b) =>
          a.getTime() > b.getTime() ? a : b
        );
        item.createdAt = newestDate;
      }

      // 子記事からリマインダーの日付を取得
      const reminderEndDates: Date[] = [];
      item.children.forEach((child) => {
        if (child.reminderEndDate) {
          reminderEndDates.push(new Date(child.reminderEndDate));
        }
      });

      if (reminderEndDates.length !== 0) {
        const nearestDate = reminderEndDates.reduce((a, b) =>
          a.getTime() < b.getTime() ? a : b
        );
        item.reminderEndDate = nearestDate.toISOString();
      }
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
