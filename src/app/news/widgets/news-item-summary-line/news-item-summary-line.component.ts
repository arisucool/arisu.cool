import { Component, Input } from '@angular/core';
import { NewsItem } from '../../interfaces/news-item.interface';

@Component({
  selector: 'app-news-item-summary-line',
  templateUrl: './news-item-summary-line.component.html',
  styleUrls: [
    '../../../shared/styles.scss',
    './news-item-summary-line.component.scss',
  ],
})
export class NewsItemSummaryLineComponent {
  @Input()
  item?: NewsItem;

  @Input()
  isVisibleTags: boolean = false;

  isToday(date: Date | string) {
    const today = new Date();

    const d = typeof date === 'string' ? new Date(date) : date;

    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }
}
