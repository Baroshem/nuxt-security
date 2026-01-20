---
title: "macOS oxc-parser Native Binding Fix"
description: "Add troubleshooting documentation for macOS Apple Silicon installation issues"
status: done
priority: P3
effort: 1h
branch: feat/issue-675-enhancement-this-repo-didn-t-support-on-
tags: [documentation, macos, troubleshooting, pnpm, oxc-parser]
created: 2026-01-20
---

# macOS oxc-parser Native Binding Fix

## Summary

Add troubleshooting documentation to help users resolve oxc-parser native binding issues on macOS Apple Silicon when using pnpm or npm < v11.3.0.

**Research:** `research/oxc-parser-macos-native-binding-issue-2026-01-20.md`
**Confidence:** 95%

## Root Cause

The issue is NOT in nuxt-security - it's a known npm/pnpm bug with optional dependencies:
- oxc-parser is transitive dependency via Nuxt (not nuxt-security direct dep)
- pnpm and npm < v11.3.0 fail to install platform-specific bindings
- Darwin ARM64 bindings exist but aren't properly resolved

## Implementation Phases

| Phase | Description | Status | Link |
|-------|-------------|--------|------|
| 01 | Add troubleshooting docs | done | [phase-01](./phase-01-add-troubleshooting-docs.md) |
| 02 | Update playground config | done | [phase-02](./phase-02-update-playground-config.md) |

## Success Criteria

- [x] FAQ page includes macOS installation troubleshooting section
- [x] Playground works on macOS Apple Silicon with pnpm
- [x] No code changes to nuxt-security core

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users miss docs | Medium | Link from installation page |
| Upstream fixes | Low | Docs remain helpful as reference |

## References

- [oxc troubleshooting](https://oxc.rs/docs/guide/troubleshooting)
- [nuxt/nuxt#33480](https://github.com/nuxt/nuxt/issues/33480)
- [npm/cli#4828](https://github.com/npm/cli/issues/4828)
