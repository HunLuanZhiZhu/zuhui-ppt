---
name: zuhui-ppt-master
description: 当用户请求 组会PPT、论文汇报PPT、paper sharing slides、Swiss-style scientific PPT 或 PPT/HTML/PDF 三重交付物时， orchestrate 高端中文 journal-club 与组会论文汇报。该主技能按严格顺序管道协调七个 zuhui-ppt-* 子技能：source-audit → story-spine → swiss-design → triformat-export → qa → visual-audit → visual-score，并 review gate 逐一通过。它继承并本地化 Swiss International 风格资产（template-swiss.html、S01-S22 注册布局、validate-swiss-deck.mjs、themes-swiss.md、layouts-swiss.md、swiss-layout-lock.md、checklist.md、screenshot-backgrounds），内化了证据优先的论文提取方法论（每页 claim+proof+caveat、presentation logic routing、结论式标题、slide archetype recipes、strategist-executor-critic 迭代），并贯彻精益操作原则（最小提取、跨平台工具链、快速路径默认），从而可在无外部技能依赖的情况下运行。
---

## Claude Code 整体插件路径与运行约定

当此技能作为整个 `zuhui-ppt` 插件的一部分使用时，**本技能的所有仓库相对路径均相对于插件根目录**，不是用户当前工作目录：

- 资源及模板：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/assets/`、`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/references/`；
- 关联技能：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-<stage>/SKILL.md`，Claude Code 中技能名称带有 `zuhui-ppt:` 命名空间；
- 校验器：使用 `node "${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/scripts/validate-swiss-deck.mjs" "ppt_vN/deck.html"` 和 `node "${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/scripts/validate-research-ledgers.mjs" ...`（根据实际输出路径替换示意路径）。

`PROJECT_SLUG`、`VERSION`、`OUTPUT_DIR` 和原论文素材属于**用户项目工作区**，不能把输出写进插件安装目录。继续遵守主控对 HTML、图面板、公式账本、质量门和旧版本保留的规则。独立通过 Skills 安装器使用时，依然按原先工作区与同级技能目录的方式定位资源。



# 组会 PPT 主控技能（Zuhui PPT Master）

## 目标

从一篇学术论文构建一份高端、高密度、视觉精美的中文组会汇报演示。默认交付物为一组同步产物：

1. Swiss International 风格横向 `.html`（核心源文件），
2. 从 HTML 导出的可打印 `.pdf`，
3. 可在本地修改的 `.pptx`，
4. **独立演讲稿** `speaker_script_v{VERSION}.md`，含每页字数与总预估时长，
5. 每页 speaker notes 与 QA 报告。

**HTML 优先原则（严格）**：HTML 是核心/规范交付物。PPTX 与 PDF 均应由 HTML 转换/导出而来，禁止为 PPTX/PDF 单独重新创作或重新排版。当格式之间的一致性发生冲突时，以 HTML 为准。必要时可以牺牲 PPTX 的原生可编辑性，以维持与 HTML 的视觉一致。

### HTML 优先模式下的禁止事项

- **禁止**编写单独的 PPTX 构建器，从零开始摆放文本、形状、表格或图片。
- **禁止**脱离 HTML 独立生成 PowerPoint 原生幻灯片结构。
- **禁止**以“PPTX 可编辑，因此可以与 HTML 不同”作为视觉漂移的理由。
- **禁止**将 PPTX 打印为 PDF。PDF 必须从 HTML 导出。

若用户要求“可编辑的 PPTX”，应理解为“生成一个可以在 PowerPoint 中打开的 PPTX 文件”，而非“生成原生可编辑的 PPTX”。实现方式必须是截图 backed slides 或 HTML-to-PPTX 转换，以精确保留 HTML 渲染效果。

## 项目初始化

**第一阶段之前**，提取或向用户询问以下项目参数。所有子技能都使用这些参数，而不是硬编码值：

| 参数 | 来源 | 示例 |
|-----------|--------|---------|
| `PROJECT_SLUG` | 论文短名或缩写，小写 | `adancfgd`, `thin-harness`, `swin-transformer` |
| `VERSION` | 工作区中下一个未使用的版本号；若不存在则为 `1` | `1`, `2`, `3` |
| `OUTPUT_DIR` | 相对于论文工作区根的 `ppt_v{VERSION}/` | `ppt_v1/`, `ppt_v2/` |
| `VISUAL_REF` | 最近一期用户认可的旧版本 deck 路径；首次构建则为 `none` | `ppt_v0/index.html` |

搜索工作区中现有的 `ppt_v*/` 目录以确定起始 `VERSION`。若 `ppt_v1` 到 `ppt_v3` 都已存在，则下一版进入 `ppt_v4/`。除非用户明确要求，否则永远不要覆盖早期版本。

`PROJECT_SLUG` 决定输出文件名：`{PROJECT_SLUG}_v{VERSION}.pptx`、`{PROJECT_SLUG}_v{VERSION}.html`、`{PROJECT_SLUG}_v{VERSION}.pdf`。

## 组会 PPT 硬性指标（项目级约束）

只要用户请求的是**组会/文献汇报/journal club** 用途的 deck，以下两项即为项目级硬约束，必须在第 1 阶段之前明确，并贯穿整个管道：

- **总页数 ≥ 30 页**（不含附件、致谢、Q&A 占位页）。
- **讲稿对应口述时长 ≥ 30 分钟**。

这两项不是仅在最后检查时才考虑的“建议”，而是早期决策的输入：

- `zuhui-ppt-story-spine` 必须在 slide plan 中规划出 ≥ 30 页的内容结构；
- 每页计划必须附带 speaker notes，累计中文字符数 ≥ 6600 字（按 220 字/分钟 × 30 分钟），或英文 ≥ 3900 words（130 words/分钟 × 30 分钟）；
- `zuhui-ppt-qa` 和 `zuhui-ppt-visual-audit` 分别在结构门和硬性指标门复核这两项。

如果在任何早期阶段发现页数或时长无法达标，必须立刻回到 story spine 补充背景、方法细节、实验解读、消融分析、相关工作对比或扩展讨论，禁止通过放慢语速、重复内容或插入无关页来凑数。

## 演讲者与论文作者区分规则

组会 PPT 通常讲述别人的论文，因此必须严格区分“演讲者信息”与“论文作者信息”。两者不得混淆，封面上尤其要避免喧宾夺主。

### 信息分类

- **演讲者信息**：汇报人姓名、所在单位、组会日期、导师/汇报组别等。这些信息属于本次组会场景，而非论文本身。
- **论文作者信息**：论文原文列出的作者、作者单位、发表会议/期刊、年份、DOI/arXiv 链接等。这些信息必须从论文 PDF/HTML 中提取，不得与演讲者信息混为一谈。

### 占位符规则

若用户未提供演讲者信息，使用以下占位符，严禁直接留空或错误套用论文作者：

- `[演讲者姓名]`
- `[演讲者单位]`
- `[汇报日期]`
- `[导师/组别]`（如适用）

### 封面/首页布局规则

- 论文标题、论文作者与单位应占据封面的主导地位。
- 演讲者信息应以较小字号、footer 或 kicker 形式出现，不得与论文作者并列或喧宾夺主。
- 若使用 `SWISS-COVER-ASCII` 或 S01 封面，论文元数据（标题、作者、会议/期刊、年份）应构成主视觉块；演讲者元数据放在底部细条或角落。

### 导出前检查清单

导出前必须确认以下事项：

- [ ] 演讲者占位符已被用户提供的真实信息替换，或明确标注为占位符等待用户填写。
- [ ] 封面未将论文作者误标为演讲者。
- [ ] 论文作者信息确实来自论文原文，而非演讲者个人资料。
- [ ] 演讲者信息字号与位置不抢论文标题与作者的风头。

## 用户反馈转化为不可跳过的研究型质量约束

本次强制遵循 `references/research-deck-quality-protocol.md`。它细化了七阶段既有职责，不新增布局，也不改变 HTML 优先原则：

- **理论主线**：算法/方法论文以理论、架构和机制为骨架，默认理论/机制 50%–60%、实验 20%–35%，作为每篇论文的可调整规划预算。不得将所有次要图一图一页；合并、舍弃或移至备份必须有取舍理由。
- **整图语义边界**：以原论文的完整逻辑图号和所有 (a)/(b)/内部面板为单位核验。即使 `object-fit:contain`、页面没有越界，也不能推断“裁剪图完整”。在 `figure_manifest_vN.json` 留下原页码、面板清单与人工对照记录。
- **公式可读性**：每个展示公式建立 `formula_ledger_vN.json`，可见页面必须解释关键符号、索引/维度、输入输出与设计作用；重要公式用最小例子或形状追踪。只有讲稿里有解释不算通过。
- **多论文/翻译版本**：分别审计各篇的原版和译版、版本号、引用图的版本；有明确的两篇边界与对读，不跨不同实验口径直接比较优劣。
- **回归修复**：用户提出的“37 页图 3(a+b) 丢子图”“37/38 页逻辑断裂”“公式符号不明”“实验堆叠”应写入修订回归清单。真正修好后需附源图对照和相邻页截图，不能凭自动检测通过宣称修复。
- **不虚报校验**：结构 QA、浏览器像素渲染、源图逐面板对照与公式符号审查是四类不同的检查。未运行须写 `NOT RUN`，不得与 `PASS` 混同。视觉评分即使 ≥4.5/5 也不抵消源图或公式解释的关键失败。

## 必需子技能链（严格顺序管道）

必须按以下精确顺序调用同级子技能。每一阶段的结果喂给下一阶段；不要并行化，不要跳过，只有在当前阶段的 review gate 满足后才能进入下一阶段。进入下一阶段前，先记录当前阶段的输出产物。

| 阶段 | 子技能 | 输出产物 | Review gate（进入下一阶段前必须通过） |
|-------|----------|----------------|-------------------------------------------|
| 1 | `zuhui-ppt-source-audit` | `audit_note_v{VERSION}.md` + asset manifest | 源文件及版本锁定；候选图/表与全部子图面板已识别；译图与原图差异、旧版本失败点已记录。 |
| 2 | `zuhui-ppt-story-spine` | `slide_plan_v{VERSION}.md` | 每个非过渡页都有 claim + proof object + interpretation + caveat；逐论文理论/实验预算与公式释义计划已审查。 |
| 3 | `zuhui-ppt-swiss-design` | `visual_plan_v{VERSION}.md` | 布局 ID 已注册（S01-S22 或 ASCII 扩展）；主题已选；图片尺寸与节奏已规划。 |
| 4 | `zuhui-ppt-triformat-export` | `.html`（规范源）、`.pdf`、`.pptx`、构建脚本/笔记 | 数量一致；HTML 使用 `template-swiss.html`；PPTX 默认采用截图 backed。 |
| 5 | `zuhui-ppt-qa` | `qa_report_v{VERSION}.md` | 结构门通过：数量一致、布局已注册、资源存在、无禁用短语、密度最低标准满足。 |
| 6 | `zuhui-ppt-visual-audit` | `visual_audit_report_v{VERSION}.md` | **硬性指标通过**：页数 ≥ 30 页、讲稿时长 ≥ 30 分钟；图片源码面板完整且演示中不裁切、公式已渲染且可解释、相邻页逻辑自然、文字大小与布局无硬伤。 |
| 7 | `zuhui-ppt-visual-score` | `visual_score_v{VERSION}.md` | 总分 ≥ 4.5/5 且无源图/公式语义一票否决项；未独立评分不得宣称通过。 |

### 管道纪律

- **仅顺序执行**：第 N 阶段完成并通过其 gate 后，再开始第 N+1 阶段。故事脊椎未批准前不要构建 HTML；**visual-audit 通过前不要运行 visual score**。
- **禁止静默跳过**：若某个子技能无法加载，向用户报告失败并停止管道。不要以弱化版 fallback 替代 source audit、story spine、QA、visual-audit 或 visual score。
- **产物检查点**：每个阶段必须在 `OUTPUT_DIR` 中留下持久产物。下一阶段以上一阶段的产物为主要输入。
- **迭代循环**：当 QA、visual-audit 或 visual score 失败时，回到能修复根本原因的最早期阶段（通常密度/故事问题回到第 2 阶段，布局问题回到第 3 阶段，图片/公式/页数问题回到第 4 或第 6 阶段），然后按顺序重新运行下游阶段。

若某个子技能无法加载，说明问题并停止；不要继续执行会绕过 source audit、evidence mapping、QA、visual-audit 或 visual scoring 的 fallback。

## 继承并本地化的 Swiss 资产

本技能从 `guizang-ppt-skill` 继承 Swiss International 体系，并将所需文件本地化，使其在运行时不依赖 `guizang-ppt-skill`。执行时使用这些本地化文件，不要回退到 `guizang-ppt-skill` 路径：

| 本地路径 | 在 guizang-ppt-skill 中的来源 | 用途 |
|------------|----------------------------|---------|
| `zuhui-ppt-master/assets/template-swiss.html` | `assets/template-swiss.html` | 强制的 HTML deck 种子（横向翻页、WebGL 网格、Motion One、导航）。 |
| `zuhui-ppt-master/assets/motion.min.js` | `assets/motion.min.js` | Motion One 本地 fallback。 |
| `zuhui-ppt-master/assets/screenshot-backgrounds/` | `assets/screenshot-backgrounds/` | 内置截图装帧背景（style-a / style-b）。 |
| `zuhui-ppt-master/references/themes-swiss.md` | `references/themes-swiss.md` | 4 种强调色预设（IKB / 柠檬黄 / 柠檬绿 / 安全橙）。 |
| `zuhui-ppt-master/references/layouts-swiss.md` | `references/layouts-swiss.md` | S01-S22 布局骨架与使用说明。 |
| `zuhui-ppt-master/references/swiss-layout-lock.md` | `references/swiss-layout-lock.md` | 硬约束：仅注册布局、无 SVG 文本、禁止自创正文布局。 |
| `zuhui-ppt-master/references/checklist.md` | `references/checklist.md` | P0/P1/P2/P3 质量检查清单。 |
| `zuhui-ppt-master/references/components.md` | `references/components.md` | 组件细节（字体、网格、图标、callouts、stat cards、motion recipes）。 |
| `zuhui-ppt-master/references/screenshot-framing.md` | `references/screenshot-framing.md` | CleanShot X 风格截图适配规则。 |
| `zuhui-ppt-master/scripts/validate-swiss-deck.mjs` | `scripts/validate-swiss-deck.mjs` | 静态校验器：data-layout 注册、SVG 文本禁令、布局硬约束。 |

构建 Swiss 风格 deck 前，先阅读 `template-swiss.html`（至少读到 `<style>` 块结束）和相关 references。构建后，运行 `node zuhui-ppt-master/scripts/validate-swiss-deck.mjs {OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.html`，并在 QA 前修复所有错误。

## 内化的视觉规则（Swiss International 风格）

核心规则：

### 视觉系统核心

- **字体**：Inter / Helvetica Neue / Noto Sans SC（均为无衬线）。Swiss deck 上出现任何衬线字体均为错误。
- **单一强调色**：每份 deck 只使用四种预设之一（IKB Blue `#002FA7`、Lemon Yellow `#FFD500`、Lemon Green `#C5E803`、Safety Orange `#FF6B35`）。禁止混用多种强调色。
- **IKB Blue 默认**：若用户未指定，使用 IKB Blue `#002FA7`，`--accent-on:#ffffff`。
- **灰阶**（跨主题，切勿修改）：`--paper:#fafaf8`，`--ink:#0a0a0a`，`--grey-1:#f0f0ee`，`--grey-2:#d4d4d2`，`--grey-3:#737373`。
- **无渐变、无阴影、无 border-radius**：所有块均为纯色直角。唯一的装饰线是 1px 细线。
- **字重阶梯**：字号越大，字重越轻。`>=8vw` 用 weight 200，`4-7.9vw` 用 200-300，`1-1.9vw` 用 300-400，`16-20px` 用 400-500，`13-15px` 用 500-600。
- **中文标题字号**：`<=8 字` → `min(6.4vw,11.2vh)`；`2 行每行 <=8 字` → `min(5.8vw,10.2vh)`；`2 行 9-12 字` → `min(5.2vw,9.2vh)`；`3 行及以上` → 先重写标题，fallback `min(4.6vw,8.2vh)`。
- **最小可读字号**：正文 `18px`，卡片/说明 `16px`，meta/kicker `14px`。不得低于 14px。
- **卡片填充类型互斥**：同一组内不能混用 `card-ink` / `card-accent` / `card-fill` / `card-outlined`。默认多卡片使用 `card-fill`（灰色）；仅允许一张 `card-accent`。

### 注册布局（S01-S22）

每张正文幻灯片必须使用以下注册布局之一，并带有 `data-layout="Sxx"`：

| ID | 名称 | 用途 |
|----|------|----------|
| S01 | Index Cover | 开篇封面 |
| S02 | Vertical Timeline + KPI | 带数据的演进（2-5 个节点） |
| S03 | Split Statement | 核心论点，左右分屏 |
| S04 | Six Cells | 6 个概念定义 |
| S05 | Three Layers | 三层架构 |
| S06 | KPI Tower | 4 个带高度对比的数据项 |
| S07 | H-Bar Chart | 5-10 项排序对比 |
| S08 | Duo Compare | 前后对比 |
| S09 | Dot Matrix Statement | 大标题 + 点阵 |
| S10 | Split Closing | 结尾 |
| S11 | Horizontal Timeline | 4-7 步线性流程 |
| S12 | Manifesto + Ink Banner | 阶段性结论 + 墨条 |
| S13 | Three Forces | 3 个等权重概念 |
| S14 | Loop Form | 闭环流程（3-5 步） |
| S15 | Matrix + Hero Stat | 8-12 项矩阵 + 汇总 |
| S16 | Multi-card Brief | 6 个轻量提示卡片 |
| S17 | System Diagram | 三层同心系统 |
| S18 | Why Now | 3 个论据 + 数据 |
| S19 | Four Cards | 4 个等权重特性 |
| S20 | Stacked KPI Ledger | 4-6 行台账数据 |
| S21 | Tech Spec Sheet | 产品规格 / 基准对比 |
| S22 | Image Hero | 21:9 主图 + 标题 + 3 个 KPI |

封面与结尾还可使用 `SWISS-COVER-ASCII` / `SWISS-CLOSING-ASCII` 扩展。正文幻灯片禁止其他自创布局。

### 论文 deck 的布局选择

| 内容意图 | 推荐布局 |
|---------------|-------------------|
| 封面 | S01 或 `SWISS-COVER-ASCII` |
| 问题陈述 | S09 Dot Matrix Statement 或 S03 Split Statement |
| 密集对比 / 原生表格 | S21 Tech Spec Sheet |
| 大论文图/表裁剪 | S22 Image Hero |
| 架构 / 流程图 | S22 或 S17 System Diagram |
| 三概念卡片 | S13 Three Forces |
| 四特性或限制 | S19 Four Cards |
| 前后/模型对比 | S08 Duo Compare |
| 指标 / 单次实验证据 | S20 Stacked KPI Ledger |
| 章节过渡 | S09 暗色陈述页 |
| 结尾 | S10 Split Closing 或 `SWISS-CLOSING-ASCII` |

### 布局多样性规则

7-8 页 deck 至少使用 6 种不同布局 ID。25 页以上 deck 至少使用 8 种。禁止 3 张及以上连续幻灯片使用相同主体结构。

### 图片规则

- 证据页上的图/表占据幻灯片面积的 55-80%，并配一条窄解读轨。
- S22 hero 图片使用 21:9 比例，主体位于安全中间区域，`object-position:center 35%`。
- S15/S16 多图网格使用统一比例（21:9 或 16:10），禁止混用。
- 图片容器：直角、无阴影、无 border-radius。白色背景 `var(--paper)`。
- 仅裁剪图/表本身；永远不要包含周围正文、图注或图例。
- 将表格重建为原生 HTML/PPT 表格，基于已核验文本；不要使用表格截图。

### P0 对齐规则

1. 不要重复水平内边距：`canvas-card` 已提供 `5.6vh 5vw 4.4vh`。正文内容不要再加 `5vw`。
2. Kicker 在标题上方：始终垂直堆叠（`flex-direction:column`），禁止并排。
3. 双约束字号：`min(Xvw, Yvh)`，其中 Y >= X * 1.6。
4. 使用 grid `gap` 作为 canvas-card 子元素之间的间距，不要堆叠 margin/padding。

### 幻灯片主题节奏

在浅色（白色）证据页与暗色（ink）陈述/章节页之间交替。每 3-4 张证据页后应插入一张暗色 hero 或章节分隔页。禁止 3 张及以上连续同主题幻灯片。

### 视觉黄金源规则

当存在旧版本且用户认可其视觉风格时，将该版本视为 `VISUAL_REF` 黄金源。若用户已接受某种外观，不要重新发明样式。若 `VISUAL_REF` 为 `none`，则遵循上述默认 Swiss International 规则。

## 内化的内容方法论（证据优先提取）

本技能内化了论文到 PPT 的提取方法论，使其运行时无需依赖 `paper-ppt-agent` 或 `nature-paper2ppt`。核心规则：

### Strategist-Executor-Critic 工作流

1. **Strategist**：阅读论文，构建 claim spine，规划幻灯片结构与证据地图。
2. **Executor**：按照 strategist 的计划构建 deck（HTML/PPTX/PDF）。
3. **Critic**：检查已构建 deck 的密度、图片可读性、禁用内容、布局多样性、对齐问题。若 critic 发现问题，至少迭代一次。

该循环对应：第 2 阶段（story spine）= strategist，第 3-4 阶段（design + export）= executor，第 5 阶段（QA）= critic。

### 论文类型路由

首先识别主要论文类型：discovery/mechanism、methods/algorithm/tool、resource/dataset/benchmark、clinical/population、materials/chemistry/engineering、review/perspective。

### 演示逻辑路由

识别论文类型后，选择演示逻辑。这是独立决策：同一论文类型可根据论证强度支持不同逻辑。

| 逻辑 | 何时使用 | 幻灯片弧线 |
|-------|------------|-----------|
| `claim-first` | 有一个可 upfront 陈述的强烈核心论点 | claim → evidence → validation → boundary |
| `question-to-evidence` | 机制与发现类论文 | phenomenon → unknown → hypothesis → design → evidence → model → next |
| `problem-to-solution` | 方法、工具、AI、工程类论文 | bottleneck → method → workflow → evaluation → baselines → ablation → reuse |
| `workflow-to-validation` | 数据集、图谱、基准 | need → design → QC → landscape → validation → insights → boundaries |
| `evidence-map` | 综述与观点 | why now → framework → themes → controversy → synthesis → future |

AI/方法类论文默认：`problem-to-solution`。若论文有单一主导论点，优先 `claim-first`。

### Claim + Proof Object 规则

每个非过渡页必须包含：

- **claim**：结论式中文标题或核心洞见
- **proof object**：干净的图裁剪、原生重建表格、流程图、指标或论文支持的总结
- **interpretation**：观众应相信什么
- **caveat**：证据不能证明什么

若不存在 proof object，该页必须是必要的过渡、讨论或限制页。否则合并或删除。

### 标题写作规则

所有内容页使用**结论式标题**。好标题陈述幻灯片的观点，而非仅列主题。优先使用“AdaNCFGD 通过非因果机制消除训练延迟偏移”，而非“Method”或“Figure 3”。

### 幻灯片原型配方

- **Hero Figure Result**：60-75% 视觉，20-30% 解读轨，底部短 take-away 条 → S22
- **Workflow / Method**：全宽流程视觉 + 紧凑注释条 → S17 或 S11
- **Comparison / Table**：图表/表格块 + 细指标轨 → S21、S08 或 S07
- **Text-Led Synthesis**：2-4 个要点或 3 个 claim 卡片 + 底部总结句 → S13、S19 或 S09
- **Cover**：一个主导块 + 小元数据条 → S01 或 `SWISS-COVER-ASCII`
- **Chapter Transition**：全宽陈述，暗色主题 → S09 或 S03

### 单页证据层级

1. Hero figure 或主表裁剪（主导区域）
2. 窄解读轨（1-3 个指标 callout）
3. 最少标签
4. 更深入解释 → speaker notes 或下一页

### 密集提取

不要停在摘要和主图。检查表格、附录图、流程内部、对比表、失败模式、限制段落和实现细节。所有数字必须与论文核对。

### 图文协作

- 用共享场域将图与文字配对：紧凑边框、图注边缘、解读轨或 take-away 条。
- 单页以一张主导图为核心：图占 60-75%，文字仅占窄轨。
- 图注紧贴图边缘；禁止漂浮的 detached text。
- 1-3 个指标 callout 帮助读图；不要环绕多个等权重框。
- 密集源图：裁剪 hero 面板 + callout，永远不要缩小整图再用长要点补偿。
- 文字引导阅读顺序和解读，不重复面板标签。

### 页面饱满度规则

大多数幻灯片应有顶部锚点（kicker/章节标签）、主导中部块（证据图/表/claim 卡片）和底部锚点（take-away 条/source 条/结论行）。通过证据支持元素增加饱满度，而非装饰。

## 精益操作模式

默认采用仍能产出可用输出包的最低开销工作流。

应做：
- 只阅读理解论文论点所需的源材料，
- 若 `{OUTPUT_DIR}/audit_note_v{VERSION}.md` 已存在则复用 source audit note，
- 仅从 audit note 的候选资源列表中提取图/表，
- 若 `{OUTPUT_DIR}/assets/` 中已有裁剪则复用，
- 三种格式作为主要交付物全部构建，
- 对 PPTX 包进行轻量结构检查，
- 编写简短 QA 报告。

默认避免：
- 穷尽提取每一张图、页、图片、表格或补充材料，
- 除非 PDF 扫描或正常文本提取失败，否则不进行完整 OCR，
- 除非调试或复用需要，否则不保存完整原始论文文本，
- 当只有少数几页包含有用图片时进行全页高分辨率渲染，
- 仅为了预览而启动 GUI 应用或桌面自动化，
- 当用户只需要 deck 时生成冗长中间文件，
- 当没有可靠 headless 渲染器时渲染每一页。

## 工具链策略

除非用户明确要求其他方案，否则使用跨平台 Python 优先栈：
- PyMuPDF 用于元数据、文本提取、页面渲染和页面级裁剪，
- Pillow 用于图裁剪、contact sheets 和轻量预览图，
- python-pptx 用于 PPTX 创作和 PPTX 安全编辑，
- zipfile 加 python-pptx 重新打开一遍用于包校验。

该栈可在 macOS、Linux 和 Windows 上运行。使用 `pathlib` 路径和项目本地输出目录。不要硬编码 OS 字体路径或平台特定位置。若缺少 Python 包，创建本地虚拟环境并仅在策略允许时安装最少量包。

将 LibreOffice/soffice 视为可选项，仅当它已可用且真实渲染预览值得成本时才使用。避免 Keynote、PowerPoint 桌面自动化、AppleScript、Preview、Finder、`open` 以及 helper scripts 中任何 OS 特定的字体或路径依赖。

## 默认快速路径

对于一份可正常选中文本的论文 PDF，执行最短的完整路径：
1. 若 source audit note 可用则复用；否则用 PyMuPDF 提取元数据、摘要、标题、图例、表题。写入 `audit_note_v{VERSION}.md`。
2. 若 story spine 可用则复用；否则识别论文类型、演示逻辑和候选图。写入 `slide_plan_v{VERSION}.md`，并在进入下一阶段前满足第 2 阶段 review gate。
3. 仅对选定的图/表页渲染高分辨率图像，并仅裁剪会出现在 deck 中的资源。
4. 写入 `visual_plan_v{VERSION}.md`，包含注册的 S01-S22 布局和密度检查清单。
5. 使用 triformat export 构建 PPTX + HTML + PDF；HTML 是规范源。
6. 运行 `node zuhui-ppt-master/scripts/validate-swiss-deck.mjs {html}` 并修复所有错误。
7. 通过重新打开 PPTX 并检查包结构来验证；仅当有可靠 headless 渲染器时才渲染幻灯片预览。
8. 运行 `zuhui-ppt-qa`，然后运行 `zuhui-ppt-visual-score`。迭代直到总分 ≥4.5/5。

OCR、完整补充材料提取、全页高分辨率渲染、全页渲染 QA 和长脚本文件均为可选或合理例外，而非默认。

## 操作契约

### 必须保持

- 保留三种最终产物：HTML（规范源）、PDF、PPTX。
- HTML 是规范源。PPTX 与 PDF 仅通过转换从 HTML 派生。当格式一致性冲突时，HTML 胜出。
- 保持 HTML 根植于 Swiss International 风格：`template-swiss.html`、IKB blue（默认）、暗色章节/陈述页、注册 `Sxx` 布局、大图 hero 页。
- 当 `VISUAL_REF` 指向已批准的旧版本时，将其视为视觉黄金源。默认 house style 为：IKB 封面、暗色陈述页、纤细 Swiss 字体、稀疏而锐利的卡片、干净的证据图页。
- 仅从 HTML 生成 PPTX。默认将每张 HTML 幻灯片渲染为 1920x1080 截图，并每张 PPTX 幻灯片放一张截图。原生可编辑 PPTX 重建仅在用户明确要求且截图 backed PPTX 已产出并验证通过后才作为次要选择。
- 保留可复现脚本或构建笔记，以便后续版本可重新生成。
- 在 QA 前运行 `node zuhui-ppt-master/scripts/validate-swiss-deck.mjs {html}` 并修复所有错误。
- 保持幻灯片内容面向观众。规划脚手架、给 agent 的阅读地图、“why this deck matters” 等说明应放入 speaker notes 或构建笔记，而非幻灯片。
- 幻灯片可见文字使用中文。若必须使用英文专业术语，写作 `中文解释（English term）`；不要在标题、卡片、说明、footer 或章节标签中留下独立英文短语。
- 保持高内容密度：每个非过渡页必须携带 ≥3 个具体信息点；卡片必须有实质性正文；禁止单句卡片。

### 必须避免

- 不要制作稀疏 deck：空卡片、单句卡片，或只有标题和小图的页面。
- 不要将密集论文图缩进小槽；若图就是证据，给它 55-80% 的页面面积。
- 不要截图长篇论文段落、图例或表题作为幻灯片证据。
- 当表格可重建时，不要使用表格截图。从已核验文本重建原生 HTML/PPT 表格。
- 不要使用包含周围论文正文或图注的翻译 PDF 裁剪；仅裁剪图/表本身，或使用干净的提取图资源。
- 除非明确要求，否则不要创建独立 glossary 或英文术语记忆页。
- 不要创建 meta-slide，例如“how this version solves English figures”。
- 不要创建面向自己的规划页，例如“why this paper is worth presenting”或“how to read this deck”；将它们转成 speaker notes 或内部幻灯片计划。
- 不要在可见 slide copy 中留下独立英文短语，如 `controlled evaluation`、`autonomous research harness`、`components`、`claim` 或 `workflow`。翻译或包装为 `中文（English）`。
- 不要为了视觉饱满而虚构数字、对比或性能声明。
- 不要从头创建无关视觉风格；遵循本地化 Swiss International 资产与规则。
- 不要发明未注册的正文布局（`P23`、`Evidence Grid` 等）。仅使用 S01-S22 或 `SWISS-COVER-ASCII` / `SWISS-CLOSING-ASCII`。
- 不要交付视觉总分低于 4.5/5 的 deck；迭代直到达标。

## 工作流

### 第一阶段 — 源文件审计

使用 `zuhui-ppt-source-audit`。

本阶段交付物：

- source inventory，
- paper metadata，
- page/figure/table map，
- 翻译后的图/表裁剪资源，
- asset manifest（含来源页与目标幻灯片），
- 旧版本失败点与用户约束笔记。

对于翻译 PDF，即使没有单独的翻译图片资源，也要渲染页面并裁剪翻译后的图/表。

### 第二阶段 — 科学故事脊椎

使用 `zuhui-ppt-story-spine`。

本阶段交付物：

- 论文类型与演示逻辑，
- 密集 claim spine，
- 逐页计划（含结论式标题与原型分配），
- 图/表证据地图，
- 限制与讨论问题，
- 每页的 speaker-note 意图。

每个非过渡页必须回答：claim 是什么、evidence 是什么、why it matters、boundary 或 caveat 是什么。

**严格 review gate**：第二阶段完成后，必须审查并确认 `slide_plan_v{VERSION}.md`。验证以下全部内容；任何一条失败即拒绝该计划：

- 若为组会/文献汇报，内容页必须不少于 30 页、讲稿不少于 30 分钟；其他类型演示仅遵循用户的明确长度要求。
- 每个非过渡页都有清晰的 **claim**、具体的 **proof object**、**interpretation** 和 **caveat/boundary**。
- 每个非过渡页至少有 **3-5 个具体信息点**（数据点、对比、指标或具体论点）。
- 图分配通过信息密度与语义完整性评估：源图面板清单正确；次要图应合并、舍弃或放到备份，不为凑页数独占整页。
- 不存在仅用于展示图注或论文 legend 作为可见 slide copy 的页面。
- 叙事弧线遵循某一种演示逻辑路由，并从标题到结尾连贯。
- 过渡页必须有正当理由；通用章节标题如“Method”或“Results”禁止作为幻灯片标题。

不要带着未经审查或密度不足的 slide plan 进入第三阶段（视觉设计）。

### 第三阶段 — Swiss 视觉计划

使用 `zuhui-ppt-swiss-design`。首先阅读本地化 references：`template-swiss.html`、`references/themes-swiss.md`、`references/swiss-layout-lock.md`、`references/layouts-swiss.md`、`references/checklist.md`。

本阶段交付物：

- `visual_plan_v{VERSION}.md`，包含：主题（通常为 IKB Blue 默认）、幻灯片节奏、使用 S01-S22 或 `SWISS-COVER-ASCII` / `SWISS-CLOSING-ASCII` 的注册 `data-layout` 计划、图文协作计划、图片尺寸计划、每页密度检查清单。
- 每个计划布局必须是注册 S01-S22 ID 或 ASCII 扩展之一。禁止自创正文布局。
- 密集图必须分配给 S22 Image Hero 或全宽 S21；低信息图必须合并为多卡片页（S13/S19）或文本主导页（S09）。
- 预判 `validate-swiss-deck.mjs` 检查：每页都带 `data-layout`、SVG 几何中无可见 `<text>`、布局已注册。

论文图优先使用 S22、S21、S19、S09。避免未注册正文布局。

**阶段 1–3 新增持久产物**：`figure_manifest_v{VERSION}.json`、`formula_ledger_v{VERSION}.json`、`revision_regression_v{VERSION}.md`。前两者的示例和填写规则见研究质量协议。审计未通过不能靠导出或评分补救。

### 第四阶段 — 三重导出

使用 `zuhui-ppt-triformat-export`。

从一个内容模型构建，以避免漂移：

- 通过将 slide section 注入 `template-swiss.html`（来自 `zuhui-ppt-master/assets/`）生成 HTML，作为规范源，
- 以相同页数打印 HTML 得到 PDF（`@page { size: 13.333in 7.5in; margin: 0; }`），
- 将每张渲染后的 HTML 幻灯片转为截图并作为 slide background/shape 插入 PPTX（无独立布局），
- notes 与 QA 报告。

HTML 是规范源；PPTX 与 PDF 是 HTML 的转换，不是独立重建。截图 backed PPTX 是默认方式。在 QA 报告中披露 PPTX 构建方法。

### 第五阶段 — QA 与迭代

使用 `zuhui-ppt-qa`。

QA gates：

- PPTX 幻灯片数 = HTML section 数 = PDF 页数。
- 每个真实 HTML 幻灯片都有在 S01-S22 或 ASCII 扩展中注册的 `data-layout`。
- `node zuhui-ppt-master/scripts/validate-swiss-deck.mjs {html}` 零错误通过。
- 密集证据页包含大而可读的图/表。
- 无禁用 meta/glossary 短语。
- 所有图片资源存在且被引用。
- 图文协作：图占 55-80%、图注紧贴、证据周围无等权重框。
- 页面饱满度：每页都有顶部锚点、主导中部、底部锚点。
- 内容密度：每个非过渡页 ≥3 个具体信息点；无单句卡片；S13/S19 每张卡片 ≥2 句实质性内容。
- 若有渲染器，创建预览/contact sheets 并检查弱页。
- 若无渲染 QA，明确说明该限制。

至少迭代一次的情况：

- 图片页看起来太小，
- 幻灯片节奏失去 Swiss 特征，
- 非过渡页感觉稀疏，
- HTML/PPTX/PDF 数量不一致，
- validate-swiss-deck 报错，
- 旧版本用户反馈未解决。

在结构 QA 阶段首先运行 `node zuhui-ppt-master/scripts/validate-research-ledgers.mjs ppt_vN/figure_manifest_vN.json ppt_vN/formula_ledger_vN.json`；结果只核对账本字段，不代替下一阶段的人眼源图检查。

### 第六阶段 — 强制视觉审查

使用 `zuhui-ppt-visual-audit`，在第七阶段评分之前进行真实的浏览器逐页审查：

- 将论文原始图、裁切资产和 1920×1080 幻灯片截图按面板清单逐个比较，检查有无“37 页图缺少 (b)，38 页误接残片”等现象。
- 每个公式页核对 `formula_ledger` 与屏幕上的解释：符号、下标、取值范围/维度、运算语义和最小示例。
- 至少逐页检查所有图页及其前后相邻页，确认不存在不自然的图形分割和重复证据。
- 记录 `PASS / FAIL / NOT RUN`。有关键 `FAIL` 时回溯修复并重做所有后续检查。

### 第七阶段 — 视觉质量评分

使用 `zuhui-ppt-visual-score`。

本阶段提供独立于结构 QA 的视觉质量信号：

- 6 个维度每页 1-5 分评分。
- 总体 deck 分数为各维度平均分的未加权均值。
- 识别弱页及最有影响力的单一修复。
- 若总分 < 4.5/5，交付前迭代弱页。
- 若总分 < 3.5/5，将 deck 标记为“needs significant rework”。

管道规则：必须先通过 QA（结构门），然后视觉分数必须达到 **4.5+** 阈值（质量信号）。两者都通过后才能交付。

本阶段交付物：

- 视觉评分报告 `{OUTPUT_DIR}/visual_score_v{VERSION}.md`，
- 每页及维度级分数，
- 与 `VISUAL_REF` 的对比（如适用）。

## 输出文件夹与文件命名

使用 `OUTPUT_DIR`（`ppt_v{VERSION}/`）作为论文工作区中的输出目录。文件名使用 `PROJECT_SLUG`：

- `{OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.pptx`
- `{OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.html`
- `{OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.pdf`
- `{OUTPUT_DIR}/speaker_notes_v{VERSION}.md`
- `{OUTPUT_DIR}/figure_manifest_v{VERSION}.json`
- `{OUTPUT_DIR}/formula_ledger_v{VERSION}.json`
- `{OUTPUT_DIR}/revision_regression_v{VERSION}.md`
- `{OUTPUT_DIR}/visual_audit_report_v{VERSION}.md`
- `{OUTPUT_DIR}/qa_report_v{VERSION}.md`
- `{OUTPUT_DIR}/assets/`

除非用户明确要求，否则保持早期版本不变。

## 最终回复检查清单

简洁报告：

- 输出 PPTX/HTML/PDF 路径，
- 与被批评版本相比改了什么，
- 使用了哪些子技能，
- QA 结果，
- 任何未执行的图面板核验、公式解释审查或渲染限制，不得以静态检查冒充已完成。
