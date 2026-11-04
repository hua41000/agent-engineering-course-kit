# Agent Architecture Composer

《企业级Agent工程架构实战营》的可下载架构选型配套资产：Web 通过问答建立项目上下文，Skill 读取已有项目后澄清关键问题，两端共用选型逻辑，输出架构方案与决策记录。

在线使用：[Agent Architecture Composer · GitHub Pages](https://shanggqm.github.io/agent-engineering-course-kit/agent-architecture-composer/)。网页无需登录，可直接下载 Skill。

ChatGPT 站点：[Agent 架构选型工具](https://agent-architecture-composer.guomeiqing1984.chatgpt.site)。2026-10-11 发布，当前仅所有者可访问；本公开仓库提供可独立运行的离线版。

## 直接使用首版

已实现离线 Web 和可下载 Skill，当前为开发预览（`review`）。Web 无需登录、后端或 API Key；Skill 使用宿主的模型和项目访问能力。

在本目录执行（构建需要 Node.js 20+ 和 Python 3，无需安装 npm 依赖）：

```bash
npm run build
npm start
```

打开 http://127.0.0.1:4173 ，或双击本项目目录下 `dist/index.html`。该 HTML 是自包含文件，可以单独复制给学员、断网使用。桌面侧栏或手机“更多工具”中可下载 Skill。

构建输出：

- `dist/index.html`：独立网页。
- `dist/agent-architecture-composer-skill.zip`：含指令、共享内核、安装说明的完整 Skill 包。
- `dist/skill/`：解包形式，便于本地使用。

在线网页由仓库 [GitHub Pages 工作流](../../../../.github/workflows/pages.yml)自动发布。推送到 `main` 会在测试、构建与运行检查通过后更新网页；网页和 Skill ZIP 来自同一次构建。直接下载：[Skill ZIP](https://shanggqm.github.io/agent-engineering-course-kit/agent-architecture-composer/agent-architecture-composer-skill.zip)。

Skill 安装：解压 ZIP，把完整的 `agent-architecture-composer` 文件夹放到宿主配置的 Skill 目录，例如 `~/.codex/skills/`。打开目标项目后输入：“使用 agent-architecture-composer 分析这个项目的架构选型，读取现有实现，澄清关键问题，给出完整方案。”具体目录以宿主配置为准。

## 已有能力与边界

- 五组逐题问答 + 选型报告：业务背景、任务与控制、系统与数据、风险与权限、交付与运行。32 个问题按条件显示，通常需要回答 27—32 项；其中 14 类需求支持多选，可回退修改、跳题或暂时不确定。
- 默认从自定义项目开始，九类案例作为可选示例；案例 ID 与行业名不参与架构或框架匹配。行业用于提示需澄清的问题，实际约束来自回答。
- 综合 Workflow、Autonomous、Hybrid、计划、协作、反馈与 Runtime 等方法，生成理由、模式组合、框架候选、备选和实施步骤。
- 报告同时给出目标结构、系统能力组合、执行范围、建设或改造路线，以及各项回答产生的影响。已有系统追加当前架构、改造边界和瓶颈问题；新建项目跳过这些问题。
- 导出 Markdown 报告、ADR、Mermaid、会话 JSON；支持本机草稿、JSON 导入、浏览器打印 PDF。
- Skill 阅读项目、补问关键问题，使用同一内核生成报告，再补充项目级改造建议。
- 首版采用结构化选项进行规则判断；自由文字作为报告上下文保留，交给 Skill 进一步理解。框架卡片提供候选方向，具体版本/API 在接入时核对。
- 首版覆盖第 02 课的方法；后续课程的方法随课程开发逐步补充。当前 PPT 已移除 Composer 页，工具作为独立配套资产使用。

负责人：`guomeiqing`。机器登记见 [manifest.yml](manifest.yml)。原 [设计评审](docs/reliability-review.md)保留为设计历史；按用户要求，首版采用简化方案，未实施其中完整的证据与验证体系。源码公开维护于 [agent-engineering-course-kit](https://github.com/shanggqm/agent-engineering-course-kit)。正式产品版本与分发许可另行登记。

## 开发与基本检查

```bash
npm test
node skill/scripts/composer.mjs recommend --input examples/dataagent.json --out-dir dist/composer-example
```

输出目录可自选；CLI 拒绝覆盖已有同名报告。`src/knowledge.mjs` 管理问题、模式、场景和框架卡片，`src/core.mjs` 管理控制结构和条件分支，`src/context.mjs` 管理跨场景约束、系统组件和改造路线，`src/report.mjs` 管理报告，`src/app.js` 管理界面，`src/visuals.mjs` 与 `src/presentation.css` 管理品牌首页和报告主视觉，`src/pattern-visuals.mjs` 管理 20 种子架构示意图。构建时将共享模块打入 HTML 和 Skill，避免维护两套规则。

## 多需求组合

行业、业务任务、触发方式、处理路径、并行方式、Agent 协作、检查方式、动作类型、已有架构、瓶颈、数据来源、系统接入、响应时间和技术栈支持多选。选中需求共同生成能力与模式组合；多路径报告列出各任务路径，多语言框架候选标明各自适用范围。具体任务与路径的对应关系仍需进一步确认。

建设方式、最高风险、最严格数据边界、改造权限与当前首要取舍等保持单选。“不需要”类选项与具体能力互斥；“暂时不确定”清除本题组合。Session 输出为 schema v2，多选值使用数组；可导入 v1 单选会话并自动转换，旧的混合数据来源展开为文档和结构化数据。

## 界面与交互

采用百小医 `adaptive` 浅色规范：橙色主操作、统一字号和间距、原生单选/复选控件与键盘焦点。桌面展示章节、问卷和概览；手机使用单列问卷与底部操作区。首页增加独立 Logo、可切换的动态架构主视觉、示例报告与 Skill 入口。报告采用带水印封面、架构摘要和六段目录的阅读布局，导入与必填输入提供明确反馈。示例报告独立展示，返回后保留正在填写的方案。每种子架构配有极简橙黑 SVG，呈现节点、箭头和反馈关系；报告与方法手册共用，离线和打印时保留。

主题实际由 `scripts/build.mjs` 读取 [design-system](design-system/README.md) 后内嵌到 HTML；功能图标使用 Material Symbols Rounded 的本地子集，支持离线。后续视觉修改遵守 [设计契约](design-system/BXY_DESIGN_SYSTEM.md)，调整主题值时修改 JSON tokens。

## 唯一方案入口

| 文件 | 管理内容 |
|---|---|
| [产品需求](docs/prd.md) | 用户、Web 与 Skill 流程、问答、报告、范围和验收 |
| [方法与决策规则设计](docs/methodology.md) | 课程覆盖、决策次序、规则语义、反例、证据链 |
| [技术方案](docs/technical-design.md) | 共享内核、数据契约、工程结构、部署、Skill 打包和测试 |
| [资产与文档管理](docs/delivery-management.md) | canonical 归属、文档生命周期、发布版本和分阶段实施 |

阅读顺序：产品需求 → 方法设计 → 技术方案 → 交付管理。文档开头的“当前实施范围”说明首版边界；其余详细设计作为后续演进参考。正式批准与发布仍单独登记。

## 输入与来源

- [第 02 课控制页](https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/README.md)、[获批大纲](https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/brief/lesson_outline.md)、[研究综合](https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/research/synthesis.md)、[当前逐页稿](https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/design/slide_blueprint.md)。
- [优化正课大纲](chatgpt-conversation://6aafa253-0744-83e9-b2ea-5ea9c8ed13d8)：2026-09-22 读取引用对话，以最后一轮“模式展开、框架盘点、Hybrid 组合、Skill + Web”的需求为补充。对话中的模型回答用于需求背景，技术事实以课程研究与官方来源核验；对话链接不保证对学员开放。
- [试听课现有选型工具](https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/trial/lesson_03_autonomous_first_architecture/practice/architecture-selector/README.md)：保留其轻量教学定位，可借鉴题目解释和交互；新产品的阶段级规则独立设计。
- [当前课程总纲入口](https://github.com/shanggqm/geektime-course/blob/main/course/curriculum/README.md)、[仓库管理规范](https://github.com/shanggqm/geektime-course/blob/main/docs/course-repository-governance.md)。

## 归属原则

本目录管理产品方案、Web、共享规则内核与产品级测试。[Skill 执行源](skill/SKILL.md)管理指令、项目采集流程与少量基本场景。共享内核从本目录构建后装入分发包，禁止在 Skill 内另写一套选型算法。

第 02 课保留教学说明、课堂案例和练习入口。生成的 Web、Skill ZIP、示例报告属于派生产物；学员真实项目报告保存在学员自己的系统中。本项目的 `dist/` 保存可重建产物并被 Git 忽略。课程来源链接供维护者追溯，访问需要相应仓库权限；独立构建与运行使用本目录源码。
