/**
 * DSA Questions API Routes
 * Handles fetching questions from the database
 */
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 DSA Routes - Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET');
console.log('🔧 DSA Routes - Supabase Key:', supabaseKey ? 'SET' : 'NOT SET');

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized for DSA routes');
} else {
  console.error('❌ Supabase client NOT initialized - missing credentials');
}

// Middleware to extract user ID from auth (simplified for now)
const getUserId = (req) => {
  // TODO: Extract from JWT token in production
  return req.headers['x-user-id'] || null;
};

// Test route
router.get('/test', (req, res) => {
  console.log('🔵 [DSA] Test route hit!');
  res.json({ message: 'DSA routes working!' });
});

/**
 * GET /api/dsa/questions
 * Fetch all DSA questions (list view)
 */
router.get('/questions', async (req, res) => {
  console.log('🔵 [DSA] GET /api/dsa/questions - Route hit!');
  
  try {
    if (!supabase) {
      console.error('❌ [DSA] Supabase not configured');
      return res.status(503).json({ error: 'Database not configured' });
    }

    console.log('🔵 [DSA] Querying Supabase dsa_questions table...');
    const { data, error } = await supabase
      .from('dsa_questions')
      .select('id, slug, title, difficulty, topics, tags')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ [DSA] Supabase error:', JSON.stringify(error, null, 2));
      return res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
    }

    console.log(`✅ [DSA] Successfully fetched ${data?.length || 0} questions`);

    // Transform to match expected format
    const items = data.map(q => {
      // Parse tags - can be string (comma-separated) or already an array
      let tags = [];
      if (q.tags) {
        if (typeof q.tags === 'string') {
          tags = q.tags.split(',').map(t => t.trim()).filter(Boolean);
        } else if (Array.isArray(q.tags)) {
          tags = q.tags;
        }
      }
      // Fallback to topics if tags not available
      if (tags.length === 0 && q.topics) {
        if (typeof q.topics === 'string') {
          tags = q.topics.split(',').map(t => t.trim()).filter(Boolean);
        } else if (Array.isArray(q.topics)) {
          tags = q.topics;
        }
      }
      
      return {
        id: q.slug,
        title: q.title,
        difficulty: q.difficulty || 'Medium',
        acceptance: 0, // Not in schema
        tags: tags
      };
    });

    res.json({ items });
  } catch (error) {
    console.error('❌ [DSA] Exception:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch questions', details: error.message });
  }
});

/**
 * GET /api/dsa/questions/:id
 * Fetch a single DSA question by slug (detail view)
 */
router.get('/questions/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('dsa_questions')
      .select('*')
      .eq('slug', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Transform to match expected format
    const item = {
      id: data.slug,
      title: data.title,
      difficulty: data.difficulty || 'Medium',
      acceptance: 0,
      tags: (() => {
        // Parse tags - can be string (comma-separated) or already an array
        let tags = [];
        if (data.tags) {
          if (typeof data.tags === 'string') {
            tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
          } else if (Array.isArray(data.tags)) {
            tags = data.tags;
          }
        }
        // Fallback to topics if tags not available
        if (tags.length === 0 && data.topics) {
          if (typeof data.topics === 'string') {
            tags = data.topics.split(',').map(t => t.trim()).filter(Boolean);
          } else if (Array.isArray(data.topics)) {
            tags = data.topics;
          }
        }
        return tags;
      })(),
      description: data.description || '',
      examples: [
        data.example_1_input && data.example_1_output ? {
          input: data.example_1_input,
          output: data.example_1_output
        } : null,
        data.example_2_input && data.example_2_output ? {
          input: data.example_2_input,
          output: data.example_2_output
        } : null,
        data.example_3_input && data.example_3_output ? {
          input: data.example_3_input,
          output: data.example_3_output
        } : null
      ].filter(Boolean),
      constraints: data.constraints ? [data.constraints] : [],
      testCases: [],
      isPremium: false,
      likes: 0,
      dislikes: 0
    };

    res.json({ item });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

console.log('🔧 [DSA] Router has', router.stack?.length || 0, 'routes registered');

export default router;
