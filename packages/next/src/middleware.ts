import { processRules } from "@next-url-rewrite/core";
import type { RewriteRule } from "@next-url-rewrite/core";
import type { MiddlewareOptions, NextMiddleware } from "./types";

// Declare global NextResponse type
declare global {
  var NextResponse:
    | {
        rewrite(url: string | URL): any;
        next(): any;
      }
    | undefined;
}

/**
 * Extracts pathname from Next.js request (handles both App and Pages Router)
 */
function getPathname(request: any): string {
  // App Router - request is native Request
  if (request instanceof Request || request.url) {
    const url = new URL(request.url);
    return url.pathname;
  }

  // Pages Router - request has nextUrl property
  if (request.nextUrl && request.nextUrl.pathname) {
    return request.nextUrl.pathname;
  }

  throw new Error("Unable to extract pathname from request");
}

/**
 * Extracts full URL from Next.js request
 */
function getFullUrl(request: any): URL {
  if (request instanceof Request || request.url) {
    return new URL(request.url);
  }

  if (request.nextUrl) {
    const pathname = request.nextUrl.pathname;
    const search = request.nextUrl.search || "";
    return new URL(`${pathname}${search}`, "http://localhost");
  }

  throw new Error("Unable to extract URL from request");
}

/**
 * Creates a Next.js middleware function that applies URL rewrite rules
 *
 * @param rules - Single rule or array of rewrite rules
 * @param options - Optional configuration
 * @returns Next.js middleware function
 *
 * @example
 * ```typescript
 * // middleware.ts
 * import { createMiddleware } from '@next-url-rewrite/next'
 *
 * export default createMiddleware([
 *   {
 *     pattern: {
 *       segments: ['user', '*', 'profile'],
 *       stripSegments: [2]
 *     }
 *   }
 * ])
 * ```
 */
export function createMiddleware(
  rules: RewriteRule | RewriteRule[],
  options: MiddlewareOptions = {}
): NextMiddleware {
  const rulesArray = Array.isArray(rules) ? rules : [rules];
  const debug = options.debug || false;
  const logger = options.logger || console.log;

  return async function middleware(request: any) {
    try {
      const pathname = getPathname(request);
      const fullUrl = getFullUrl(request);

      if (debug) {
        logger(`[next-url-rewrite] Checking: ${pathname}`);
      }

      const result = processRules(pathname, rulesArray);

      if (result.matched && result.rewritten) {
        if (debug) {
          logger(
            `[next-url-rewrite] ✓ Matched rule: ${result.rule || "unnamed"}`
          );
          logger(
            `[next-url-rewrite] Rewriting: ${result.original} → ${result.rewritten}`
          );
        }

        // Build rewritten URL with query string
        const rewrittenUrl = new URL(fullUrl);
        rewrittenUrl.pathname = result.rewritten;

        // Use NextResponse if available (should be imported by user)
        if (globalThis.NextResponse) {
          return globalThis.NextResponse.rewrite(rewrittenUrl);
        }

        // Fallback for testing
        return new Response(null, {
          headers: {
            "x-middleware-rewrite": rewrittenUrl.toString(),
          },
        });
      }

      if (debug) {
        logger(`[next-url-rewrite] ✗ No match for: ${pathname}`);
      }

      // No match - pass through
      if (globalThis.NextResponse) {
        return globalThis.NextResponse.next();
      }

      return undefined;
    } catch (error) {
      if (debug) {
        logger(`[next-url-rewrite] Error: ${error}`);
      }
      throw error;
    }
  };
}
