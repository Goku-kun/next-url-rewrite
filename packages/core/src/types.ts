/**
 * Pattern configuration for URL matching
 */
export interface RewritePattern {
  /**
   * URL segments to match. Use '*' as wildcard for any segment.
   * @example ['community', 'monthly-challenge', '*', '*']
   */
  segments: (string | "*")[];

  /**
   * Zero-indexed positions of segments to strip from matched URL
   * @example [3] // Strip 4th segment
   */
  stripSegments: number[];

  /**
   * Optional constraints on wildcard segment values
   * Keys are segment indices, values are allowed strings
   * @example { 3: ['submissions', 'winners'] }
   */
  allowedValues?: Record<number, string[]>;
}

/**
 * Complete rewrite rule configuration
 */
export interface RewriteRule {
  /**
   * Optional name for debugging and logging
   */
  name?: string;

  /**
   * Optional description of what this rule does
   */
  description?: string;

  /**
   * Pattern matching and transformation config
   */
  pattern: RewritePattern;
}

/**
 * Result of attempting to match and rewrite a URL
 */
export interface RewriteResult {
  /**
   * Whether the URL matched the pattern
   */
  matched: boolean;

  /**
   * Original URL pathname
   */
  original: string;

  /**
   * Rewritten URL if matched, undefined otherwise
   */
  rewritten?: string;

  /**
   * Name of the rule that matched, if any
   */
  rule?: string;
}

/**
 * Result of validating rewrite rules
 */
export interface ValidationResult {
  /**
   * Whether all rules are valid
   */
  valid: boolean;

  /**
   * Array of error messages
   */
  errors: string[];

  /**
   * Array of warning messages
   */
  warnings: string[];
}

/**
 * Internal parsed URL segment information
 */
export interface ParsedSegment {
  /**
   * Original segment value
   */
  value: string;

  /**
   * Zero-indexed position in URL
   */
  index: number;
}
