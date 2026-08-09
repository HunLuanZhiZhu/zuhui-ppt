---
name: group-meeting-ppt-source-audit
description: "Audits academic paper source files for group-meeting PPT creation. Invoke when you need to inspect source PDFs, translated PDFs, figures, tables, or appendices before slide planning. English alias of zuhui-ppt-source-audit."
---

# Group Meeting PPT Source Audit (Alias of zuhui-ppt-source-audit)

This skill is a **thin alias** for `zuhui-ppt-source-audit`. It does not duplicate any content. All actual logic and rules live in `zuhui-ppt-source-audit`.

## How to Use

### If `zuhui-ppt-source-audit` is already installed

Use `zuhui-ppt-source-audit` directly. It contains the full instructions for this pipeline stage.

Do not run this alias skill. Instead, invoke `zuhui-ppt-source-audit` and follow its instructions.

### If `zuhui-ppt-source-audit` is NOT installed

Install it from GitHub:

```bash
npx skills add hunluanzhizhu/zuhui-ppt@zuhui-ppt-source-audit -g -y
```

Or install the entire pipeline (all 8 skills):

```bash
npx skills add hunluanzhizhu/zuhui-ppt -g -y
```

Then invoke `zuhui-ppt-source-audit` directly.

## Why This Alias Exists

This skill exists so that users searching for "group meeting PPT" in English can discover the toolchain via `npx skills find "group meeting ppt"`. The canonical skill is `zuhui-ppt-source-audit`; this alias only points to it.

## Maintenance

All content is maintained in `zuhui-ppt-source-audit`. This file should rarely need updates — only if the install command or repository URL changes.
