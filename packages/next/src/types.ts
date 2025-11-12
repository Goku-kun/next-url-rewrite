/**
 * Options for createMiddleware
 */
export interface MiddlewareOptions {
  /**
   * Enable debug logging to console
   * @default false
   */
  debug?: boolean;

  /**
   * Custom logger function
   */
  logger?: (message: string) => void;
}

/**
 * Next.js middleware function type
 */
export type NextMiddleware = (
  request: any
) => Promise<Response | undefined> | Response | undefined;
