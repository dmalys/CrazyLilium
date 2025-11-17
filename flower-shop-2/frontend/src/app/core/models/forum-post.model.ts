export interface ForumPost {
  id: number;
  title: string;
  content?: string;
  category: ForumCategory;
  createdAt: string;
}

export enum ForumCategory {
  TipsAndTricks = 'TipsAndTricks',
  News = 'News',
  Requests = 'Requests',
  Support = 'Support'
}

export const ForumCategoryLabels: Record<ForumCategory, string> = {
  [ForumCategory.TipsAndTricks]: 'Tips and Tricks',
  [ForumCategory.News]: 'News',
  [ForumCategory.Requests]: 'Requests',
  [ForumCategory.Support]: 'Support'
};

