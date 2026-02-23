/**
 * DSA questions API - Netlify Function
 *
 * Supports:
 * - GET /.netlify/functions/dsa/questions
 * - GET /.netlify/functions/dsa/questions/:id
 */

import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const fullPath = event.path || '';
  const base = '/.netlify/functions/dsa';
  const rest = fullPath.startsWith(base) ? fullPath.slice(base.length) : fullPath;

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify Environment variables.',
        }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // /questions
    if (rest === '/questions' || rest === '/questions/') {
      const { data, error } = await supabase
        .from('questions')
        .select('slug, title, difficulty, acceptance_rate, tags')
        .order('id', { ascending: true });

      if (error) throw error;

      const items = data.map(q => ({
        id: q.slug,
        title: q.title,
        difficulty: q.difficulty,
        acceptance: Math.round(q.acceptance_rate || 0),
        tags: q.tags || []
      }));

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ items }),
      };
    }

    // /questions/:id
    if (rest.startsWith('/questions/')) {
      const id = decodeURIComponent(rest.replace('/questions/', '').split('/')[0] || '');
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('slug', id)
        .single();

      if (error || !data) {
        return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Not found' }) };
      }

      const item = {
        id: data.slug,
        title: data.title,
        difficulty: data.difficulty,
        acceptance: Math.round(data.acceptance_rate || 0),
        tags: data.tags || [],
        description: data.description,
        examples: data.examples || [],
        constraints: data.constraints || [],
        testCases: data.test_cases || [],
        isPremium: data.is_premium || false,
        likes: data.likes || 0,
        dislikes: data.dislikes || 0
      };

      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ item }) };
    }

    return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err?.message || 'Internal error' }),
    };
  }
};

