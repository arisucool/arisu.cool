export interface NewsItem {
  id: number;
  category?: string;
  title?: string;
  parentId?: number;
  createdAt: Date;
  tweetUrl?: string;
  tweetId?: string;
  content: string;
  tags: string[];
  reminderEndDate: string;
  children?: NewsItem[];
}
