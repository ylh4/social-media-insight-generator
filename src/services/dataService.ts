import { RawPost, ProcessedPost, preprocessData } from '../utils/preprocessData';

export class DataService {
  private static instance: DataService;
  private processedData: ProcessedPost[] = [];

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async loadData(rawData: RawPost[]): Promise<ProcessedPost[]> {
    try {
      if (!rawData?.length) {
        return [];
      }
      
      // Process data with a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      this.processedData = preprocessData(rawData);
      return this.processedData;
    } catch (error) {
      console.error('Error processing data:', error);
      throw error;
    }
  }

  getData(): ProcessedPost[] {
    return this.processedData;
  }

  getAnalytics() {
    if (!this.processedData.length) {
      return {
        totalPosts: 0,
        totalEngagements: 0,
        averageSentiment: 0,
        postsPerNetwork: {},
        topProfiles: [],
      };
    }

    const totalPosts = this.processedData.length;
    const totalEngagements = this.processedData.reduce((sum, post) => sum + post.Engagements, 0);
    const averageSentiment = this.processedData.reduce((sum, post) => sum + (post.sentiment || 0), 0) / totalPosts;

    return {
      totalPosts,
      totalEngagements,
      averageSentiment,
      postsPerNetwork: this.getPostsPerNetwork(),
      topProfiles: this.getTopProfiles(),
    };
  }

  private getPostsPerNetwork(): Record<string, number> {
    return this.processedData.reduce((acc, post) => {
      acc[post.Network] = (acc[post.Network] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopProfiles(): Array<{ profile: string; engagements: number }> {
    const profileStats = this.processedData.reduce((acc, post) => {
      acc[post.Profile] = (acc[post.Profile] || 0) + post.Engagements;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(profileStats)
      .map(([profile, engagements]) => ({ profile, engagements }))
      .sort((a, b) => b.engagements - a.engagements)
      .slice(0, 5);
  }
}