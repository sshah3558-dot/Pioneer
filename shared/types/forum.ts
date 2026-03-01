import { UserPreview } from './user';

export interface Forum {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export interface ForumPostItem {
  id: string;
  title: string;
  content: string;
  user: UserPreview;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  createdAt: string;
  forumName: string;
  forumSlug: string;
}

export interface ForumComment {
  id: string;
  content: string;
  user: UserPreview;
  parentId: string | null;
  createdAt: string;
}
