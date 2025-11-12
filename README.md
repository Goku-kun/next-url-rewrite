# next-url-rewrite

Type-safe URL rewriting for Next.js with pattern matching and middleware support.

## Overview

`next-url-rewrite` is a modern URL rewriting solution for Next.js applications that provides:

- ✅ **Universal Router Support** - Works with both App Router and Pages Router
- ✅ **Type-safe Configuration** - Full TypeScript support with validation
- ✅ **Flexible API** - Choose between config files or fluent builder pattern
- ✅ **Pattern Matching** - Wildcard support with value constraints
- ✅ **Framework-agnostic Core** - Use the engine anywhere
- ✅ **Zero Dependencies** - Minimal bundle size

## Quick Start

```bash
pnpm add @gokukun/next-url-rewrite-next
```

Create `middleware.ts`:

```typescript
import { rewrite, createMiddleware } from "@gokukun/next-url-rewrite-next";

const profileCertificates = rewrite()
  .match("/:username/certificates")
  .stripSegment("certificates")
  .build();

export default createMiddleware(profileCertificates, { debug: true });

export const config = {
  matcher: ["/:username+/certificates"],
};
```

Now `/alice/certificates` automatically rewrites to `/alice`!

## Packages

This is a monorepo containing:

### [@gokukun/next-url-rewrite-core](./packages/core)

Framework-agnostic URL rewriting engine with pattern matching.

```typescript
import { processRules } from "@gokukun/next-url-rewrite-core";

const result = processRules("/alice/certificates", [
  {
    pattern: {
      segments: ["*", "certificates"],
      stripSegments: [1],
    },
  },
]);
// { matched: true, original: '/alice/certificates', rewritten: '/alice' }
```

[**View Core Documentation →**](./packages/core)

### [@gokukun/next-url-rewrite-next](./packages/next)

Next.js middleware integration with two configuration styles:

**Config File Approach:**

```typescript
import { createMiddleware } from "@gokukun/next-url-rewrite-next";
import rewrites from "./rewrites.config.js";

export default createMiddleware(rewrites);
```

**Fluent Builder API:**

```typescript
import { rewrite, createMiddleware } from "@gokukun/next-url-rewrite-next";

export default createMiddleware(
  rewrite()
    .match("/api/:version/users")
    .when("version", ["v1", "v2"])
    .stripSegment("api")
    .build()
);
```

[**View Next.js Documentation →**](./packages/next)

## Use Cases

### Profile URL Canonicalization

Rewrite profile subpages to the main profile page:

```typescript
// /alice/certificates → /alice
// /bob/achievements → /bob
rewrite()
  .match("/:username/:subpage")
  .when("subpage", ["certificates", "achievements", "badges"])
  .stripSegment("subpage")
  .build();
```

### API Versioning

Strip version prefixes while preserving the version in routing:

```typescript
// /api/v1/users → /users (but still knows it's v1)
// /api/v2/posts → /posts (but still knows it's v2)
rewrite()
  .match("/api/:version/:endpoint")
  .when("version", ["v1", "v2", "v3"])
  .stripSegment("api")
  .stripSegment("version")
  .build();
```

### Legacy URL Support

Maintain compatibility with old URL structures:

```typescript
// /old/blog/my-post → /blog/my-post
// /archive/2023/post → /post
const rules = [
  rewrite().match("/old/:type/:slug").stripSegment("old").build(),

  rewrite()
    .match("/archive/:year/:slug")
    .stripSegment("archive")
    .stripSegment("year")
    .build(),
];
```

### Locale Handling

Strip locale prefixes for cleaner internal routing:

```typescript
// /en-US/products → /products
// /fr-FR/products → /products
rewrite()
  .match("/:locale/:path")
  .when("locale", ["en-US", "fr-FR", "de-DE", "es-ES"])
  .stripSegment("locale")
  .build();
```

## Examples

See the `examples/` directory for complete working applications:

- **[pages-router](./examples/pages-router)** - Pages Router with config file
- **[app-router](./examples/app-router)** - App Router with fluent builder API

To run examples:

```bash
# Pages Router example
pnpm --filter pages-router-example dev

# App Router example
pnpm --filter app-router-example dev
```

## Features in Detail

### Pattern Matching

Match URL segments with wildcards:

```typescript
{
  segments: ['users', '*', 'posts'],  // matches /users/alice/posts
  stripSegments: []
}
```

### Constrained Wildcards

Limit which values wildcards can match:

```typescript
{
  segments: ['api', '*', 'data'],
  stripSegments: [],
  allowedValues: {
    1: ['v1', 'v2', 'v3']  // Only allow these API versions
  }
}
```

### Segment Stripping

Remove matched segments by index:

```typescript
{
  segments: ['*', 'certificates'],
  stripSegments: [1]  // Strip 'certificates'
}
// /alice/certificates → /alice
```

### Validation

Catch configuration errors at build time:

```typescript
import { validateRules } from "@gokukun/next-url-rewrite-core";

const result = validateRules(rules);
if (!result.valid) {
  console.error("Invalid configuration:", result.errors);
}
```

### Debug Logging

See which rules match in development:

```typescript
createMiddleware(rules, {
  debug: process.env.NODE_ENV === "development",
});
```

Output:

```
[next-url-rewrite] Checking: /alice/certificates
[next-url-rewrite] Matched rule 'profile-certificates': /alice/certificates → /alice
```

## Why Use Middleware for Rewrites?

Next.js supports rewrites in `next.config.js`, but middleware-based rewrites offer several advantages:

| Feature       | next.config.js      | Middleware          |
| ------------- | ------------------- | ------------------- |
| Validation    | ❌ Runtime only     | ✅ Build time       |
| Debugging     | ❌ Limited          | ✅ Built-in logging |
| Constraints   | ❌ No               | ✅ allowedValues    |
| Composability | ❌ Limited          | ✅ Fluent API       |
| Both routers  | ⚠️ Different syntax | ✅ Same code        |

## Architecture

```
┌─────────────────────────────────────────┐
│   @gokukun/next-url-rewrite-next                │
│   (Next.js Middleware Integration)      │
│                                         │
│   • createMiddleware()                  │
│   • loadConfig()                        │
│   • Fluent Builder API                  │
└───────────────┬─────────────────────────┘
                │
                │ depends on
                │
┌───────────────▼─────────────────────────┐
│   @gokukun/next-url-rewrite-core                │
│   (Framework-agnostic Engine)           │
│                                         │
│   • Pattern Matching                    │
│   • URL Rewriting                       │
│   • Rule Processing                     │
│   • Validation                          │
└─────────────────────────────────────────┘
```

The core package can be used independently in any JavaScript/TypeScript project.

## Development

This project uses:

- **[Turborepo](https://turbo.build)** - Monorepo build system
- **[pnpm](https://pnpm.io)** - Package manager with workspaces
- **[tsdown](https://github.com/rolldown/tsdown)** - TypeScript bundler
- **[Vitest](https://vitest.dev)** - Testing framework

### Setup

```bash
pnpm install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Type Check

```bash
pnpm type-check
```

### Run Examples

```bash
# Pages Router
pnpm --filter pages-router-example dev

# App Router
pnpm --filter app-router-example dev
```

## Testing

The project has comprehensive test coverage:

- **Core package**: 31 tests
  - Pattern matching (6 tests)
  - URL rewriting (8 tests)
  - Rule processing (6 tests)
  - Validation (11 tests)

- **Next.js package**: 21 tests
  - Middleware (7 tests)
  - Config loading (5 tests)
  - Fluent builder (9 tests)

Run tests:

```bash
# All tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

## Performance

- **Zero runtime overhead** for pattern compilation
- **Linear time complexity** O(n) for pattern matching
- **Early exit** on first match in multi-rule processing
- **No regular expressions** - direct string comparison
- **Tree-shakeable** - Only bundle what you use

## Browser/Environment Support

- **Node.js**: 18+
- **Next.js**: 12-16+ (Pages Router), 13-16+ (App Router)
- **Package formats**: ESM and CommonJS
- **TypeScript**: 5.0+

### Next.js 16 Note

This package fully supports Next.js 16. Note that Next.js 16 renamed `middleware.ts` to `proxy.ts`. Your existing middleware files will continue to work, but you may see a deprecation warning. Simply rename the file to remove the warning - the functionality is identical.

## Roadmap

- [ ] Add support for query parameter manipulation
- [ ] Add support for hash fragment handling
- [ ] Performance benchmarks
- [ ] Visual debugging tools
- [ ] Migration CLI tool from next.config.js rewrites
- [ ] Edge Runtime optimization

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Related Projects

- [Next.js](https://nextjs.org) - The React framework
- [next-intl](https://next-intl-docs.vercel.app) - Internationalization
- [next-auth](https://next-auth.js.org) - Authentication

## Support

- 📖 [Core Documentation](./packages/core)
- 📖 [Next.js Documentation](./packages/next)
- 🐛 [Report Issues](https://github.com/Goku-kun/next-url-rewrite/issues)
- 💬 [Discussions](https://github.com/Goku-kun/next-url-rewrite/discussions)
