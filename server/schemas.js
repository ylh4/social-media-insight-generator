import { z } from 'zod';

export const postSchema = z.object({
  posts: z.array(z.object({
    Network: z.string(),
    Message_URL: z.string().url(),
    Date: z.string(),
    Message: z.string(),
    Type: z.string(),
    Content_Type: z.string(),
    Profile: z.string(),
    Followers: z.number(),
    Engagements: z.number()
  }))
});

export const messageSchema = z.object({
  message: z.string().min(1)
});