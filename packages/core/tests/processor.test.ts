import { describe, it, expect } from "vitest";
import { processRules } from "../src/processor";
import type { RewriteRule } from "../src/types";

describe("processRules", () => {
  it("should process single matching rule", () => {
    const rules: RewriteRule[] = [
      {
        name: "strip-certificates",
        pattern: {
          segments: ["*", "certificates"],
          stripSegments: [1],
        },
      },
    ];

    const result = processRules("/john/certificates", rules);

    expect(result.matched).toBe(true);
    expect(result.rewritten).toBe("/john");
    expect(result.rule).toBe("strip-certificates");
  });

  it("should try rules in order and use first match", () => {
    const rules: RewriteRule[] = [
      {
        name: "rule-1",
        pattern: {
          segments: ["specific", "path"],
          stripSegments: [],
        },
      },
      {
        name: "rule-2",
        pattern: {
          segments: ["*", "*"],
          stripSegments: [1],
        },
      },
    ];

    const result = processRules("/specific/path", rules);

    expect(result.matched).toBe(true);
    expect(result.rule).toBe("rule-1");
  });

  it("should return unmatched result when no rules match", () => {
    const rules: RewriteRule[] = [
      {
        pattern: {
          segments: ["specific", "path"],
          stripSegments: [],
        },
      },
    ];

    const result = processRules("/different/path", rules);

    expect(result.matched).toBe(false);
    expect(result.rewritten).toBeUndefined();
    expect(result.rule).toBeUndefined();
  });

  it("should handle empty rules array", () => {
    const result = processRules("/any/path", []);

    expect(result.matched).toBe(false);
  });

  it("should handle complex multi-rule scenario", () => {
    const rules: RewriteRule[] = [
      {
        name: "monthly-challenge-tabs",
        pattern: {
          segments: ["community", "monthly-challenge", "*", "*"],
          stripSegments: [3],
          allowedValues: { 3: ["submissions", "winners"] },
        },
      },
      {
        name: "profile-certificates",
        pattern: {
          segments: ["*", "certificates"],
          stripSegments: [1],
        },
      },
    ];

    const result1 = processRules(
      "/community/monthly-challenge/jan-2024/submissions",
      rules
    );
    expect(result1.matched).toBe(true);
    expect(result1.rule).toBe("monthly-challenge-tabs");
    expect(result1.rewritten).toBe("/community/monthly-challenge/jan-2024");

    const result2 = processRules("/alice/certificates", rules);
    expect(result2.matched).toBe(true);
    expect(result2.rule).toBe("profile-certificates");
    expect(result2.rewritten).toBe("/alice");

    const result3 = processRules("/unmatched/path", rules);
    expect(result3.matched).toBe(false);
  });

  it("should preserve original URL in result", () => {
    const rules: RewriteRule[] = [
      {
        pattern: {
          segments: ["test"],
          stripSegments: [],
        },
      },
    ];

    const result = processRules("/test", rules);
    expect(result.original).toBe("/test");
  });
});
