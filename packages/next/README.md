# @next-url-rewrite/next

Next.js middleware for URL rewriting with pattern matching. Supports both App Router and Pages Router.

## Features

- **Universal Router Support** - Works with both App Router and Pages Router
- **Next.js 12-16+ Compatible** - Supports Next.js 12 through 16 and beyond
- **Two Configuration Styles** - Config files or fluent builder API
- **Type-safe** - Full TypeScript support with autocomplete
- **Auto-detection** - Automatically detects router type
- **Debug logging** - Built-in debugging for development
- **Zero dependencies** (except @next-url-rewrite/core and Next.js)

## Installation

```bash
npm install @next-url-rewrite/next
# or
pnpm add @next-url-rewrite/next
# or
yarn add @next-url-rewrite/next
```

## Quick Start

### Option 1: Config File (Recommended for Multiple Rules)

**1. Create `rewrites.config.js`:**

```javascript
module.exports = [
  {
    name: "profile-certificates",
    description: "Rewrite /username/certificates to /username",
    pattern: {
      segments: ["*", "certificates"],
      stripSegments: [1],
    },
  },
];
```

**2. Create `middleware.ts`:**

```typescript
import { createMiddleware } from "@next-url-rewrite/next";
import rewrites from "./rewrites.config.js";

export default createMiddleware(rewrites, { debug: true });

export const config = {
  matcher: ["/:username+/certificates"],
};
```

### Option 2: Fluent Builder API (Recommended for Simple Rules)

**Create `middleware.ts`:**

```typescript
import { rewrite, createMiddleware } from "@next-url-rewrite/next";

const profileCertificates = rewrite()
  .match("/:username/certificates")
  .stripSegment("certificates")
  .name("profile-certificates")
  .description("Rewrite /username/certificates to /username")
  .build();

export default createMiddleware(profileCertificates, { debug: true });

export const config = {
  matcher: ["/:username+/certificates"],
};
```

## API Reference

### createMiddleware

Creates Next.js middleware from rewrite rules.

```typescript
function createMiddleware(
  rules: RewriteRule | RewriteRule[],
  options?: MiddlewareOptions
): NextMiddleware;
```

**Parameters:**

- `rules` - Single rule or array of rules
- `options` - Optional configuration
  - `debug` - Enable debug logging (default: `false`)
  - `logger` - Custom logging function (default: `console.log`)

**Returns:** Next.js middleware function

**Example:**

```typescript
import { createMiddleware } from "@next-url-rewrite/next";

const rules = [
  {
    pattern: {
      segments: ["api", "*", "legacy"],
      stripSegments: [2], // Strip 'legacy'
    },
  },
];

export default createMiddleware(rules, {
  debug: process.env.NODE_ENV === "development",
  logger: (msg) => console.log(`[Custom] ${msg}`),
});
```

### loadConfig

Loads rewrite rules from a configuration file.

```typescript
function loadConfig(
  configPath: string,
  options?: LoadConfigOptions
): Promise<RewriteRule[]>;
```

**Parameters:**

- `configPath` - Absolute path to config file
- `options` - Optional configuration
  - `validate` - Validate rules on load (default: `true`)

**Returns:** Promise resolving to array of rules

**Example:**

```typescript
import { loadConfig, createMiddleware } from "@next-url-rewrite/next";
import { join } from "path";

const configPath = join(process.cwd(), "rewrites.config.js");
const rules = await loadConfig(configPath);

export default createMiddleware(rules);
```

### Fluent Builder API

#### rewrite()

Creates a new rule builder instance.

```typescript
function rewrite(): RewriteBuilder;
```

**Example:**

```typescript
import { rewrite } from "@next-url-rewrite/next";

const rule = rewrite()
  .match("/api/:version/users")
  .stripSegment("api")
  .when("version", ["v1", "v2"])
  .name("api-version-rewrite")
  .build();
```

#### Builder Methods

##### `.match(pattern: string)`

Defines the URL pattern to match. Use `:name` for named wildcards.

```typescript
rewrite().match("/users/:username/posts/:postId").build();
```

##### `.stripSegment(segment: string | number)`

Removes a segment by name or index.

```typescript
// By name
rewrite().match("/:username/settings").stripSegment("settings").build();

// By index
rewrite()
  .match("/:username/settings")
  .stripSegment(1) // Strip second segment
  .build();
```

##### `.when(segmentName: string, values: string[])`

Constrains a named wildcard to specific values.

```typescript
rewrite()
  .match("/api/:version/data")
  .when("version", ["v1", "v2", "v3"])
  .stripSegment("api")
  .build();
```

##### `.name(name: string)`

Sets the rule name for debugging.

```typescript
rewrite()
  .match("/:username/certificates")
  .stripSegment("certificates")
  .name("profile-certificates")
  .build();
```

##### `.description(description: string)`

Sets the rule description for documentation.

```typescript
rewrite()
  .match("/:username/certificates")
  .stripSegment("certificates")
  .description("Rewrites certificate pages to profile pages")
  .build();
```

##### `.build()`

Builds and returns the final `RewriteRule`.

```typescript
const rule = rewrite()
  .match("/:username/posts/:action")
  .when("action", ["edit", "delete"])
  .stripSegment("action")
  .build();
```

## Configuration Examples

### Multiple Rules

Rules are processed in order, first match wins:

```typescript
import { rewrite, createMiddleware } from "@next-url-rewrite/next";

const rules = [
  // More specific rules first
  rewrite()
    .match("/users/:username/admin")
    .when("username", ["alice", "bob"])
    .stripSegment("admin")
    .name("admin-users")
    .build(),

  // General rules last
  rewrite()
    .match("/users/:username/settings")
    .stripSegment("settings")
    .name("user-settings")
    .build(),
];

export default createMiddleware(rules, { debug: true });

export const config = {
  matcher: ["/users/:username+/admin", "/users/:username+/settings"],
};
```

### API Versioning

Strip version prefixes from API routes:

```typescript
const apiRewrite = rewrite()
  .match("/api/:version/:endpoint")
  .when("version", ["v1", "v2", "v3"])
  .stripSegment("api")
  .stripSegment("version")
  .name("api-version-strip")
  .build();

export default createMiddleware(apiRewrite);

export const config = {
  matcher: "/api/:version+/:endpoint+",
};
```

### Legacy URL Support

Rewrite old URLs to new structure:

```typescript
const legacyRewrites = [
  rewrite()
    .match("/old/:slug/page")
    .stripSegment("old")
    .stripSegment("page")
    .name("legacy-pages")
    .build(),

  rewrite()
    .match("/archive/:year/:month/:slug")
    .stripSegment("archive")
    .stripSegment("year")
    .stripSegment("month")
    .name("legacy-archive")
    .build(),
];

export default createMiddleware(legacyRewrites);
```

## Router Compatibility

### App Router (Next.js 13+)

```typescript
// middleware.ts
import { rewrite, createMiddleware } from "@next-url-rewrite/next";

export default createMiddleware(
  rewrite().match("/:username/profile").stripSegment("profile").build()
);

export const config = {
  matcher: "/:username+/profile",
};
```

**Page structure:**

```
app/
  [username]/
    page.tsx     ← Handles both /username and /username/profile
```

### Pages Router (Next.js 12 and earlier)

```typescript
// middleware.ts (same as App Router!)
import { rewrite, createMiddleware } from "@next-url-rewrite/next";

export default createMiddleware(
  rewrite().match("/:username/profile").stripSegment("profile").build()
);

export const config = {
  matcher: "/:username+/profile",
};
```

**Page structure:**

```
pages/
  [username]/
    index.tsx    ← Handles both /username and /username/profile
```

## Debugging

Enable debug logging to see which rules match:

```typescript
export default createMiddleware(rules, {
  debug: process.env.NODE_ENV === "development",
});
```

**Output:**

```
[next-url-rewrite] Checking: /alice/certificates
[next-url-rewrite] Matched rule 'profile-certificates': /alice/certificates → /alice
```

## TypeScript Support

All types are exported for use in your code:

```typescript
import type {
  MiddlewareOptions,
  NextMiddleware,
  LoadConfigOptions,
  RewriteRule,
  RewritePattern,
} from "@next-url-rewrite/next";
```

## Next.js 16 Compatibility

This package is fully compatible with Next.js 16. Note that Next.js 16 has deprecated the `middleware.ts` file convention in favor of `proxy.ts`. While your existing `middleware.ts` files will continue to work, you may see a deprecation warning:

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

Both file names work identically - simply rename `middleware.ts` to `proxy.ts` to remove the warning. The functionality remains the same.

## Migration from next.config.js Rewrites

**Before (next.config.js):**

```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: "/:username/certificates",
        destination: "/:username",
      },
    ];
  },
};
```

**After (middleware.ts):**

```typescript
import { rewrite, createMiddleware } from "@next-url-rewrite/next";

export default createMiddleware(
  rewrite()
    .match("/:username/certificates")
    .stripSegment("certificates")
    .build()
);

export const config = {
  matcher: "/:username+/certificates",
};
```

**Benefits of middleware approach:**

- ✅ More flexible pattern matching
- ✅ Constrained wildcards with `.when()`
- ✅ Debug logging built-in
- ✅ Type-safe configuration
- ✅ Validation at build time
- ✅ Works with both routers

## Best Practices

### 1. Use Specific Matchers

Define precise Next.js matchers for performance:

```typescript
export const config = {
  matcher: [
    "/:username+/certificates", // ✓ Specific
    "/:username+/settings", // ✓ Specific
  ],
  // Avoid: matcher: '/:path*'   // ✗ Too broad
};
```

### 2. Order Rules by Specificity

More specific rules should come first:

```typescript
const rules = [
  rewrite().match("/api/v2/admin/:action").build(), // Most specific
  rewrite().match("/api/:version/:endpoint").build(), // General
];
```

### 3. Validate Configuration

Enable validation in development:

```typescript
import { loadConfig } from "@next-url-rewrite/next";

const rules = await loadConfig("./rewrites.config.js", {
  validate: process.env.NODE_ENV === "development",
});
```

### 4. Use Named Rules

Name rules for easier debugging:

```typescript
rewrite()
  .match("/:username/posts/:action")
  .stripSegment("action")
  .name("user-post-actions") // ✓ Easy to identify in logs
  .build();
```

## Examples

See the `examples/` directory for complete working examples:

- **pages-router** - Pages Router with config file approach
- **app-router** - App Router with fluent builder API

## License

MIT
