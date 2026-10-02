export interface GamePixGame {
  id: string;
  title: string;
  namespace: string;
  description: string;
  category: string;
  orientation: 'landscape' | 'portrait' | 'all';
  quality_score: number;
  width: number;
  height: number;
  date_published: string;
  date_modified: string;
  banner_image: string;
  image: string;
  url: string;
}
