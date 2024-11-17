import { format } from 'date-fns';

export interface ProcessedPost {
  Network: string;
  Message_URL: string;
  Date: string;
  Message: string;
  Type: string;
  Content_Type: string;
  Profile: string;
  Followers: number;
  Engagements: number;
  formattedDate: string;
}

export const processPost = (post: any): ProcessedPost | null => {
  try {
    if (!post.Message_URL || !post.Date || !post.Message) {
      console.warn('Skipping post due to missing required fields:', post);
      return null;
    }

    const parsedDate = new Date(post.Date);
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date format:', post.Date);
      return null;
    }

    return {
      ...post,
      Followers: Number(post.Followers) || 0,
      Engagements: Number(post.Engagements) || 0,
      formattedDate: format(parsedDate, 'PPP')
    };
  } catch (error) {
    console.error('Error processing post:', post.Message_URL, error);
    return null;
  }
};