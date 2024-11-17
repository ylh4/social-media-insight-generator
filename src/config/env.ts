export const env = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  UPLOAD_PASSWORD: import.meta.env.VITE_UPLOAD_PASSWORD || 'admin123',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
};

export const isConfigured = (): boolean => {
  return Boolean(
    env.OPENAI_API_KEY && 
    env.OPENAI_API_KEY !== 'your-api-key-here' &&
    env.SUPABASE_URL &&
    env.SUPABASE_ANON_KEY
  );
};