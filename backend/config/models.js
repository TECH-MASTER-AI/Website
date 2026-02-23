/**
 * Groq Model Configuration
 * Centralized model management with fallback support
 * Resilient to future model deprecations
 */

// Model configuration with fallback chain
const GROQ_MODELS = {
  // Primary model - fast and cost-efficient
  primary: 'llama-3.1-8b-instant',

  // Fallback model - more capable, slightly slower
  fallback: 'llama-3.1-70b-versatile',

  // Emergency fallback - if both above fail
  emergency: 'mixtral-8x7b-32768',
};

// Model-specific configurations
const MODEL_CONFIG = {
  'llama-3.1-8b-instant': {
    maxTokens: 300,
    temperature: 0.7,
    topP: 0.9,
    description: 'Fast, cost-efficient model',
  },
  'llama-3.1-70b-versatile': {
    maxTokens: 400,
    temperature: 0.7,
    topP: 0.9,
    description: 'Capable, balanced model',
  },
  'mixtral-8x7b-32768': {
    maxTokens: 500,
    temperature: 0.7,
    topP: 0.9,
    description: 'Expert mixture model',
  },
};

/**
 * Get the next model in fallback chain
 * @param {string} currentModel - Current model that failed
 * @returns {string|null} - Next model to try or null if no fallback
 */
function getNextFallbackModel(currentModel) {
  if (currentModel === GROQ_MODELS.primary) {
    return GROQ_MODELS.fallback;
  }
  if (currentModel === GROQ_MODELS.fallback) {
    return GROQ_MODELS.emergency;
  }
  return null;
}

/**
 * Get model configuration
 * @param {string} model - Model name
 * @returns {object} - Model configuration
 */
function getModelConfig(model) {
  return MODEL_CONFIG[model] || {
    maxTokens: 300,
    temperature: 0.7,
    topP: 0.9,
    description: 'Default configuration',
  };
}

/**
 * Validate model is in supported list
 * @param {string} model - Model name
 * @returns {boolean} - True if model is supported
 */
function isModelSupported(model) {
  return Object.values(GROQ_MODELS).includes(model);
}

/**
 * Get primary model
 * @returns {string} - Primary model name
 */
function getPrimaryModel() {
  return GROQ_MODELS.primary;
}

export {
  GROQ_MODELS,
  MODEL_CONFIG,
  getNextFallbackModel,
  getModelConfig,
  isModelSupported,
  getPrimaryModel,
};
