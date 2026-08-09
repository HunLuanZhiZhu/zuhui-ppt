---
name: group-meeting-ppt-triformat-export
description: "Exports synchronized PPTX, Swiss HTML, and PDF for group-meeting paper presentations. Invoke after source audit, story spine, and Swiss visual plan. English alias of zuhui-ppt-triformat-export."
---

# Group Meeting PPT Triformat Export (Alias of zuhui-ppt-triformat-export)

This skill is a **thin alias** for `zuhui-ppt-triformat-export`. It does not duplicate any content. All actual logic and rules live in `zuhui-ppt-triformat-export`.

## How to Use

### If `zuhui-ppt-triformat-export` is already installed

Use `zuhui-ppt-triformat-export` directly. It contains the full instructions for this pipeline stage.

Do not run this alias skill. Instead, invoke `zuhui-ppt-triformat-export` and follow its instructions.

### If `zuhui-ppt-triformat-export` is NOT installed

Install it from GitHub:

```bash
npx skills add hunluanzhizhu/zuhui-ppt@zuhui-ppt-triformat-export -g -y
```

Or install the entire pipeline (all 8 skills):

```bash
npx skills add hunluanzhizhu/zuhui-ppt -g -y
```

Then invoke `zuhui-ppt-triformat-export` directly.

## Why This Alias Exists

This skill exists so that users searching for "group meeting PPT" in English can discover the toolchain via `npx skills find "group meeting ppt"`. The canonical skill is `zuhui-ppt-triformat-export`; this alias only points to it.

## Maintenance

All content is maintained in `zuhui-ppt-triformat-export`. This file should rarely need updates — only if the install command or repository URL changes.
