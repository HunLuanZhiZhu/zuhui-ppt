---
name: ppt
description: 用 Zuhui PPT 全套八阶段技能制作或修订中文论文组会 PPT：学术论文 PDF、中译 PDF、双论文分享、理论推导、完整图/公式质量审查、Swiss International HTML/PDF/PPTX。需要完整论文汇报时使用。
argument-hint: "[论文 PDF 路径、主题、要求或修改意见]"
---

# Zuhui PPT 完整组会制作入口

用户本次的任务与约束：

$ARGUMENTS

**本技能只是入口，不是简化版主控**。你必须按顺序读取并遵循本插件内的完整主控说明：

1. 首先读取 `${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/SKILL.md`。
2. 按主控要求读取 `${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/references/research-deck-quality-protocol.md`。
3. 按既定七阶段顺序执行下列同一插件内的完整技能。需要时使用对应技能或读取各自的 `SKILL.md`，不能只读本入口后自行发明流程：
   - 源文件审计：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-source-audit/SKILL.md`
   - 故事脊椎：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-story-spine/SKILL.md`
   - Swiss 视觉设计：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-swiss-design/SKILL.md`
   - 三格式导出：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-triformat-export/SKILL.md`
   - 结构校验：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-qa/SKILL.md`
   - 浏览器与论文证据视觉审查：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-visual-audit/SKILL.md`
   - 六维视觉评分：`${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-visual-score/SKILL.md`
4. 视觉设计之前必须读取插件自带的 `zuhui-ppt-master/assets/template-swiss.html` 以及相关 `references/`，禁止凭印象重建模板。
5. 项目输出写到**用户当前项目工作区**的 `ppt_vN/`（先确认已有版本，避免覆盖），不能写入插件安装目录。插件中的模板/校验器/图片资源用绝对插件路径读取；例如：
   `node "${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/scripts/validate-swiss-deck.mjs" "ppt_vN/deck.html"`。
6. 不能把“布局静态通过”当作“论文整图完整”。所有使用的源图按完整图号逐面板核对；公式关键符号必须在可见幻灯片上解释；对用户反馈的问题建立回归检查。
7. 论文文本与图像的版本差异（原版、译文、v1、v2）必须核验和披露。遵守理论优先、实验图精简、多论文清晰分隔的要求。
8. 明确报告 HTML/PDF/PPTX、讲稿与审查报告的实际生成状态，不宣称未运行的检查已经通过。

插件内的完整技能另有可直接调用的命名空间入口，例如 `/zuhui-ppt:zuhui-ppt-master`；推荐用户使用 `/zuhui-ppt:ppt` 启动整条管道。
