# SubAgent 与多 Agent 编排：研究结论

调研日期：2026-10-15。用途：第 08 课课堂讲解与演示，配套[最佳实践](best_practices.md)。

本次以公开的一手工程复盘和当前官方文档为依据。下文将来源报告的事实、作者经验与课堂教学推导分别标明。来源中的大型实验没有在本项目复现，不能据此承诺某种团队规模、加速比或成本收益。

<a id="practice-selection"></a>

## 2026-10-18 六条实践选编

按课程负责人要求，保留日常开发适用面广、对质量有直接帮助、操作与结果可检查的六条，依次编号 A–F。前两条给出可直接采用的协作方式，其余四条补齐委派与执行约束。排序属于课程选编判断，未做收益排名实验；原四条已从最佳实践正文和 HTML 中删除，研究证据保留用于追溯。

| 当前编号 | 原编号 | 标题 | 保留与排序理由 |
|---|---|---|---|
| A | D | 并行取证，集中决策 | 适合代码调查与故障定位，容易划分只读工作，也容易检查证据 |
| B | H | 独立评审，再验证问题 | 适合日常变更检查，以复核和重验把评审意见收敛为质量改进 |
| C | C | 把任务合同交给子代理 | 适用于每次委派，减少上下文遗漏、越界与无法验收的交付 |
| D | E | 按任务依赖安排并行 | 明确哪些工作可以同时开始，避免各自完成却无法接通 |
| E | G | 并行写入先隔离 | 并行实现时直接约束文件、环境与集成责任，降低相互干扰 |
| F | A | 需要隔离上下文再委派 | 帮助判断委派是否值得，避免简单工作产生额外协调负担 |

删去原 B“按职责定义 subAgent”（偏向可复用代理配置，日常委派的关键边界由当前 C 承接）、原 F“批量迁移先分片”（专项迁移场景，覆盖面较窄）、原 I“多方案用测试择优”（适用高价值难题，成本较高）、原 J“给编排设置停止条件”（与 [Loop 专题](../loop-engineering/best_practices.md)重叠）。研究结论与来源表中的消费者已按当前六条更新。

## 研究结论

<a id="finding-1"></a>

### 1. 先找到能独立推进的工作，再增加 Agent

**来源事实：** Nicholas Carlini 的 C 编译器实验中，多 Agent 可以分别修复不同失败用例；进入 Linux 内核编译阶段后，大家反复遇到同一故障、修改同一处，16 个 Agent 仍无法有效并行。作者用 GCC 辅助分离待验证文件，才使不同 Agent 能处理不同问题。[S1](#s1)

**教学推导：** 委派前判断子任务能否单独产出、单独验证。代码库的独立模块调查、不同故障假设验证适合先并行；共享接口尚未确定的实现先处理依赖。单次改动很小、大家都要改同一个核心函数时，派更多 Agent 可能增加返工。消费者：最佳实践 A、D、F。

<a id="finding-2"></a>

### 2. 委派消息要让子 Agent 能直接开始，也能明确结束

**作者经验：** Anthropic 在 Research 系统中发现，笼统委派会造成重复搜索和范围偏差；其改进是给出目标、输出格式、工具与来源指引，以及清晰边界。[S2](#s2)

**教学推导：** 迁移到 Coding 时，最小任务说明可包含目标、相关文件、允许修改的范围、验收方式和回传内容。需要上游决定时报告阻塞，避免自行扩展任务。这里只迁移委派方法；研究产品的效果数据不代表 Coding 的效果。消费者：最佳实践 C。

<a id="finding-3"></a>

### 3. 共享设计决定应有明确负责人

**作者经验：** Cursor 2026 年 7 月的复盘记录了不同 planner 重复设计同一概念的问题；团队要求规划者完成设计决定，并避免把同一个决定交给多个子树分别处理。[S4](#s4)

**教学推导：** 前后端并行前，先明确接口、错误码、状态定义等共享约定。子 Agent 可以提出变更建议，由负责人决定并通知受影响任务。职责可以很轻：一份当前约定加一个负责人即可。消费者：最佳实践 D、E。

<a id="finding-4"></a>

### 4. 独立上下文需要明确交接，回传摘要需要保留证据入口

**文档事实：** 当前 Claude Code 文档说明，普通子 Agent 从独立上下文启动，收到委派消息；fork 模式会继承父对话。子 Agent 可隔离大量检索、日志和文件阅读，仅回传摘要。具体启动信息还受 Agent 类型与配置影响。[S5](#s5)

**教学推导：** 不假定子 Agent 已看到主对话中的决定。派发时给必要背景和文件入口；回收时要求“结论、证据位置、验证结果、未解决项”。摘要只写“已检查，没有问题”，主 Agent 很难判断覆盖范围。消费者：最佳实践 C、F。

<a id="finding-5"></a>

### 5. 分开上下文、文件写入和外部资源三种边界

**文档事实：** Claude Code 的 worktree 为会话提供单独工作目录与分支，隔离文件编辑；Agent Teams 文档另行要求按文件划分负责人，避免相互覆盖。[S6](#s6)、[S7](#s7)

**教学推导：** 只读调查可以共享代码目录。并行修改需明确文件归属，或使用独立 worktree 后统一集成。worktree 不会自动拆分外部数据库、端口、队列或账号；同一数据库地址仍可能指向同一实例。可写测试资源要单独分配，无法隔离的操作串行执行。不要把独立上下文当作文件与外部资源的隔离保证。消费者：最佳实践 E。

<a id="finding-6"></a>

### 6. 依赖结果先回收，再派发后续任务

**文档事实：** Claude Code 官方建议用子 Agent 串联需要前序结果的任务；Agent Teams 文档也提醒主会话等待队友完成、及时调整无效方向。[S5](#s5)、[S7](#s7)

**教学推导：** 主 Agent 可以在等待时完成独立工作；依赖子任务的实现应等结果回收后推进。若负责人在等待期间自行重做同一任务，会产生双份工作和冲突。失败重派前先取得现有产物、尝试记录和最新状态，并明确旧任务已停止或其写入权限已收回。消费者：最佳实践 A、D。

<a id="finding-7"></a>

### 7. 独立审查要改变观察角度，并要求可核验的问题

**作者经验：** Cursor 尝试过向 reviewer 提供完整工作记录、只提供产物或只提供代码库等不同审查视角；作者认为这些视角可以互补，但未证明某种组合普遍最优。[S4](#s4)

**来源事实：** Anthropic 的多 Agent 实验观察到，相似模型、上下文与运行条件容易产生相似行为；在其游戏开发实验中，多个 Agent 甚至选择了同一个分支名。该研究也记录了群体讨论过早趋同的失败。[S8](#s8)

**教学推导：** 可将功能正确性、权限边界、回归测试分给不同 reviewer；先独立检查，再汇总证据。要求给出触发条件、代码位置和验证方法。多个 Agent 都回答“没问题”仍需与测试和实际行为对照。消费者：最佳实践 B。

<a id="finding-8"></a>

### 8. 集成方式要随实际冲突调整，合并后的结果仍需验收

**作者经验与日期边界：** Cursor 在 **2026-01-14** 的实验中移除了造成瓶颈的 integrator 角色，由 worker 处理冲突；到了 **2026-07-20** 的后续系统，团队报告 worker 会覆盖或放弃相互冲突的修改，改由中立第三方 Agent 处理冲突。两篇描述的是不同阶段的系统，不能概括成统一禁用或必须设置 integrator。[S3](#s3)、[S4](#s4)

**来源事实：** C 编译器实验遇到新增功能破坏已有行为，作者加强了持续集成与回归约束。[S1](#s1)

**教学推导：** 小团队可以由主 Agent 集成；只有出现持续冲突、等待或吞吐瓶颈时，再调整角色与流程。合并成功只说明修改已组合，仍须验证组合后的接口和行为。消费者：最佳实践 E。

<a id="finding-9"></a>

### 9. 用验收通过的成果评估并行收益

**来源事实：** Anthropic Research 文章报告其多 Agent 系统约消耗普通聊天 15 倍 token；参照对象是聊天，任务场景是研究，不能写成 Coding 相对单 Agent 的固定倍数。[S2](#s2)

**作者经验：** Cursor 1 月的实验中，共享锁会让多数 Agent 等待，平权分工也出现避开难题的情况；7 月后续复盘还明确旧浏览器实验距离完善软件有明显差距。[S3](#s3)、[S4](#s4)

**教学推导：** 同时记录验收通过的任务数、总耗时、token 或实际费用、冲突与返工。从当前可独立执行的工作量决定并发度；当结果开始重复、冲突上升或新证据停止增加时，收缩并发并重新分工。预算、超时和停止规则应成为委派要求，数值按任务设定。消费者：选编边界；不单列为当前最佳实践。

## 来源记录

以下来源均已阅读正文，访问日期均为 **2026-10-15**。使用权边界 **R**：公开阅读不等于获得再分发许可；本材料仅作必要的中文概述并链接原文，未复制全文、截图、图表或源代码；权利保留给原作者，进一步转载需核实授权。官方文档用于确认功能语义，不单独作为实际提效的证明。

| 编号 | 作者／发布方 | 标题与 URL | 发布日期 | 来源类型 | 使用权 | 消费者 |
|---|---|---|---|---|---|---|
| <a id="s1"></a>S1 | Nicholas Carlini／Anthropic | [Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler) | 2026-02-05 | 一手工程实验复盘；重点为 Make parallelism easy、Write extremely high-quality tests | R | 结论 1、8；最佳实践 A、D、E |
| <a id="s2"></a>S2 | Anthropic 工程团队 | [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) | 2025-06-13 | 研究产品的一手工程复盘；重点为委派与成本边界 | R | 结论 2、9；最佳实践 C、选编边界 |
| <a id="s3"></a>S3 | Wilson Lin／Cursor | [Scaling long-running autonomous coding](https://cursor.com/blog/scaling-agents) | 2026-01-14 | 长任务 Coding 的一手工程实验复盘 | R | 结论 8、9；最佳实践 E、选编边界 |
| <a id="s4"></a>S4 | Wilson Lin／Cursor | [Agent swarms and the new model economics](https://cursor.com/blog/agent-swarm-model-economics) | 2026-07-20 | 后续工程实验复盘；重点为 Split-brain design、Merge conflicts、Review lenses | R | 结论 3、7、8、9；最佳实践 B、D、E |
| <a id="s5"></a>S5 | Anthropic／Claude Code 文档团队 | [Create custom subagents](https://code.claude.com/docs/en/sub-agents) | 页面未标注；持续更新文档 | 当前官方文档；重点为 What loads at startup、Chain subagents | R | 结论 4、6；最佳实践 C、D、F |
| <a id="s6"></a>S6 | Anthropic／Claude Code 文档团队 | [Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees) | 页面未标注；持续更新文档 | 当前官方文档；文件隔离的功能边界 | R | 结论 5；最佳实践 E |
| <a id="s7"></a>S7 | Anthropic／Claude Code 文档团队 | [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams) | 页面未标注；持续更新文档 | 当前官方文档；重点为 Avoid file conflicts、Wait for teammates to finish | R | 结论 5、6；最佳实践 D、E |
| <a id="s8"></a>S8 | Anthropic Frontier Red Team | [Patterns and problems in emerging multiagent systems](https://www.anthropic.com/research/multiagent-systems) | 2026-08-13 | 第一方多 Agent 实验研究；重点为 Failures from conformity、Epistemic failures | R | 结论 7；最佳实践 B |

## 尚未证明的部分

- 本次没有本仓库任务的单 Agent／多 Agent 对照实验，无法给出推荐的固定人数、token 节省比例或编码加速比。
- Cursor 和 Anthropic 的大型实验有专门的环境、验证器和运行条件；其中的规模数据不能直接迁移到日常业务开发。
- 最佳实践中的 GoodCase / BadCase 全部为自拟教学示例，用于演示如何下达任务与核验结果；不代表来源作者实际使用的原始 Prompt 或本项目实测。
