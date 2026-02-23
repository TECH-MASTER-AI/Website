/**
 * ============================================================================
 * DEPRECATED FOR NETLIFY DEPLOYMENT
 * ============================================================================
 * This server.js file is NOT used when deployed to Netlify.
 * Netlify does not support persistent servers or app.listen().
 * 
 * The chatbot backend has been migrated to:
 * netlify/functions/chat.js (Serverless Function)
 * 
 * This file is kept for local development reference only.
 * To test locally with Netlify functions, use: netlify dev
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import {
  GROQ_MODELS,
  getNextFallbackModel,
  getModelConfig,
  isModelSupported,
  getPrimaryModel,
} from './config/models.js';
import { healthCheck as dbHealthCheck, closePool } from './db/pool.js';
import dsaRoutes from './routes/dsa.js';
import dsaAiRoutes from './routes/dsaAi.js';
import executeRoutes from './routes/execute.js';
import { attachDuelWs, createBotMatch } from './duels/duelWs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// CONFIGURATION & VALIDATION
// ============================================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PRIMARY_MODEL = getPrimaryModel();
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS_PER_REQUEST || '300', 10);
const RATE_LIMIT_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '10', 10);
const CONVERSATION_HISTORY_LIMIT = parseInt(process.env.CONVERSATION_HISTORY_LIMIT || '5', 10);

// Validate API key on startup (warn only so server can run without key for local dev)
function validateStartup() {
  const hasKey = GROQ_API_KEY && GROQ_API_KEY.trim().length > 0;
  if (!hasKey) {
    console.warn('⚠️  GROQ_API_KEY is not set in .env — chatbot will be disabled. Add GROQ_API_KEY to enable chat.');
  } else {
    console.log('✅ Groq API Key validation passed');
  }
  console.log(`✅ Primary Model: ${PRIMARY_MODEL}`);
  console.log(`✅ Fallback Model: ${GROQ_MODELS.fallback}`);
  console.log(`✅ Emergency Model: ${GROQ_MODELS.emergency}`);
  console.log(`✅ Max tokens per request: ${MAX_TOKENS}`);
  console.log(`✅ Rate limit: ${RATE_LIMIT_REQUESTS} requests/minute`);
  console.log(`✅ Conversation history limit: ${CONVERSATION_HISTORY_LIMIT} messages`);
}

validateStartup();

// Initialize Groq client only when API key is set
const groq = GROQ_API_KEY && GROQ_API_KEY.trim().length > 0
  ? new Groq({ apiKey: GROQ_API_KEY })
  : null;

// ============================================================================
// RATE LIMITING & SESSION MANAGEMENT
// ============================================================================

const sessionStore = new Map();

function getOrCreateSession(sessionId) {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, {
      requestCount: 0,
      resetTime: Date.now() + 60000,
      rateLimitExceeded: false,
      rateLimitExceededTime: null,
      modelFallbackAttempts: {}, // Track fallback attempts per model
    });
  }
  return sessionStore.get(sessionId);
}

function checkRateLimit(sessionId) {
  const session = getOrCreateSession(sessionId);
  const now = Date.now();

  // Reset counter if minute has passed
  if (now > session.resetTime) {
    session.requestCount = 0;
    session.resetTime = now + 60000;
    session.rateLimitExceeded = false;
  }

  // Check if rate limit was exceeded recently (cooldown: 1 minute)
  if (session.rateLimitExceeded) {
    const cooldownTime = 60 * 1000;
    if (now - session.rateLimitExceededTime < cooldownTime) {
      return {
        allowed: false,
        reason: 'rate_limit_exceeded_cooldown',
        message: 'Too many requests. Please wait a moment before trying again.',
      };
    } else {
      session.rateLimitExceeded = false;
      session.rateLimitExceededTime = null;
    }
  }

  // Check rate limit
  if (session.requestCount >= RATE_LIMIT_REQUESTS) {
    session.rateLimitExceeded = true;
    session.rateLimitExceededTime = now;
    return {
      allowed: false,
      reason: 'rate_limit_exceeded',
      message: 'Too many requests. Please wait a moment before trying again.',
    };
  }

  session.requestCount++;
  return { allowed: true };
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// ============================================================================
// API ROUTES
// ============================================================================

// DSA Questions API
app.use('/api/dsa', (req, res, next) => {
  console.log(`🔵 [SERVER] ${req.method} ${req.url}`);
  next();
}, dsaRoutes);
console.log('✅ DSA routes mounted at /api/dsa');

// DSA AI Assistant & Feedback API
app.use('/api/dsa', dsaAiRoutes);
console.log('✅ DSA AI routes mounted at /api/dsa');

// Code Execution API
app.use('/api/execute', executeRoutes);
console.log('✅ Execute routes mounted at /api/execute');

// Duels: REST fallback when WebSocket doesn't deliver "matched" (e.g. bot after 4s)
app.post('/api/duels/bot-match', (req, res) => {
  try {
    const gender = req.body?.gender === 'male' || req.body?.gender === 'female' ? req.body.gender : null;
    const { roomId, problemId, botName } = createBotMatch(gender);
    res.json({ roomId, problemId, opponent: botName, isBot: true });
  } catch (err) {
    console.error('[duels] bot-match error:', err);
    res.status(500).json({ error: 'Failed to create bot match' });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Trim conversation history to last N messages
 */
function trimConversationHistory(messages) {
  if (messages.length > CONVERSATION_HISTORY_LIMIT) {
    return messages.slice(-CONVERSATION_HISTORY_LIMIT);
  }
  return messages;
}

/**
 * Check if error is model decommissioned
 */
function isModelDecommissionedError(error) {
  return (
    error.error?.code === 'model_decommissioned' ||
    error.code === 'model_decommissioned' ||
    (error.message && error.message.includes('decommissioned'))
  );
}

/**
 * Check if error is retryable
 */
function isRetryableError(error) {
  const errorCode = error.error?.code || error.code;
  const retryableCodes = [
    'model_decommissioned',
    'rate_limit_exceeded',
    'service_unavailable',
    'timeout',
  ];
  return retryableCodes.includes(errorCode);
}

/**
 * Map Groq errors to user-friendly messages
 */
function mapGroqError(error, statusCode, attemptedModels = []) {
  const errorMessage = error.message || 'Unknown error';
  const errorStatus = error.status || statusCode;
  const errorCode = error.error?.code || error.code;

  console.error(`🔴 Groq Error [${errorStatus}] (${errorCode}): ${errorMessage}`);
  console.error(`   Attempted models: ${attemptedModels.join(', ')}`);

  // Invalid API key
  if (errorMessage.includes('API key') || errorStatus === 401) {
    return {
      userMessage: 'Authentication error. Please contact support.',
      isServiceDown: false,
      isRetryable: false,
    };
  }

  // Rate limit
  if (errorMessage.includes('rate limit') || errorStatus === 429) {
    return {
      userMessage: 'The AI service is experiencing high demand. Please wait a moment and try again.',
      isServiceDown: false,
      isRetryable: true,
    };
  }

  // Model decommissioned or invalid
  if (isModelDecommissionedError(error)) {
    return {
      userMessage: 'The AI service is temporarily unavailable. Please try again in a moment.',
      isServiceDown: true,
      isRetryable: true,
    };
  }

  // Network/timeout
  if (errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
    return {
      userMessage: 'Connection timeout. Please check your internet and try again.',
      isServiceDown: true,
      isRetryable: true,
    };
  }

  // Server error
  if (errorStatus >= 500) {
    return {
      userMessage: 'The AI service is temporarily unavailable. Please try again later.',
      isServiceDown: true,
      isRetryable: true,
    };
  }

  return {
    userMessage: 'An error occurred while processing your request. Please try again.',
    isServiceDown: false,
    isRetryable: false,
  };
}

/**
 * Call Groq API with automatic fallback on model decommissioned error
 */
async function callGroqWithFallback(messages, initialModel, sessionId) {
  let currentModel = initialModel;
  const attemptedModels = [currentModel];
  let lastError = null;

  // Try primary model first
  try {
    console.log(`📨 [${sessionId}] Calling Groq with model: ${currentModel}`);

    const modelConfig = getModelConfig(currentModel);
    const response = await groq.chat.completions.create({
      messages,
      model: currentModel,
      temperature: modelConfig.temperature,
      max_tokens: Math.min(modelConfig.maxTokens, MAX_TOKENS),
      top_p: modelConfig.topP,
    });

    console.log(`✅ [${sessionId}] Response from ${currentModel}`);
    return {
      response,
      model: currentModel,
      attemptedModels,
      fallbackUsed: false,
    };
  } catch (error) {
    lastError = error;

    // Check if model is decommissioned
    if (isModelDecommissionedError(error)) {
      console.warn(`⚠️  [${sessionId}] Model ${currentModel} is decommissioned. Attempting fallback...`);

      // Get next fallback model
      const nextModel = getNextFallbackModel(currentModel);

      if (nextModel && isModelSupported(nextModel)) {
        attemptedModels.push(nextModel);
        currentModel = nextModel;

        try {
          console.log(`📨 [${sessionId}] Retrying with fallback model: ${currentModel}`);

          const modelConfig = getModelConfig(currentModel);
          const response = await groq.chat.completions.create({
            messages,
            model: currentModel,
            temperature: modelConfig.temperature,
            max_tokens: Math.min(modelConfig.maxTokens, MAX_TOKENS),
            top_p: modelConfig.topP,
          });

          console.log(`✅ [${sessionId}] Response from fallback model ${currentModel}`);
          return {
            response,
            model: currentModel,
            attemptedModels,
            fallbackUsed: true,
          };
        } catch (fallbackError) {
          console.error(`🔴 [${sessionId}] Fallback model ${currentModel} also failed:`, fallbackError.message);
          lastError = fallbackError;
        }
      } else {
        console.error(`🔴 [${sessionId}] No fallback model available`);
      }
    }

    // If we get here, all models failed
    throw lastError;
  }
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health check endpoint (includes database status)
 */
app.get('/api/health', async (req, res) => {
  const db = await dbHealthCheck();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: 'groq',
    primaryModel: PRIMARY_MODEL,
    fallbackModel: GROQ_MODELS.fallback,
    emergencyModel: GROQ_MODELS.emergency,
    apiKeyConfigured: !!GROQ_API_KEY,
    database: db.ok ? { connected: true } : { connected: false, error: db.error },
  });
});

/**
 * Main chat endpoint with automatic model fallback
 * POST /api/chat
 * Body: { message: string, sessionId: string, conversationHistory?: Array }
 */
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  const { message, sessionId, conversationHistory = [] } = req.body;

  // ========================================================================
  // INPUT VALIDATION
  // ========================================================================

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      error: 'Message is required and must be a non-empty string',
    });
  }

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      error: 'Session ID is required',
    });
  }

  const trimmedMessage = message.trim().substring(0, 2000);

  // ========================================================================
  // RATE LIMITING CHECK
  // ========================================================================

  const rateLimitCheck = checkRateLimit(sessionId);
  if (!rateLimitCheck.allowed) {
    console.warn(`⚠️  Rate limit exceeded for session ${sessionId}: ${rateLimitCheck.reason}`);
    return res.status(429).json({
      error: rateLimitCheck.message,
      retryAfter: 60,
    });
  }

  // ========================================================================
  // PREPARE CONVERSATION HISTORY
  // ========================================================================

  const trimmedHistory = trimConversationHistory(conversationHistory);

  // Build messages array: system message + history + current message
  const messages = [
    {
      role: 'system',
      content: 'You are Nova, a helpful AI assistant for TechMaster, a tech community platform. Keep responses concise and friendly. Maximum 2-3 sentences.',
    },
    ...trimmedHistory.map(msg => ({
      role: msg.from === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    {
      role: 'user',
      content: trimmedMessage,
    },
  ];

  console.log(`📨 [${sessionId}] Processing message: "${trimmedMessage.substring(0, 50)}..."`);
  console.log(`📨 [${sessionId}] Conversation history: ${trimmedHistory.length} messages`);

  if (!groq) {
    return res.status(503).json({
      error: 'Chat is unavailable. Add GROQ_API_KEY to your .env file to enable the chatbot.',
      code: 'GROQ_API_KEY_NOT_SET',
    });
  }

  try {
    // ====================================================================
    // CALL GROQ API WITH FALLBACK
    // ====================================================================

    const groqResult = await callGroqWithFallback(messages, PRIMARY_MODEL, sessionId);

    const botResponse = groqResult.response.choices?.[0]?.message?.content || 'No response generated';
    const tokensUsed = groqResult.response.usage?.total_tokens || 0;
    const responseTime = Date.now() - startTime;

    console.log(`✅ [${sessionId}] Response generated in ${responseTime}ms (${tokensUsed} tokens)`);
    if (groqResult.fallbackUsed) {
      console.log(`✅ [${sessionId}] Fallback model used: ${groqResult.model}`);
    }

    res.json({
      response: botResponse,
      tokensUsed,
      responseTime,
      model: groqResult.model,
      fallbackUsed: groqResult.fallbackUsed,
      attemptedModels: groqResult.attemptedModels,
    });
  } catch (error) {
    console.error(`🔴 [${sessionId}] All models failed:`, error.message);

    const { userMessage, isServiceDown } = mapGroqError(error, error.status);

    res.status(error.status || 500).json({
      error: userMessage,
      isServiceDown,
    });
  }
});

/**
 * DSA AI Assist endpoint - strict coaching mode
 * POST /api/dsa/ai-assist
 * Body: { message, sessionId, systemPrompt, conversationHistory }
 */
app.post('/api/dsa/ai-assist', async (req, res) => {
  const startTime = Date.now();
  const { message, sessionId, systemPrompt, conversationHistory = [] } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const rateLimitCheck = checkRateLimit(sessionId);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({ error: rateLimitCheck.message, retryAfter: 60 });
  }

  if (!groq) {
    return res.status(503).json({
      error: 'AI service unavailable. Add GROQ_API_KEY to enable.',
      code: 'GROQ_API_KEY_NOT_SET',
    });
  }

  const trimmedMessage = message.trim().substring(0, 2000);
  const trimmedHistory = trimConversationHistory(conversationHistory);

  const messages = [
    { role: 'system', content: systemPrompt || 'You are a helpful DSA coding coach. Never give full solutions.' },
    ...trimmedHistory.map(msg => ({
      role: msg.from === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: trimmedMessage },
  ];

  try {
    const groqResult = await callGroqWithFallback(messages, PRIMARY_MODEL, sessionId);
    const botResponse = groqResult.response.choices?.[0]?.message?.content || 'No response generated';
    const responseTime = Date.now() - startTime;

    res.json({
      response: botResponse,
      responseTime,
      model: groqResult.model,
    });
  } catch (error) {
    console.error(`[DSA AI] Error for session ${sessionId}:`, error.message);
    const { userMessage } = mapGroqError(error, error.status);
    res.status(error.status || 500).json({ error: userMessage });
  }
});

/**
 * Fallback endpoint for when service is down
 */
app.post('/api/chat/fallback', (req, res) => {
  const fallbackResponses = [
    'I appreciate your question! The AI service is currently unavailable. Please try again in a few moments.',
    'Thanks for reaching out! Our AI is taking a quick break. Feel free to ask again shortly.',
    'I\'m temporarily unavailable, but I\'ll be back soon! Please try again in a few minutes.',
  ];

  const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

  res.json({
    response: randomResponse,
    isFallback: true,
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('🔴 Unhandled error:', err);
  res.status(500).json({
    error: 'An unexpected error occurred. Please try again.',
  });
});

// ============================================================================
// START SERVER & GRACEFUL SHUTDOWN
// ============================================================================

const server = app.listen(PORT, () => {
  attachDuelWs(server);
  console.log('\n' + '='.repeat(70));
  console.log('🚀 TechMaster Backend Server (Groq + PostgreSQL)');
  console.log('='.repeat(70));
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`📝 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`🔌 Duels WebSocket: ws://localhost:${PORT}/ws/duels`);
  console.log(`🏥 Health check: GET http://localhost:${PORT}/api/health`);
  console.log(`🤖 Provider: Groq (with automatic fallback)`);
  console.log(`📊 Primary Model: ${PRIMARY_MODEL}`);
  console.log(`📊 Fallback Model: ${GROQ_MODELS.fallback}`);
  console.log(`📊 Emergency Model: ${GROQ_MODELS.emergency}`);
  console.log(`⏱️  Rate limit: ${RATE_LIMIT_REQUESTS} requests per minute`);
  console.log(`📊 Max tokens: ${MAX_TOKENS} per response`);
  console.log('='.repeat(70) + '\n');
});

function shutdown(signal) {
  console.log(`\n${signal} received, closing server and database pool...`);
  server.close(() => {
    console.log('HTTP server closed');
    closePool().then(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
