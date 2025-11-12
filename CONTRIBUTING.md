# Contributing to next-url-rewrite

Thank you for your interest in contributing to next-url-rewrite! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 10 or higher

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/Goku-kun/next-url-rewrite.git
cd next-url-rewrite
```

2. Install dependencies:

```bash
pnpm install
```

3. Build all packages:

```bash
pnpm build
```

4. Run tests:

```bash
pnpm test
```

## Project Structure

```
next-url-rewrite/
├── packages/
│   ├── core/          # Framework-agnostic URL rewriting engine
│   └── next/          # Next.js middleware integration
├── examples/
│   ├── pages-router/  # Pages Router example app
│   └── app-router/    # App Router example app
├── .changeset/        # Changeset configuration
└── turbo.json         # Turborepo configuration
```

## Build Tool

This project uses [tsdown](https://github.com/rolldown/tsdown) for building TypeScript packages. tsdown is the modern successor to tsup, providing faster builds with better compatibility.

## Development Workflow

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests for specific package
pnpm --filter @next-url-rewrite/core test
```

### Type Checking

```bash
# Type check all packages
pnpm type-check

# Type check specific package
pnpm --filter @next-url-rewrite/core type-check
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint and auto-fix issues
pnpm --filter @next-url-rewrite/core lint:fix
pnpm --filter @next-url-rewrite/next lint:fix
```

### Code Formatting

```bash
# Format all files with Prettier
pnpm format

# Check formatting without modifying files
pnpm format:check
```

### Building

```bash
# Build all packages
pnpm build

# Build in watch mode
pnpm dev

# Build specific package
pnpm --filter @next-url-rewrite/core build
```

### Running Examples

```bash
# Pages Router example
pnpm --filter pages-router-example dev

# App Router example
pnpm --filter app-router-example dev
```

## Making Changes

### Test-Driven Development

This project follows TDD principles. When adding new features:

1. **Write failing tests first** - Document expected behavior
2. **Implement minimal code** - Make tests pass
3. **Refactor** - Improve code while keeping tests green

### Code Style

- Use TypeScript for all source code
- Follow existing code style and patterns
- Write clear, descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Run `pnpm format` before committing to ensure consistent formatting
- Ensure `pnpm lint` passes with no errors or warnings

### Commit Guidelines

- Use clear, descriptive commit messages
- Reference issue numbers when applicable
- Keep commits atomic (one logical change per commit)

Example commit messages:

```
feat(core): add support for regex patterns
fix(next): resolve Edge Runtime compatibility issue
docs: update API reference for builder API
test(core): add tests for pattern validation
```

## Submitting Changes

### Pull Request Process

1. **Create a changeset** for your changes:

```bash
pnpm changeset
```

Select the packages affected and the change type (major, minor, patch).

2. **Ensure all checks pass**:

```bash
pnpm build
pnpm test
pnpm type-check
pnpm lint
pnpm format:check
```

3. **Update documentation** if needed:
   - Update README files
   - Add/update examples
   - Update inline code comments

4. **Create a Pull Request**:
   - Provide a clear description of changes
   - Reference related issues
   - Include before/after examples if applicable

### Pull Request Guidelines

- PRs should focus on a single concern
- Include tests for new functionality
- Update documentation for API changes
- Ensure all CI checks pass
- Request review from maintainers

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for version management.

### Creating a Changeset

```bash
pnpm changeset
```

Follow the prompts to:

1. Select packages to include
2. Choose version bump type (major, minor, patch)
3. Write a description of changes

### Versioning

When ready to release:

```bash
# Update package versions based on changesets
pnpm version-packages

# Build and publish to npm
pnpm release
```

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features, backward compatible
- **Patch (0.0.1)**: Bug fixes, backward compatible

## Testing Guidelines

### Unit Tests

- Test public APIs thoroughly
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests independent and isolated

### Integration Tests

- Test package integration with Next.js
- Test both App Router and Pages Router
- Verify middleware behavior end-to-end

### Example Applications

- Keep examples simple and focused
- Document what each example demonstrates
- Ensure examples work with latest package versions

## Documentation

### README Files

- Keep README files up to date
- Include clear, runnable examples
- Document all public APIs
- Explain configuration options

### Code Comments

- Add JSDoc comments for public APIs
- Explain complex logic with inline comments
- Document assumptions and constraints
- Include examples in JSDoc when helpful

## Questions and Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/Goku-kun/next-url-rewrite/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/Goku-kun/next-url-rewrite/discussions)
- **Security**: Report security issues privately to the maintainers

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/3/0/code_of_conduct/).

Be respectful, inclusive, and constructive in all interactions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
