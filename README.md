# Agent Engineering Course Kit

《企业级Agent工程架构实战营》的公开课程配套项目，按篇章和课次管理示例代码、工具、Skill、模板与学习资料。

在线使用：[Agent Architecture Composer](https://shanggqm.github.io/agent-engineering-course-kit/agent-architecture-composer/)。

## 快速开始

需要 Node.js 20+、Python 3 和 Git；当前无需安装 npm 依赖。

```bash
git clone https://github.com/shanggqm/agent-engineering-course-kit.git
cd agent-engineering-course-kit
npm test
npm run build
npm start
```

打开 http://127.0.0.1:4173。也可直接双击 Composer 目录的 `dist/index.html`，离线使用网页并下载 Skill。

首批内容：[Agent Architecture Composer](chapters/chapter_01_ai_foundations/lesson_02_agent_architecture_selection/agent-architecture-composer/README.md)，位于第一篇第 02 课，包含 Web、共享选型内核、可打包 Skill、示例与测试。当前为开发预览（`review`）。其余课次提供导航，配套内容随课程进度补充。

## 按篇章查找

第二篇作业：[用 my-ai-infra SDD 为 DSH 开发一个插件](chapters/chapter_02_ai_coding/assignment/README.md)。

| 篇章 | 主题 | 课次 |
|---|---|---|
| 01 | [AI 核心认知篇：从工程到 AI Agent 必须建立的底层认知](chapters/chapter_01_ai_foundations/README.md) | 01–05 |
| 02 | [底层能力篇：掌握企业级 AI Coding 的道法术器](chapters/chapter_02_ai_coding/README.md) | 06–09 |
| 03 | [贯穿实战立项篇：把真实业务问题转化为可验证、可演进的企业级 Agent 项目](chapters/chapter_03_project_inception/README.md) | 10–10 |
| 04 | [LLM 执行底座篇：构建面向 Agent Harness 的可靠模型执行LLM Runtime](chapters/chapter_04_llm_runtime/README.md) | 11–14 |
| 05 | [Agent Harness 与 Agent Runtime 架构选型篇：设计自主 + Workflow 的企业级混合系统](chapters/chapter_05_agent_runtime/README.md) | 15–20 |
| 06 | [Agent Context 架构选型与治理篇：为每一步决策构建最小充分、可信可控的上下文](chapters/chapter_06_agent_context/README.md) | 21–26 |
| 07 | [Agent 工具 / 技能治理篇：让 Agent 安全、可靠、高效地连接真实世界](chapters/chapter_07_tools_and_skills/README.md) | 27–31 |
| 08 | [Agent Memory 架构选型与治理篇：让 Agent 有选择地记住、正确地回忆](chapters/chapter_08_agent_memory/README.md) | 32–35 |
| 09 | [Agent 评测与受控进化篇：用科学的评测方法论驱动持续有效进化](chapters/chapter_09_evaluation_and_evolution/README.md) | 36–40 |
| 10 | [完结篇：面向未来的 Agent 工程判断](chapters/chapter_10_future_and_capstone/README.md) | 41–43 |

## 目录与维护

```text
chapters/
└── chapter_01_ai_foundations/
    └── lesson_02_agent_architecture_selection/
        └── agent-architecture-composer/
            ├── docs/
            ├── src/
            ├── skill/
            ├── examples/
            ├── scripts/
            └── tests/
```

- 篇章使用 `chapter_NN_slug`，课次使用全课连续编号 `lesson_NN_slug`；具体标题见课次 README。
- 同一交付物保留一个开发源，跨课复用时链接首次引入的项目。新增交付物时更新课次 README、项目 manifest 和 [课程导航登记](course-map.json)。
- 生成的 HTML、ZIP 和示例报告保留在被 Git 忽略的 `dist/` 或 `work/`；源码与打包脚本随项目维护。
- 当前导航对应 V5 正式课，共 10 篇、43 课。后续试听课和直播课有配套内容时分别使用 `trial/`、`live/`，轨道内独立编号。
- 课程大纲、研究和 PPT 在课程开发仓库维护；本仓库只保存公开配套内容。部分产品文档保留课程来源链接，读取这些来源需要课程开发仓库的访问权限，运行配套项目无需访问它们。
- 现有 Compass、AI Coding 演示素材和 my-ai-infra 继续在各自现有位置维护，本次首批迁入 Composer。

校验与构建：

```bash
npm test          # 导航检查与 Composer 规则回归
npm run build    # 生成独立 HTML 与 Skill ZIP
npm run smoke    # 检查离线包、解压 Skill、CLI 与预览服务
npm run build:pages # 构建 GitHub Pages 部署目录 work/pages
```

GitHub Pages 由 [部署工作流](.github/workflows/pages.yml)发布。推送到 `main` 或手动运行工作流时，先执行规则测试、构建与运行检查，再发布 Composer 网页及 Skill ZIP。部署产物只包含公开网页和下载文件。项目站点根路径自动转到 Composer 的独立入口；后续工具可以使用各自的子路径。

课程开发仓库通过 `learner-kit/code/agent-engineering-course-kit/` submodule 固定引用本仓库。修改时先在本仓库提交并推送，再在课程仓库更新 submodule 指针。Composer 的课程 Skill 入口通过相对软链引用本项目 `skill/`。

许可见 [NOTICE.md](NOTICE.md)，第三方素材保留各自许可证。
