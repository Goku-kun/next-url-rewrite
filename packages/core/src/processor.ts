import type { RewriteRule, RewriteResult } from "./types";
import { rewriteUrl } from "./rewriter";

/**
 * Processes an array of rewrite rules against a URL pathname
 * Returns the result of the first matching rule
 *
 * @param pathname - URL pathname to process
 * @param rules - Array of rewrite rules to try in order
 * @returns Rewrite result with matched rule information
 *
 * @example
 * ```typescript
 * const result = processRules('/user/certificates', [
 *   {
 *     name: 'strip-certs',
 *     pattern: {
 *       segments: ['*', 'certificates'],
 *       stripSegments: [1]
 *     }
 *   }
 * ])
 * // result.matched === true
 * // result.rewritten === '/user'
 * // result.rule === 'strip-certs'
 * ```
 */
export function processRules(
  pathname: string,
  rules: RewriteRule[]
): RewriteResult {
  // Try each rule in order
  for (const rule of rules) {
    const result = rewriteUrl(pathname, rule.pattern);

    if (result.matched) {
      return {
        matched: true,
        original: result.original,
        rewritten: result.rewritten,
        rule: rule.name,
      };
    }
  }

  // No rules matched
  return {
    matched: false,
    original: pathname,
  };
}
