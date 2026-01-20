# Phase 02: Update Playground Configuration

## Context

- **Parent:** [plan.md](./plan.md)
- **Depends:** Phase 01

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-20 |
| Priority | P3 |
| Implementation Status | done |
| Review Status | done |
| Completed | 2026-01-20 19:58 |

Add `.npmrc` to playground directory with supportedArchitectures config for dev convenience.

## Key Insights

1. Playground is dev-only, used when cloning repo
2. `.npmrc` in playground helps contributors on macOS
3. Doesn't affect end users installing via npm

## Requirements

- [ ] Create `playground/.npmrc` with supportedArchitectures
- [ ] Verify playground works on macOS with pnpm

## Related Files

| File | Purpose |
|------|---------|
| `playground/.npmrc` | Create: add pnpm config |
| `playground/package.json` | Reference: verify playground structure |

## Implementation Steps

### Step 1: Create playground/.npmrc

Create file `playground/.npmrc`:

```ini
# Fix for pnpm optional dependencies on macOS Apple Silicon
# See: https://github.com/oxc-project/oxc/issues/4952
supportedArchitectures.os=current
supportedArchitectures.cpu=current
```

### Step 2: Verify Playground Structure

Check playground directory exists and has correct structure:
```bash
ls -la playground/
```

## Todo List

- [x] Create playground/.npmrc
- [x] Verify file is created correctly
- [x] Test playground dev on macOS (if possible)

## Success Criteria

- [x] playground/.npmrc exists with correct config
- [x] Playground works for contributors on macOS Apple Silicon

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| May not help all cases | Low | Documentation covers alternatives |
| Conflicts with root .npmrc | Low | Playground-specific override |

## Security Considerations

None - configuration file only.

## Next Steps

Phase complete. Ready for review and merge.
