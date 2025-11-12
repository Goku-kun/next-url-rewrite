import { validateRules } from "@next-url-rewrite/core";
import type { RewriteRule } from "@next-url-rewrite/core";
import { pathToFileURL } from "url";

/**
 * Options for config loading
 */
export interface LoadConfigOptions {
  /**
   * Validate config after loading
   * @default true
   */
  validate?: boolean;
}

/**
 * Loads rewrite rules from a configuration file
 *
 * Supports both CommonJS (.js, .cjs) and ESM (.mjs, .js with type: module)
 *
 * @param configPath - Absolute path to config file
 * @param options - Loading options
 * @returns Array of rewrite rules
 *
 * @example
 * ```typescript
 * const rules = await loadConfig('./rewrites.config.js')
 * ```
 */
export async function loadConfig(
  configPath: string,
  options: LoadConfigOptions = {}
): Promise<RewriteRule[]> {
  const { validate = true } = options;

  try {
    // Dynamic import works for both CJS and ESM
    const fileUrl = pathToFileURL(configPath).href;
    const module = await import(/* webpackIgnore: true */ fileUrl);

    // Handle default export or direct export
    let config = module.default || module;

    // Normalize single rule to array
    if (!Array.isArray(config)) {
      config = [config];
    }

    // Validate if requested
    if (validate) {
      const validationResult = validateRules(config);
      if (!validationResult.valid) {
        throw new Error(
          `Config validation failed:\n${validationResult.errors.join("\n")}`
        );
      }

      // Log warnings if any
      if (validationResult.warnings.length > 0) {
        console.warn(
          "[next-url-rewrite] Warnings:\n",
          validationResult.warnings.join("\n")
        );
      }
    }

    return config as RewriteRule[];
  } catch (error) {
    throw new Error(
      `Failed to load config from ${configPath}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
