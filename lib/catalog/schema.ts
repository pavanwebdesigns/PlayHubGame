import { z } from 'zod';

export const gamePixItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  namespace: z.string().min(1),
  description: z.string().nullish(),
  category: z.string().min(1),
  orientation: z.enum(['landscape', 'portrait', 'all']),
  quality_score: z.number().finite().min(0).max(1),
  width: z.number().positive(),
  height: z.number().positive(),
  date_published: z.string().min(1),
  date_modified: z.string().min(1),
  banner_image: z.string().min(1),
  image: z.string().min(1),
  url: z.string().min(1),
});

export type GamePixItem = z.infer<typeof gamePixItemSchema>;
