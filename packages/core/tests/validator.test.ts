import { describe, it, expect } from "vitest";
import { validateRule, validateRules } from "../src/validator";
import type { RewriteRule } from "../src/types";

describe("validateRule", () => {
  it("should validate correct rule", () => {
    const rule: RewriteRule = {
      name: "test-rule",
      pattern: {
        segments: ["a", "b", "*"],
        stripSegments: [2],
      },
    };

    const result = validateRule(rule);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should error when stripSegments index exceeds pattern length", () => {
    const rule: RewriteRule = {
      name: "bad-rule",
      pattern: {
        segments: ["a", "b"],
        stripSegments: [5],
      },
    };

    const result = validateRule(rule);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Rule 'bad-rule': stripSegments index 5 exceeds pattern length 2"
    );
  });

  it("should error when allowedValues references non-wildcard segment", () => {
    const rule: RewriteRule = {
      name: "bad-allowed",
      pattern: {
        segments: ["literal", "value"],
        stripSegments: [],
        allowedValues: { 0: ["test"] },
      },
    };

    const result = validateRule(rule);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Rule 'bad-allowed': allowedValues index 0 references non-wildcard segment 'literal'"
    );
  });

  it("should error when allowedValues index out of bounds", () => {
    const rule: RewriteRule = {
      pattern: {
        segments: ["*"],
        stripSegments: [],
        allowedValues: { 5: ["test"] },
      },
    };

    const result = validateRule(rule);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "allowedValues index 5 exceeds pattern length 1"
    );
  });

  it("should error on empty segments array", () => {
    const rule: RewriteRule = {
      pattern: {
        segments: [],
        stripSegments: [],
      },
    };

    const result = validateRule(rule);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Pattern must have at least one segment");
  });

  it("should error on duplicate stripSegments indices", () => {
    const rule: RewriteRule = {
      pattern: {
        segments: ["a", "b", "c"],
        stripSegments: [1, 1, 2],
      },
    };

    const result = validateRule(rule);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "stripSegments contains duplicate index: 1"
    );
  });

  it("should accumulate multiple errors", () => {
    const rule: RewriteRule = {
      name: "very-bad",
      pattern: {
        segments: ["a"],
        stripSegments: [5, 10],
      },
    };

    const result = validateRule(rule);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe("validateRules", () => {
  it("should validate array of correct rules", () => {
    const rules: RewriteRule[] = [
      {
        name: "rule-1",
        pattern: { segments: ["a"], stripSegments: [] },
      },
      {
        name: "rule-2",
        pattern: { segments: ["b", "*"], stripSegments: [1] },
      },
    ];

    const result = validateRules(rules);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should collect errors from multiple invalid rules", () => {
    const rules: RewriteRule[] = [
      {
        name: "bad-1",
        pattern: { segments: [], stripSegments: [] },
      },
      {
        name: "bad-2",
        pattern: { segments: ["a"], stripSegments: [10] },
      },
    ];

    const result = validateRules(rules);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("should warn about potential rule conflicts", () => {
    const rules: RewriteRule[] = [
      {
        name: "specific",
        pattern: { segments: ["user", "profile"], stripSegments: [] },
      },
      {
        name: "wildcard",
        pattern: { segments: ["*", "*"], stripSegments: [] },
      },
    ];

    const result = validateRules(rules);

    expect(result.valid).toBe(true);
    expect(result.warnings).toContain(
      "Rule 'wildcard' may shadow rule 'specific' - consider reordering"
    );
  });

  it("should handle empty rules array", () => {
    const result = validateRules([]);

    expect(result.valid).toBe(true);
    expect(result.warnings).toContain("No rewrite rules provided");
  });
});
