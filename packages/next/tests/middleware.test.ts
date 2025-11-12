import { describe, it, expect, vi } from "vitest";
import { createMiddleware } from "../src/middleware";
import type { RewriteRule } from "@next-url-rewrite/core";

// Mock Next.js Request and Response
class MockRequest {
  constructor(
    public url: string,
    public nextUrl?: { pathname: string }
  ) {}
}

class MockNextResponse {
  static rewrite(url: string | URL) {
    return { type: "rewrite", url: url.toString() };
  }

  static next() {
    return { type: "next" };
  }
}

// Mock global NextResponse
globalThis.NextResponse = MockNextResponse as any;

describe("createMiddleware", () => {
  it("should create middleware function", () => {
    const rules: RewriteRule[] = [];
    const middleware = createMiddleware(rules);

    expect(typeof middleware).toBe("function");
  });

  it("should rewrite matching URL in App Router", async () => {
    const rules: RewriteRule[] = [
      {
        name: "test-rule",
        pattern: {
          segments: ["user", "*", "profile"],
          stripSegments: [2],
        },
      },
    ];

    const middleware = createMiddleware(rules);
    const request = new MockRequest("https://example.com/user/john/profile");

    const response = await middleware(request);

    expect(response).toEqual({
      type: "rewrite",
      url: expect.stringContaining("/user/john"),
    });
  });

  it("should rewrite matching URL in Pages Router", async () => {
    const rules: RewriteRule[] = [
      {
        pattern: {
          segments: ["*", "certificates"],
          stripSegments: [1],
        },
      },
    ];

    const middleware = createMiddleware(rules);
    const request = new MockRequest("https://example.com/alice/certificates", {
      pathname: "/alice/certificates",
    });

    const response = await middleware(request);

    expect(response).toEqual({
      type: "rewrite",
      url: expect.stringContaining("/alice"),
    });
  });

  it("should pass through non-matching URL", async () => {
    const rules: RewriteRule[] = [
      {
        pattern: {
          segments: ["specific", "path"],
          stripSegments: [],
        },
      },
    ];

    const middleware = createMiddleware(rules);
    const request = new MockRequest("https://example.com/different/path");

    const response = await middleware(request);

    expect(response).toEqual({ type: "next" });
  });

  it("should handle debug mode logging", async () => {
    const logger = vi.fn();
    const rules: RewriteRule[] = [
      {
        name: "debug-rule",
        pattern: {
          segments: ["test"],
          stripSegments: [],
        },
      },
    ];

    const middleware = createMiddleware(rules, {
      debug: true,
      logger,
    });

    const request = new MockRequest("https://example.com/test");
    await middleware(request);

    expect(logger).toHaveBeenCalled();
    expect(logger.mock.calls[0][0]).toContain("Checking: /test");
  });

  it("should accept single rule or array of rules", () => {
    const singleRule: RewriteRule = {
      pattern: { segments: ["test"], stripSegments: [] },
    };

    const middleware1 = createMiddleware(singleRule);
    const middleware2 = createMiddleware([singleRule]);

    expect(typeof middleware1).toBe("function");
    expect(typeof middleware2).toBe("function");
  });

  it("should handle URLs with query strings", async () => {
    const rules: RewriteRule[] = [
      {
        pattern: {
          segments: ["api", "v1", "*"],
          stripSegments: [1],
        },
      },
    ];

    const middleware = createMiddleware(rules);
    const request = new MockRequest(
      "https://example.com/api/v1/users?page=1&limit=10"
    );

    const response = await middleware(request);

    expect(response).toEqual({
      type: "rewrite",
      url: expect.stringContaining("/api/users"),
    });
    expect(response.url).toContain("?page=1&limit=10");
  });
});
