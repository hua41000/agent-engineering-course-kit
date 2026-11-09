**企业级 AI Coding 中，subAgent 最值得优先采用的形态是：主代理掌握需求与决策，子代理承担边界明确的探索、实现或验证，再用可检查的产物收敛结果。** Cognition 的生产复盘尤其支持“单一写入者＋多个辅助判断者”；并行写代码则需要更明确的任务与环境隔离。[Cognition](https://cognition.com/blog/multi-agents-working)

这里的 **subAgent 是被主代理委派、拥有独立任务上下文的执行单元**，仅在同一段提示词里扮演几个专家不具备这种独立任务上下文。它不一定并行运行，也不自动拥有独立沙箱；上下文继承、工具权限和工作区隔离需要分别确认。[Claude](https://code.claude.com/docs/en/sub-agents)

以下根据截至 **2026 年 10 月 15 日**可查的一线分享、工程复盘和公开实现整理。**GoodCase / BadCase 是面向企业研发编写的应用示例，并非所引用公司的项目实录。**

以下保留 **6 条实践**，按日常开发的适用范围、质量收益与可操作性排序。

### 最佳实践 A：

- **标题：并行取证，集中决策**

- **描述：**
  把独立调查方向分给子代理，由主代理汇总证据、裁决冲突并明确修改权，让并行探索收敛到可验证的方案。

- **GoodCase：**
  “并行调查报表导出失败：A 检查 API 与认证链路，B 检查队列与重试，C 检查存储与下载。全部只读，各自返回证据和排除项。主代理等待三份结果后确认根因，再由一个实现者修改代码。”
  某个方向提前发现会影响其他调查的事实时，先反馈主代理，由主代理调整任务。

- **BadCase：**
  给四个子代理同一句“修好报表导出”。它们分别修改超时、重试次数、数据库查询和异常处理，最终既无法确认根因，也难以判断哪项修改真正必要。

- **参考依据：**
  适用模式：主控—工作者（Orchestrator–Workers），常用并行扇出、集中汇总（Fan-out / Fan-in）。Cognition 的生产复盘支持多个代理贡献判断、尽量保持单一写入者。[Cognition](https://cognition.com/blog/multi-agents-working) Codex 官方同样建议先尝试探索、测试分析和问题分诊等读密集任务。编排中还需明确汇总时点，及时传递会影响其他调查的新事实。

### 最佳实践 B：

- **标题：独立评审，再验证问题**

- **描述：**
  让独立评审者依据同一版需求发现候选问题，再用工具证据逐项复核，修复后重跑原用例形成闭环。

- **GoodCase：**
  实现完成后，reviewer 只读检查下载鉴权，提出包含触发条件和代码位置的候选问题；verifier 在测试环境验证“租户 A 能否使用租户 B 的下载链接”，返回请求、响应及对应版本。主代理修复后重跑原用例；无法执行的项目明确标记为“未验证”。

- **BadCase：**
  实现代理写完后解释“已经考虑了所有边界”，评审代理沿用这段解释宣布通过；或者每轮评审都要求修改风格，开发代理全部照办，最终无限循环，却始终没有运行真正的验收。

- **参考依据：**
  适用模式：生成—验证（Generator–Verifier），以及发现—复核。Cognition 发现干净上下文的 reviewer 能补充发现，但仍需按整体需求筛选，防止无限修改。[Cognition](https://cognition.com/blog/multi-agents-working) Anthropic 的评审实现只保留验证代理复核成立的问题。[GitHub](https://github.com/anthropics/claude-code/blob/main/plugins/code-review/commands/code-review.md) 独立评审仍应获得同一版需求，避免继承实现者的自证解释；应用开发实验还让 evaluator 用 Playwright 操作真实页面取证。[Anthropic](https://www.anthropic.com/engineering/harness-design-long-running-apps)

### 最佳实践 C：

- **标题：把任务合同交给子代理**

- **描述：**
  每次委派都写清目标、上下文、约束、边界、交付格式和阻塞处理，让子代理按同一份任务合同执行。

- **GoodCase：**
  “调查导出任务的租户身份是否在入队时丢失。已确认租户身份必须来自认证上下文，不能信任请求参数。读取 `specs/export.md`，沿 API 到消费者追踪；只负责这条链路，不检查下载鉴权，不修改代码。返回调用链、可疑位置、代码依据及复现条件。发现需要改变既定接口时先报告，不自行改约定。”

- **BadCase：**
  “让后端专家把这个问题处理一下。”主代理默认它知道前面讨论过的租户规则；子代理自行做了另一套假设，最后仅返回“已完成，逻辑正确”。

- **参考依据：**
  Anthropic Research 复盘曾因简短委派出现重复搜索、范围错位和遗漏；交接宜采用“简短结论＋证据位置＋未解决事项”，长日志、报告和代码通过产物路径传递。[Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system) Claude Code 普通子代理不会自动看到主代理已读文件和完整对话，fork 属于另一种继承方式，需分别确认。[Claude](https://code.claude.com/docs/en/sub-agents)

### 最佳实践 D：

- **标题：按任务依赖安排并行**

- **描述：**
  先稳定接口和关键决策，再让输入已就绪的任务并行，后续实现与验收按依赖关系接续推进。

- **GoodCase：**
  开发“异步导出进度页”：先确认任务状态机、API 和错误码。随后前端按合同实现交互，后端实现生产与消费；测试代理可以同步设计用例，但端到端执行必须等待系统可运行。任何接口合同变更，都要通知受影响任务重新确认。

- **BadCase：**
  前端、后端同时开始，各自发明状态名和轮询语义；测试代理对着自建 Mock 宣布通过。三个代理都完成了任务，真实系统却无法联通。

- **参考依据：**
  适用模式：顺序接力与依赖图（Pipeline / DAG）。Addy Osmani 演示了数据层与校验逻辑先并行、API 路由等待两份接口报告的结构，收益仍取决于具体需求。[AddyOsmani.com](https://addyosmani.com/blog/code-agent-orchestra/) Anthropic 编译器实验中，代理曾集中修复同一阻塞点；重构验证方式、产生独立工作目标后才恢复并行空间。[Anthropic](https://www.anthropic.com/engineering/building-c-compiler)

### 最佳实践 E：

- **标题：并行写入先隔离**

- **描述：**
  并行修改前先划定文件归属、隔离工作区与运行资源，指定共享文件维护者，并在集成后重新验证。

- **GoodCase：**
  前端和后端从同一个已确认的基线提交创建独立 worktree；各自使用不同服务端口和测试数据命名空间。接口定义、迁移文件编号、依赖锁文件指定唯一维护者。子代理交付提交记录和测试证据，集成后重新运行接口与端到端测试。

- **BadCase：**
  几个代理共用同一工作目录和测试库：一个启动数据库迁移，一个重置测试数据，另一个运行验收。随后把环境冲突误判成代码缺陷，继续修改本来正确的业务逻辑。

- **参考依据：**
  适用模式：隔离工作区中的并行实现（Worktree-based Parallel Implementation）。Cursor 使用 Git worktree 隔离文件与变更，再合并选定结果。[Cursor](https://cursor.com/blog/agent-best-practices) Builder 提醒子代理仍可能共享文件系统、数据库和 API 凭证，上下文、工作区和运行环境需分别隔离。[Builder.io](https://www.builder.io/blog/subagents) worktree 无法保证合并后没有语义冲突，集成仍需专人负责。

### 最佳实践 F：

- **标题：需要隔离上下文再委派**

- **描述：**
  把读取量大、过程嘈杂且只需少量结论的任务交给子代理，先判断独立上下文的价值，再决定是否委派。

- **GoodCase：**
  主代理正在实现异步导出，需要先搞清楚现有任务队列的重试机制。委派一个只读子代理调查队列配置、消费者和失败恢复逻辑，只返回关键文件、调用关系与限制；主代理继续保留完整的业务需求和技术决策。

- **BadCase：**
  修复一个已定位的空值判断，却依次创建“需求分析师、架构师、开发工程师、测试工程师、项目经理”，每个代理都重新阅读仓库，再把同一件事转述一遍。

- **参考依据：**
  适用模式：隔离委派（Isolated Delegation）。Cursor 提醒子代理要重新收集上下文，简单修改或紧密依赖当前讨论的连续实现通常留在主代理；无需隔离的重复流程优先用 Skill 或命令。[Cursor](https://cursor.com/docs/subagents) Boris Cherny 在交互开发中用 subAgent 隔离评审上下文，在 CI 中则未必需要，说明委派应由执行需要决定。[Every](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
