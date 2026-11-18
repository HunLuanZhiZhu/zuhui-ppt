---
name: "zuhui-ppt-visual-audit"
description: "组会 PPT 视觉审查强制流程。在每次构建或导出 HTML/PPTX/PDF 前调用，检查图片完整度、公式渲染、文字大小、布局合理性，以及页数与讲稿时长是否达标。"
---

# 组会 PPT 视觉审查（强制流程）

## 触发条件

在以下任何节点 **必须** 调用本流程，禁止直接交付未审查的产物：

1. 首次生成 HTML/PPTX/PDF 后；
2. 修改模板 CSS、任何 slide 代码、图片素材或公式后；
3. 用户反馈“图显不全/公式没渲染/字太小/布局怪”时；
4. 每次版本迭代（v1→v2→…）重新导出前。

## 组会 PPT 硬性指标（强制）

若该 deck 用于**组会/文献汇报/journal club**，必须同时满足以下两项，否则视为未通过：

### 页数要求

- **总页数 ≥ 30 页**（不含附件、致谢、Q&A 占位页）。
- 扫描 `slides/` 目录下所有 `slide_*.py` 文件计数：

```python
from pathlib import Path
slide_count = len(list(Path("slides").glob("slide_*.py")))
print(f"页数：{slide_count}")
assert slide_count >= 30, f"组会 PPT 需要 ≥30 页，当前仅 {slide_count} 页"
```

### 讲稿时长要求

- **讲稿对应口述时长 ≥ 30 分钟**。
- 语速按中文组会汇报的保守学术语速计算：**220 个汉字/分钟**（不含标点、空格、公式源码）。
- 计算公式：

```
时长（分钟）= 中文字符数 / 220
```

- 若已有讲稿文件（如 `speaker_notes.md`、每页 `slide_XX_notes.md`、或 HTML 中的 `.speaker-notes` 元素），直接统计其中的中文字符数。
- 若尚无讲稿，必须根据每页 slide 内容生成 speaker notes，并统计字数。

```python
import re
from pathlib import Path

def count_chinese_chars(text: str) -> int:
    """统计中文字符数（不含标点、空格、数字、英文）。"""
    return len(re.findall(r'[\u4e00-\u9fff]', text))

notes_path = Path("speaker_notes.md")
if notes_path.exists():
    text = notes_path.read_text(encoding="utf-8")
    chars = count_chinese_chars(text)
    minutes = chars / 220
    print(f"中文字符：{chars}，预估时长：{minutes:.1f} 分钟")
    assert minutes >= 30, f"讲稿时长不足 30 分钟，当前约 {minutes:.1f} 分钟"
```

- **英文讲稿换算**：若讲稿为英文，按 **130 words/minute** 计算，需 ≥ 3900 words。
- **补救措施**：若页数或时长不足，必须补充背景、方法细节、实验解读、消融分析、相关工作对比或扩展讨论，禁止通过放慢语速、重复内容或插入无关页来凑数。

## 审查原则

- **以渲染结果为准**：不能只看源代码或臆断 CSS，必须以 1920×1080 真实截图 + DOM 测量为判据。
- **对照原始素材**：把原 PDF 完整逻辑图、裁剪图片与幻灯片截图三者并排核对，逐项检查面板、图例和公式语义。
- **量化 + 人工语义记录**：所有结论必须有像素级数据、源图面板清单和人工截图证据，不能写“看起来还行”；面板漏掉属于语义错误，不能仅用像素测量代替。
- **逐页不漏**：至少抽查所有含图片、公式、表格、复杂布局的页面；全 deck 超过 20 页时，必须全覆盖关键页（封面、章节、方法、实验、消融、结论）。

## 新增 P0：从原论文面板到相邻页的语义审查

参照 `references/research-deck-quality-protocol.md`。**只看最终 PNG、页面 DOM/像素边界是不够的**：一个错误裁出来的半张原图可以在浏览器中“完整地显示”，所以必须加入 PDF 原图的独立对照。

1. **原文→裁剪→展示三联图**：对每张用于演示的图，打开所记录的原版/译文 PDF 指定页，核对完整逻辑图号及 `expected_panels`；打开导出资产；打开浏览器 1920×1080 截图。人工标记每个面板、图内图例、轴、单位、箭头是否齐全。检查与 `figure_manifest` 一致并记录页码。
2. **相邻页逻辑 QA**：对每张图页检查上一页/下一页。特别检查单图跨页被拆得不自然、上一页声称“完整图”但下一页才出现遗漏图块、重复图例、标题结论超出所显示的面板范围。这类失败必须回到源图或故事计划修复，不能只修改 `object-fit`。
3. **公式语义 QA**：逐页对照 `formula_ledger` 与当前可见截图，检查关键符号首次出现时是否定义了含义、上下标、域/维度；有没有把影响模型机制的门控函数缩成不等价的简式；输入→运算→输出及边界情形是否能顺着页面读下来。
4. **译文与版本一致性**：中文叠字有无遮挡图轴/数据；译图、原文和实验数值来源的 arXiv 或期刊版本是否一致。若不一致，检查是否有披露而不是暗中混用。
5. **回归清单**：已知失败页必须生成修复后 1920×1080 截图、必要时并排源图/资产图。仅写“修好了”不算完成。

输出 `visual_audit_report_vN.md` 增补：逐图源图对照表、逐公式解释状态表、每个图页的相邻页观察，以及每项 `PASS/FAIL/NOT RUN`。所有关键证据必须为 PASS 才能进入下一阶段。

## 强制检查清单

### 1. 图片完整度审查

#### 1.1 扫描所有含图片的幻灯片

使用脚本或正则扫描 `slides/` 下所有 `slide_*.py`，列出 `(页码, 图片路径, 原始宽高)`。

```python
import re
from pathlib import Path
from PIL import Image

slides_dir = Path("slides")
assets_dir = Path("assets")
rows = []
for p in sorted(slides_dir.glob("slide_*.py")):
    text = p.read_text(encoding="utf-8")
    imgs = re.findall(r'<img[^>]+src="([^"]+)"', text, re.DOTALL)
    imgs += re.findall(r"img_hero\(\s*r?'''([^']+)'''", text)
    imgs += re.findall(r'img_hero\("([^"]+)"', text)
    if not imgs:
        continue
    num = int(re.search(r"slide_(\d+)", p.name).group(1))
    for src in imgs:
        asset = assets_dir / src.replace("assets/", "")
        size = "?"
        if asset.exists():
            with Image.open(asset) as im:
                size = f"{im.width}x{im.height}"
        rows.append((num, src, size))
print("页码 | 图片 | 原始尺寸")
for num, src, size in rows:
    print(f"{num:2d} | {src} | {size}")
```

#### 1.2 精确测量渲染尺寸

必须使用浏览器（Playwright/Chromium）在 1920×1080 下渲染，读取每张图片的：

- `naturalWidth` / `naturalHeight`（原始像素）
- `getBoundingClientRect()`（实际渲染位置与尺寸）
- 父容器 `getBoundingClientRect()` 与 `getComputedStyle().overflow`

判断公式：

```
如果 img.bottom > parent.bottom + 1px 且 parent.overflow 包含 hidden
    -> 图片底部被裁切（FAIL）
如果 img 的渲染宽高比例与原始比例差异 > 2%
    -> 图片被拉伸/压扁（FAIL）
如果图片被 object-fit: cover 用于内容图（非封面背景）
    -> 可能裁切面板/坐标轴/标签（FAIL，除非用户明确允许）
```

#### 1.3 视觉对照原始图

对每一张内容图（非封面背景），将幻灯片截图与原始 asset 并排放置，检查：

- 顶部、底部、左侧、右侧是否有黑边或被裁；
- 子图面板（a/b/c/d…）是否全部可见；
- 坐标轴标签、图例、数值是否完整；
- 图片是否过小（高度 < 40vh 的内容图应提出警告）。

#### 1.4 推荐修复范例

**错误（裁切）：**
```html
<div class="img-hero-wrap" style="height:46vh;">
  <img class="frame-img" src="assets/2.png">
</div>
```
问题：`.frame-img` 默认 `max-height:64vh`，容器却只有 46vh，图片溢出被 `overflow:hidden` 裁切。

**正确：**
在模板 CSS 中：
```css
.img-hero-wrap .frame-img {
  max-height: 100%;
}
```
或 inline：
```html
<div class="img-hero-wrap" style="height:46vh;">
  <img class="frame-img" style="max-height:100%;" src="assets/2.png">
</div>
```

---

### 2. 公式渲染审查

#### 2.1 扫描公式

在生成的 HTML 中搜索所有 `$...$` 与 `$$...$$`，确认：

- 没有裸漏的 `$...$` 或 `$$...$$` 文本（说明 KaTeX 未处理或处理失败）；
- 没有半渲染片段，如 `ight)`、`ight\|`、`\tau =` 等；
- 行内公式与 display 公式均被 `<span class="katex">` 包裹。

#### 2.2 打开浏览器控制台验证

使用 Playwright 监听 `console` 事件，捕获 KaTeX parse error：

```python
console_msgs = []
page.on("console", lambda msg: console_msgs.append((msg.type, msg.text)))
page.goto(html_uri)
page.wait_for_timeout(2000)
# 过滤 error 类型，检查是否包含 "KaTeX parse error"
```

任何 `KaTeX parse error` 都是 FAIL。

#### 2.3 常见公式错误来源

| 问题 | 原因 | 修复 |
|---|---|---|
| 行内公式显示为原始 `$...$` | KaTeX 解析失败，auto-render 保留原文 | 检查控制台错误，转义特殊字符 |
| `\text{task_label}` 失败 | `_` 在 math 模式下被当作下标 | 改为 `\text{task\_label}` |
| `\text{...}` 中的 `%`、`&`、`#` 失败 | 这些字符在 TeX 中有特殊含义 | 转义为 `\%`、`\&`、`\#` |
| 多行公式括号断裂 | 源字符串中 `\left\|` 等被 Python 字符串处理吃掉反斜杠 | 使用 raw string `r'''...'''` 并双写反斜杠 |

#### 2.4 推荐修复范例

**错误：**
```python
p = r"携带 $(X, M, \tau, \text{task_label})$。"
```

**正确：**
```python
p = r"携带 $(X, M, \tau, \text{task\_label})$。"
```

---

### 3. 文字大小审查

#### 3.1 测量关键文字元素

对标题、正文、图注、小标签分别采样，用 `getComputedStyle().fontSize` 获取实际像素：

- 主标题 h1：建议 `min(4.8vw, 7.6vh)`，即约 52–82 px；
- 正文 body-md：建议 20–26 px；
- 图注 caption：建议 16–18 px；
- 任何小于 14 px 的正文或标签视为可读性风险（FAIL）。

#### 3.2 检查文字是否被截断

测量文字元素的 `scrollHeight` 与 `clientHeight`：

```javascript
el.scrollHeight > el.clientHeight + 1
```
若成立，说明文字溢出容器（FAIL）。

#### 3.3 检查标题是否过大挤占内容区

标题区块高度不应超过幻灯片内容区高度的 15%–20%。超过则标记为布局拥挤。

---

### 4. 布局合理性审查

#### 4.1 图片与文字比例

- 证据页（实验/消融/持续学习）中，图表应占据 60%–75% 的可用内容区；
- 若图表被压缩到 < 50%，说明文字或留白过多，需调整布局。

#### 4.2 对齐与留白

- 检查元素是否左对齐/右对齐/居中对齐混乱；
- 检查是否存在大片无意义空白（> 25% slide 面积）；
- 检查 kicker、页码、标题、内容是否遵循统一的网格系统。

#### 4.3 纵横比适配

- 竖图（高 > 宽）不要强行塞进窄栏；
- 横图（宽 > 高）不要压成细长条；
- 多面板大图优先使用全宽 hero 布局，而非小图+大段文字。

#### 4.4 输出一致性

- HTML 截图、PPTX、PDF 三者必须逐页对齐；
- 抽查 5–10 页，确认 PPTX/PDF 中无黑边、无裁切、无字体回退导致的错位。

---

## 在 zuhui-ppt-master 中的位置

本技能是 `zuhui-ppt-master` 必需子技能链的**第 6 阶段**，位于 `zuhui-ppt-qa` 之后、`zuhui-ppt-visual-score` 之前。只有 visual-audit 的 review gate 通过（页数/时长/图片/公式/文字/布局全部 OK）后，才能进入 visual-score。

## 输出模板

每次审查必须输出结构化报告，文件名为 `visual_audit_report_v{VERSION}.md`：

```markdown
## 视觉审查报告

### 1. 图片完整度
| 页码 | 图片 | 原始尺寸 | 渲染尺寸 | 容器高度 | 是否裁切 | 备注 |
|------|------|----------|----------|----------|----------|------|
| 09 | 2.png | 1117x812 | 951x691 | 497px | 是 | 底部溢出 99px |
| ... | ... | ... | ... | ... | ... | ... |

### 2. 公式渲染
| 页码 | 公式 | 状态 | 控制台错误 |
|------|------|------|------------|
| 11 | $(X, M, \tau, \text{task_label})$ | 失败 | Expected 'EOF', got '_' |
| ... | ... | ... | ... |

### 3. 文字大小
| 页码 | 元素 | 实际字号 | 状态 |
|------|------|----------|------|
| ... | ... | ... | ... |

### 4. 布局问题
| 页码 | 问题 | 严重程度 |
|------|------|----------|
| ... | ... | ... |

### 5. 已应用的修复
- 修复 ...
- 重新生成 ...
```

---

## 禁止行为

- 不能仅通过“看代码”或“图片在容器内没有越界”判断图片是否完整；
- 不能仅通过模板默认值判断公式是否渲染；
- 不能跳过浏览器真实渲染步骤；
- 不能把封面背景的 `object-fit:cover` 当作内容图问题，但必须在报告中注明。
