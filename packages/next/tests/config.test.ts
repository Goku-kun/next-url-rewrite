import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../src/config";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const TEST_DIR = join(process.cwd(), ".test-configs");

describe("loadConfig", () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("should load JS config file", async () => {
    const configPath = join(TEST_DIR, "rewrites.config.js");
    writeFileSync(
      configPath,
      `
      module.exports = [
        {
          name: 'test-rule',
          pattern: {
            segments: ['test'],
            stripSegments: []
          }
        }
      ]
    `
    );

    const config = await loadConfig(configPath);

    expect(config).toHaveLength(1);
    expect(config[0].name).toBe("test-rule");
  });

  it("should load ESM config file", async () => {
    const configPath = join(TEST_DIR, "rewrites.config.mjs");
    writeFileSync(
      configPath,
      `
      export default [
        {
          name: 'esm-rule',
          pattern: {
            segments: ['esm'],
            stripSegments: []
          }
        }
      ]
    `
    );

    const config = await loadConfig(configPath);

    expect(config).toHaveLength(1);
    expect(config[0].name).toBe("esm-rule");
  });

  it("should throw error for non-existent file", async () => {
    await expect(loadConfig("/non/existent/path.js")).rejects.toThrow();
  });

  it("should handle default export from config", async () => {
    const configPath = join(TEST_DIR, "default.config.js");
    writeFileSync(
      configPath,
      `
      export default {
        name: 'single-rule',
        pattern: {
          segments: ['single'],
          stripSegments: []
        }
      }
    `
    );

    const config = await loadConfig(configPath);

    expect(Array.isArray(config)).toBe(true);
    expect(config[0].name).toBe("single-rule");
  });

  it("should validate loaded config", async () => {
    const configPath = join(TEST_DIR, "invalid.config.js");
    writeFileSync(
      configPath,
      `
      module.exports = [
        {
          pattern: {
            segments: [],  // Invalid - empty segments
            stripSegments: []
          }
        }
      ]
    `
    );

    await expect(loadConfig(configPath, { validate: true })).rejects.toThrow(
      /validation/i
    );
  });
});
