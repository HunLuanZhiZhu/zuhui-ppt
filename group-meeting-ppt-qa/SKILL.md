---
name: group-meeting-ppt-qa
description: "Validates group-meeting PPT packages for structural integrity. Invoke to check slide counts, layout compliance, density, formula integrity, and the 30-page / 30-minute hard requirements. English alias of zuhui-ppt-qa."
---

# Group Meeting PPT Qa (Alias of zuhui-ppt-qa)

This skill is a **thin alias** for `zuhui-ppt-qa`. It does not duplicate any content. All actual logic and rules live in `zuhui-ppt-qa`.

## How to Use

### If `zuhui-ppt-qa` is already installed

Use `zuhui-ppt-qa` directly. It contains the full instructions for this pipeline stage.

Do not run this alias skill. Instead, invoke `zuhui-ppt-qa` and follow its instructions.

### If `zuhui-ppt-qa` is NOT installed

Install it from GitHub:

```bash
npx skills add hunluanzhizhu/zuhui-ppt@zuhui-ppt-qa -g -y
```

Or install the entire pipeline (all 8 skills):

```bash
npx skills add hunluanzhizhu/zuhui-ppt -g -y
```

Then invoke `zuhui-ppt-qa` directly.

## Why This Alias Exists

This skill exists so that users searching for "group meeting PPT" in English can discover the toolchain via `npx skills find "group meeting ppt"`. The canonical skill is `zuhui-ppt-qa`; this alias only points to it.

## Maintenance

All content is maintained in `zuhui-ppt-qa`. This file should rarely need updates — only if the install command or repository URL changes.
