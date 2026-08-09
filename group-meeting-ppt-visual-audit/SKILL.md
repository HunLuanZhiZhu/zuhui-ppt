---
name: group-meeting-ppt-visual-audit
description: "Mandatory visual audit for group-meeting PPT. Invoke before delivering HTML/PPTX/PDF to check image completeness, formula rendering, text sizing, layout validity, and page/duration requirements. English alias of zuhui-ppt-visual-audit."
---

# Group Meeting PPT Visual Audit (Alias of zuhui-ppt-visual-audit)

This skill is a **thin alias** for `zuhui-ppt-visual-audit`. It does not duplicate any content. All actual logic and rules live in `zuhui-ppt-visual-audit`.

## How to Use

### If `zuhui-ppt-visual-audit` is already installed

Use `zuhui-ppt-visual-audit` directly. It contains the full instructions for this pipeline stage.

Do not run this alias skill. Instead, invoke `zuhui-ppt-visual-audit` and follow its instructions.

### If `zuhui-ppt-visual-audit` is NOT installed

Install it from GitHub:

```bash
npx skills add hunluanzhizhu/zuhui-ppt@zuhui-ppt-visual-audit -g -y
```

Or install the entire pipeline (all 8 skills):

```bash
npx skills add hunluanzhizhu/zuhui-ppt -g -y
```

Then invoke `zuhui-ppt-visual-audit` directly.

## Why This Alias Exists

This skill exists so that users searching for "group meeting PPT" in English can discover the toolchain via `npx skills find "group meeting ppt"`. The canonical skill is `zuhui-ppt-visual-audit`; this alias only points to it.

## Maintenance

All content is maintained in `zuhui-ppt-visual-audit`. This file should rarely need updates — only if the install command or repository URL changes.
