---
name: zuhui-ppt-qa
description: 校验高端中文组会论文汇报 PPT 包，尤其是 zuhui-ppt-master 生成的 PPTX/HTML/PDF 三重输出。用于检查幻灯片数量、组会硬性指标（页数 ≥ 30 页、讲稿时长 ≥ 30 分钟）、Swiss International data-layout 合规性、资源引用、图片尺寸/可读性、禁用 glossary/meta 内容、密度、PDF 页数以及交付前的 QA 报告。QA 通过后，运行 `zuhui-ppt-visual-score` 进行独立逐页视觉质量评分。运行时无外部技能依赖。
---

# 组会 PPT QA（Zuhui PPT QA）

## 目标

阻止未经校验的幻灯片 deck 被交付。只有当 PPTX、HTML、PDF 通过结构与内容检查，且视觉限制已被记录后，deck 才算完成。

## 项目参数

所有路径使用 `zuhui-ppt-master` 中定义的项目参数：

- `PROJECT_SLUG` — 论文短名，用于文件命名
- `VERSION` — 当前版本号
- `OUTPUT_DIR` — `ppt_v{VERSION}/`
- `VISUAL_REF` — 已批准旧版本 deck 的路径，或 `none`

## 必做检查

### 包结构检查

- PPTX 存在：`{OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.pptx`
- HTML 存在：`{OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.html`
- PDF 存在：`{OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.pdf`
- 已规划时，speaker notes 存在。
- QA 报告存在。
- Assets 文件夹存在，且所有被引用图片均在其中。

### 数量检查

- **组会 deck 总页数 ≥ 30 页**（不含附件、致谢、Q&A 占位页）。若不足 30 页，QA 失败。
- PPTX 幻灯片数、HTML 真实幻灯片数、PDF 页数三者一致。
- PPTX slide XML 数量与 PPTX 幻灯片数一致。
- 当存在含图幻灯片时，PPTX media 数量非零。
- Speaker script `speaker_script_v{VERSION}.md` 存在，并包含每页字数与总预估时长。
- **组会 deck 讲稿累计时长 ≥ 30 分钟**：中文 ≥ 6600 字（220 字/分钟），英文 ≥ 3900 words（130 words/分钟）。若不足，QA 失败。

### Swiss International 检查

- 每个真实 HTML 幻灯片都有 `data-layout`。
- 注册正文布局使用 S01-S22；封面/结尾可使用允许的 `SWISS-*` 扩展。
- Deck 节奏包含暗色陈述/章节页与浅色证据页。
- 25 页以上 deck 应具备足够布局多样性，通常至少 8 种布局 ID。
- 全为无衬线字体（Swiss deck 上无衬线）。
- 每份 deck 仅一种强调色（不混用 IKB + 黄 + 橙等）。
- 任何元素无渐变、阴影或 border-radius。
- 遵守字重阶梯：字号越大字重越轻。

### 内容密度检查

- 任何非过渡页都不应在视觉或语义上为空。
- 密集论文图/表不应过小。
- 图重页应有一张主导视觉和一条窄解读层。
- 当论文内容丰富时，应出现表格和附录。
- 当数值清晰可辨时，表格应为原生/重建表格，而非截图。
- 截图不得包含长篇正文段落、图例、表题或周围 PDF 文字。
- 若 `VISUAL_REF` 指向已批准的旧版本，渲染 QA 必须对照该视觉黄金源，而非仅检查结构有效性。

### 资源与渲染完整性检查

- **公式完整性**：在生成的 HTML 和 Python 幻灯片模块中搜索孤立 LaTeX 片段，如 `ight)`、`ight\|`、`ight]`、`ight\}` 或未渲染的可见原始 `$$...$$` 块。任何命中均视为 QA 失败。
- **图片缩放策略**：检查模板 CSS 与内联样式。任何内容图（而非装饰性封面背景）若使用 `object-fit: cover` 且固定容器可能裁剪面板/坐标轴/标签，即视为失败。默认必须为 `object-fit: contain` 并带 `max-height`。
- **布局-纵横比匹配**：标记高/竖图被强行塞进上下 hero 条、或宽/横图被挤进窄轨导致无法阅读或不完整的幻灯片。
- **高密度图片尺寸**：框架图和密集多面板图应占据幻灯片面积的 60-75%，而不是被缩进小槽。
- **标题尺寸合理性**：在证据页上，h1 标题不应消耗超过约 15% 的幻灯片高度；过大而挤压证据的标题应被标记。

### 禁用短语检查

在幻灯片文本与 HTML 中搜索：

- 独立英文标签，如 `WHY NOW`、`Q&A`、`controlled evaluation`、`autonomous research harness`、`components`、`claim` 或 `workflow`，除非以 `中文（English）` 形式配对出现
- 仅 glossary 的页面
- 关于 deck 制作的 meta-description 页面
- "why this paper is worth presenting" 或 "how to read this deck"

将用户反馈中的任何特定禁用短语加入检查列表。

### 证据检查

- 无无依据的虚构指标。
- 观察性证据标注为观察性。
- AI reviewer 分数不作为人工评估呈现。
- 包含局限性。
- 图/表带有来源标签。

## 渲染 QA

**标准视觉审查管道**（默认）：

1. **HTML → PDF**：使用 headless 浏览器（Chrome/Edge headless）将 HTML 打印为 PDF（`@page { size: 13.333in 7.5in; margin: 0; }`）
2. **PDF → 单页图片**：使用 PyMuPDF 将 PDF 拆分为单张 PNG 图片，每页一张（1920x1080 分辨率）
3. **逐页视觉审查**：单独审查每页图片，检查：
   - 图片尺寸、文字溢出、缺图、节奏、第 2 页/标题重叠，
   - 图裁剪是否为干净的纯图裁剪，
   - **图片完整性**：每张论文图中的所有面板、坐标轴、标签、箭头是否完全可见，未被 CSS `cover` 裁剪，
   - **公式渲染**：每个 `$$...$$` 块是否渲染为数学公式，无可见原始 LaTeX 片段（如 `ight)`），
   - 可见英文是否没有即时中文翻译，
   - 修复弱页。

若有可靠渲染器：
- 遵循上述标准管道。
- 从单页图片创建 contact sheet。

若无渲染器：
- 执行包级校验，
- 检查提取的资源/contact sheets，
- 明确报告未执行像素级渲染 QA。

## QA 报告内容

在 `{OUTPUT_DIR}/qa_report_v{VERSION}.md` 中撰写一份简洁报告，包含：

- 输出路径，
- 源文件，
- 幻灯片/页数，
- **组会硬性指标检查结果**：总页数 ≥ 30 页（OK/FAIL）、讲稿时长 ≥ 30 分钟（OK/FAIL），
- media 数量，
- 布局合规性，
- 禁用短语检查结果，
- 图片资源结果，
- 渲染 QA 状态，
- PPTX 可编辑性状态（尤其使用视觉保真截图时），
- 已知限制，
- 与 `VISUAL_REF` 的对比（如适用）。

## 交付规则

除非 QA 报告已存在且命令输出或脚本结果确认检查通过，否则不要说“完成”。

QA 通过后，运行 `zuhui-ppt-visual-score` 获取视觉质量信号。QA 与视觉评分都必须在 deck 被标记为已交付前记录在案。
