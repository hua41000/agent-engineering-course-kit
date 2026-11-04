---
id: architecture-composer-methodology
title: 架构选型方法与决策规则设计
type: methodology-design
scope: cross-course-learner-tool
status: review
owner: guomeiqing
updated: 2026-09-22
sources:
  - https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/research/synthesis.md
  - https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/research/reports/rq_07_selection_composer_cognitive_terrain.md
  - https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/design/slide_blueprint.md
---

# 架构选型方法与决策规则设计

[返回项目入口](../README.md) · [产品需求](prd.md)

## 当前实施范围

2026-09-22，首版保留本课架构与模式选择方法，通过有限问题和显式规则给出建议；复杂证据分级与形式化架构校验延后。未知问题直接列为待澄清条件，报告不声称已完成实测。


### 当前通用评估模型

核心判断以项目属性为输入。内置案例只预填部分答案；`scenario` 仅供界面展示，规则不按案例 ID 分流。自定义行业和组合任务均可填写，行业名只触发背景澄清提示。32 个问题存于 `src/knowledge.mjs`，条件规则与报告共用同一套结构化回答。

| 维度 | 采集信息 | 影响的输出 |
|---|---|---|
| 业务背景 | 行业、任务类型、触发方式、新建或改造 | 澄清提示、入口与任务状态、实施起点 |
| 任务与控制 | 语义处理、路径、反馈、依赖、并行、协作 | 顶层结构与模式组合 |
| 系统与数据 | 现有主控、改造范围、瓶颈、信息来源、数据可用性、接口 | 数据与接入层、保留/替换范围、迁移顺序 |
| 风险与权限 | 结果检查、写入、授权、恢复、错误影响、自主范围、数据边界、监督 | 受控执行、复核、恢复与当前可交付范围 |
| 交付与运行 | 技术栈、团队、优先级、部署、时延、负载、预算、交付阶段 | 框架候选、运行组件、预算限制与实施顺序 |

先判断任务需要什么结构，再应用项目约束，输出“目标结构 + 组件组合 + 执行范围 + 建设/迁移路线”。关键数据不可用时先解决输入；硬实时路径交给确定性系统；仅允许外围扩展时保留已有核心。行业标签不自动变成法规或权限结论。

界面一次呈现一题。已有系统追加改造问题；写入或较高影响追加自主程度问题。改变上游回答后，隐藏分支的原答案保留以便恢复，但不参与推荐、问题统计或报告输入摘要。未知关键条件导致“待补充关键条件”，完成数量仅代表问卷完整度。

模型支持未内置场景通过共同维度组合；特殊专业要求可写入自由文本，由 Skill 补充分析。它提供可解释的初步方向，不宣称有限选项已经覆盖任意领域的全部细节。

## 1. 方法基线与来源优先级

本文件定义把课程方法落实为产品行为的方案。语义依据为[研究综合](https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/research/synthesis.md)和[选型研究](https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/research/reports/rq_07_selection_composer_cognitive_terrain.md)；课程范围以[获批大纲](https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/brief/lesson_outline.md)为准；最新教学展开参考[逐页稿](https://github.com/shanggqm/geektime-course/blob/main/lessons/v5/formal/lesson_02_agent_architecture_selection/design/slide_blueprint.md)。

引用对话的最后一轮强调模式语言、框架全景与组合设计。较早回答中收缩为一页评审工具的建议，不覆盖本次双端产品需求。框架能力、默认版本和实验表现必须单独核验。

当前材料存在表达层次差异：研究综合使用九个契约域，逐页稿 S24 展开为十项字段；前者提供域分组，后者提供报告的十项展示字段，并保留调用身份与能力版本。大纲 C14 把 PydanticAI 等作为框架对照，S26A 则把原生 SDK + 自研薄 Harness 作为课程 DataAgent 的主控路线；产品同时保留这些候选，不把教学对照误作项目依赖。方法库发布时记录实际输入文件哈希，未经评审的差异不能静默改写规则。

## 2. 选型对象与输出层级

先评估五类候选：传统确定性软件、LLM Feature、Workflow Agent、Autonomous Agent、Hybrid。每个业务阶段分别判断，再组合全局结构。

用四轴描述结果：

| 轴 | 候选值 | 需要澄清的边界 |
|---|---|---|
| 控制权 | Workflow-dominant、Autonomous-dominant、Hybrid | 谁持续选择下一步，能选择多远，谁叫停 |
| 求解模式 | Chain、Router、Parallel、Evaluator、ReAct、Plan、Delegation 等 | 当前不确定性由什么机制处理 |
| 执行与状态载体 | 普通代码、Workflow、Graph、Durable Runtime | 状态在哪里，失败谁恢复 |
| 参与者拓扑 | Single、Agent-as-Tool、Handoff、Supervisor、Group Chat | 谁接管、谁返回、谁负责 |

传统软件和 LLM Feature 同样描述控制、状态与验证，但不强行贴 Agent 名称。Graph 不自动决定控制权，多 Agent 不单独构成顶层架构。

报告区分三个层次：**当前可实施方案**、**条件补齐后的目标方案**、**实验才能区分的备选**。例如审批能力缺失时，当前方案可停在分析与申请，目标方案描述审批和确定性执行；不能把能力要求写成现状已具备。

## 3. 决策顺序

```text
确认业务终态和现状
→ 按阶段识别不确定性、反馈、验证和副作用
→ 检查冲突、否决条件与关键未知
→ 分配控制权
→ 选择最小充分模式组合
→ 配置运行与交接契约
→ 翻译为框架/组件责任
→ 过滤候选并比较自研、复用与退出成本
→ 给出实验、迁移步骤与 ADR
```

硬约束优先于偏好：适用范围与授权边界 → 必须能力 → 证据完整性 → 用户排序的质量、时延、费用和维护成本。首版采用透明的约束过滤与逐项比较，允许多方案并列；没有效用权重和实验依据时不输出精确总分。

最小充分原则通过删减检查落实：每个模式都要有一项它解决的已知问题、必要前提和验证方式。无法解释收益的模式从当前推荐中移除，作为可选演进保留。

## 4. 可执行规则的语义

规则类型分为 `requirement`（增加能力要求）、`veto`（排除特定范围）、`pattern`（选择模式）、`question`（要求澄清）、`simplification`（删减）和 `reselection`（重选条件）。

每条规则至少记录：稳定 ID、适用阶段、输入字段、条件表达式、未知处理、输出、优先级、冲突组、事实引用、课程依据、反例、实验与重选条件。条件结果采用 `true / false / unknown / conflict`，规则不得把 unknown 当 false 来绕过门禁。

示例规则设计：

```yaml
id: G-ACTION-01
kind: requirement
scope: stage
when:
  field: side_effect
  op: equals
  value: external_write
requires:
  - authorization_bound_to_action
  - execution_time_policy_check
  - operation_identity
  - authoritative_outcome_lookup
when_missing: restrict_current_plan_to_proposal
when_unknown: ask_action_control_questions
proposes: controlled_action_workflow
source_claims: [lesson02-C19, lesson02-S24, lesson02-S26]
counterexample: confirmed_read_only_stage
```

实际授权方式由风险、业务规则和组织要求决定；低风险且已获策略授权的动作可以自动执行。高风险或明确要求审批的动作增加人工审批绑定，拒绝、撤销或内容变更必须使原授权失效。所有真实副作用都要检查执行边界、结果查回和失败语义。

规则计算分层进行，先生成要求，再检查现有能力，最后生成推荐。默认不支持任意脚本表达式与无界规则递归；编译期校验依赖环、未知字段、互斥结论和无终止的补问。

## 5. 核心门禁与模式规则

### 5.1 候选与门禁

| 规则 ID | 已确认条件 | 产生的判断 | 未知或缺失处理 |
|---|---|---|---|
| B-01 | 规则完整且无语义理解需要 | 确定性软件为基线 | 追问引入模型的实际收益 |
| B-02 | 单次语义转换足够、无需反馈驱动行动 | LLM Feature + 验证 | 不因有 Tool Calling 就升级为 Autonomous |
| G-01 | 外部写入、发布或提交 | 增加动作身份、权限执行、结果查询与失败契约 | 当前收窄为建议/申请；目标标前置条件 |
| G-02 | 开放循环缺少可用验收与停止 | 否决无界自主执行 | 改成人工检查、限轮试验或补齐 Verifier |
| G-03 | 多 Agent 缺少可验证隔离/协作收益 | 采用单 Agent 或普通并发基线 | 用对照实验争取额外复杂度 |
| G-04 | 跨进程、跨日等待或明确恢复要求 | 增加持久状态、恢复语义与幂等要求 | 明确待建能力；不由长任务直接推导分布式 |
| G-05 | 单进程满足规模和隔离要求 | 暂不引入分布式部署 | 以吞吐、故障域、隔离、运维证据触发重选 |
| G-06 | 核心事实互相冲突 | 暂停受影响阶段的确定推荐 | 保留其他阶段结果，追问冲突范围 |

### 5.2 模式与成立条件

| 规则 ID / 模式 | 触发条件 | 必要契约或限制 | 反例与失败接口 |
|---|---|---|---|
| P-01 Chain | 阶段与依赖稳定 | 结构化 I/O、中间 Gate、局部重试 | 前序错误传播；无分阶段收益时改单次调用 |
| P-02 Router | 有限且稳定的出口 | 分类证据、未知出口、回退、权限过滤 | 用低置信类别直接触发高风险动作 |
| P-03 Parallel | 子任务独立或独立尝试有用 | 共享状态隔离、fan-in、部分失败、取消、总预算 | 跨维度贡献重复相加、多个分支写同一状态 |
| P-04 Evaluator-Optimizer | 质量可检查且修订能带来收益 | 独立证据、可操作反馈、迭代上限 | 同源模型自评空转，SQL 可执行却口径错误 |
| P-05 Orchestrator-Workers | 子任务在运行时才明确 | Worker Contract、去重、合并者、数量上限 | 分工重叠、遗漏、结果无法合并 |
| P-06 Agentic Workflow | 固定业务流程中有局部探索 | 七项局部探索契约 | Agent 超时后不归还控制权 |
| P-07 ReAct | 新观察持续改变下一步 | 允许工具、失败重复检测、预算、强制停止 | 短视、反复失败、观察污染 |
| P-08 Plan-and-Execute / Replan | 长程依赖或里程碑明显 | 计划状态、完成证据、局部/全局重规划条件 | 计划脱离真实状态；短任务过度规划 |
| P-09 Reflection / Verifier-Guided | 新证据能够修正策略 | 外部锚点、假设切换、退出条件 | 仅改措辞，无新增证据 |
| P-10 Agent-as-Tool | 有界专业子任务或上下文隔离 | 子输入、权限、结果 Schema、回到主 Agent | 把普通函数包装成多个角色却无收益 |
| P-11 Handoff | 需要接收者持续接管 | 当前活跃主体、上下文过滤、权限、责任及返回条件 | 无最终负责人，角色移交误作授权扩张 |
| P-12 Supervisor / Group Chat | 动态派工或确有协商需求 | 调度者、发言预算、合并与终止 | 发言增加而有效工作不增加；应优先比较单体 |
| P-13 Deep Agent / Harness | 计划、工作空间、压缩、工具、会话治理组合需求 | 各能力负责人、状态和恢复、平台退出成本 | 一个简单问答任务引入全套工作环境 |

Parallel 的 Sectioning、Map-Reduce、Voting、Perspective 与 Guardrail 变体通过任务数据与汇总契约区别。安全检查若能否决外部动作，必须在提交前完成；并发运行检查不等于可以先提交再检查。

### 5.3 Hybrid 组合

| 形态 | 选择条件 | 典型技术结构 |
|---|---|---|
| Workflow-first | 业务终态与宏观流程固定，少数阶段开放 | LLM/Agent Node、Agentic Island |
| Autonomous-first | 调查与规划路径动态，稳定能力可封装 | Workflow-as-Tool/Skill、Sub-Agent-as-Tool、Handoff |
| Dynamic Compiled | 动态计划值得显式校验、编译和恢复 | Plan-to-Workflow / Dynamic Graph |

Managed Agent 作为运行承载候选记录，必须另行说明谁控制下一步及谁执行治理。三种形态可以在不同阶段组合，不以问卷均值给整个企业贴单一标签。

局部探索的七项契约：进入条件、允许工具、预算、完成证据、返回 Schema、失败/超时返回、控制权归还。全局交接的十项展示字段：输入、权限范围、允许动作、状态所有权、预算、完成证据、返回值、失败语义、回滚/补偿、返回对象；另附调用方、接收方、能力版本与协议版本元数据。

停止状态至少区分候选答案、验证成功、环境终态、等待输入、资源耗尽、策略拒绝、用户取消和不可恢复失败。外部提交结果未知时进入对账状态，不能直接按普通失败重试。

## 6. 框架与组件取舍

按六层责任登记 Model SDK、Agent Loop SDK、Workflow/Graph、Multi-Agent Coordination、Harness/Capability、Runtime/Operations。记录每项责任由应用、框架、外部服务还是人工承担。

首批盘点对象来自本课：原生 SDK / 自研薄主控、PydanticAI、LangGraph、OpenAI Agents SDK、Google ADK、Microsoft Agent Framework、CrewAI、Mastra、LlamaIndex Workflows、smolagents、Agno、Strands、AutoGen、Claude Agent SDK、LangChain Deep Agents；Temporal 等作为 Runtime 组件单独比较。上述列表表示核验范围，当前提案没有为所有产品确认最新版本与能力。

候选选择顺序：

1. 过滤语言、部署、模型/Provider、许可、数据边界等硬约束。
2. 对必须责任逐项标记原生覆盖、部分覆盖、外部集成、应用自建、缺失或未知；记录子能力稳定性与版本。
3. 比较 Loop 可修改性、业务对象侵入、状态迁移、工具可独立测试、模型切换和运行平台绑定。
4. 对自研薄主控计入循环、上下文、Provider 差异、工具契约、恢复与回归的维护负担；对完整框架计入升级、抽象绕行和退出成本。
5. 优先保留满足约束的现有资产；最终保留 1 个当前推荐与最多 2 个有实质区别的备选。没有证据区分时并列，不强选品牌。

框架“支持某能力”不能自动推出业务机制正确。例如 Checkpoint 不证明外部副作用已撤销，Sub-Agent 不证明权限隔离，审批节点不证明批准对象与执行参数绑定。

框架快照保留版本范围、语言、核验日期、官方来源与许可证说明。超过维护者设定的复核期限或发生相关版本变化时标为过期；关键能力过期或未知时不输出无条件推荐。离线状态照常生成架构级报告，框架级结论附待核验项。

## 7. 课程方法覆盖矩阵

| 教学范围 | 产品中的落实 | 主要验收案例 |
|---|---|---|
| C01、C06：架构语法与总览 | 五类候选、四轴描述、顶层与局部分开 | 有 Graph 的 Autonomous；有模型 Router 的 Workflow |
| C02：Chain / Routing | P-01、P-02 与有限出口补问 | 固定抽取、未知分类回退 |
| C03：Parallel | P-03 与共享状态、合并契约 | 独立维度、共享写冲突 |
| C04：Evaluator | P-04 与验证来源 | SQL 执行正确但业务错误 |
| C05：Orchestrator / Agentic Workflow | P-05、P-06 与局部契约 | 动态拆分、超时返回 |
| C07：ReAct | P-07 与观察驱动选择 | 新异常导致换分析维度 |
| C08：Plan / Replan | P-08 与里程碑状态 | 新证据推翻局部计划 |
| C09：Reflection | P-09 与策略修正 | 数据缺失时停止与收窄 |
| C10：Delegation | P-10—P-12 与责任移交 | 调用返回和持续接管差异 |
| C11：Harness | P-13 与能力责任表 | 简单问答拒绝全套 Harness |
| C12—C14：六层技术栈与框架 | 版本化能力库、责任覆盖、退出成本 | 同名能力语义不同、过期信息 |
| C15：同题框架对照 | 同任务、模型、工具、预算与验收 | 原生基线与框架的公平比较 |
| C16—C19：Hybrid 与契约 | 三类形态、六种结构、七/十项契约 | 分析开放、审批执行受控 |
| C20 / S26：九类场景与八条原则 | 场景预填、规则补问、删减检查 | 同场景因约束改变而改推荐 |
| C21 / S26A：DataAgent 演进 | 当前/目标分离、自研与复用取舍 | 固定月报 → 调查 → 受控写入 |
| C22：选型与实验 | 硬约束、候选比较、变更与故障实验 | 换语言、加审批、替换 Provider |
| C23：Composer | 双端共享规则、可解释报告、ADR | 同输入一致与修改条件可追踪 |

九类场景卡包含结构化抽取、知识问答、客服咨询、退款理赔、Deep Research、DataAgent、Coding Agent、高风险交易、跨系统长任务。每张卡保存适用条件、初始阶段、推荐起点、反例与降级路线；用户必须确认关键事实，场景卡不绕过门禁。

## 8. 实验与回归原则

最小实验固定任务、模型版本/参数、工具契约、输入、预算和验收；记录成功/失败数、费用、时延分布、步骤、人工介入和恢复结果。样本数量、重复次数、随机性与环境要公开，不能把一次演示写成普遍性能结论。

至少包含正常完成、证据缺失、授权拒绝、工具失败、提交结果未知、恢复、需求变更和框架替换。离线 fixture 标为模拟；真实运行结果引用可复查的配置、原始记录和摘要，不能借助报告润色把声明升级为实测。

方法回归包含三类断言：应命中的规则、不得出现的结论、允许并列的候选。典型不变量包括：提高开放任务收益不能消除权限要求；移除外部写入只删除相关控制要求；改变语言主要影响实现候选；增加已验证控制能力可以解锁目标结构；缺少独立收益不自动增加多 Agent；已有可靠实现不会因为“新建项目默认模板”被替换。

实现后，执行规则与框架数据的唯一源位于本产品 `packages/knowledge/`。本文件保留解释、覆盖和变更原则；规则详情页、Skill 参考摘要及场景卡从该数据构建，避免两端手工维护同义规则。
