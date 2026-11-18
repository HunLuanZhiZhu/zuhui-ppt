# Zuhui PPT

> 从一篇学术论文，到一份高端、高密度、视觉精美的中文组会汇报演示——全流程 agent skills 工具链。

`zuhui-ppt` 是一套面向 AI coding agent 的 skills 集合，用于将学术论文（PDF / 翻译 PDF）转化为 **Swiss International 风格**的中文组会 / journal club 汇报 PPT。它以 **HTML 为规范源**，同步导出 `.html` / `.pdf` / `.pptx` 三重交付物，并附带逐页演讲稿、QA 报告与视觉质量评分。

整个工具链由 **1 个主控技能 + 7 个子技能**组成，按严格顺序的 7 阶段管道运行，每个阶段都有 review gate，未通过不得进入下一阶段。

---

## ✨ 核心特性

- **证据优先的内容方法论** — 每页非过渡页必须包含 claim（论点）+ proof object（证据）+ interpretation（解读）+ caveat（边界），杜绝稀疏 deck。
- **Swiss International 视觉系统** — IKB 蓝默认主题、22 种注册布局（S01–S22）、无衬线字重阶梯、无渐变 / 阴影 / 圆角的纯粹排版。
- **HTML 优先原则** — HTML 是规范源，PPTX 与 PDF 均由 HTML 转换 / 导出而来，杜绝格式间视觉漂移。
- **组会硬性指标** — 总页数 ≥ 30 页、讲稿口述时长 ≥ 30 分钟，作为早期决策输入而非事后检查。
- **双重质量门** — 结构 QA（`zuhui-ppt-qa`）+ 视觉评分（`zuhui-ppt-visual-score`，6 维度，交付阈值 4.5/5）。
- **演讲者 / 论文作者分离** — 封面严格区分汇报人信息与论文作者信息，避免喧宾夺主。
- **零外部技能依赖** — 所有 Swiss 资产（模板、主题、布局、校验器）已本地化，运行时无需其他 skill。

---

## 📦 包含的 Skills

| # | Skill 名称 | 阶段 | 职责 |
|---|-----------|------|------|
| 0 | `zuhui-ppt-master` | 主控 | 协调全流程 7 阶段管道，内化视觉规则与内容方法论，贯彻精益操作原则 |
| 1 | `zuhui-ppt-source-audit` | 源文件审计 | 提取论文元数据、图 / 表 / 附录清单、翻译 PDF 图裁剪、旧版本失败点 |
| 2 | `zuhui-ppt-story-spine` | 故事脊椎 | 论文类型路由、演示逻辑选择、claim spine 构建、逐页计划（含结论式标题） |
| 3 | `zuhui-ppt-swiss-design` | 视觉设计 | S01–S22 注册布局分配、主题选择、图文协作规划、KaTeX 公式渲染策略 |
| 4 | `zuhui-ppt-triformat-export` | 三重导出 | 从 HTML 规范源生成 `.html` / `.pdf` / `.pptx` + 演讲稿 + 构建脚本 |
| 5 | `zuhui-ppt-qa` | 结构校验 | 幻灯片数量一致性、布局合规、禁用短语、密度、公式完整性、组会硬性指标 |
| 6 | `zuhui-ppt-visual-audit` | 视觉审查 | 图片完整度、公式渲染、文字大小、布局合理性——以 1920×1080 真实渲染为准 |
| 7 | `zuhui-ppt-visual-score` | 视觉评分 | 6 维度逐页评分（证据可读性 / 图文协作 / 排版纪律 / 视觉节奏 / 内容密度 / 观众清晰度） |

### 🔀 英文别名（English Aliases）

每个 `zuhui-ppt-*` skill 都有一个对应的 `group-meeting-ppt-*` 英文薄壳。薄壳不复制内容，只做转发：如果对应的 zuhui skill 已安装则直接使用，否则说明如何下载。

| 中文原版（规范源） | 英文别名（薄壳） |
|-------------------|-----------------|
| `zuhui-ppt-master` | `group-meeting-ppt-master` |
| `zuhui-ppt-source-audit` | `group-meeting-ppt-source-audit` |
| `zuhui-ppt-story-spine` | `group-meeting-ppt-story-spine` |
| `zuhui-ppt-swiss-design` | `group-meeting-ppt-swiss-design` |
| `zuhui-ppt-triformat-export` | `group-meeting-ppt-triformat-export` |
| `zuhui-ppt-qa` | `group-meeting-ppt-qa` |
| `zuhui-ppt-visual-audit` | `group-meeting-ppt-visual-audit` |
| `zuhui-ppt-visual-score` | `group-meeting-ppt-visual-score` |

> **维护方式**：所有实际内容只在 `zuhui-ppt-*` 中维护。英文薄壳无需同步修改，仅当仓库 URL 或安装命令变更时才需更新。用户通过 `npx skills find "group meeting ppt"` 可用英文名搜索到本工具链。

---

## 🔧 工作流程

```
论文 PDF
   │
   ▼
┌─────────────────────────────────────────────────────┐
│  1. source-audit    源文件审计 → audit_note.md       │
│     ▼ review gate: 源清单完整、候选图表已识别         │
│  2. story-spine     故事脊椎 → slide_plan.md         │
│     ▼ review gate: 每页有 claim+proof+caveat         │
│  3. swiss-design    视觉设计 → visual_plan.md        │
│     ▼ review gate: 布局已注册、主题已选               │
│  4. triformat-export 三重导出 → .html/.pdf/.pptx     │
│     ▼ review gate: 三格式数量一致、HTML 用模板        │
│  5. qa              结构校验 → qa_report.md          │
│     ▼ review gate: 结构门通过                         │
│  6. visual-audit    视觉审查 → visual_audit_report   │
│     ▼ review gate: 页数≥30 / 时长≥30min / 图公式OK   │
│  7. visual-score    视觉评分 → visual_score.md       │
│     ▼ review gate: 总分 ≥ 4.5/5                      │
└─────────────────────────────────────────────────────┘
   │
   ▼
交付：HTML + PDF + PPTX + 演讲稿 + QA 报告 + 视觉评分
```

任何阶段的 review gate 未通过，回溯到能修复根本原因的最早期阶段，然后按顺序重新运行下游。

---

## 研究型组会的内容与证据质量门（更新）

从双论文 TabPFN / TabICLv2 的实际迭代中增加以下**可执行**检查。完整规则见 [研究演示质量协议](./zuhui-ppt-master/references/research-deck-quality-protocol.md)。

- **理论优先**：方法型组会每篇分别规划机制、目标函数、符号解释、张量流和复杂度；实验图仅选有必要的证据，弱图可以同页组合或舍弃。
- **整图审计**：译文 PDF 和原版 PDF 分别建立版本与页码映射。原始完整 Fig.(a+b) 不得因为裁切失误被变成“前页一部分、后页另一部分”。图内图例保留，图外论文图注按用户要求删除。
- **公式可解释**：展示公式时直接在页内解释符号、索引、形状/取值范围、输入输出与设计原因，并给出必要的教学示例；不能只写在讲稿中。
- **多论文**：独立内容分段、清晰的过渡与跨论文方法对读；不混淆不同版本和基准条件。
- **QA 不能虚报**：静态布局检查、浏览器画面检查、图源逐面板对照和公式语义检查独立记录。源图或符号释义失败会否决交付，即使视觉得分很高也不能放行。

新增推荐产物：`figure_manifest_vN.json`（源图/面板清单）、`formula_ledger_vN.json`（逐页公式释义）、`revision_regression_vN.md`（反馈回归记录）。已有的七阶段顺序、30 页/30 分钟组会门槛、22 种 Swiss 布局和 HTML 规范源规则维持不变。

## 🚀 安装

### 安装全部 skills（推荐）

```bash
npx skills add hunluanzhizhu/zuhui-ppt -g -y
```

`-g` 全局安装（用户级），`-y` 跳过确认。

### 安装单个 skill

```bash
# 只安装主控技能
npx skills add hunluanzhizhu/zuhui-ppt@zuhui-ppt-master -g -y

# 只安装视觉评分技能
npx skills add hunluanzhizhu/zuhui-ppt@zuhui-ppt-visual-score -g -y
```

### 列出仓库中所有可用 skills

```bash
npx skills add hunluanzhizhu/zuhui-ppt -l
```

### 项目级安装（仅当前项目可用）

去掉 `-g` 即安装到项目的 `.agents/skills/` 目录：

```bash
npx skills add hunluanzhizhu/zuhui-ppt -y
```

### 通过英文名安装

也可以用英文别名安装（薄壳会指引你使用对应的 zuhui skill）：

```bash
# 安装英文别名主控
npx skills add hunluanzhizhu/zuhui-ppt@group-meeting-ppt-master -g -y

# 用英文名搜索
npx skills find "group meeting ppt"
```

---

## 📖 使用方式

安装后，在你的论文工作区中直接对 agent 说：

> 帮我把这篇论文做成组会 PPT，论文在 `paper.pdf`，翻译版在 `paper_zh.pdf`。

`zuhui-ppt-master` 会自动被触发，依次协调 7 个子技能完成全流程。

### 关键项目参数

主控技能会在第一阶段提取或询问以下参数：

| 参数 | 说明 | 示例 |
|------|------|------|
| `PROJECT_SLUG` | 论文短名，决定输出文件名 | `swin-transformer` |
| `VERSION` | 版本号，自动检测已有 `ppt_v*/` | `1`, `2`, `3` |
| `OUTPUT_DIR` | 输出目录 | `ppt_v1/` |
| `VISUAL_REF` | 已批准旧版本路径（首次为 `none`） | `ppt_v0/index.html` |

### 输出文件

```
ppt_v1/
├── {slug}_v1.html              # 规范源（Swiss International 横向 deck）
├── {slug}_v1.pdf               # 从 HTML 导出
├── {slug}_v1.pptx              # 截图 backed（默认）
├── speaker_notes_v1.md         # 每页要点
├── speaker_script_v1.md        # 逐字完整讲稿（含字数与时长）
├── audit_note_v1.md            # 源文件审计笔记
├── slide_plan_v1.md            # 故事脊椎与逐页计划
├── visual_plan_v1.md           # Swiss 视觉计划
├── qa_report_v1.md             # 结构 QA 报告
├── visual_audit_report_v1.md   # 视觉审查报告
├── visual_score_v1.md          # 6 维度视觉评分
├── build_v1.sh                 # 可复现构建脚本
└── assets/                     # 图 / 表裁剪资源
```

---

## 🎨 视觉系统速览

### 4 种强调色预设

| 预设 | 色值 | 适用场景 |
|------|------|---------|
| **IKB Blue**（默认） | `#002FA7` | 通用、AI / 科技、学术 |
| Lemon Yellow | `#FFD500` | 年轻、零售、能源 |
| Lemon Green | `#C5E803` | 生态、未来、新兴科技 |
| Safety Orange | `#FF6B35` | 工业、警示、汽车 |

### 22 种注册布局

每张正文幻灯片必须使用 `data-layout="Sxx"` 标注的注册布局之一，禁止自创：

> S01 Index Cover · S02 Vertical Timeline · S03 Split Statement · S04 Six Cells · S05 Three Layers · S06 KPI Tower · S07 H-Bar Chart · S08 Duo Compare · S09 Dot Matrix Statement · S10 Split Closing · S11 Horizontal Timeline · S12 Manifesto · S13 Three Forces · S14 Loop Form · S15 Matrix + Hero Stat · S16 Multi-card Brief · S17 System Diagram · S18 Why Now · S19 Four Cards · S20 Stacked KPI Ledger · S21 Tech Spec Sheet · S22 Image Hero

封面与结尾还可使用 `SWISS-COVER-ASCII` / `SWISS-CLOSING-ASCII` 扩展。

---

## 🛠️ 技术栈

- **HTML 渲染**：`template-swiss.html`（横向翻页、WebGL 网格背景、Motion One 动画、键盘导航）
- **PDF 导出**：Chrome / Edge headless 打印（`@page { size: 13.333in 7.5in; margin: 0; }`）
- **PPTX 生成**：HTML 幻灯片 → 1920×1080 PNG 截图 → 全页背景插入（截图 backed，默认）
- **公式渲染**：KaTeX（CDN），MathJax 3.x 作为 fallback
- **论文处理**：PyMuPDF（元数据 / 文本提取 / 页面渲染）、Pillow（图裁剪）、python-pptx（PPTX 创作）
- **静态校验**：`validate-swiss-deck.mjs`（Node.js，检查 data-layout 注册、SVG 文本禁令、布局硬约束）

跨平台支持 macOS / Linux / Windows，使用 `pathlib` 路径，不硬编码 OS 字体或平台特定位置。

---

## 📁 仓库结构

```
zuhui-ppt/
├── zuhui-ppt-master/              # 主控技能
│   ├── SKILL.md
│   ├── assets/
│   │   ├── template-swiss.html    # Swiss deck HTML 模板
│   │   ├── motion.min.js          # Motion One 本地 fallback
│   │   └── screenshot-backgrounds/# 截图装帧背景（style-a / style-b）
│   ├── references/
│   │   ├── themes-swiss.md        # 4 种强调色预设
│   │   ├── layouts-swiss.md       # S01-S22 布局骨架
│   │   ├── swiss-layout-lock.md   # 布局硬约束
│   │   ├── components.md          # 组件细节（字体 / 网格 / motion）
│   │   ├── checklist.md           # P0-P3 质量检查清单
│   │   └── screenshot-framing.md  # 截图适配规则
│   └── scripts/
│       └── validate-swiss-deck.mjs# 静态校验器
├── zuhui-ppt-source-audit/
│   └── SKILL.md
├── zuhui-ppt-story-spine/
│   └── SKILL.md
├── zuhui-ppt-swiss-design/
│   └── SKILL.md
├── zuhui-ppt-triformat-export/
│   └── SKILL.md
├── zuhui-ppt-qa/
│   └── SKILL.md
├── zuhui-ppt-visual-audit/
│   └── SKILL.md
├── zuhui-ppt-visual-score/
│   └── SKILL.md
├── group-meeting-ppt-master/      # 英文薄壳 → 指向 zuhui-ppt-master
│   └── SKILL.md
├── group-meeting-ppt-source-audit/
│   └── SKILL.md
├── group-meeting-ppt-story-spine/
│   └── SKILL.md
├── group-meeting-ppt-swiss-design/
│   └── SKILL.md
├── group-meeting-ppt-triformat-export/
│   └── SKILL.md
├── group-meeting-ppt-qa/
│   └── SKILL.md
├── group-meeting-ppt-visual-audit/
│   └── SKILL.md
├── group-meeting-ppt-visual-score/
│   └── SKILL.md
├── LICENSE                        # GPL-3.0
└── README.md
```

---

## ⚙️ 设计理念

### HTML 优先（严格）

HTML 是核心 / 规范交付物。PPTX 与 PDF 均由 HTML 转换 / 导出而来。格式一致性冲突时，以 HTML 为准。

**禁止事项：**
- 编写独立的 PPTX 构建器从零摆放文本 / 形状 / 表格
- 将 PPTX 打印为 PDF（PDF 必须从 HTML 导出）
- 以"PPTX 可编辑"为由允许视觉漂移

### 证据优先提取

不止于摘要和主图。扫描表格、附录图、流程内部、对比表、失败模式、限制段落和实现细节。所有数字必须与论文核对，不从外部参考借用示意性或幻觉指标。

### Strategist-Executor-Critic 迭代

- **Strategist**（第 2 阶段）：阅读论文，构建 claim spine，规划幻灯片结构与证据地图
- **Executor**（第 3–4 阶段）：按计划构建 deck
- **Critic**（第 5–7 阶段）：检查密度、可读性、禁用内容、布局多样性、对齐问题，至少迭代一次

### 精益操作

默认采用仍能产出可用输出包的最低开销工作流：只读理解论点所需的源材料，只提取会出现在 deck 中的图 / 表，不进行不必要的 OCR / 全页高分辨率渲染 / GUI 桌面自动化。

---

## 📄 许可证

本项目基于 [GPL-3.0](./LICENSE) 许可证开源。

---

## 🤝 贡献

欢迎通过 Issue 和 Pull Request 贡献。请确保：
1. 新增 / 修改布局时更新 `layouts-swiss.md` 和 `validate-swiss-deck.mjs`
2. 修改视觉规则时同步更新 `zuhui-ppt-master/SKILL.md` 中的内化规则
3. 保持子技能链的顺序管道纪律不被破坏
