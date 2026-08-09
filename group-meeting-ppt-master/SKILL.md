---
name: group-meeting-ppt-master
description: "Orchestrates high-end Chinese journal-club and group-meeting paper presentation decks (Swiss International style, HTML-first, 7-stage pipeline). Invoke when user asks for 组会PPT, group meeting PPT, paper sharing slides, or PPT/HTML/PDF triple deliverables. This is the English alias of zuhui-ppt-master."
---

# Group Meeting PPT Master (Alias of zuhui-ppt-master)

This skill is a **thin alias** for `zuhui-ppt-master`. It does not duplicate any content. All actual logic, assets, references, and pipeline rules live in `zuhui-ppt-master`.

## How to Use

### If `zuhui-ppt-master` is already installed

Use `zuhui-ppt-master` directly. It contains the full 7-stage pipeline:

1. `zuhui-ppt-source-audit` → source file audit
2. `zuhui-ppt-story-spine` → scientific story spine
3. `zuhui-ppt-swiss-design` → Swiss International visual design
4. `zuhui-ppt-triformat-export` → HTML / PDF / PPTX triple export
5. `zuhui-ppt-qa` → structural QA
6. `zuhui-ppt-visual-audit` → visual audit
7. `zuhui-ppt-visual-score` → visual quality scoring (threshold ≥ 4.5/5)

Do not run this alias skill. Instead, invoke `zuhui-ppt-master` and follow its instructions.

### If `zuhui-ppt-master` is NOT installed

Install it from GitHub:

```bash
npx skills add hunluanzhizhu/zuhui-ppt@zuhui-ppt-master -g -y
```

Or install the entire pipeline (all 8 skills):

```bash
npx skills add hunluanzhizhu/zuhui-ppt -g -y
```

Then invoke `zuhui-ppt-master` directly.

## Why This Alias Exists

This skill exists so that users searching for "group meeting PPT" in English can discover the toolchain via `npx skills find "group meeting ppt"`. The canonical skill is `zuhui-ppt-master`; this alias only points to it.

## Maintenance

All content is maintained in `zuhui-ppt-master`. This file should rarely need updates — only if the install command or repository URL changes.
