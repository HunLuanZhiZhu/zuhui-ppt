# zuhui-ppt
从一篇学术论文，到一份高端、高密度、视觉精美的中文组会汇报演示——全流程 agent skills 工具链。  `zuhui-ppt` 是一套面向 AI coding agent 的 skills 集合，用于将学术论文（PDF / 翻译 PDF）转化为 **Swiss International 风格**的中文组会 / journal club 汇报 PPT。它以 **HTML 为规范源**，同步导出 `.html` / `.pdf` / `.pptx` 三重交付物，并附带逐页演讲稿、QA 报告与视觉质量评分。  整个工具链由 **1 个主控技能 + 7 个子技能**组成，按严格顺序的 7 阶段管道运行，每个阶段都有 review gate，未通过不得进入下一阶段。
