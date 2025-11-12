# @gokukun/next-url-rewrite-core

Framework-agnostic URL rewriting engine with pattern matching and rule processing.

## Features

- **Type-safe pattern matching** with wildcard support
- **Segment-based URL rewriting** with configurable stripping
- **Multi-rule processing** with first-match-wins semantics
- **Validation utilities** for catching configuration errors
- **Zero dependencies** - pure TypeScript implementation
- **Dual ESM/CJS builds** for maximum compatibility

## Installation

```bash
npm install @gokukun/next-url-rewrite-core
# or
pnpm add @gokukun/next-url-rewrite-core
# or
yarn add @gokukun/next-url-rewrite-core
```

## Core Concepts

### RewriteRule

A rewrite rule defines how URLs should be matched and transformed:

```typescript
interface RewriteRule {
  name?: string; // Optional rule identifier
  description?: string; // Optional rule description
  pattern: RewritePattern; // The matching and rewriting configuration
}

interface RewritePattern {
  segments: (string | "*")[]; // URL segments to match (* = wildcard)
  stripSegments: number[]; // Indices of segments to remove
  allowedValues?: Record<number, string[]>; // Constrain wildcards
}
```

### Pattern Matching

Patterns are matched segment-by-segment against the URL pathname:

- **Literal segments** must match exactly: `['users', 'profile']` matches `/users/profile`
- **Wildcard segments** (`'*'`) match any value: `['users', '*']` matches `/users/alice`, `/users/bob`
- **Constrained wildcards** limit accepted values: `allowedValues: { 1: ['admin', 'moderator'] }`

### Segment Stripping

After matching, segments can be removed by their index:

- `stripSegments: [2]` on `/users/alice/settings` → `/users/alice`
- `stripSegments: [1, 2]` on `/api/v1/users` → `/api`

## API Reference

### Pattern Matching

#### `matchPattern(pathname: string, pattern: RewritePattern): MatchResult`

Tests if a URL pathname matches a pattern.

```typescript
import { matchPattern } from "@gokukun/next-url-rewrite-core";

const pattern = {
  segments: ["users", "*", "profile"],
  stripSegments: [],
};

const result = matchPattern("/users/alice/profile", pattern);
// { matched: true, segments: [{ value: 'users', index: 0 }, ...] }
```

### URL Rewriting

#### `rewriteUrl(pathname: string, pattern: RewritePattern): RewriteUrlResult`

Matches and rewrites a URL in one operation.

```typescript
import { rewriteUrl } from "@gokukun/next-url-rewrite-core";

const pattern = {
  segments: ["*", "certificates"],
  stripSegments: [1], // Strip 'certificates'
};

const result = rewriteUrl("/alice/certificates", pattern);
// {
//   matched: true,
//   original: '/alice/certificates',
//   rewritten: '/alice'
// }
```

### Rule Processing

#### `processRules(pathname: string, rules: RewriteRule[]): RewriteResult`

Applies the first matching rule from an array of rules.

```typescript
import { processRules } from "@gokukun/next-url-rewrite-core";

const rules = [
  {
    name: "strip-certificates",
    pattern: {
      segments: ["*", "certificates"],
      stripSegments: [1],
    },
  },
  {
    name: "strip-settings",
    pattern: {
      segments: ["*", "settings"],
      stripSegments: [1],
    },
  },
];

const result = processRules("/alice/certificates", rules);
// {
//   matched: true,
//   original: '/alice/certificates',
//   rewritten: '/alice',
//   rule: 'strip-certificates'
// }
```

### Validation

#### `validateRule(rule: RewriteRule): ValidationResult`

Validates a single rule for configuration errors.

```typescript
import { validateRule } from "@gokukun/next-url-rewrite-core";

const rule = {
  name: "invalid-rule",
  pattern: {
    segments: ["users", "*"],
    stripSegments: [5], // Out of bounds!
  },
};

const result = validateRule(rule);
// {
//   valid: false,
//   errors: ["Rule 'invalid-rule': stripSegments index 5 exceeds pattern length"],
//   warnings: []
// }
```

#### `validateRules(rules: RewriteRule[]): ValidationResult`

Validates multiple rules and detects rule shadowing.

```typescript
import { validateRules } from "@gokukun/next-url-rewrite-core";

const rules = [
  {
    name: "general",
    pattern: { segments: ["*"], stripSegments: [] },
  },
  {
    name: "specific", // This will never match!
    pattern: { segments: ["users"], stripSegments: [] },
  },
];

const result = validateRules(rules);
// {
//   valid: true,
//   errors: [],
//   warnings: ["Rule 'specific' is shadowed by earlier rule 'general'"]
// }
```

## Advanced Usage

### Constrained Wildcards

Limit which values a wildcard can match:

```typescript
const pattern = {
  segments: ["api", "*", "data"],
  stripSegments: [],
  allowedValues: {
    1: ["v1", "v2", "v3"], // Only allow these API versions
  },
};

matchPattern("/api/v2/data", pattern); // ✓ matched: true
matchPattern("/api/v4/data", pattern); // ✗ matched: false
```

### Multiple Wildcards

Use multiple wildcards in a single pattern:

```typescript
const pattern = {
  segments: ["*", "posts", "*"],
  stripSegments: [2], // Strip the post ID
  allowedValues: {
    0: ["alice", "bob"], // Limit usernames
    2: ["edit", "delete"], // Limit actions
  },
};

rewriteUrl("/alice/posts/edit", pattern);
// { matched: true, original: '/alice/posts/edit', rewritten: '/alice/posts' }
```

### Query String Preservation

Query strings are automatically preserved during rewriting:

```typescript
const pattern = {
  segments: ["api", "*"],
  stripSegments: [0], // Strip 'api'
};

rewriteUrl("/api/users?page=2&sort=name", pattern);
// Original includes query: '/api/users?page=2&sort=name'
// Note: Query handling is implemented in framework-specific packages
```

## Error Handling

The library validates URLs and patterns, rejecting malformed inputs:

```typescript
// Empty segments (consecutive slashes) are rejected
matchPattern("/users//profile", pattern);
// { matched: false }

// Trailing slashes are normalized
matchPattern("/users/alice/", pattern);
// Equivalent to matchPattern('/users/alice', pattern)
```

## TypeScript Support

All functions are fully typed with exported interfaces:

```typescript
import type {
  RewriteRule,
  RewritePattern,
  RewriteResult,
  ValidationResult,
  MatchResult,
  RewriteUrlResult,
  ParsedSegment,
} from "@gokukun/next-url-rewrite-core";
```

## Performance

- **Zero runtime overhead** for pattern compilation
- **Linear time complexity** O(n) for pattern matching
- **Early exit** on first match in multi-rule processing
- **No regular expressions** - direct string comparison

## License

MIT
