import { format, parse, isValid } from 'date-fns';

export interface RawPost {
  Network: string;
  Message_URL: string;
  Date: string;
  Message: string;
  Type: string;
  Content_Type: string;
  Profile: string;
  Followers: string | number;
  Engagements: string | number;
}

export interface ProcessedPost extends Omit<RawPost, 'Followers' | 'Engagements'> {
  Followers: number;
  Engagements: number;
  formattedDate: string;
  sentiment?: number;
  keywords?: string[];
  topics?: string[];
}

const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/RT @[\w]+: /, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

const parseDate = (dateStr: string): Date | null => {
  // Try different date formats
  const formats = [
    'MM/dd/yyyy HH:mm',
    'yyyy-MM-dd HH:mm:ss',
    'yyyy-MM-dd\'T\'HH:mm:ss.SSSX',
    'yyyy-MM-dd\'T\'HH:mm:ssX'
  ];

  for (const formatStr of formats) {
    try {
      const parsedDate = parse(dateStr, formatStr, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    } catch (error) {
      continue;
    }
  }

  // If all parsing attempts fail, try creating a date directly
  const directDate = new Date(dateStr);
  if (isValid(directDate)) {
    return directDate;
  }

  return null;
};

export const preprocessPost = (post: RawPost): ProcessedPost | null => {
  try {
    // Validate required fields
    if (!post.Message_URL || !post.Date || !post.Message) {
      return null;
    }

    // Parse date
    const parsedDate = parseDate(post.Date);
    if (!parsedDate) {
      return null;
    }

    // Clean and process the post
    const cleanedMessage = cleanText(post.Message);
    
    return {
      ...post,
      Message: cleanedMessage,
      Followers: typeof post.Followers === 'string' ? parseInt(post.Followers, 10) || 0 : post.Followers,
      Engagements: typeof post.Engagements === 'string' ? parseInt(post.Engagements, 10) || 0 : post.Engagements,
      formattedDate: format(parsedDate, 'PPP')
    };
  } catch (error) {
    console.error('Error processing post:', post.Message_URL, error);
    return null;
  }
};

export const preprocessData = (data: RawPost[]): ProcessedPost[] => {
  if (!Array.isArray(data)) {
    console.error('Invalid data format: expected an array');
    return [];
  }

  return data
    .map(post => {
      try {
        return preprocessPost(post);
      } catch (error) {
        console.error(`Error processing post: ${post.Message_URL}`, error);
        return null;
      }
    })
    .filter((post): post is ProcessedPost => post !== null)
    .sort((a, b) => {
      const dateA = parseDate(a.Date);
      const dateB = parseDate(b.Date);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });
};