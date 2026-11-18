---
name: zuhui-ppt-swiss-design
description: 将 Swiss International 风格视觉设计应用于高密度中文论文汇报 PPT。在 zuhui-ppt-master 工作流中，故事脊椎就绪后使用。继承并本地化 guizang-ppt-skill 的资产（template-swiss.html、themes-swiss.md、layouts-swiss.md、swiss-layout-lock.md、checklist.md、components.md、screenshot-framing.md、screenshot-backgrounds、validate-swiss-deck.mjs），从而无需在运行时依赖 guizang-ppt-skill。强制使用 IKB 蓝、暗色章节页、注册 S01-S22 布局、大论文图、高密度内容与反稀疏规则。
---

## Claude Code 整体插件路径与运行约定

当此技能作为整个 `zuhui-ppt` 插件的一部分使用时，**本技能的所有仓库相对路径均相对于插件根目录**，不是用户当前工作目录：

- 资源及模板：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/assets/`、`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/references/`；
- 关联技能：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-<stage>/SKILL.md`，Claude Code 中技能名称带有 `zuhui-ppt:` 命名空间；
- 校验器：使用 `node "${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/scripts/validate-swiss-deck.mjs" "ppt_vN/deck.html"` 和 `node "${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/scripts/validate-research-ledgers.mjs" ...`（根据实际输出路径替换示意路径）。

`PROJECT_SLUG`、`VERSION`、`OUTPUT_DIR` 和原论文素材属于**用户项目工作区**，不能把输出写进插件安装目录。继续遵守主控对 HTML、图面板、公式账本、质量门和旧版本保留的规则。独立通过 Skills 安装器使用时，依然按原先工作区与同级技能目录的方式定位资源。



# 组会 PPT Swiss 设计（Zuhui PPT Swiss Design）

## 目标

将密集的科学故事计划转化为高端的 Swiss International 风格幻灯片设计，遵循内化的视觉规则，而非发明新的视觉系统。

组会/文献汇报 deck 必须满足 **总页数 ≥ 30 页、讲稿时长 ≥ 30 分钟** 的项目级硬约束。因此 Swiss 设计阶段要确保：

- 为 30+ 页规划足够的布局多样性（通常至少 8-10 种不同 layout ID），避免视觉单调；
- 章节页/过渡页与证据页的节奏能支撑长篇汇报，避免信息疲劳；
- 每页 speaker notes 区域与设计兼容，确保讲稿字数可被记录和统计。

## 项目参数

所有输出路径与命名使用 `zuhui-ppt-master` 中定义的项目参数：

- `PROJECT_SLUG` — 论文短名，用于文件命名
- `VERSION` — 当前版本号
- `OUTPUT_DIR` — `ppt_v{VERSION}/`
- `VISUAL_REF` — 已批准旧版本 deck 的路径，或 `none`

## 本地化 Swiss 资产（设计前必读）

本子技能使用 `zuhui-ppt-master/` 下本地化的文件。在生成任何 HTML 前按以下顺序阅读：

1. `zuhui-ppt-master/assets/template-swiss.html` — 至少读到 `<style>` 块结束；这是规范的 class 与布局来源。
2. `zuhui-ppt-master/references/themes-swiss.md` — 从 4 种预设中选择（默认 IKB Blue）。
3. `zuhui-ppt-master/references/swiss-layout-lock.md` — 注册布局、SVG 文本、布局发明的硬约束。
4. `zuhui-ppt-master/references/layouts-swiss.md` — S01-S22 骨架与使用说明。
5. `zuhui-ppt-master/references/checklist.md` — P0/P1/P2/P3 质量检查清单。
6. `zuhui-ppt-master/references/components.md` — 需要时的组件细节。
7. `zuhui-ppt-master/references/screenshot-framing.md` — 处理用户截图时。

HTML 构建后，运行：

```bash
node zuhui-ppt-master/scripts/validate-swiss-deck.mjs {OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.html
```

在移交给 QA 前修复所有报告错误。

## 内化的 Swiss 视觉系统

以下规则均内化了 Swiss International 视觉系统。运行时无需外部技能依赖。

### 字体

- 主字体：Inter / Helvetica Neue / Noto Sans SC（均为无衬线）。
- Mono：JetBrains Mono。
- Swiss deck 上出现任何衬线字体均为错误。

### 单一强调色

每份 deck 只使用四种预设之一：

| 预设 | 强调色 | `--accent-on` | 适用场景 |
|--------|--------|-----------------|-------------|
| IKB Blue（默认） | `#002FA7` | `#ffffff` | 通用、AI/科技、设计、学术 |
| Lemon Yellow | `#FFD500` | `#0a0a0a` | 年轻、零售、能源 |
| Lemon Green | `#C5E803` | `#0a0a0a` | 生态、未来、新兴科技 |
| Safety Orange | `#FF6B35` | `#ffffff` | 工业、警示、汽车 |

一份 deck 中不混用多种强调色。若用户未指定，使用 IKB Blue。

### 灰阶（跨主题，切勿修改）

`--paper:#fafaf8`，`--ink:#0a0a0a`，`--grey-1:#f0f0ee`，`--grey-2:#d4d4d2`，`--grey-3:#737373`。

### 无渐变、无阴影、无 Border-Radius

所有块均为纯色直角。唯一的装饰线是 1px 细线。

### 字重阶梯

字号越大，字重越轻：

| 字号范围 | 字重 | 典型用途 |
|-----------|--------|------------|
| >= 8vw | 200 (ExtraLight) | 封面 hero、巨型 KPI、h-statement |
| 4-7.9vw | 200-300 | 章节标题、大数字 |
| 1.8-3.9vw | 300-400 | 中等标题、take-away 标题 |
| 1-1.7vw / 16-20px | 400-500 | 正文、卡片描述 |
| 13-15px | 500-600 | Meta、kicker、图表标签 |

硬规则：同一页内，较小文字的字重必须 >= 较大文字的字重。

### 中文标题字号

| 标题形态 | 字号 |
|-------------|-----------|
| 1 行，<= 8 个汉字 | `min(6.4vw,11.2vh)` |
| 2 行，每行 <= 8 字 | `min(5.8vw,10.2vh)` |
| 2 行，任一行 9-12 字 | `min(5.2vw,9.2vh)` |
| 3 行及以上 | 先重写标题；fallback `min(4.6vw,8.2vh)` |

**证据页标题字号约束**：在承载大图、密集公式或多卡片布局的内容页上，优先使用该层级范围的下限（例如 `min(4.8vw, 7.6vh)`），使标题不超过幻灯片高度的 ~12-15%。标题应可读，但绝不与证据争夺垂直空间。

### 最小可读字号

| 文本类型 | 最小字号 |
|-----------|-------------|
| 正文段落 / 主描述 | 18px |
| 卡片描述 / 列表 / 说明 | 16px |
| Meta / kicker / mono 标签 | 14px |

永远不要低于 14px。若内容放不下，压缩文字、拆分为两页或更改布局。

### 卡片填充类型（互斥）

| 类型 | Class | 角色 |
|------|-------|------|
| Ink（暗色） | `card-ink` | 反转 / manifesto |
| Accent（蓝色填充） | `card-accent` | 单一焦点高亮 |
| Grey fill | `card-fill` | 多卡片默认中性 |
| Outlined | `card-outlined` | 锚点（不是卡片） |

同一卡片组内不能混用类型。每组仅允许一张 `card-accent`。

### P0 对齐规则

1. 不要重复水平内边距：`canvas-card` 已提供 `5.6vh 5vw 4.4vh`。正文内容不要再加 `5vw`。
2. Kicker 在标题上方：始终垂直堆叠，禁止并排。
3. 双约束字号：`min(Xvw, Yvh)`，其中 Y >= X * 1.6。
4. 使用 grid `gap` 作为间距，不要堆叠 margin/padding。
5. 底部导航安全区：内容不得延伸至 ~93vh 以下。

## 注册布局（S01-S22）

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

封面/结尾还可使用 `SWISS-COVER-ASCII` / `SWISS-CLOSING-ASCII`。禁止其他自创正文布局。

## 论文 Deck 的布局映射

| 内容类型 | 推荐布局 |
|-------------|-------------------|
| 封面 | `SWISS-COVER-ASCII` 或 S01 |
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

## 布局多样性规则

- 7-8 页 deck：至少 6 种不同布局 ID。
- 25+ 页 deck：至少 8 种不同布局 ID。
- 禁止 3 张及以上连续幻灯片使用相同主体结构。

## 可见语言规则

- 默认可见 slide copy 为中文。
- 英文仅可作为缩写、代码标识符或括号内的专业术语：`中文解释（English term）`。
- 不要在标题、卡片、说明、footer 或章节标签中使用独立英文标签。
- 图截图中可包含源标签，但周围 slide text 必须立即翻译硬术语。

## 默认主题

除非用户请求其他预设，否则使用 IKB Blue。

核心节奏：

- IKB 封面，
- 暗色陈述页呈现核心问题，
- 浅色图/表证据页，
- 每个主要章节后暗色分隔页，
- 暗色或 IKB 结尾页，
- 在 S09、S18、S21、S22、S19、S08、S20 之间保持足够变化。

## 视觉黄金源规则

当 `VISUAL_REF` 指向已批准的旧版本时，将该版本视为视觉黄金源。若用户已接受某种外观，不要发明新样式。

若当前构建的样式与 `VISUAL_REF` 黄金源冲突，回退到黄金源的视觉语言，并通过内容密度而非更重装饰来增加细节。

## 图片尺寸规则

对于科学证据页：

- 图/表通常应占据幻灯片面积的 55-80%，
- 使用窄解读轨，而非 50/50 分屏，
- 流程图、对比表和附录内部使用全宽或接近全宽，
- 裁剪或拆分密集图，而不是缩小它，
- 图注紧贴图边缘，
- 使用 source footer。

## 图信息密度评估

并非每张图都值得全页布局。在分配全页布局（S22 Image Hero）或给图独占一页之前，先评估图的信息密度：

### 全页 / 全宽处理的标准

1. **图类型**：架构图、流程图、多面板对比图和复杂系统图通常承载足够信息，适合全页处理。简单柱状图、单线图或单面板示意图通常不适合。
2. **内部信息含量**：多面板图（3+ 子图）、带多数据维度、复杂注释或详细图例的图可 justify 全页。单一维度数据、简单趋势线或单视图插图不适合。
3. **在论文中的角色**：核心证据图（主要结果、关键消融、核心机制）可 justify 全页处理。支持/补充图、示意性插图或背景设置视觉应与文字或其他图合并。

### 处理低信息图

当图的信息量不足以 justify 全页时：
- 与文字和 speaker notes 合并为文本主导 synthesis 页（S13、S19）。
- 与另一相关图并置对比（S08、S21）。
- 缩为多卡片布局中的卡片（S16、S19）。
- 作为文本重页中的小嵌入式插图。

### S22 Image Hero 使用条件

S22 Image Hero 仅应在图通过信息密度评估时使用。一张既信息丰富又对论文论点至关重要的图才符合 S22 条件。

## 原始逻辑图的布局完整性门（强制）

参照 `references/research-deck-quality-protocol.md` 与 `figure_manifest_vN.json` 先确认完整图号及 `expected_panels`，再选用 S22/S21/S15/S16 已注册布局。不因版式要 21:9 就裁掉源图的 (b) 半边；也不能把缺失子图堆到下一页却仍声称本页呈现完整图。多面板图要么完整同页，要么将各**完整子面板**拆到有独立结论的页，并在标题/图注说明展示范围。

- 多张小图组合成一页时，要保证各图图例和坐标自洽，统一分辨率与视觉比例；不可把实验中同一条曲线拆开拼接。
- 同页高密度源图可以宽图优先、下方简短解释；若放不下，先删非关键说明/次要图，再增加符合已有 Sxx 骨架的页；内容图禁止 `cover`。
- 图像旁中文解读与源图/实验数值的对应关系必须在视觉计划标记。不从不同论文版本搬运未核验数据。
- 可见图中英文专业词按 `中文（English）` 解释；若中文译图覆盖原英文导致坐标/图例重复或遮挡，回到 source-audit 更换干净素材，不能靠 CSS 裁掉问题部分。

## 截图 + 表格设计规则

- 截图必须是纯图裁剪：不含正文段落、**图外图注**、表题或周围 PDF 文字；**图内图例、坐标轴和单位必须保留**。
- 可用时优先使用源 `images/` 裁剪作为边界参考。
- 除非表格与图在视觉上不可分割，否则将表格重建为原生 HTML/PPTX 表格。
- 对于翻译后的图，仅裁剪翻译后的图本身，并将任何长说明重写为可编辑的中文 slide text。
- 首选干净的原生表格，而非低分辨率表格截图，即使需要更多页。

若用户说图片太小、源图缺失一半或图形跨页接错，须在源图、资产图和最终幻灯片三层逐项修复，并出示对比证据；仅提高图片像素/容器尺寸不算修复。

## 图文协作

幻灯片上图片与文字的互动方式：

- 不要让图看起来像贴到页面上。通过清晰的共享场域配对：紧凑边框、图注边缘、解读轨或短 take-away 条。
- 当一页有一张主导图时，让图占据约 60-75% 的幻灯片面积，解释文字限制在窄轨或短带。
- 图注紧贴图边缘或放在底部说明带。避免 detached caption 远离视觉。
- 使用 1-3 个指标 callout 或短解读条帮助读图；不要用许多等权重框环绕图。
- 若源图非常密集，允许将完整且独立的子面板作为 hero，但须说明“仅展示 Fig. x(a)”并在 manifest 标注 intentional-partial；不得将源图未展示的部分称为已完整展示。
- 用文字引导图的阅读顺序和解读，不要重复每个面板标签。

### 布局不对称规则

不要默认固定 50/50 左右分屏。根据图的纵横比、密度和论点角色选择布局比例：

- 图宽、复杂或是该页主要证据时，使用全宽或接近全宽的视觉。
- 图竖向 orient 或说明/解读较短时，使用高图 + 窄文本轨。
- 图需要更多水平空间或页面受益于上方短论点、下方视觉时，使用上下堆叠。
- 一侧明显主导时，使用不对称分屏（70/30、75/25 或 65/35）。
- 将等权重 1:1 布局视为例外而非默认。仅当文字和图片真正承载可比权重时才使用。

### 图片缩放与纵横比匹配规则

布局必须根据 asset 的实际纵横比选择，而不是强行塞进默认 hero 容器：

- **高/竖图**（高 > 宽，如框架图、竖向流程图）：使用**左右不对称分屏**（图在一侧，解读轨在另一侧）。不要把竖图塞进上下 S22 hero 条，否则会被缩小或裁剪。
- **宽/横图**（宽 ≥ 高，如多面板结果网格）：使用**全宽或接近全宽的 hero**（S22、S21、S20），图在上，短解读带在下。
- **默认缩放**：内容图必须使用 `object-fit: contain` 并带 `max-height` 约束（例如 `max-height: 64vh`），确保整张图 —— 包括所有面板、坐标轴和标签 —— 都可见。`object-fit: cover` 仅允许用于装饰性背景图（如封面），永远不要用于观众必须阅读的论文图。
- **高密度图获得更多空间**：框架图、多面板架构图和密集流程图信息丰富，应占据 60-75% 的幻灯片面积。优先使用左右不对称分屏，图侧宽度可达 50%，高度可达 74-76vh，而不是把它们塞进标准 55% hero 条。
- **禁止 CSS 裁剪证据**：若图不适合所选容器，更改布局或拆分/裁剪源图，而不是让浏览器用 `cover` 裁剪。

### 密集图规则

若图在缩小后无法在阅读距离下看清，裁剪它、拆分到多页或给它独占一页。优先选择一张清晰的视觉，而非多张拥挤的视觉。永远不要为保持布局对称而将密集图缩进小槽。

## SVG 逻辑图指南

对于某些非摄影类图表，手绘内联 SVG 优于论文截图裁剪。谨慎使用 SVG —— 每份 deck 目标 1-3 张 SVG 图，不要更多。

### 何时使用 SVG

- 架构图、流程图、模块关系图、对比框架、方法流程图
- 可用矩形、箭头、线条表达的简单几何逻辑图
- 论文原图分辨率过低、过于杂乱或包含未翻译英文标签

### 何时不使用 SVG

- 数据图表（柱状图、折线图、散点图）— 使用论文截图
- 照片、显微镜图像或渲染可视化 — 使用论文截图
- 重绘工作量过大的复杂多元素图

### SVG 设计原则

- **极简几何**：仅矩形、箭头、线条。无阴影、无渐变、无圆角。
- **Swiss 调色板**：使用 deck 强调色作为高亮，灰色用于边框和背景。
- **字体**：SVG 中所有文字使用 `Noto Sans SC`，字号不低于 14px。
- **内联嵌入**：将 SVG 直接嵌入 HTML section，不作为外部文件。
- **SVG 中的文字**：所有可见文字必须为中文。标签保持简洁。

### SVG 示例结构

```html
<svg viewBox="0 0 800 400" style="width:100%; height:auto;">
  <!-- 使用 Swiss 灰色与强调色 -->
  <rect x="20" y="20" width="200" height="60" fill="#f0f0ee" stroke="#002FA7" stroke-width="2"/>
  <text x="120" y="55" text-anchor="middle" font-family="Noto Sans SC" font-size="16" fill="#0a0a0a">输入模块</text>
  <!-- 箭头、连接等 -->
</svg>
```

## 单页证据层级

对于任何结果或证据页，按以下优先级组织视觉逻辑：

1. **Hero figure 或主表裁剪** - 主要证据块，占据主导区域（60-75%）。
2. **窄解读轨** - 短注释带或 1-3 个帮助读图的指标 callout（20-30%）。
3. **最少标签** - 仅阅读证据所需的标签；正文中不重复面板标签。
4. **更深入解释** - 移入 speaker notes 或下一页。

不要让解读块变得与证据一样大或更抢眼。图才是证据；文字是引导。

## 页面饱满度规则

幻灯片应感觉完整而非空旷。大多数幻灯片应包含：

- **顶部锚点**：kicker 或章节标签，将页面锚定在叙事中，
- **主导中部块**：主要证据图、表或 claim 卡片，
- **底部锚点**：take-away 条、source 条、结论行或说明带。

通过证据支持元素增加饱满度：指标 chip、紧凑解读带、短 source 条或窄对比块。避免 tiny figure 孤零零在一个角落、短要点漂泊、说明远离视觉造成的大片无结构空白。

不要用纯装饰填充空间。任何添加的块都应澄清层级、引导阅读顺序或提高图可读性。

### 内容密度标准（严格反稀疏）

稀疏幻灯片是 P0 失败。每页都必须有意义地填充面向观众的实质性内容。将这些最低标准视为硬门槛：

- 每个非过渡页至少包含 **3-5 个具体信息点**（数据点、论点、对比结果或具体指标）。仅 1-2 个信息点的页面必须合并或扩展。
- 三卡片页（S13、S19）：每张卡片至少 **2-3 句实质性内容**。“单句卡片”和空卡片被禁止。
- 四卡片页（S19）：同样规则 —— 每张卡片必须承载真实内容，而非仅一个标题。
- 文本主导 synthesis 页（S09、S12）：必须包含至少 **4-5 条**带具体数据、对比或证据的要点；或 3 个 claim 卡片，每个 2+ 句。
- 对比页（S08、S21）：每一侧至少列出 2-3 个带具体数值的具体对比维度。
- 证据页（S22、S21、S20）：图/表占据 55-80% 的幻灯片，并由 2-3 个指标 callout 或解读轨支持，这些 callout 必须增值，而非仅重述说明。
- 不要把所有深入解释都移到 speaker notes —— 页面本身至少保留一句总结性结论行、source 条或 take-away 条。移到 speaker notes 是**例外**，不是默认。
- **禁止稀疏模式**：标题 + 一条要点的页面；标题 + 一张小图别无他物的页面；三张卡片中两张只有一句话的页面；中部块被空白主导的页面。

### 内容密度自检

在定稿一页前，自问：
- 这页是否有至少 3 个具体数字、对比或证据项，能独立站得住？
- 不看 speaker notes，观众能理解要点吗？
- 是否有卡片或区块只是标题没有正文？
- 若移除 speaker notes，该页是否仍能传达其 claim 和 proof？
- 是否有大片无结构空白，可用指标 callout、对比或 source 条填充？

若任一问题答案不满意，重新设计该页或将其与另一页合并。

## 两遍字号调整

字号应分两步应用：

### 第一步 — 全局统一字号

跨整份 deck 统一应用字重阶梯、中文标题字号层级和最小可读字号。这确保排版层级一致。

### 第二步 — 每页微调

视觉审查（第 5 阶段 QA）后，根据内容丰富度逐页调整字号：

- **密集页**（内容丰富、数据点多）：略微缩小字号以容纳更多信息，但不得低于最小可读字号（正文 18px、卡片 16px、meta 14px）。
- **稀疏页**（内容轻、元素少）：略微放大字号以自然填充空间。
- **字重阶梯仍适用**：调整后，验证较大文字字重仍轻于较小文字。
- **中文标题字号层级仍适用**：调整后的标题仍须符合中文标题字号分类。

## 理论页与公式符号说明的设计门（强制）

公式页不可只是大公式加“模型更强”式说明。以 `formula_ledger_vN.json` 为设计输入，在可见幻灯片同时保留：

1. **记号释义**：与公式同屏可读的符号表，逐一解释核心变量、上下标、向量/张量形状或取值域、训练/测试标记；
2. **计算路径**：输入 → 中间运算 → 输出，用可见的中文引导语解释所学机制；
3. **设计理由**：为何加入该项，相对于原模型解决了什么问题；适用边界/假设是什么；
4. **可选直观示例**：复杂式给小型数值代入、极限情况或张量维度追踪，注明“教学示意，非论文实验”。

当公式、符号表、计算解释在一个已注册布局中放不下时，优先拆成多页理论推导（例如定义 → 机制 → 含义），继续使用 S03/S05/S08/S09/S21 等**原有 Sxx 骨架**，不要缩小到低于 14px 或把核心符号只放在 speaker notes。避免把每页都设计成一样的“灰底大公式 + 右栏四条词典”，要按概念、推导和张量流变换视觉结构。

第 36 页 QASSMax 类公式需特别检查 `q`、`h`、`i`、`n`、长度对数项、门控的含义。分位数预测、混合进位、分段密度等也必须逐项核对源论文原始记号，不得为排版擅改公式。

## KaTeX 公式渲染

对于包含数学公式的 HTML 幻灯片，使用 KaTeX 作为标准渲染引擎。

### 为何使用 KaTeX

- 渲染速度快于 MathJax（服务端与客户端）
- 体积更轻，适合演示场景
- 默认 KaTeX_Main 字体与 Swiss 无衬线风格兼容
- 支持的 LaTeX 语法子集完善

### CDN 集成

添加到 HTML `<head>`：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", function() {
  renderMathInElement(document.body, {
    delimiters: [
      {left: "$$", right: "$$", display: true},
      {left: "\\[", right: "\\]", display: true},
      {left: "\\(", right: "\\)", display: false}
    ]
  });
});
</script>
```

### 公式语法

- **行内公式**：使用 `\(...\)` 分隔符，例如 `\(E = mc^2\)`
- **显示（块）公式**：使用 `$$...$$` 分隔符，例如 `$$\mathcal{L} = -\frac{1}{4}F_{\mu\nu}F^{\mu\nu}$$`
- **公式颜色**：使用 `\color{#002FA7}` 匹配 IKB 强调色，用于高亮关键项
- **公式尺寸**：显示公式应使用 `\Large` 或 `\LARGE` 以确保投影尺度可读。行内公式可添加 CSS：`.katex { font-size: 1.1em; }`

### 公式完整性规则

LaTeX 命令是原子的。在生成的 Python 代码中，切勿在 raw string 或 f-string 内将 LaTeX 命令拆到多行：

- 禁止：将 `\right)` 放在一行，下一行只剩 `ight)`；`\r` 会丢失，导致 KaTeX 渲染原始 LaTeX。
- 禁止：将 `\frac{...}{...}`、`\mathbb{...}`、`\mathcal{...}`、`\left[`、`\right]` 或任何其他反斜杠命令拆到行边界。
- 最佳实践：每个显示公式保持单行，或仅在安全位置断开，如空格、逗号，或围绕 `=`/`+` 运算符且不打断反斜杠命令。
- 构建后，grep 生成的 HTML 中是否有 `ight)`、`ight\|`、`ight]` 等片段；若发现，公式已损坏。

### Fallback

若 KaTeX CDN 不可用，使用 MathJax 3.x 作为 fallback：

```html
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
```

## HTML 构建（强制模板 + 横向翻页）

HTML 必须是横向 Swiss International 网页 deck，而不是垂直滚动文档或自定义样式页面。遵循以下强制规则：

### 1. 基础模板强制

- **必须**从 `zuhui-ppt-master/assets/` 中的 `template-swiss.html` 开始。
- **禁止**从头编写自定义 `<style>` 块来复制或替换模板 CSS。
- 仅允许项目特定的 CSS 做小幅覆盖（例如自定义双面板图比例），且必须放在模板 CSS 之后的一个小块 `<style>` 中。

### 2. 横向 deck 结构

模板提供 `#deck` 作为单一横向条带。严格保持：

```html
<body>
  <canvas class="bg" id="bg"></canvas>
  <div id="deck">
    <section class="slide" data-layout="S01"> ... </section>
    <section class="slide dark" data-layout="S09"> ... </section>
    <section class="slide" data-layout="S22"> ... </section>
    <!-- ... -->
  </div>
  <nav id="nav"></nav>
```

- 幻灯片是 `<div id="deck">` 内的 `<section class="slide">`。
- 每张幻灯片**必须**有 `data-layout="Sxx"`。
- 主题类：`.slide`（浅色）、`.slide.dark`（暗色）、`.slide.accent`（强调色）。
- **禁止**用普通 `<section>` 替换 `.slide` 或移除 `#deck`。
- `#deck` 容器使用 CSS transform 横向翻页；不要覆盖为垂直滚动。

### 3. 保留模板行为

- 保留 `motion.min.js` 和模板的动画属性（`data-animate`）。
- 保留键盘导航（方向键 / PageDown / PageUp）。
- 保留点导航（`#nav`）。
- 保留 WebGL/网格背景（`canvas.bg`）。

### 4. 打印 / PDF 行为

- 模板已提供打印覆盖，使每张 `.slide` 成为一页 PDF。
- 不要给 `#deck` 外的自定义 `<section>` 元素添加 `page-break-after: always`。

### V1 中观察到的反模式

- 自定义内联 CSS reset 和基于 section 的垂直布局，替代 `#deck` 横向翻页。
- 自建布局，替代模板的 `.slide`、`.frame`、`.grid-*` 和 `.swiss-img-split` 类。

## 图片处理

所有图片必须使用模板的响应式图片类，以防止裁剪、溢出或小图。

### 图片容器类

将 `.frame-img` 与纵横比 helper 一起使用：

```html
<figure class="frame-img r-16x9">
  <img src="assets/fig2a_arch.png" alt="模型架构">
</figure>
```

允许的纵横比 helper：`.r-21x9`、`.r-16x9`、`.r-16x10`、`.r-4x3`、`.r-3x2`、`.r-3x4`、`.r-1x1`。

对于不得裁剪的图片，添加 `.fit-contain`：

```html
<figure class="frame-img r-16x9 fit-contain">
  <img src="assets/fig3_overview.png" alt="生成任务概览">
</figure>
```

### 文图分屏

使用 `.swiss-img-split` 替代手写 50/50 flex 布局：

```html
<div class="swiss-img-split">
  <div class="swiss-img-copy"> ... text ... </div>
  <figure class="frame-img r-16x9 fit-contain">
    <img src="assets/fig1c_framework.png" alt="统一框架">
    <figcaption class="swiss-img-caption"><strong>图 1c</strong> UniCardio 统一框架</figcaption>
  </figure>
</div>
```

- 默认分屏为 `5fr 7fr`（文字侧窄于图片侧）。
- 使用 `.reverse` 得到 `7fr 5fr`。
- 图应占据幻灯片面积的 **55-80%**。

### 图片尺寸规则

- 证据页上的图/表占据 **55-80%** 的幻灯片面积，并配一条窄解读轨。
- S22 hero 图片使用 **21:9** 比例，主体居中，`object-position:center 35%`。
- 多图网格（S15/S16）使用统一比例；同一份网格中不混用 16:9 和 4:3。
- 图片容器：直角、无阴影、无 border-radius，白色/`var(--paper)` 背景。
- 若图在缩小后无法在阅读距离下看清，裁剪它、拆分到多页或给它独占一页。

## PPTX 构建

PPTX **由 HTML 派生**，不是独立构建。执行者必须：

1. 使用 headless 浏览器或等效渲染器将每张 HTML 幻灯片渲染为 1920x1080 PNG 截图。
2. 将一张截图作为全页背景或图片插入每张 PPTX 幻灯片。
3. 严格保留幻灯片数量和顺序。

完整 HTML First 管道请参阅 `zuhui-ppt-triformat-export`。不要在本技能中编写原生 PPTX 布局构建器。

## 设计 QA

导出前执行以下检查，并记录在 `visual_plan_v{VERSION}.md` 中：

- 列出幻灯片主题节奏：cover / dark / light / figure / table / chapter；
- 确保没有 3 张及以上单调稀疏页；
- 25 页以上 deck 检查至少 8 种不同 Swiss 布局 ID（7-8 页 deck 为 6 种）；
- 检查每个非过渡页满足内容密度标准（≥3-5 个具体信息点，无单句卡片）；
- 检查论文图没有被困在小卡片中；
- 检查所有图重页都有说明和 source 标签；
- 检查图片完整性：每张论文图必须显示所有面板、坐标轴和标签，无 CSS 裁剪；若 `object-fit: cover` 隐藏内容，切换为 `contain` 或更改布局；
- 检查公式渲染：验证所有 `$$...$$` 块渲染为数学公式，无原始 LaTeX；grep 孤立片段如 `ight)`、`ight\|`、`ight]`；
- 运行 `node zuhui-ppt-master/scripts/validate-swiss-deck.mjs {html}` 并修复所有错误。

若校验器报告未注册布局、SVG 文本、缺失 `data-layout` 或其他错误，在移交给 `zuhui-ppt-qa` 前修复。
