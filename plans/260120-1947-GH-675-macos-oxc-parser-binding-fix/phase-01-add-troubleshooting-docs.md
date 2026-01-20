# Phase 01: Add Troubleshooting Documentation

## Context

- **Parent:** [plan.md](./plan.md)
- **Research:** `research/oxc-parser-macos-native-binding-issue-2026-01-20.md`

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-01-20 |
| Priority | P3 |
| Implementation Status | done |
| Review Status | done |
| Completed | 2026-01-20 19:54 UTC |

Add a troubleshooting section to FAQ docs explaining macOS installation issues and workarounds.

## Key Insights

1. Issue is upstream (npm/pnpm bug, not nuxt-security)
2. oxc-parser is transitive via Nuxt, not direct dependency
3. Multiple workarounds exist - document all
4. Users on Apple Silicon most affected

## Requirements

- [ ] Add "macOS Installation Issues" section to FAQ
- [ ] Document all workaround options
- [ ] Link to upstream issues for reference
- [ ] Optionally mention in installation docs

## Related Files

| File | Purpose |
|------|---------|
| `docs/content/5.advanced/2.faq.md` | Target: add troubleshooting section |
| `docs/content/1.getting-started/1.installation.md` | Optional: add note/link |

## Implementation Steps

### Step 1: Update FAQ with macOS Troubleshooting

Add new section to `docs/content/5.advanced/2.faq.md` after line 369:

```md
## macOS Installation Issues (Apple Silicon)

When installing on macOS with Apple Silicon (M1/M2/M3), you may encounter:

```
Cannot find module '@oxc-parser/binding-darwin-arm64'
```

This is a known issue with npm/pnpm handling optional native dependencies, not a nuxt-security bug.

### Solutions

**Option 1: Upgrade npm (Recommended)**
```bash
npm install -g npm@latest
rm -rf node_modules package-lock.json
npm install
```

**Option 2: Use yarn**
```bash
rm -rf node_modules pnpm-lock.yaml
yarn install
```

**Option 3: Configure pnpm**
Add to `.npmrc`:
```ini
supportedArchitectures.os=current
supportedArchitectures.cpu=current
```

**Option 4: Explicit binding**
```bash
npm install @oxc-parser/binding-darwin-arm64
```

::callout{icon="i-heroicons-light-bulb"}
Read more about the root cause at [oxc troubleshooting](https://oxc.rs/docs/guide/troubleshooting) and [nuxt/nuxt#33480](https://github.com/nuxt/nuxt/issues/33480).
::
```

### Step 2: Optional - Add Note to Installation Page

Consider adding brief note to `docs/content/1.getting-started/1.installation.md`:

```md
::callout{icon="i-heroicons-exclamation-triangle"}
Having issues on macOS Apple Silicon? See [troubleshooting](/advanced/faq#macos-installation-issues-apple-silicon).
::
```

## Todo List

- [x] Add macOS troubleshooting section to FAQ
- [x] Test documentation renders correctly
- [x] Optionally link from installation page

## Success Criteria

- [x] FAQ includes clear macOS troubleshooting section
- [x] All workaround options documented
- [x] Links to upstream issues included

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Anchor link breaks | Low | Use consistent slug |
| Outdated workarounds | Low | Link to upstream |

## Security Considerations

None - documentation only.

## Next Steps

After completion, proceed to Phase 02 (playground config).
