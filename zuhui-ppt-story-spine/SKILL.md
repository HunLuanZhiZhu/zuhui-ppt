---
name: zuhui-ppt-story-spine
description: 为高密度中文 journal-club 组会 PPT deck 构建科学论点脊椎与证据地图。在 zuhui-ppt-master 工作流中，于源文件审计之后使用，将论文、翻译 PDF、干净图资源、重建原生表格与审计笔记转化为逐页计划，包含 claims、proof objects、caveats 与演讲者意图。包括演示逻辑路由、结论式标题写作、幻灯片原型配方与证据层级规则。运行时无外部工具依赖。
---

## Claude Code 整体插件路径与运行约定

当此技能作为整个 `zuhui-ppt` 插件的一部分使用时，**本技能的所有仓库相对路径均相对于插件根目录**，不是用户当前工作目录：

- 资源及模板：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/assets/`、`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/references/`；
- 关联技能：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-<stage>/SKILL.md`，Claude Code 中技能名称带有 `zuhui-ppt:` 命名空间；
- 校验器：使用 `node "${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/scripts/validate-swiss-deck.mjs" "ppt_vN/deck.html"` 和 `node "${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/scripts/validate-research-ledgers.mjs" ...`（根据实际输出路径替换示意路径）。

`PROJECT_SLUG`、`VERSION`、`OUTPUT_DIR` 和原论文素材属于**用户项目工作区**，不能把输出写进插件安装目录。继续遵守主控对 HTML、图面板、公式账本、质量门和旧版本保留的规则。独立通过 Skills 安装器使用时，依然按原先工作区与同级技能目录的方式定位资源。



# 组会 PPT 故事脊椎（Zuhui PPT Story Spine）

## 目标

将论文转化为以证据为主导的中文演示计划。以论文的科学论点作为脊椎，而不是论文的章节顺序。将内容/稿件规划与视觉执行分离。

## 项目参数

所有输出路径与命名使用 `zuhui-ppt-master` 中定义的项目参数：

- `PROJECT_SLUG` — 论文短名，用于文件命名
- `VERSION` — 下一个未使用的版本号
- `OUTPUT_DIR` —: `ppt_v{VERSION}/`

## 组会 PPT 页数与讲稿时长硬约束

本 skill 规划的 slide plan 必须满足 `zuhui-ppt-master` 中定义的项目级硬约束：

- **总页数 ≥ 30 页**（不含附件、致谢、Q&A 占位页）。
- **speaker notes 累计时长 ≥ 30 分钟**：中文字符 ≥ 6600 字（220 字/分钟），或英文 ≥ 3900 words（130 words/分钟）。

规划时必须将这两项作为输入，而不是后期凑数：

- 在 slide plan 阶段即统计页数；若不足 30 页，必须补充背景、方法细节、实验解读、消融分析、相关工作对比或扩展讨论。
- 为每页内容页分配 speaker notes，并在计划阶段估算累计字数/时长；若不足，需要拆分复杂图、增加方法解释、或增加 limitation/discussion 页。
- 禁止通过重复内容、放慢语速、插入无关页来满足页数或时长。

## 论文类型路由

首先识别主要论文类型。选择最贴近的分类：

- discovery / mechanism 论文
- methods / algorithm / tool 论文
- resource / dataset / atlas / omics / benchmark 论文
- clinical / population / intervention 研究
- materials / chemistry / physics / engineering 论文
- review / perspective / commentary
- meta-analysis / systematic review

## 演示逻辑路由

识别论文类型后，选择演示逻辑。这是独立于论文类型的决策：同一论文类型可根据论证强度支持不同逻辑。

| 逻辑 | 何时使用 | 幻灯片弧线 |
|-------|------------|-----------|
| `claim-first` | 论文有一个可在 upfront 陈述的强烈核心论点 | claim -> evidence chain -> validation -> boundary |
| `question-to-evidence` | 机制与发现类论文；问题驱动叙事 | phenomenon -> unknown -> hypothesis -> design -> evidence chain -> model -> next experiments |
| `problem-to-solution` | 方法、工具、AI 与工程类论文 | bottleneck -> proposed method -> workflow -> evaluation -> performance vs baselines -> ablation/failure cases -> reuse and limitations |
| `workflow-to-validation` | 数据集、图谱、omics、基准 | need -> dataset design -> generation/QC -> main landscape -> validation/reproducibility -> example insights -> access and boundaries |
| `evidence-map` | 综述与观点 | why now -> framework -> theme 1 -> theme 2 -> theme 3 -> controversy -> synthesis -> future |

对于 AI、系统、工具、方法、基准或基础设施论文，默认使用 `problem-to-solution`：

1. bottleneck / failure mode，
2. proposed system or design assumption，
3. architecture and workflow，
4. key evidence and deployment footprint，
5. assurance / validation / audit，
6. limitations and open questions，
7. discussion。

对于其他论文类型，使用上表中的弧线。若论文有一个可在第 2-3 页陈述的单一主导论点，即使对于方法类论文也优先 `claim-first` 而非 `problem-to-solution`。

## 方法型论文的理论优先与多论文分隔（强制）

本技能必须阅读主控 `references/research-deck-quality-protocol.md`，并执行逐论文篇幅预算。算法/方法论文默认将理论、机制与推导分配约 50%–60% 的内容页，实验约 20%–35%；具体比例按论文证据而定，偏离需在计划解释。**禁止先按论文图数决定 PPT 页数**。

建议每篇采用：问题定义 → 核心目标/概率假设 → 符号与数据表示 → 架构与张量流 → 关键公式逐步推导 → 复杂度/适用边界 → 只保留必要实验 → 局限性与讨论。每个理论页必须有实质推理对象，不能只是笼统术语卡片。

**每个展示公式**在 `formula_ledger_v{VERSION}.json` 登记：
- 源论文页/章节及版本、准确的表达式；
- 可见幻灯片上要解释的符号（包括上下标、变量形状/取值域、训练/测试区别）；
- 输入—计算—输出与为何需要此项；
- 教学示例/形状追踪/边界情况（适当选择），与原论文实验数值严格分离；
- 预计放入讲稿的拓展推导（不取代可见关键释义）。

**多篇论文必须分别拥有完整闭环**：不可把第一篇视作第二篇的背景而略过其理论，也不能强行合并跨论文实验结果。加入明显的中间分隔、概念衔接页，以及标注“基准、数据、硬件与调参不一定可比”的末尾方法对读。

**论文图取舍表**：对每个候选图记录它支持的 claim、原始逻辑图号、面板清单、`keep/combine/omit/backup` 结论与取舍理由。内容不重要的图合并或舍弃；不能机械地逐图开页。若一个结论要求同时读 Fig.3(a) 与 Fig.3(b)，应以整图或两个完整独立面板说明，不得在两页间遗留半幅内容。

## Claim + Proof Object 规则

每个非过渡页必须包含：

- claim：结论式中文标题或核心洞见，
- proof object：干净图裁剪、原生重建表格、流程图、指标或直接来自论文支持的总结，
- interpretation：观众应相信什么，
- caveat：证据不能证明什么。

若不存在 proof object，该页必须是必要的过渡、讨论或限制页。否则合并或删除。

## 标题写作规则

所有内容页使用**结论式标题**。好标题陈述幻灯片的观点，而非仅列主题。

优先：
- `AdaNCFGD 通过非因果机制消除训练延迟偏移`
- `脉冲发放率在低时间步长下优于 SGD 30%`
- `消融实验证实学习率校准是收敛的关键因素`

避免：
- `Method`
- `Results`
- `Figure 3`
- `Comparison`
- `Ablation Study`

标题应是幻灯片对“观众看完这页后应该相信什么？”的一句话回答。

## 幻灯片原型配方

规划每页时，首先为其指定原型。原型决定内容到布局的映射，而非直接使用 Sxx 编号。

### Hero Figure Result

- **内容**：一张承载主要证据的主导图或表裁剪
- **布局比例**：60-75% 视觉面积，20-30% 解读轨，底部短 take-away 条
- **Sxx 映射**：S22 Image Hero（若图宽且信息密集）或 S09（若图需要陈述上下文）。S22 适用性请参阅 `zuhui-ppt-swiss-design` 中的“图信息密度评估”。
- **规则**：让图主导页面；注释轨保持窄而短；将次要解释移入 speaker notes 或后续页
- **警告**：不要将 Hero Figure Result 原型分配给低信息图（简单柱状图、单线图、单面板示意图）。低信息图请使用 Text-Led Synthesis 或 Comparison/Table。

### Workflow / Method

- **内容**：流程图、架构图或系统流
- **布局比例**：全宽或接近全宽的流程视觉 + 紧凑注释条
- **Sxx 映射**：S22（若宽）、S17（系统图）、S11（水平时间线，用于分步）
- **规则**：使用最宽的可用布局；每步说明文字控制在 1-2 行
- **SVG 考虑**：若论文原始 workflow/architecture 图分辨率过低、过于杂乱或包含未翻译英文标签，可考虑重绘为内联 SVG（参见 `zuhui-ppt-swiss-design` 中的 SVG Logic Diagram Guide）。在视觉计划中标记为 `[SVG: 描述]`。

### Comparison / Table

- **内容**：基准结果、基线对比、多方法表格
- **布局比例**：一个图表或表格块 + 细指标或结论轨
- **Sxx 映射**：S21 Tech Spec Sheet、S08 Duo Compare 或 S07 H-Bar Chart
- **规则**：若表格拥挤则拆分为两页；永远不要将密集表格缩进小槽

### Text-Led Synthesis

- **内容**：概念框架、模型、讨论或限制总结
- **布局比例**：2-4 条强要点或 3 个紧凑 claim 卡片 + 底部总结句
- **Sxx 映射**：S13 Three Forces、S19 Four Cards 或 S09 Dot Matrix Statement
- **规则**：避免用装饰填充空间；每个块都应澄清层级或引导阅读顺序

### Cover

- **内容**：论文标题、论文作者、期刊、一个主导视觉或字体创意
- **布局比例**：一个主导块 + 小元数据条
- **Sxx 映射**：S01 Index Cover 或 `SWISS-COVER-ASCII`
- **规则**：不要像 dashboard 一样排布等权重的小元素；封面需要呼吸感
- **演讲者与论文作者区分**：故事脊椎和封面信息必须显式区分演讲者与论文作者，不要把论文作者直接当作演讲者。封面主视觉块应突出论文标题与论文作者/单位；演讲者信息以较小字号或 footer/kicker 形式出现。

### Chapter Transition / Statement

- **内容**：章节分隔或核心问题陈述
- **布局比例**：全宽陈述文字，装饰最少
- **Sxx 映射**：S09 Dot Matrix Statement 或 S03 Split Statement
- **规则**：暗色主题页，在浅色证据页之间创造视觉呼吸

## 单页证据层级

对于任何结果或证据页，按以下优先级组织视觉逻辑：

1. **Hero figure 或主表裁剪** — 主要证据块，占据主导区域
2. **窄解读轨** — 短注释带或 1-3 个帮助读图的指标 callout
3. **最少标签** — 仅阅读证据所需的标签；正文中不重复面板标签
4. **更深入解释** — 移入 speaker notes 或下一页

不要让解读块变得与证据一样大或更抢眼。图才是证据；文字是引导。

## 证据对象策略

- 仅当完整图/表无法忠实重建时才允许截图。
- 不要围绕正文段落、图例、表题或长文本块的截图来规划幻灯片。
- 只要数值清晰可辨，表格必须从已核验文本重建为原生表格。
- 当论文工作区有 `images/` 文件夹含已提取图裁剪时，将这些裁剪视为默认视觉边界参考。
- 若翻译 PDF 包含翻译后的图标签，仅裁剪图区域；排除周围正文和说明。
- 若说明有用，将其重写为截图外的短中文解读行。

## 密集内容提取

不要停在摘要和主图。检查：

- 表格，
- 附录图，
- 流程内部，
- 部署足迹，
- 对比表，
- 失败模式，
- 限制段落，
- 实现细节，
- 产物名称与 workflow 输出。

使用密集笔记捕捉实质，但与论文或翻译文本核对数字和论点。不要从任何外部参考借用示意性或幻觉指标。

## 幻灯片计划字段

为每页指定：

- 幻灯片编号，
- 标题（结论式），
- 章节，
- 幻灯片目的，
- 原型（来自上述配方），
- 核心 claim，
- 2-4 条 on-slide 要点，
- proof object 文件名、原生表格或重绘图，
- 图/表说明与原始完整逻辑图号、当前使用的面板范围，
- 公式的符号释义/维度/计算示例规划（若含公式），
- 页类型归类（理论/实验/背景/讨论/过渡）及逐篇理论实验预算，
- caveat，
- speaker note，
- 推荐 Swiss 布局（来自 S01-S22，由原型推断）。

## 幻灯片 vs Speaker Notes

- 幻灯片面向观众：论文 claim、证据对象、interpretation、caveat。
- Speaker notes 面向演讲者：为何这篇论文值得讨论、如何阅读 deck、术语提示、过渡提示。
- 若某页计划为“why this deck matters”、“how to read this version”或解释制作决策，请将其移入 notes。
- 可见幻灯片标题应是论文特定的 claim，而非内部工作流标签。

## 页数指导

对于组会/文献汇报，项目级硬约束是内容页 ≥30 页、讲稿 ≥30 分钟；具体页数由论证深度决定，不能靠每张实验图独占一页凑数。对密集证据应按**完整面板**拆分或整图展示，绝不能拆断面板。

仅在明确不是组会/文献汇报的快速演示中，才可以按用户指定时长采用较短页数；不得以“默认 10–14 页”覆盖组会硬门。

## 禁止的故事操作

- 仅 glossary 的幻灯片，
- "how this version solves English figures" 幻灯片，
- 面向自己的阅读计划页，如 "why this paper is worth presenting" 或 "how to read this deck"，
- 无论文特定论点的通用 "background" 幻灯片，
- 每张卡片只有一句模糊话的三卡片页，
- 标题只说 "Method" 或 "Results" 而无结论，
- 论文未支持的空洞 claim，
- 当一侧明显主导时仍采用对称 1:1 图文分屏，
- 为保持布局对称而将密集图缩进小槽。

## 幻灯片计划输出格式

在 `{OUTPUT_DIR}/slide_plan_v{VERSION}.md` 中生成幻灯片计划与 speaker-note 大纲。每页以 `---` 分隔。它应可直接供 `zuhui-ppt-swiss-design` 分配注册 Swiss 布局，并供 `zuhui-ppt-triformat-export` 构建输出。

### 格式

```markdown
<!-- page_type: cover|chapter|content|ending -->
<!-- page_number: N -->

## [结论式中文标题]

**Narrative role**: Hook|Tension|Core Insight|Mechanism|Evidence|Implications|Coda
**Detail density**: light|normal|rich
**Archetype**: Hero Figure Result|Workflow/Method|Comparison/Table|Text-Led Synthesis|Cover|Chapter Transition
**Section**: [章节名]

**Core claim**: [一句话核心论点]

**Slide points**:
- [要点 1，含具体数据]
- [要点 2]
- [要点 3]

**Visual plan**:
- [CHART: 柱状图对比各方法表现]
- [DIAGRAM: 方法流程图]
- [SVG: 架构关系图]
- [TABLE: 结果对比表]
- [[FIG:fig_007_p9_page]] — 简短说明该图证明什么

**Proof object**: `assets/fig_xxx.png` — [简短说明]
**Caption**: [图注/说明]
**Caveat**: [证据不能证明什么]
**Recommended layout**: S22|S17|S21|S09|S01|S03

**Speaker note**: [演讲要点，包括过渡语、时间提示、强调重点]
```

### 规则
- `<!-- page_type: ... -->` HTML 注释标记每页类型。
- 每个非过渡页必须有 claim、proof object、interpretation 和 caveat。
- `[CHART: ...]`、`[DIAGRAM: ...]`、`[SVG: ...]`、`[TABLE: ...]` 标记供下游 Strategist/Executor 使用，不要字面渲染。
- `[[FIG:fig_id]]` token 必须引用源审计中的真实图 ID。每行一个，附简短描述。
- Speaker notes 应包含过渡语、时间提示和强调重点；关键公式变量定义必须也出现在可见页面中。
- slide plan 中必须记录每页图的 keep/combine/omit 取舍与前后页逻辑连续性检查。
- Detail density：`light` = 1-2 点，`normal` = 2-4 点，`rich` = 4-6 点。
- 幻灯片计划完成后，进入第三阶段（Swiss Visual Design）前必须审查。
