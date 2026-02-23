/**
 * DSA AI Assistant & Feedback Routes
 * - POST /ai-assist: AI-powered hints (strict no-solution policy)
 * - POST /feedback: User feedback submission
 * - GET /notes/:userId/:problemSlug: Retrieve saved notes
 * - POST /notes: Save a note
 */
import { Router } from 'express';
import { query, getPool } from '../db/pool.js';

const router = Router();

// ============================================================================
// AI ASSIST ENDPOINT
// ============================================================================

/**
 * POST /api/dsa/ai-assist
 * Proxies to Groq with a strict DSA coaching system prompt
 *
 * This endpoint is registered in server.js which has the Groq client.
 * Here we only define the feedback/notes routes that use the DB.
 * The AI assist route is added directly in server.js for Groq access.
 */

// ============================================================================
// FEEDBACK ENDPOINT
// ============================================================================

/**
 * POST /api/dsa/feedback
 * Submit problem feedback with optional rating
 */
router.post('/feedback', async (req, res) => {
  try {
    const { problemSlug, userId, feedbackText, rating } = req.body;

    if (!problemSlug || !feedbackText || typeof feedbackText !== 'string' || feedbackText.trim().length === 0) {
      return res.status(400).json({ error: 'problemSlug and feedbackText are required' });
    }

    if (rating !== null && rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const trimmedText = feedbackText.trim().substring(0, 2000);

    const pool = getPool();
    if (!pool) {
      // Fallback: log feedback when DB is not configured
      console.log(`[Feedback] Problem: ${problemSlug}, User: ${userId || 'anonymous'}, Rating: ${rating || 'N/A'}, Text: ${trimmedText.substring(0, 100)}...`);
      return res.json({ success: true, stored: 'logged', message: 'Feedback logged (no database configured)' });
    }

    await query(
      `INSERT INTO dsa_feedback (user_id, problem_slug, feedback_text, rating)
       VALUES ($1, $2, $3, $4)`,
      [userId || 'anonymous', problemSlug, trimmedText, rating || null]
    );

    res.json({ success: true, stored: 'database' });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// ============================================================================
// NOTES ENDPOINTS
// ============================================================================

/**
 * POST /api/dsa/notes
 * Save an AI chat note
 */
router.post('/notes', async (req, res) => {
  try {
    const { userId, problemSlug, noteText, source } = req.body;

    if (!userId || !problemSlug || !noteText) {
      return res.status(400).json({ error: 'userId, problemSlug, and noteText are required' });
    }

    const pool = getPool();
    if (!pool) {
      return res.json({ success: true, stored: 'local_only' });
    }

    await query(
      `INSERT INTO dsa_notes (user_id, problem_slug, note_text, source)
       VALUES ($1, $2, $3, $4)`,
      [userId, problemSlug, noteText.substring(0, 5000), source || 'ai_chat']
    );

    res.json({ success: true, stored: 'database' });
  } catch (error) {
    console.error('Note save error:', error);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

/**
 * GET /api/dsa/notes/:userId/:problemSlug
 * Retrieve saved notes for a user+problem
 */
router.get('/notes/:userId/:problemSlug', async (req, res) => {
  try {
    const { userId, problemSlug } = req.params;

    const pool = getPool();
    if (!pool) {
      return res.json({ notes: [] });
    }

    const result = await query(
      `SELECT id, note_text, source, created_at
       FROM dsa_notes
       WHERE user_id = $1 AND problem_slug = $2
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId, problemSlug]
    );

    res.json({ notes: result.rows });
  } catch (error) {
    console.error('Notes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

export default router;
