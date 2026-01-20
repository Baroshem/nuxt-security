# Research: oxc-parser macOS Native Binding Issue

> **Started:** 2026-01-20 19:00 GMT+7
> **Updated:** 2026-01-20 19:10 GMT+7
> **Status:** Complete
> **Final Confidence:** 95%

## Research Question

Why does `nuxt-security` (and Nuxt projects using it) fail on macOS Apple Silicon with "Cannot find module '@oxc-parser/binding-darwin-arm64'" error when using pnpm?

---

## Executive Summary

The error occurs because pnpm (and npm < v11.3.0) has a bug handling optional dependencies with native bindings. The `oxc-parser` package (transitive dependency via Nuxt) requires platform-specific binaries that aren't properly resolved. **nuxt-security does NOT directly depend on oxc-parser** - it's a transitive dependency through Nuxt's internal parser. The fix requires updating package managers or explicitly installing the darwin-arm64 binding.

---

## Hypothesis Evolution

| # | Hypothesis | Initial Confidence | Final Confidence | Status |
|---|------------|-------------------|------------------|--------|
| 1 | nuxt-security directly depends on oxc-parser | 60% | 0% | **Rejected** - package.json shows no direct dependency |
| 2 | oxc-parser is transitive via Nuxt internals | 70% | 95% | **Confirmed** - yarn.lock shows Nuxt depends on oxc-parser/minify/transform |
| 3 | pnpm has bug with optional dependencies | 80% | 95% | **Confirmed** - documented in npm/cli#4828 and oxc-project/oxc#4952 |
| 4 | npm version < 11.3.0 has same bug | 70% | 90% | **Confirmed** - oxc troubleshooting docs confirm this |

---

## Current Architecture Analysis

### Dependency Chain

```
nuxt-security@2.5.1
  └── @nuxt/kit@^4.2.1
        └── nuxt@^4.2.1 (devDependency)
              └── oxc-parser@^0.96.0 (via internal parsing)
                    └── @oxc-parser/binding-darwin-arm64@0.96.0 (optional)
```

### How oxc-parser Works

1. **Native bindings approach**: oxc-parser provides Rust-compiled native binaries for each platform
2. **Optional dependencies**: Platform-specific bindings are listed as `optionalDependencies`
3. **Resolution logic**: At runtime, `bindings.js` attempts to load:
   - `@oxc-parser/binding-darwin-arm64` (for Apple Silicon)
   - `./parser.darwin-arm64.node` (local fallback)
   - `@oxc-parser/binding-darwin-universal` (universal fallback)
   - `./parser.darwin-universal.node` (local universal)

### Error from user's logs

```
Cannot find module '@oxc-parser/binding-darwin-arm64'
  [cause]: Cannot find module './parser.darwin-arm64.node'
    [cause]: Cannot find module '@oxc-parser/binding-darwin-universal'
      [cause]: Cannot find module './parser.darwin-universal.node'
```

The entire resolution chain fails, indicating no darwin bindings were installed.

---

## Approaches Considered

### Approach A: Document the pnpm workaround

**Description**: Add documentation explaining the issue and workarounds

**Pros:**
- No code changes required
- Educates users
- Addresses root cause explanation

**Cons:**
- Doesn't fix the issue automatically
- Users must manually intervene

**Verdict:** Partial solution - good for documentation but doesn't solve it

### Approach B: Explicitly add darwin bindings to dependencies

**Description**: Add `@oxc-parser/binding-darwin-arm64` and `@oxc-parser/binding-darwin-x64` as optional peer dependencies

**Pros:**
- Forces installation of macOS bindings
- Predictable behavior across package managers

**Cons:**
- Increases package complexity
- May conflict with different oxc-parser versions in user projects
- Not nuxt-security's responsibility (transitive dep via Nuxt)

**Verdict:** **Rejected** - this is Nuxt's dependency, not nuxt-security's

### Approach C: Recommend package manager upgrades

**Description**: Document that users should:
1. Use npm >= 11.3.0, OR
2. Use yarn (which handles optional deps correctly), OR
3. Configure pnpm's `supportedArchitectures` properly

**Pros:**
- Addresses root cause
- Works across all affected platforms
- No changes to nuxt-security codebase

**Cons:**
- Requires user action
- Some users may be locked to older package manager versions

**Verdict:** **Chosen** - correct approach as root cause is in package manager

### Approach D: Add pnpm configuration to repository

**Description**: Add `.npmrc` with `supportedArchitectures` configuration

**Pros:**
- Works out of the box for pnpm users
- No user intervention needed

**Cons:**
- Only helps projects that clone nuxt-security repo directly
- Doesn't help end users installing via npm/pnpm

**Verdict:** Could be added to playground for development purposes

---

## Recommended Approach

**Decision:** Document the issue and recommend package manager upgrades

**Rationale:**
1. The issue is NOT in nuxt-security's code - it's a transitive dependency through Nuxt
2. The root cause is documented npm/pnpm bugs with optional native dependencies
3. oxc-parser team has confirmed bindings exist for darwin-arm64 (v0.96.0+)
4. Package manager upgrades fix the issue at the source

**Confidence:** 95% (confirmed via multiple GitHub issues, oxc docs, and dependency analysis)

---

## Implementation Checklist

- [ ] Add troubleshooting section to nuxt-security documentation
- [ ] Document known package manager compatibility
- [ ] Add `.npmrc` to playground with `supportedArchitectures` for dev convenience
- [ ] Consider opening issue on Nuxt repo linking to this analysis

---

## Workarounds for Users

### Option 1: Update npm to >= 11.3.0 (Recommended)
```bash
npm install -g npm@latest
rm -rf node_modules package-lock.json
npm install
```

### Option 2: Use yarn instead of pnpm/npm
```bash
rm -rf node_modules pnpm-lock.yaml
yarn install
```

### Option 3: Configure pnpm supportedArchitectures

Add to `.npmrc`:
```ini
supportedArchitectures.os=current
supportedArchitectures.cpu=current
```

Or in `pnpm-workspace.yaml`:
```yaml
supportedArchitectures:
  os:
    - darwin
    - linux
    - win32
    - current
  cpu:
    - x64
    - arm64
    - current
```

### Option 4: Explicit binding installation
```bash
npm install @oxc-parser/binding-darwin-arm64
```

### Option 5: Clean reinstall
```bash
rm -rf node_modules
rm pnpm-lock.yaml  # or package-lock.json
pnpm install  # or npm install
```

---

## Edge Cases & Risks

- **Risk 1:** Users on older Node.js versions (< 20) may have other issues → Mitigation: nuxt-security requires Node >= 20
- **Risk 2:** CI/CD environments with cached node_modules → Mitigation: Document cache clearing in CI
- **Risk 3:** Docker/container builds on different architectures → Mitigation: Use multi-platform builds or WASM fallback

---

## Dead Ends & Rejected Paths

1. **Adding explicit oxc dependencies**: Rejected because it's Nuxt's transitive dependency
2. **Downgrading Nuxt version**: Not viable as nuxt-security tracks latest Nuxt
3. **WASM fallback**: oxc-parser has WASM support but requires additional setup; not automatic

---

## Unresolved Questions

1. Should nuxt-security add CI matrix testing on macOS ARM64? - Impact: Medium (catches issues early)
2. Should Nuxt restore WASM fallback mechanism removed in PR #31484? - Impact: Low (Nuxt team decision)

---

## Key Sources

| Source | Contribution |
|--------|--------------|
| [oxc-parser troubleshooting](https://oxc.rs/docs/guide/troubleshooting) | Official workarounds for binding issues |
| [nuxt/nuxt#33480](https://github.com/nuxt/nuxt/issues/33480) | Confirmed npm version as root cause |
| [nuxt/nuxt#31954](https://github.com/nuxt/nuxt/issues/31954) | ARM64 deployment failure analysis |
| [oxc-project/oxc#4952](https://github.com/oxc-project/oxc/issues/4952) | pnpm + libc:null bug root cause |
| [npm/cli#4828](https://github.com/npm/cli/issues/4828) | npm optional dependencies bug documentation |

---

*Generated: 2026-01-20*
