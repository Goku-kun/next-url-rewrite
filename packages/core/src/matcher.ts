import type { RewritePattern, ParsedSegment } from "./types";

/**
 * Result of pattern matching operation
 */
export interface MatchResult {
  matched: boolean;
  segments?: ParsedSegment[];
}

/**
 * Normalizes URL pathname by removing trailing slashes and empty segments
 */
function normalizePathname(pathname: string): string {
  return pathname
    .split("/")
    .filter((segment) => segment.length > 0)
    .join("/");
}

/**
 * Parses pathname into array of segments
 */
function parseSegments(pathname: string): ParsedSegment[] {
  const normalized = normalizePathname(pathname);
  return normalized.split("/").map((value, index) => ({ value, index }));
}

/**
 * Checks if a segment matches the pattern segment
 * @param segment - Actual URL segment
 * @param pattern - Pattern segment ('*' or literal string)
 * @param allowedValue - Optional allowed values for wildcard
 */
function segmentMatches(
  segment: string,
  pattern: string,
  allowedValues?: string[]
): boolean {
  if (pattern === "*") {
    if (allowedValues && allowedValues.length > 0) {
      return allowedValues.includes(segment);
    }
    return true;
  }
  return segment === pattern;
}

/**
 * Matches a URL pathname against a rewrite pattern
 *
 * @param pathname - URL pathname to match (e.g., '/community/monthly-challenge/jan-2024')
 * @param pattern - Pattern configuration
 * @returns Match result with segments if matched
 *
 * @example
 * ```typescript
 * const result = matchPattern('/user/profile', {
 *   segments: ['user', '*'],
 *   stripSegments: []
 * })
 * // result.matched === true
 * // result.segments === [{ value: 'user', index: 0 }, { value: 'profile', index: 1 }]
 * ```
 */
export function matchPattern(
  pathname: string,
  pattern: RewritePattern
): MatchResult {
  // Check for empty segments (consecutive slashes) before normalization
  // This catches malformed URLs like '/community//monthly-challenge'
  if (pathname.includes("//")) {
    return { matched: false };
  }

  const segments = parseSegments(pathname);

  // Length must match
  if (segments.length !== pattern.segments.length) {
    return { matched: false };
  }

  // Check each segment
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i].value;
    const patternSegment = pattern.segments[i];
    const allowedValues = pattern.allowedValues?.[i];

    if (!segmentMatches(segment, patternSegment, allowedValues)) {
      return { matched: false };
    }
  }

  return { matched: true, segments };
}
