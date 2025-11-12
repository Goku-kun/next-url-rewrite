import { describe, it, expect } from "vitest";
import { matchPattern } from "../src/matcher";

describe("matchPattern", () => {
  it("should match exact segment pattern", () => {
    const result = matchPattern("/community/monthly-challenge", {
      segments: ["community", "monthly-challenge"],
      stripSegments: [],
    });

    expect(result.matched).toBe(true);
    expect(result.segments).toEqual([
      { value: "community", index: 0 },
      { value: "monthly-challenge", index: 1 },
    ]);
  });

  it("should not match different segments", () => {
    const result = matchPattern("/community/project-showcase", {
      segments: ["community", "monthly-challenge"],
      stripSegments: [],
    });

    expect(result.matched).toBe(false);
  });

  it("should match wildcard segments", () => {
    const result = matchPattern("/community/monthly-challenge/jan-2024", {
      segments: ["community", "monthly-challenge", "*"],
      stripSegments: [],
    });

    expect(result.matched).toBe(true);
    expect(result.segments?.[2].value).toBe("jan-2024");
  });

  it("should validate allowedValues constraints", () => {
    const pattern = {
      segments: ["community", "monthly-challenge", "*", "*"],
      stripSegments: [],
      allowedValues: { 3: ["submissions", "winners"] },
    };

    const validResult = matchPattern(
      "/community/monthly-challenge/jan-2024/submissions",
      pattern
    );
    expect(validResult.matched).toBe(true);

    const invalidResult = matchPattern(
      "/community/monthly-challenge/jan-2024/invalid",
      pattern
    );
    expect(invalidResult.matched).toBe(false);
  });

  it("should handle trailing slashes", () => {
    const pattern = {
      segments: ["community"],
      stripSegments: [],
    };

    expect(matchPattern("/community", pattern).matched).toBe(true);
    expect(matchPattern("/community/", pattern).matched).toBe(true);
  });

  it("should handle empty segments gracefully", () => {
    const result = matchPattern("/community//monthly-challenge", {
      segments: ["community", "monthly-challenge"],
      stripSegments: [],
    });

    expect(result.matched).toBe(false);
  });
});
