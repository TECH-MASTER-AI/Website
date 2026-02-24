/**
 * Code Complexity Analysis Utility
 * Analyzes code to provide heuristic complexity estimates
 */

export interface ComplexityResult {
  hasLoops: boolean;
  hasNestedLoops: boolean;
  hasRecursion: boolean;
  estimatedComplexity: 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(2^n)' | 'Unknown';
  warnings: string[];
}

/**
 * Detect loops in code
 */
function detectLoops(code: string): { hasLoop: boolean; nestedLevel: number } {
  let nestedLevel = 0;
  let maxNestedLevel = 0;
  const lines = code.toLowerCase().split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Check for for, while, do-while loops
    if (trimmed.includes('for (') || trimmed.includes('while (') || trimmed.includes('do {')) {
      nestedLevel++;
      maxNestedLevel = Math.max(maxNestedLevel, nestedLevel);
    }
    // Count closing braces to track nesting (rough estimate)
    const closingBraces = (trimmed.match(/}/g) || []).length;
    nestedLevel = Math.max(0, nestedLevel - closingBraces);
  }

  return { hasLoop: maxNestedLevel > 0, nestedLevel: maxNestedLevel };
}

/**
 * Detect recursion (function calling itself)
 */
function detectRecursion(code: string): boolean {
  const functionPatterns = [
    /(?:function\s+\w+|\w+\s*(?=\())\s*\{/g,
    /(?:def\s+\w+|int\s+main|public\s+static\s+void\s+main)/g,
  ];

  // Extract function bodies
  const functionBodies: string[] = [];
  
  // Simple approach: look for function calls that match common function names
  const words = code.match(/\b[a-zA-Z_]\w*\b/g) || [];
  const uniqueWords = [...new Set(words)];
  
  // Check if any word appears multiple times in a pattern suggesting recursion
  for (const word of uniqueWords.slice(0, 50)) { // Limit checks
    if (word.length > 2) {
      const recursionPattern = new RegExp(`\\b${word}\\s*\\(`, 'g');
      const matches = code.match(recursionPattern) || [];
      if (matches.length > 1) {
        // More than one occurrence suggests potential recursion
        return true;
      }
    }
  }

  // Check for common recursion indicators
  if (code.toLowerCase().includes('function') || code.includes('def ')) {
    // Look for function calling itself
    const functionNames = code.match(/(?:function\s+|def\s+|public\s+static\s+\w+\s+)\s*(\w+)/g) || [];
    for (const fn of functionNames) {
      const name = fn.replace(/(?:function\s+|def\s+|public\s+static\s+\w+\s+)/, '').trim();
      if (name && code.includes(`${name}(`) && code.includes(`${name}(`)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Detect divide and conquer patterns
 */
function detectDivideConquer(code: string): boolean {
  const patterns = [
    /\b(mid|left\s*\+\s*right|low\s*,\s*high)\b/,
    /\b(merge|quick|binary)\s*\(?/,
    /\b(start\s*\+\s*end|divide|conquer)\b/,
  ];

  return patterns.some(pattern => pattern.test(code.toLowerCase()));
}

/**
 * Analyze code complexity
 */
export function analyzeComplexity(code: string): ComplexityResult {
  const warnings: string[] = [];
  const { hasLoop, nestedLevel } = detectLoops(code);
  const hasRecursion = detectRecursion(code);
  const hasDivideConquer = detectDivideConquer(code);

  let estimatedComplexity: ComplexityResult['estimatedComplexity'] = 'Unknown';

  if (hasLoop) {
    if (nestedLevel >= 2) {
      estimatedComplexity = 'O(n²)';
      warnings.push('Nested loops detected - O(n²) complexity');
    } else if (hasDivideConquer) {
      estimatedComplexity = 'O(n log n)';
      warnings.push('Divide and conquer pattern detected - O(n log n)');
    } else {
      estimatedComplexity = 'O(n)';
    }
  } else if (hasRecursion) {
    if (hasDivideConquer) {
      estimatedComplexity = 'O(n log n)';
      warnings.push('Recursive divide and conquer detected - O(n log n)');
    } else {
      estimatedComplexity = 'O(2^n)';
      warnings.push('Recursion detected - potential exponential complexity');
    }
  } else {
    // No loops or recursion - likely O(1) or very simple
    estimatedComplexity = 'O(1)';
  }

  if (code.length < 20) {
    warnings.push('Code is very short - consider adding solution logic');
  }

  return {
    hasLoops: hasLoop,
    hasNestedLoops: nestedLevel >= 2,
    hasRecursion,
    estimatedComplexity,
    warnings,
  };
}

/**
 * Get complexity color for UI
 */
export function getComplexityColor(complexity: ComplexityResult['estimatedComplexity']): string {
  switch (complexity) {
    case 'O(1)':
      return 'text-green-400';
    case 'O(log n)':
      return 'text-green-400';
    case 'O(n)':
      return 'text-yellow-400';
    case 'O(n log n)':
      return 'text-orange-400';
    case 'O(n²)':
      return 'text-red-400';
    case 'O(2^n)':
      return 'text-red-500';
    default:
      return 'text-slate-400';
  }
}

/**
 * Get complexity badge class
 */
export function getComplexityBadgeClass(complexity: ComplexityResult['estimatedComplexity']): string {
  switch (complexity) {
    case 'O(1)':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'O(log n)':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'O(n)':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'O(n log n)':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'O(n²)':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'O(2^n)':
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}
