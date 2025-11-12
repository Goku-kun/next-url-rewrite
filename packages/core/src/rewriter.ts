import type { RewritePattern } from "./types";
import { matchPattern } from "./matcher";

/**
 * Result of URL rewrite operation
 */
export interface RewriteUrlResult {
  matched: boolean;
  original: string;
  rewritten?: string;
}

/**
 * Rewrites a URL by removing specified segments
 *
 * @param pathname - URL pathname to rewrite
 * @param pattern - Rewrite pattern configuration
 * @returns Rewrite result with original and rewritten URLs
 *
 * @example
 * ```typescript
 * const result = rewriteUrl('/user/profile/certificates', {
 *   segments: ['user', 'profile', 'certificates'],
 *   stripSegments: [2]
 * })
 * // result.rewritten === '/user/profile'
 * ```
 */
export function rewriteUrl(
  pathname: string,
  pattern: RewritePattern
): RewriteUrlResult {
  const matchResult = matchPattern(pathname, pattern);

  if (!matchResult.matched || !matchResult.segments) {
    return { matched: false, original: pathname };
  }

  // No segments to strip - return original
  if (pattern.stripSegments.length === 0) {
    return {
      matched: true,
      original: pathname,
      rewritten: pathname.endsWith("/") ? pathname.slice(0, -1) : pathname,
    };
  }

  // Create a set of indices to strip for O(1) lookup
  const indicesToStrip = new Set(pattern.stripSegments);

  // Filter out segments that should be stripped
  const remainingSegments = matchResult.segments
    .filter((segment) => !indicesToStrip.has(segment.index))
    .map((segment) => segment.value);

  // Build rewritten URL
  const rewritten =
    remainingSegments.length > 0 ? "/" + remainingSegments.join("/") : "/";

  return {
    matched: true,
    original: pathname,
    rewritten,
  };
}
