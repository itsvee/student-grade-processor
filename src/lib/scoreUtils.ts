/**
 * Utility functions for handling Excel score data
 */

export interface ScoreProcessingOptions {
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  decimalPlaces?: number;
  allowNegative?: boolean;
}

/**
 * Process and validate a single score value from Excel
 */
export function processScoreValue(
  value: unknown, 
  options: ScoreProcessingOptions = {}
): number {
  const {
    defaultValue = 0,
    minValue = 0,
    maxValue = 100,
    decimalPlaces = 2,
    allowNegative = false
  } = options;

  let score: number;

  // Handle null, undefined, or empty string
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  // Handle numeric values directly
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      return defaultValue;
    }
    score = value;
  } 
  // Handle string values
  else if (typeof value === 'string') {
    const trimmed = value.trim();
    
    // Handle common empty representations
    if (trimmed === '' || trimmed === '-' || trimmed === 'N/A' || trimmed === 'NA') {
      return defaultValue;
    }
    
    // Try to parse as number
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed)) {
      return defaultValue;
    }
    score = parsed;
  }
  // Handle other types (boolean, date, etc.)
  else {
    const parsed = parseFloat(String(value));
    if (isNaN(parsed)) {
      return defaultValue;
    }
    score = parsed;
  }

  // Round to specified decimal places
  score = Math.round(score * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);

  // Apply range validation
  if (!allowNegative && score < 0) {
    score = defaultValue;
  }
  
  score = Math.max(minValue, Math.min(maxValue, score));

  return score;
}

/**
 * Process an array of score values from an Excel row
 */
export function processScoreArray(
  row: unknown[], 
  startIndex: number = 3, 
  endIndex: number = 8,
  options: ScoreProcessingOptions = {}
): number[] {
  const scores: number[] = [];
  
  for (let i = startIndex; i <= endIndex; i++) {
    const scoreValue = row[i];
    const processedScore = processScoreValue(scoreValue, options);
    scores.push(processedScore);
  }
  
  return scores;
}

/**
 * Validate that all scores are within acceptable ranges
 */
export function validateScoreArray(
  scores: number[],
  minValue: number = 0,
  maxValue: number = 100
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  scores.forEach((score, index) => {
    if (score < minValue || score > maxValue) {
      errors.push(`Score ${index + 1} (${score}) is outside valid range [${minValue}-${maxValue}]`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format scores for display
 */
export function formatScoresForDisplay(scores: number[], decimalPlaces: number = 2): string[] {
  return scores.map(score => 
    score === 0 ? '0' : score.toFixed(decimalPlaces).replace(/\.?0+$/, '')
  );
}

/**
 * Calculate statistics for a set of scores
 */
export function calculateScoreStatistics(scores: number[]): {
  min: number;
  max: number;
  average: number;
  total: number;
  nonZeroCount: number;
} {
  const nonZeroScores = scores.filter(score => score > 0);
  
  return {
    min: scores.length > 0 ? Math.min(...scores) : 0,
    max: scores.length > 0 ? Math.max(...scores) : 0,
    average: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
    total: scores.reduce((sum, score) => sum + score, 0),
    nonZeroCount: nonZeroScores.length
  };
}