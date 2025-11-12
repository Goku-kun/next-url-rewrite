import { describe, it, expect } from "vitest";
import { rewriteUrl } from "../src/rewriter";

describe("rewriteUrl", () => {
  it("should strip single segment", () => {
    const result = rewriteUrl("/user/profile/certificates", {
      segments: ["*", "profile", "certificates"],
      stripSegments: [2],
    });

    expect(result.matched).toBe(true);
    expect(result.rewritten).toBe("/user/profile");
    expect(result.original).toBe("/user/profile/certificates");
  });

  it("should strip multiple segments", () => {
    const result = rewriteUrl("/a/b/c/d/e", {
      segments: ["a", "b", "c", "d", "e"],
      stripSegments: [1, 3],
    });

    expect(result.matched).toBe(true);
    expect(result.rewritten).toBe("/a/c/e");
  });

  it("should preserve leading slash", () => {
    const result = rewriteUrl("/community", {
      segments: ["community"],
      stripSegments: [],
    });

    expect(result.rewritten).toBe("/community");
  });

  it("should handle no segments to strip", () => {
    const result = rewriteUrl("/path/to/resource", {
      segments: ["path", "to", "resource"],
      stripSegments: [],
    });

    expect(result.matched).toBe(true);
    expect(result.rewritten).toBe("/path/to/resource");
  });

  it("should return matched: false for non-matching URL", () => {
    const result = rewriteUrl("/wrong/path", {
      segments: ["correct", "path"],
      stripSegments: [],
    });

    expect(result.matched).toBe(false);
    expect(result.rewritten).toBeUndefined();
  });

  it("should handle allowedValues filtering", () => {
    const pattern = {
      segments: ["community", "monthly-challenge", "*", "*"],
      stripSegments: [3],
      allowedValues: { 3: ["submissions", "winners"] },
    };

    const validResult = rewriteUrl(
      "/community/monthly-challenge/jan-2024/submissions",
      pattern
    );
    expect(validResult.matched).toBe(true);
    expect(validResult.rewritten).toBe("/community/monthly-challenge/jan-2024");

    const invalidResult = rewriteUrl(
      "/community/monthly-challenge/jan-2024/leaderboard",
      pattern
    );
    expect(invalidResult.matched).toBe(false);
  });

  it("should handle edge case of stripping all segments", () => {
    const result = rewriteUrl("/only", {
      segments: ["only"],
      stripSegments: [0],
    });

    expect(result.matched).toBe(true);
    expect(result.rewritten).toBe("/");
  });

  it("should sort stripSegments indices to strip correctly", () => {
    const result = rewriteUrl("/a/b/c/d", {
      segments: ["a", "b", "c", "d"],
      stripSegments: [3, 1], // Unsorted indices
    });

    expect(result.rewritten).toBe("/a/c");
  });
});
