/**
 * Health check function for Netlify deployment
 * Endpoint: /.netlify/functions/health
 */

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      provider: 'groq',
      deployment: 'netlify',
      functions: {
        chat: '/.netlify/functions/chat',
        health: '/.netlify/functions/health',
      },
      environment: {
        nodeVersion: process.version,
        hasGroqKey: !!process.env.GROQ_API_KEY,
        groqKeyLength: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0,
        envVarCount: Object.keys(process.env).length,
        groqEnvVars: Object.keys(process.env).filter(key => key.includes('GROQ')),
        allEnvKeys: Object.keys(process.env).sort()
      },
      apiKeyConfigured: !!process.env.GROQ_API_KEY,
      message: process.env.GROQ_API_KEY ? 'All systems operational' : 'Missing GROQ_API_KEY environment variable'
    }),
  };
};
