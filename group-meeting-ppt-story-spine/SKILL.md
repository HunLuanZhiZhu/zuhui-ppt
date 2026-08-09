---
name: group-meeting-ppt-story-spine
description: "Builds scientific claim spine and evidence map for high-density group-meeting PPT decks. Invoke after source audit to create per-slide plans with claims, proof objects, and caveats. English alias of zuhui-ppt-story-spine."
---

# Group Meeting PPT Story Spine (Alias of zuhui-ppt-story-spine)

This skill is a **thin alias** for `zuhui-ppt-story-spine`. It does not duplicate any content. All actual logic and rules live in `zuhui-ppt-story-spine`.

## How to Use

### If `zuhui-ppt-story-spine` is already installed

Use `zuhui-ppt-story-spine` directly. It contains the full instructions for this pipeline stage.

Do not run this alias skill. Instead, invoke `zuhui-ppt-story-spine` and follow its instructions.

### If `zuhui-ppt-story-spine` is NOT installed

Install it from GitHub:

```bash
npx skills add hunluanzhizhu/zuhui-ppt@zuhui-ppt-story-spine -g -y
```

Or install the entire pipeline (all 8 skills):

```bash
npx skills add hunluanzhizhu/zuhui-ppt -g -y
```

Then invoke `zuhui-ppt-story-spine` directly.

## Why This Alias Exists

This skill exists so that users searching for "group meeting PPT" in English can discover the toolchain via `npx skills find "group meeting ppt"`. The canonical skill is `zuhui-ppt-story-spine`; this alias only points to it.

## Maintenance

All content is maintained in `zuhui-ppt-story-spine`. This file should rarely need updates — only if the install command or repository URL changes.
