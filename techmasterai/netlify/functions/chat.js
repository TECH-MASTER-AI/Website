/**
 * STABLE HYBRID CHATBOT - Netlify Function
 * Priority: Knowledge Base → AI API → Friendly Fallback
 * NEVER shows "Service Down" - Always returns helpful responses
 */

import Groq from 'groq-sdk';

// Configuration
const GROQ_MODELS = {
  primary: 'llama-3.1-8b-instant',
  fallback: 'llama-3.1-70b-versatile',
  emergency: 'mixtral-8x7b-32768',
};

const MODEL_CONFIG = {
  'llama-3.1-8b-instant': { maxTokens: 300, temperature: 0.7, topP: 0.9 },
  'llama-3.1-70b-versatile': { maxTokens: 400, temperature: 0.7, topP: 0.9 },
  'mixtral-8x7b-32768': { maxTokens: 500, temperature: 0.7, topP: 0.9 },
};

const MAX_TOKENS = 300;
const CONVERSATION_HISTORY_LIMIT = 5;

// Helper Functions
function getModelConfig(model) {
  return MODEL_CONFIG[model] || { maxTokens: 300, temperature: 0.7, topP: 0.9 };
}

function getNextFallbackModel(currentModel) {
  if (currentModel === GROQ_MODELS.primary) return GROQ_MODELS.fallback;
  if (currentModel === GROQ_MODELS.fallback) return GROQ_MODELS.emergency;
  return null;
}

function trimConversationHistory(messages) {
  return messages.length > CONVERSATION_HISTORY_LIMIT ? messages.slice(-CONVERSATION_HISTORY_LIMIT) : messages;
}

function isModelDecommissionedError(error) {
  return (
    error.error?.code === 'model_decommissioned' ||
    error.code === 'model_decommissioned' ||
    (error.message && error.message.includes('decommissioned'))
  );
}

// AI API Call with Fallback Models
async function callGroqWithFallback(groq, messages, initialModel, sessionId) {
  let currentModel = initialModel;
  const attemptedModels = [currentModel];

  try {
    const modelConfig = getModelConfig(currentModel);
    const response = await groq.chat.completions.create({
      messages,
      model: currentModel,
      temperature: modelConfig.temperature,
      max_tokens: Math.min(modelConfig.maxTokens, MAX_TOKENS),
      top_p: modelConfig.topP,
    });

    return {
      response,
      model: currentModel,
      attemptedModels,
      fallbackUsed: false,
    };
  } catch (error) {
    if (isModelDecommissionedError(error)) {
      const nextModel = getNextFallbackModel(currentModel);
      if (nextModel) {
        attemptedModels.push(nextModel);
        try {
          const modelConfig = getModelConfig(nextModel);
          const response = await groq.chat.completions.create({
            messages,
            model: nextModel,
            temperature: modelConfig.temperature,
            max_tokens: Math.min(modelConfig.maxTokens, MAX_TOKENS),
            top_p: modelConfig.topP,
          });

          return {
            response,
            model: nextModel,
            attemptedModels,
            fallbackUsed: true,
          };
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
    }
    throw error;
  }
}

// MAIN NETLIFY FUNCTION HANDLER
export const handler = async (event) => {
  // CORS Headers
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const startTime = Date.now();

  try {
    // Parse request body
    const { message, sessionId, conversationHistory = [] } = JSON.parse(event.body || '{}');

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Message is required and must be a non-empty string' }),
      };
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Session ID is required' }),
      };
    }

    const trimmedMessage = message.trim().substring(0, 2000);
    const trimmedHistory = trimConversationHistory(conversationHistory);

    // 🎯 STEP 1: CHECK KNOWLEDGE BASE FIRST (Always works)
    // Import knowledge base search function
    const { searchKnowledgeBase } = await import('../../src/data/knowledgeBase.js');
    const knowledgeResponse = searchKnowledgeBase(trimmedMessage);
    
    if (knowledgeResponse) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          response: knowledgeResponse,
          source: 'knowledge',
          responseTime: Date.now() - startTime,
        }),
      };
    }

    // 🤖 STEP 2: TRY AI API (Only if knowledge base has no match)
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (GROQ_API_KEY && GROQ_API_KEY.trim().length > 0) {
      try {
        const groq = new Groq({ apiKey: GROQ_API_KEY });

        // Build messages array for AI
        const messages = [
          {
            role: 'system',
            content: 'You are Nova, a helpful AI assistant for TechMasterAI, a competitive programming platform. TechMasterAI was founded by Adarsh Kumar (Founder), with Akshat Singh as Co-Founder, Kartavya Rana as Managing Director, Amey Rathore as COO, Divyam as CMO, Jyoti Rana as HR Manager, Nikhil as Designer Head, and Aarushi as Operational Manager. The platform offers live coding collaboration, 1v1 CodeArena battles, DSA practice with 5000+ questions, and leaderboards with rewards. Keep responses concise, friendly, and focused on coding, programming, and tech topics. Maximum 2-3 sentences.',
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

        const groqResult = await callGroqWithFallback(groq, messages, GROQ_MODELS.primary, sessionId);
        const botResponse = groqResult.response.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a proper response. Please try rephrasing your question.';

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            response: botResponse,
            source: 'api',
            model: groqResult.model,
            fallbackUsed: groqResult.fallbackUsed,
            responseTime: Date.now() - startTime,
          }),
        };
      } catch (apiError) {
        // API failed - fall through to friendly fallback
        console.log('API call failed, using friendly fallback:', apiError.message);
      }
    }

    // 💬 STEP 3: FRIENDLY FALLBACK (When API is unavailable or fails)
    const friendlyFallback = `Hi there! I'm Nova, your TechMasterAI assistant! 🤖

I'd love to help you with questions about:
• **TechMasterAI platform** - Our features and services
• **Our team** - Leadership and company info  
• **Getting started** - How to join and compete
• **Programming topics** - Coding challenges and DSA

Try asking me something like "What is TechMasterAI?" or "Who founded the company?" - I have lots of information to share! 

*My AI capabilities are temporarily limited, but I can still help with TechMasterAI-related questions.*`;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        response: friendlyFallback,
        source: 'fallback',
        responseTime: Date.now() - startTime,
      }),
    };

  } catch (error) {
    // Final error handler - still return friendly response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        response: `Hello! I'm Nova from TechMasterAI! 🚀 I'm experiencing some technical difficulties right now, but I'd still love to help you learn about our competitive programming platform. Try asking me about TechMasterAI, our features, or our team!`,
        source: 'fallback',
        responseTime: Date.now() - startTime,
      }),
    };
  }
};