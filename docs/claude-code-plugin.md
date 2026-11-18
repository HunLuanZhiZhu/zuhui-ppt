# Claude Code 整体插件

本仓库可作为一个 **Claude Code 插件**安装，同时继续支持原有的 `npx skills add` 独立技能安装方式。这两条路径互不替代，不需要用户把 8 个技能分别安装进 Claude Code。

## 一、直接安装到 Claude Code

在已安装并登录 Claude Code 的终端中执行：

```bash
claude plugin marketplace add HunLuanZhiZhu/zuhui-ppt
claude plugin install zuhui-ppt@zuhui-ppt-marketplace
claude plugin list
```

在 Claude Code 会话中开始制作论文汇报：

```text
/zuhui-ppt:ppt 将 paper.pdf 和 paper_zh.pdf 制作成中文组会汇报，理论讲透，实验精选。
```

也可以不输入斜杠，直接描述需要的任务；技能会在匹配场景下作为候选被 Claude 自动发现。插件的完整流水线仍遵循七阶段 review gate。

**本地开发，不安装也能测试：**

```bash
git clone https://github.com/HunLuanZhiZhu/zuhui-ppt.git
cd zuhui-ppt
claude plugin validate . --strict
claude plugin validate .claude-plugin/marketplace.json --strict
claude --plugin-dir .
```

进入会话后运行 `/zuhui-ppt:ppt`。此方式只在该会话加载，不是永久安装。

## 二、实际包含哪些内容

安装一个插件后得到九个中文技能入口：

| 入口 | 作用 |
|---|---|
| `/zuhui-ppt:ppt` | 推荐入口：启动整套论文组会制作工作流 |
| `/zuhui-ppt:zuhui-ppt-master` | 原始主控完整技能 |
| `/zuhui-ppt:zuhui-ppt-source-audit` | 论文版本、译图、图面板来源审计 |
| `/zuhui-ppt:zuhui-ppt-story-spine` | 理论优先的故事线与逐页计划 |
| `/zuhui-ppt:zuhui-ppt-swiss-design` | Swiss 视觉布局与公式页设计 |
| `/zuhui-ppt:zuhui-ppt-triformat-export` | HTML/PDF/PPTX 同源导出 |
| `/zuhui-ppt:zuhui-ppt-qa` | 结构、图片账本、公式账本检查 |
| `/zuhui-ppt:zuhui-ppt-visual-audit` | 源论文完整图、相邻页、公式的渲染审查 |
| `/zuhui-ppt:zuhui-ppt-visual-score` | 六维独立视觉评分 |

插件 `.claude-plugin/plugin.json` 直接指向仓库原有的 8 个 `zuhui-ppt-*/SKILL.md` 技能目录，`skills/ppt/SKILL.md` 是额外的统一入口。英文别名 `group-meeting-ppt-*` 继续保留给原有 Skills 安装器，但不会在 Claude Code 插件中重复注册。

视觉资源、模板、校验脚本仍位于 `zuhui-ppt-master/` 原始路径，**不会复制一套易于失去同步的插件影子目录**。

## 三、路径、权限和输出

插件安装在 Claude Code 管理的目录中，通常不是用户的论文工作区。插件内部资源引用必须使用 `${CLAUDE_PLUGIN_ROOT}/zuhui-ppt-master/...`，而 **`ppt_vN/`、源论文 PDF、导出结果、讲稿及报告必须保存在用户当前项目**，不能写入只读插件缓存。

插件不会默认启动 MCP 服务器，不会添加需要执行的生命周期钩子，也不会自动向 GitHub 推送文件。需要文件访问、浏览器渲染或外部依赖的动作由当前 Claude Code 环境授权执行。没有所需工具时要明确报告未执行的质量门，不得虚报完成。

## 四、与原 Skills 安装方式共存

仍可使用：

```bash
npx skills add hunluanzhizhu/zuhui-ppt -g -y
```

这是另一种跨智能体的 Skills 安装方式，不是 `claude plugin install`。若同一个 Claude Code 环境已经独立安装了这 8 个技能，建议避免同时保留重复命名或重复触发的旧副本，以免影响技能选择。

## 五、如何验证

```bash
node --test tests/claude-code-plugin.test.mjs
node --test tests/research-ledgers.test.mjs
claude plugin validate . --strict
claude plugin validate .claude-plugin/marketplace.json --strict
```

**静态验证**只能证明目录、清单和入口结构正确；与“插件已在某个用户账号安装成功”不同。要确认运行时安装和发现，请在真实 Claude Code 环境执行 `claude plugin list`，然后启动 `/zuhui-ppt:ppt`。源论文图像与公式仍需按照 `research-deck-quality-protocol.md` 逐一检查。
