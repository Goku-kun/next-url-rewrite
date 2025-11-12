# @next-url-rewrite/next

## 0.2.0

### Minor Changes

- 7f970ae: Initial release of next-url-rewrite

  This is the first release of the next-url-rewrite package, providing type-safe URL rewriting for Next.js applications.

  ## Features

  ### @next-url-rewrite/core
  - Pattern matching with wildcard support
  - Segment-based URL rewriting
  - Multi-rule processing with first-match-wins
  - Validation utilities for configuration errors
  - Framework-agnostic implementation
  - Dual ESM/CJS builds with proper TypeScript declarations

  ### @next-url-rewrite/next
  - Next.js middleware integration
  - Support for both App Router and Pages Router
  - Config file loader for declarative configuration
  - Fluent builder API for programmatic configuration
  - Debug logging support
  - Auto-detection of router type
  - Dual ESM/CJS builds with proper TypeScript declarations

  ## Technical Details
  - Built with tsdown (modern successor to tsup) for faster builds
  - Comprehensive test suite with 52 passing tests
  - Full TypeScript support with strict type checking
  - Zero dependencies (except peer dependencies)
  - Compatible with Next.js 12-16+ (both App Router and Pages Router)

  ## Next.js 16 Support

  Fully tested and compatible with Next.js 16. Note: Next.js 16 renamed `middleware.ts` to `proxy.ts` - both work identically with this package.

### Patch Changes

- Updated dependencies [7f970ae]
  - @next-url-rewrite/core@0.2.0
