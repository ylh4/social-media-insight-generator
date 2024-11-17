import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import OpenAI from 'openai';
import { env, isConfigured } from './config/env';
import { ProcessedPost, preprocessData } from './utils/preprocessData';

// Initialize OpenAI client
let openai: OpenAI | null = null;
try {
  if (isConfigured()) {
    openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  edited?: boolean;
}

interface Store {
  messages: Message[];
  selectedPost: ProcessedPost | null;
  isLoading: boolean;
  error: string | null;
  data: ProcessedPost[];
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  editMessage: (id: string, content: string) => void;
  deleteMessage: (id: string) => void;
  clearHistory: () => void;
  setSelectedPost: (post: ProcessedPost | null) => void;
  setData: (rawData: any[]) => void;
  setError: (error: string | null) => void;
  sendMessage: (content: string) => Promise<string>;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      messages: [],
      selectedPost: null,
      isLoading: false,
      error: null,
      data: [],

      addMessage: (content, role) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              role,
              content,
              timestamp: Date.now(),
            },
          ],
        })),

      editMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id
              ? { ...msg, content, edited: true }
              : msg
          ),
        })),

      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),

      clearHistory: () => set({ messages: [] }),

      setSelectedPost: (post) => set({ selectedPost: post }),

      setData: (rawData) => {
        try {
          const processedData = preprocessData(rawData);
          set({ data: processedData, error: null });
        } catch (error) {
          set({ error: 'Error processing data: ' + (error instanceof Error ? error.message : 'Unknown error') });
        }
      },

      setError: (error) => set({ error }),

      sendMessage: async (content) => {
        set({ isLoading: true, error: null });

        try {
          if (!isConfigured()) {
            throw new Error('OpenAI API key is not configured');
          }

          if (!openai) {
            throw new Error('OpenAI client is not initialized');
          }

          const { data, selectedPost } = get();
          
          // Get relevant context based on the query and data columns
          const relevantPosts = selectedPost ? [selectedPost] : data.slice(0, 5);

          // Create detailed context including all columns
          const context = relevantPosts.map(post => `
Post Details:
- Network: ${post.Network}
- Profile: ${post.Profile} (Followers: ${post.Followers})
- Date: ${post.formattedDate}
- Type: ${post.Type}
- Content Type: ${post.Content_Type}
- Message: "${post.Message}"
- Engagements: ${post.Engagements}
- URL: ${post.Message_URL}
          `).join('\n\n');

          // Create system message with comprehensive data context
          const systemMessage = {
            role: 'system' as const,
            content: `You are an AI analyst specializing in social media data analysis. You have access to ${data.length} social media posts.

Your task is to analyze the provided data based on user queries. Important guidelines:

1. ONLY use information from the provided dataset
2. Do NOT introduce external information or assumptions
3. When analyzing, consider ALL available columns:
   - Network (platform)
   - Profile (user information)
   - Followers (audience size)
   - Date (temporal patterns)
   - Type (post category)
   - Content_Type (media format)
   - Message (actual content)
   - Engagements (interaction metrics)
   - Message_URL (source link)

4. Provide specific examples from the data to support your analysis
5. When asked about trends or patterns, use actual numbers and percentages from the data
6. If information is not available in the data, clearly state that instead of making assumptions

Current context (${relevantPosts.length} posts):
${context}

Remember: Base ALL insights EXCLUSIVELY on the provided data.`
          };

          // Keep only last 5 messages for context
          const conversationHistory = get().messages
            .slice(-5)
            .map(msg => ({
              role: msg.role,
              content: msg.content
            }));

          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              systemMessage,
              ...conversationHistory,
              { role: 'user' as const, content }
            ],
            temperature: 0.3, // Lower temperature for more focused analysis
            max_tokens: 1000
          });

          set({ isLoading: false });
          return response.choices[0].message.content || 'No response generated';
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);