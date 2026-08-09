---
name: zuhui-ppt-triformat-export
description: 导出同步的 PPTX、Swiss International HTML 与 PDF 版本的中文组会论文汇报。在 zuhui-ppt-master 工作流中，于源文件审计、故事脊椎与 Swiss 视觉计划之后使用。确保三种产物保持一致、保留大论文图，并在导出阶段复核组会硬性指标（页数 ≥ 30 页、讲稿时长 ≥ 30 分钟）。记录可复现的构建脚本、笔记、资源与 QA 路径。运行时无外部技能依赖。
---

# 组会 PPT 三重导出（Zuhui PPT Tri-Format Export）

## 目标

从一个 HTML 规范源生成并保留三种最终格式：

- `.html` 用于 Swiss International 横向网页演示（规范源），
- `.pdf` 用于便携审阅、打印与归档（仅从 HTML 导出），
- `.pptx` 用于可编辑演示与本地修改（默认截图 backed）。

HTML 是规范源。PPTX 与 PDF 必须通过转换/导出 HTML 生成。它们不得独立创作。HTML/PDF 不应被视为可选副产品。

## 项目参数

所有输出路径与命名使用 `zuhui-ppt-master` 中定义的项目参数：

- `PROJECT_SLUG` — 论文短名，决定输出文件名
- `VERSION` — 下一个未使用的版本号
- `OUTPUT_DIR` — `ppt_v{VERSION}/`
- `VISUAL_REF` — 已批准旧版本 deck 的路径，或 `none`

## 构建顺序

必需顺序：

1. 构建内容模型与幻灯片规格。
2. 通过将 section 注入 `template-swiss.html` 生成 HTML（规范源）。
3. 从 HTML 导出 PDF，使 PDF 反映规范源。
4. 通过将每张 HTML 幻灯片渲染为截图，每张 PPTX 幻灯片放置一张截图，生成 PPTX。
5. 生成 `speaker_notes_v{VERSION}.md`（每页要点）与 `speaker_script_v{VERSION}.md`（完整讲稿，含每页字数与总预估时长）。
6. **导出后自检**：确认总页数 ≥ 30 页（不含附件/致谢/Q&A 占位页）；确认讲稿累计时长 ≥ 30 分钟（中文 ≥ 6600 字，英文 ≥ 3900 words）。任一指标不达标即停止并回到上游补充内容。
7. 生成 QA 报告。

PPTX 与 PDF 必须派生自 HTML。不要构建单独的 PPTX 布局引擎。应使用相同的幻灯片规格驱动所有输出，以防止漂移。

## PPTX 规则

- 使用 16:9 宽屏。
- **默认方法**：将每张 HTML 幻灯片渲染为 1920x1080 PNG 截图，并作为 slide background 或全页图片插入每张 PPTX 幻灯片。这保证 PPTX 是 HTML 规范源的忠实转换。
- PPTX 中的文字**不要求可编辑**。除非用户明确要求可编辑性**且**截图 backed PPTX 已产出并验证，否则禁止原生文本框、表格或形状。
- 严格保留幻灯片数量：PPTX 幻灯片数必须等于 HTML section 数。
- 不要在 PPTX 构建器中独立排版文字、图片、表格或形状。
- 保留 Swiss 节奏：IKB 封面、暗色陈述页、浅色证据页、暗色章节过渡（继承自 HTML）。
- 给密集图/表大面积（继承自 HTML）。
- 包含页码与安静的 source 标签（继承自 HTML）。

## HTML 规则

- 使用 `template-swiss.html` 作为基础（来自 `zuhui-ppt-master/assets/`）。
- 替换所需标题占位符。
- 仅将真实幻灯片 section 插入模板 deck 区域。
- 每个真实幻灯片都需要 `data-layout`。
- 使用与所选 Swiss 布局家族一致的 `data-animate`。
- 将大图保留在 `assets/` 中，并使用稳定的相对路径引用。
- 仅在需要时注入 print CSS，以将所有幻灯片导出为 PDF。
- 若 deck 包含数学公式，在 `<head>` 中包含 KaTeX CDN 链接（参见 `zuhui-ppt-swiss-design` 中的 KaTeX 公式渲染章节）。

## PDF 规则

- 从 HTML 导出，最好使用 Chrome/Edge headless 打印。
- 使用 `@page { size: 13.333in 7.5in; margin: 0; }`。
- 打印时覆盖横向固定 deck 行为，使每张幻灯片成为一页 PDF。
- 验证 PDF 页数等于幻灯片数。

若浏览器打印裁剪固定布局幻灯片，则从实时 HTML 将每张幻灯片渲染为 16:9 截图并组装 PDF。在 QA 报告中记录此 fallback。

## 可编辑 PPTX 例外

原生可编辑 PPTX **不是默认**。仅允许作为次要选项，当：

- 用户明确要求可编辑性高于视觉质量，
- 截图 backed PPTX 已产出并验证通过，
- HTML 仍是规范源，
- QA 报告明确说明 PPTX 是原生/可编辑而非截图 backed，
- HTML 中仍存在原生表格，且不来源于表格截图。

即使在此例外情况下，可编辑 PPTX 仍应尽可能在视觉上匹配 HTML。

## 输出包

使用 `OUTPUT_DIR` 与项目参数化的文件名：

- `{OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.pptx`
- `{OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.html`
- `{OUTPUT_DIR}/{PROJECT_SLUG}_v{VERSION}.pdf`
- `{OUTPUT_DIR}/speaker_notes_v{VERSION}.md`（每页要点）
- `{OUTPUT_DIR}/speaker_script_v{VERSION}.md`（逐字完整讲稿，含每页字数与总预估时长）
- `{OUTPUT_DIR}/qa_report_v{VERSION}.md`
- `{OUTPUT_DIR}/assets/`
- `{OUTPUT_DIR}/contact_sheet_v{VERSION}.png`（或等效渲染预览，若可用）
- `{OUTPUT_DIR}/build_v{VERSION}.sh`（可复现构建脚本或命令）

除非请求，否则不要覆盖早期版本。

## 失败处理

若 PDF 导出失败：

- 保留 PPTX 与 HTML，
- 报告浏览器/工具错误，
- 不要声称三重输出包已完成，
- 若可能，修复 print CSS 或使用其他可用渲染器后再最终交付。

若 HTML 与 PPTX 幻灯片数不同，停止并修复，然后再创建最终报告。

## 反模式（V1 教训）

以下方法被禁止，因为它们破坏 HTML First 并在 V1 中导致视觉漂移：

1. **从零开始原生 PPTX 构建器**：不要使用 `python-pptx` 独立于 HTML 摆放文本框、形状、表格和图片。这总会偏离规范源。
2. **垂直滚动 HTML**：不要构建幻灯片以 `page-break-after: always` 垂直堆叠的 HTML 作为主要导航。HTML 必须来自 `template-swiss.html` 的横向 `#deck` 演示。
3. **内联自定义 CSS reset**：不要用自定义 reset 和布局系统替换模板 CSS。仅允许小幅覆盖。
4. **PPTX → PDF**：永远不要打印或导出 PPTX 为 PDF。PDF 必须来自 HTML。

## 截图实现指南

生成截图 backed PPTX 时：

- 渲染视口：1920×1080。
- 在横向 deck 定位到显示该幻灯片后，单独捕获每张 `.slide`。
- 捕获前等待字体、图片和 KaTeX 公式渲染完成。
- 将 PNG 保存到 `{OUTPUT_DIR}/rendered_slides/` 或 `{OUTPUT_DIR}/slide_screens/`。
- 将每张 PNG 作为全页图片插入空白 16:9 PPTX 幻灯片。
- 保留渲染后的幻灯片图片在输出包中，以便 QA 可比较 HTML、PNG 和 PPTX。
