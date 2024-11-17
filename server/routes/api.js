import { Router } from 'express';
import { OpenAI } from 'openai';
import { getDb } from '../database.js';
import { validateSchema } from '../middleware/validateSchema.js';
import { postSchema, messageSchema } from '../schemas.js';
import { logger } from '../utils/logger.js';

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Get all posts
router.get('/posts', (req, res) => {
  try {
    const db = getDb();
    const posts = db.prepare('SELECT * FROM social_posts ORDER BY date DESC').all();
    res.json(posts);
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Upload posts
router.post('/posts', validateSchema(postSchema), (req, res) => {
  try {
    const db = getDb();
    const { posts } = req.body;

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO social_posts (
        network, message_url, date, message, type,
        content_type, profile, followers, engagements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((posts) => {
      for (const post of posts) {
        stmt.run(
          post.Network,
          post.Message_URL,
          post.Date,
          post.Message,
          post.Type,
          post.Content_Type,
          post.Profile,
          post.Followers,
          post.Engagements
        );
      }
    });

    insertMany(posts);
    res.json({ message: 'Posts uploaded successfully' });
  } catch (error) {
    logger.error('Error uploading posts:', error);
    res.status(500).json({ error: 'Failed to upload posts' });
  }
});

// Chat completion
router.post('/chat', validateSchema(messageSchema), async (req, res) => {
  try {
    const db = getDb();
    const { message } = req.body;

    // Get relevant posts for context
    const posts = db.prepare('SELECT * FROM social_posts ORDER BY date DESC LIMIT 5').all();
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI analyst specializing in social media data analysis. 
          You have access to ${posts.length} social media posts. Base your analysis only on the provided data.`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.3
    });

    const response = completion.choices[0].message.content;

    // Store chat history
    db.prepare('INSERT INTO chat_history (role, content) VALUES (?, ?)')
      .run('user', message);
    db.prepare('INSERT INTO chat_history (role, content) VALUES (?, ?)')
      .run('assistant', response);

    res.json({ response });
  } catch (error) {
    logger.error('Error in chat completion:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get chat history
router.get('/chat/history', (req, res) => {
  try {
    const db = getDb();
    const history = db.prepare('SELECT * FROM chat_history ORDER BY timestamp ASC').all();
    res.json(history);
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Clear chat history
router.delete('/chat/history', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM chat_history').run();
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    logger.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

export { router as apiRouter };