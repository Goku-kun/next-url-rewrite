import type { RewriteRule } from "@next-url-rewrite/core";

/**
 * Fluent API builder for creating rewrite rules
 */
export class RewriteBuilder {
  private ruleName?: string;
  private ruleDescription?: string;
  private pattern?: string;
  private segmentNames: Map<string, number> = new Map();
  private allowedValuesMap: Map<number, string[]> = new Map();
  private stripIndices: number[] = [];

  /**
   * Set rule name
   */
  name(name: string): this {
    this.ruleName = name;
    return this;
  }

  /**
   * Set rule description
   */
  description(description: string): this {
    this.ruleDescription = description;
    return this;
  }

  /**
   * Set URL pattern to match
   *
   * @param pattern - URL pattern with optional :param segments
   * @example '/user/:username/profile'
   */
  match(pattern: string): this {
    this.pattern = pattern;
    this.parsePattern(pattern);
    return this;
  }

  /**
   * Add constraint on segment values
   *
   * @param segmentName - Name of segment from pattern
   * @param values - Allowed values
   */
  when(segmentName: string, values: string[]): this {
    const index = this.segmentNames.get(segmentName);
    if (index === undefined) {
      throw new Error(
        `Segment '${segmentName}' not found in pattern. Available: ${Array.from(
          this.segmentNames.keys()
        ).join(", ")}`
      );
    }

    this.allowedValuesMap.set(index, values);
    return this;
  }

  /**
   * Mark segment to be stripped from URL
   *
   * @param segment - Segment name or index
   */
  stripSegment(segment: string | number): this {
    if (typeof segment === "number") {
      this.stripIndices.push(segment);
    } else {
      const index = this.segmentNames.get(segment);
      if (index === undefined) {
        throw new Error(
          `Segment '${segment}' not found in pattern. Available: ${Array.from(
            this.segmentNames.keys()
          ).join(", ")}`
        );
      }
      this.stripIndices.push(index);
    }

    return this;
  }

  /**
   * Build the final rewrite rule
   */
  build(): RewriteRule {
    if (!this.pattern) {
      throw new Error("match() is required before build()");
    }

    const segments = this.buildSegments();
    const allowedValues =
      this.allowedValuesMap.size > 0
        ? Object.fromEntries(this.allowedValuesMap)
        : undefined;

    return {
      name: this.ruleName,
      description: this.ruleDescription,
      pattern: {
        segments,
        stripSegments: [...new Set(this.stripIndices)].sort((a, b) => a - b),
        allowedValues,
      },
    };
  }

  /**
   * Parse pattern string into segments and parameter names
   */
  private parsePattern(pattern: string): void {
    const parts = pattern.split("/").filter((p) => p.length > 0);

    parts.forEach((part, index) => {
      if (part.startsWith(":")) {
        const paramName = part.slice(1);
        this.segmentNames.set(paramName, index);
      } else {
        this.segmentNames.set(part, index);
      }
    });
  }

  /**
   * Build segments array from pattern
   */
  private buildSegments(): (string | "*")[] {
    if (!this.pattern) return [];

    return this.pattern
      .split("/")
      .filter((p) => p.length > 0)
      .map((part) => (part.startsWith(":") ? "*" : part));
  }
}

/**
 * Creates a new rewrite rule builder
 *
 * @returns Fluent API builder instance
 *
 * @example
 * ```typescript
 * const rule = rewrite()
 *   .match('/user/:username/profile')
 *   .stripSegment('profile')
 *   .build()
 * ```
 */
export function rewrite(): RewriteBuilder {
  return new RewriteBuilder();
}
