---
name: group-meeting-ppt-visual-score
description: "Independent visual quality scoring for group-meeting PPT decks. Invoke after structural QA to score 6 dimensions per slide (evidence readability, figure-text collaboration, typographic discipline, visual rhythm, content density, audience clarity). English alias of zuhui-ppt-visual-score."
---

# Group Meeting PPT Visual Score (Alias of zuhui-ppt-visual-score)

This skill is a **thin alias** for `zuhui-ppt-visual-score`. It does not duplicate any content. All actual logic and rules live in `zuhui-ppt-visual-score`.

## How to Use

### If `zuhui-ppt-visual-score` is already installed

Use `zuhui-ppt-visual-score` directly. It contains the full instructions for this pipeline stage.

Do not run this alias skill. Instead, invoke `zuhui-ppt-visual-score` and follow its instructions.

### If `zuhui-ppt-visual-score` is NOT installed

Install it from GitHub:

```bash
npx skills add hunluanzhizhu/zuhui-ppt@zuhui-ppt-visual-score -g -y
```

Or install the entire pipeline (all 8 skills):

```bash
npx skills add hunluanzhizhu/zuhui-ppt -g -y
```

Then invoke `zuhui-ppt-visual-score` directly.

## Why This Alias Exists

This skill exists so that users searching for "group meeting PPT" in English can discover the toolchain via `npx skills find "group meeting ppt"`. The canonical skill is `zuhui-ppt-visual-score`; this alias only points to it.

## Maintenance

All content is maintained in `zuhui-ppt-visual-score`. This file should rarely need updates — only if the install command or repository URL changes.
