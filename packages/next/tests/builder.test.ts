import { describe, it, expect } from "vitest";
import { rewrite } from "../src/builder";

describe("rewrite builder", () => {
  it("should build simple rewrite rule", () => {
    const rule = rewrite()
      .match("/user/:username/profile")
      .stripSegment("profile")
      .build();

    expect(rule.pattern.segments).toEqual(["user", "*", "profile"]);
    expect(rule.pattern.stripSegments).toContain(2);
  });

  it("should support when() for allowedValues", () => {
    const rule = rewrite()
      .match("/community/challenge/:id/:tab")
      .when("tab", ["submissions", "winners"])
      .stripSegment("tab")
      .build();

    expect(rule.pattern.allowedValues).toEqual({
      3: ["submissions", "winners"],
    });
  });

  it("should support name and description", () => {
    const rule = rewrite()
      .name("test-rule")
      .description("This is a test")
      .match("/test")
      .build();

    expect(rule.name).toBe("test-rule");
    expect(rule.description).toBe("This is a test");
  });

  it("should strip multiple segments by name", () => {
    const rule = rewrite()
      .match("/:user/posts/:category/archive")
      .stripSegment("category")
      .stripSegment("archive")
      .build();

    expect(rule.pattern.stripSegments).toEqual([2, 3]);
  });

  it("should strip multiple segments by index", () => {
    const rule = rewrite()
      .match("/a/b/c/d")
      .stripSegment(1)
      .stripSegment(3)
      .build();

    expect(rule.pattern.stripSegments).toEqual([1, 3]);
  });

  it("should throw error when building without match()", () => {
    expect(() => {
      rewrite().build();
    }).toThrow(/match.*required/i);
  });

  it("should throw error for invalid segment name in when()", () => {
    expect(() => {
      rewrite().match("/user/:id").when("nonexistent", ["value"]).build();
    }).toThrow(/segment.*nonexistent/i);
  });

  it("should throw error for invalid segment name in stripSegment()", () => {
    expect(() => {
      rewrite().match("/user/:id").stripSegment("nonexistent").build();
    }).toThrow(/segment.*nonexistent/i);
  });

  it("should support chaining", () => {
    const rule = rewrite()
      .name("chain-test")
      .description("Testing chaining")
      .match("/a/:b/c")
      .when("b", ["x", "y"])
      .stripSegment("c")
      .build();

    expect(rule.name).toBe("chain-test");
    expect(rule.pattern.segments).toEqual(["a", "*", "c"]);
    expect(rule.pattern.allowedValues).toBeDefined();
    expect(rule.pattern.stripSegments).toContain(2);
  });
});
