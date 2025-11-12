import type { RewriteRule, ValidationResult } from "./types";

/**
 * Validates a single rewrite rule
 *
 * @param rule - Rule to validate
 * @returns Validation result with errors
 */
export function validateRule(rule: RewriteRule): ValidationResult {
  const errors: string[] = [];
  const ruleName = rule.name || "unnamed rule";

  // Check segments array is not empty
  if (rule.pattern.segments.length === 0) {
    errors.push("Pattern must have at least one segment");
  }

  // Check stripSegments indices are valid
  const maxIndex = rule.pattern.segments.length - 1;
  const seenIndices = new Set<number>();

  for (const index of rule.pattern.stripSegments) {
    if (index > maxIndex) {
      errors.push(
        `Rule '${ruleName}': stripSegments index ${index} exceeds pattern length ${rule.pattern.segments.length}`
      );
    }

    if (seenIndices.has(index)) {
      errors.push(`stripSegments contains duplicate index: ${index}`);
    }
    seenIndices.add(index);
  }

  // Check allowedValues references valid wildcard segments
  if (rule.pattern.allowedValues) {
    for (const [indexStr, values] of Object.entries(
      rule.pattern.allowedValues
    )) {
      const index = parseInt(indexStr, 10);

      if (index > maxIndex) {
        errors.push(
          `allowedValues index ${index} exceeds pattern length ${rule.pattern.segments.length}`
        );
        continue;
      }

      const segment = rule.pattern.segments[index];
      if (segment !== "*") {
        errors.push(
          `Rule '${ruleName}': allowedValues index ${index} references non-wildcard segment '${segment}'`
        );
      }

      if (!values || values.length === 0) {
        errors.push(
          `Rule '${ruleName}': allowedValues index ${index} has empty value array`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
}

/**
 * Checks if one pattern could shadow another
 */
function couldShadow(rule1: RewriteRule, rule2: RewriteRule): boolean {
  const p1 = rule1.pattern.segments;
  const p2 = rule2.pattern.segments;

  if (p1.length !== p2.length) {
    return false;
  }

  for (let i = 0; i < p1.length; i++) {
    const s1 = p1[i];
    const s2 = p2[i];

    // Wildcard can match anything
    if (s1 === "*" || s2 === "*") {
      continue;
    }

    // Literals must match
    if (s1 !== s2) {
      return false;
    }
  }

  return true;
}

/**
 * Validates an array of rewrite rules
 *
 * @param rules - Rules to validate
 * @returns Validation result with errors and warnings
 */
export function validateRules(rules: RewriteRule[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rules.length === 0) {
    warnings.push("No rewrite rules provided");
    return { valid: true, errors, warnings };
  }

  // Validate each rule
  for (const rule of rules) {
    const result = validateRule(rule);
    errors.push(...result.errors);
  }

  // Check for shadowing
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const earlier = rules[i];
      const later = rules[j];

      if (couldShadow(earlier, later)) {
        const laterName = later.name || `rule at index ${j}`;
        const earlierName = earlier.name || `rule at index ${i}`;
        warnings.push(
          `Rule '${laterName}' may shadow rule '${earlierName}' - consider reordering`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
